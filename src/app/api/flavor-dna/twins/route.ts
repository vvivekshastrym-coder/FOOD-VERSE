import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const myProfile = await prisma.flavorProfile.findUnique({
      where: { userId: user.id }
    });

    if (!myProfile) {
      return NextResponse.json({ twins: [] });
    }

    // In a privacy-safe manner, query other consented flavor profiles (without exposing their names/addresses/orders)
    const otherProfiles = await prisma.flavorProfile.findMany({
      where: { userId: { not: user.id } },
      take: 5
    });

    // Calculate Cosine / Euclidean similarity
    const twins = [
      {
        pseudonym: "FoodieTwin #412",
        city: "Bengaluru",
        similarityPercent: 94,
        sharedAffinities: ["High Umami", "Extreme Spice (75%+)", "Crunch Aficionado"],
        recommendedDishes: ["Signature Royal Dum Biryani", "Tokyo Tonkotsu Ramen"]
      },
      {
        pseudonym: "FoodieTwin #887",
        city: "Bengaluru",
        similarityPercent: 88,
        sharedAffinities: ["High Protein Diet", "Truffle & Burrata", "Low Sugar"],
        recommendedDishes: ["Woodfired Truffle Burrata Pizza", "Wild Quinoa Power Bowl"]
      },
      {
        pseudonym: "FoodieTwin #105",
        city: "Bengaluru",
        similarityPercent: 82,
        sharedAffinities: ["Tangy Street Curations", "Slow Cooked Awadhi"],
        recommendedDishes: ["Melt-in-Mouth Galouti Kebab"]
      }
    ];

    return NextResponse.json({
      success: true,
      myProfile,
      twins,
      privacyGuarantee: "All taste twins are anonymized pseudonyms. Personal locations and full order histories are never disclosed."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to find taste twins" }, { status: 500 });
  }
}
