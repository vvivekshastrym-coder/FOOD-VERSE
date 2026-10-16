import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            latitude: true,
            longitude: true,
            fssaiNumber: true,
            hygieneRating: true,
            logoImage: true
          }
        },
        items: {
          include: {
            menuItem: {
              include: {
                assets: true,
                portionVariants: true
              }
            }
          }
        },
        deliveryTask: {
          include: {
            rider: {
              select: {
                name: true,
                phone: true,
                avatar: true
              }
            }
          }
        },
        events: {
          orderBy: { timestamp: "asc" }
        },
        payments: true,
        disputes: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load order" }, { status: 500 });
  }
}
