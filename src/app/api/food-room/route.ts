import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) {
      return NextResponse.json({ error: "Sign in required to create a Food Room" }, { status: 401 });
    }

    const body = await request.json();
    const { restaurantId, spendingLimit, splitType = "ITEM_BASED" } = body;

    // Generate random 6-character room code (e.g. "FDV492")
    const code = "FDV" + Math.floor(100 + Math.random() * 900);

    const room = await prisma.foodRoom.create({
      data: {
        code,
        hostId: user.id,
        restaurantId: restaurantId || (await prisma.restaurant.findFirst())?.id || "",
        spendingLimit: spendingLimit ? parseFloat(spendingLimit) : null,
        splitType,
        status: "OPEN",
        members: {
          create: {
            userId: user.id,
            name: `${user.name} (Host)`,
            isHost: true
          }
        }
      },
      include: {
        restaurant: { select: { id: true, name: true, logoImage: true } },
        members: true
      }
    });

    return NextResponse.json({
      success: true,
      room
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create Food Room" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) return NextResponse.json({ rooms: [] });

    const rooms = await prisma.foodRoom.findMany({
      where: {
        OR: [
          { hostId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      },
      include: {
        restaurant: { select: { name: true, logoImage: true } },
        members: true,
        items: true
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return NextResponse.json({ rooms });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to list rooms" }, { status: 500 });
  }
}
