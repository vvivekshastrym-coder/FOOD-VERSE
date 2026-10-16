import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) {
      return NextResponse.json({ orders: [] });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope"); // all, active, restaurant

    let whereClause: any = {};
    if (user.role === "RESTAURANT_OWNER" || user.role === "RESTAURANT_STAFF") {
      const restaurant = await prisma.restaurant.findFirst({ where: { ownerId: user.id } });
      if (restaurant) whereClause = { restaurantId: restaurant.id };
    } else if (user.role === "RIDER") {
      whereClause = { deliveryTask: { riderId: user.id } };
    } else if (user.role === "ADMIN" || user.role === "CS_AGENT") {
      whereClause = {}; // Admins can view all orders
    } else {
      whereClause = { userId: user.id };
    }

    if (scope === "active") {
      whereClause.status = { notIn: ["DELIVERED", "CANCELLED", "REFUNDED"] };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        restaurant: { select: { id: true, name: true, phone: true, address: true, logoImage: true } },
        items: { include: { menuItem: { select: { id: true, name: true, imageUrl: true, trueSizeVerified: true } } } },
        deliveryTask: { include: { rider: { select: { name: true, phone: true, avatar: true } } } },
        events: { orderBy: { timestamp: "desc" } },
        disputes: true
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json({
      success: true,
      orders
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load orders" }, { status: 500 });
  }
}
