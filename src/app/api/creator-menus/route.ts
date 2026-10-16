import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const menus = await prisma.creatorMenu.findMany({
      where: { isApproved: true },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                restaurant: { select: { id: true, name: true, city: true } },
                assets: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      creatorMenus: menus
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load creator menus" }, { status: 500 });
  }
}
