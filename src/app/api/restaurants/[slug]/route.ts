import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        verification: true,
        ioTDevices: {
          include: { readings: { orderBy: { recordedAt: "desc" }, take: 1 } }
        },
        menus: {
          where: { isActive: true },
          include: {
            categories: {
              orderBy: { sortOrder: "asc" },
              include: {
                items: {
                  include: {
                    assets: true,
                    portionVariants: true,
                    ingredientToggles: true,
                    inventory: true
                  }
                }
              }
            }
          }
        },
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      restaurant
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch restaurant" }, { status: 500 });
  }
}
