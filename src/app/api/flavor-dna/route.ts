import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let profile = await prisma.flavorProfile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) {
      profile = await prisma.flavorProfile.create({
        data: {
          userId: user.id,
          spicy: 75,
          sweet: 30,
          sour: 40,
          umami: 85,
          crunch: 65,
          richness: 70,
          dietaryTags: "High Protein, Spice Enthusiast"
        }
      });
    }

    return NextResponse.json({
      success: true,
      profile,
      dimensions: [
        { key: "spicy", label: "Spiciness / Pungency", value: profile.spicy, color: "#ef4444" },
        { key: "sweet", label: "Sweetness", value: profile.sweet, color: "#f59e0b" },
        { key: "sour", label: "Tangy & Sour", value: profile.sour, color: "#84cc16" },
        { key: "umami", label: "Savory Umami", value: profile.umami, color: "#8b5cf6" },
        { key: "crunch", label: "Crunch & Texture", value: profile.crunch, color: "#06b6d4" },
        { key: "richness", label: "Richness & Creaminess", value: profile.richness, color: "#ec4899" }
      ]
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load Flavor DNA" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { spicy, sweet, sour, umami, crunch, richness, dietaryTags } = body;

    const profile = await prisma.flavorProfile.upsert({
      where: { userId: user.id },
      update: {
        spicy: spicy !== undefined ? parseInt(spicy, 10) : undefined,
        sweet: sweet !== undefined ? parseInt(sweet, 10) : undefined,
        sour: sour !== undefined ? parseInt(sour, 10) : undefined,
        umami: umami !== undefined ? parseInt(umami, 10) : undefined,
        crunch: crunch !== undefined ? parseInt(crunch, 10) : undefined,
        richness: richness !== undefined ? parseInt(richness, 10) : undefined,
        dietaryTags: dietaryTags !== undefined ? dietaryTags : undefined,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        spicy: spicy || 70,
        sweet: sweet || 30,
        sour: sour || 40,
        umami: umami || 80,
        crunch: crunch || 60,
        richness: richness || 65,
        dietaryTags: dietaryTags || "Balanced Palate"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Flavor DNA updated successfully",
      profile
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
