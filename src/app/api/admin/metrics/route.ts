import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const totalRestaurants = await prisma.restaurant.count();
    const totalOrders = await prisma.order.count();
    
    const paidOrders = await prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      select: { totalAmount: true, platformFee: true }
    });

    const gmv = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const platformRevenue = paidOrders.reduce((sum, o) => sum + o.platformFee + (o.totalAmount * 0.15), 0);

    const openDisputesCount = await prisma.dispute.count({
      where: { status: "OPEN" }
    });

    const recentOrders = await prisma.order.findMany({
      include: {
        restaurant: { select: { name: true } },
        user: { select: { name: true, email: true } },
        disputes: true
      },
      orderBy: { createdAt: "desc" },
      take: 8
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        totalRestaurants,
        totalOrders,
        gmv: Math.round(gmv * 100) / 100,
        platformRevenue: Math.round(platformRevenue * 100) / 100,
        openDisputesCount
      },
      recentOrders
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load admin metrics" }, { status: 500 });
  }
}
