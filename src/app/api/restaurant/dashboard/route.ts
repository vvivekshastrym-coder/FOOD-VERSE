import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "RESTAURANT_OWNER" } });
    
    // Find restaurant owned or staff at
    let restaurant = await prisma.restaurant.findFirst({
      where: user ? { ownerId: user.id } : {},
      include: {
        verification: true,
        ioTDevices: { include: { readings: { take: 1 } } },
        menuItems: {
          include: {
            assets: true,
            portionVariants: true,
            inventory: true
          }
        }
      }
    });

    if (!restaurant) {
      restaurant = await prisma.restaurant.findFirst({
        include: {
          verification: true,
          ioTDevices: { include: { readings: { take: 1 } } },
          menuItems: {
            include: {
              assets: true,
              portionVariants: true,
              inventory: true
            }
          }
        }
      });
    }

    if (!restaurant) {
      return NextResponse.json({ error: "No restaurant found" }, { status: 404 });
    }

    // Live kitchen orders
    const orders = await prisma.order.findMany({
      where: { restaurantId: restaurant.id },
      include: {
        items: true,
        events: { orderBy: { timestamp: "desc" } },
        deliveryTask: { include: { rider: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    // Kitchen throughput analytics
    const totalOrders = orders.length;
    const grossRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === "PAID" ? o.totalAmount : 0), 0);
    const activeOrders = orders.filter(o => !["DELIVERED", "CANCELLED", "REFUNDED"].includes(o.status));

    // True size asset verification status
    const verifiedAssetsCount = restaurant.menuItems.filter(m => m.trueSizeVerified).length;

    return NextResponse.json({
      success: true,
      restaurant,
      orders,
      activeOrders,
      metrics: {
        totalOrders,
        grossRevenue,
        activeOrdersCount: activeOrders.length,
        verifiedAssetsCount,
        totalDishes: restaurant.menuItems.length,
        avgPrepMinutes: restaurant.avgPreparationTime,
        hygieneScore: restaurant.hygieneRating
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load restaurant dashboard" }, { status: 500 });
  }
}

// Toggle dish availability or stock
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { menuItemId, isAvailable, currentStock } = body;

    const updated = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        isAvailable: isAvailable !== undefined ? isAvailable : undefined,
        inventory: currentStock !== undefined ? {
          update: { currentStock: parseInt(currentStock, 10) }
        } : undefined
      }
    });

    return NextResponse.json({ success: true, menuItem: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update item" }, { status: 500 });
  }
}
