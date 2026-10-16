import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            hygieneRating: true,
            fssaiNumber: true,
            city: true
          }
        },
        assets: true,
        portionVariants: true,
        ingredientToggles: true,
        inventory: true
      }
    });

    if (!menuItem) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      menuItem
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load dish details" }, { status: 500 });
  }
}
