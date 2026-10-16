import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const deals = await prisma.antiWasteDeal.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
        availableQuantity: { gt: 0 }
      },
      include: {
        restaurant: {
          select: { name: true, city: true, hygieneRating: true, logoImage: true }
        },
        menuItem: {
          include: { assets: true }
        }
      },
      orderBy: { expiresAt: "asc" }
    });

    return NextResponse.json({
      success: true,
      deals: deals.map(d => ({
        id: d.id,
        restaurantName: d.restaurant.name,
        dishName: d.menuItem.name,
        menuItemId: d.menuItemId,
        originalPrice: d.originalPrice,
        dealPrice: d.dealPrice,
        discountPercent: Math.round(((d.originalPrice - d.dealPrice) / d.originalPrice) * 100),
        availableQuantity: d.availableQuantity - d.claimedCount,
        expiresAt: d.expiresAt,
        imageUrl: d.menuItem.imageUrl,
        trueSizeVerified: d.menuItem.trueSizeVerified
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load anti-waste deals" }, { status: 500 });
  }
}
