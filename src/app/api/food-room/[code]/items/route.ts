import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { menuItemId, quantity = 1 } = body;

    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const room = await prisma.foodRoom.findUnique({
      where: { code: code.toUpperCase() },
      include: { members: true, items: true }
    });

    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (room.status !== "OPEN") {
      return NextResponse.json({ error: "This Food Room is locked or checking out" }, { status: 400 });
    }

    let member = room.members.find(m => m.userId === user.id);
    if (!member) {
      member = await prisma.roomMember.create({
        data: {
          foodRoomId: room.id,
          userId: user.id,
          name: user.name,
          isHost: false
        }
      });
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId }
    });

    if (!menuItem) return NextResponse.json({ error: "Dish not found" }, { status: 404 });

    const price = menuItem.discountedPrice || menuItem.price;

    // Check spending limit if configured
    if (room.spendingLimit) {
      const currentTotal = room.items.reduce((s, i) => s + i.price * i.quantity, 0);
      if (currentTotal + price * quantity > room.spendingLimit) {
        return NextResponse.json({
          error: `Room spending limit of ₹${room.spendingLimit} reached! Total would be ₹${currentTotal + price * quantity}`
        }, { status: 400 });
      }
    }

    const item = await prisma.roomItem.create({
      data: {
        foodRoomId: room.id,
        memberId: member.id,
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity,
        price
      }
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add item" }, { status: 500 });
  }
}

// Voting on room items (+1 / -1)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { roomItemId, vote = 1 } = body;

    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const room = await prisma.foodRoom.findUnique({
      where: { code: code.toUpperCase() },
      include: { members: true }
    });

    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    const member = room.members.find(m => m.userId === user.id);
    if (!member) return NextResponse.json({ error: "Not a room member" }, { status: 403 });

    // Upsert vote
    const existingVote = await prisma.roomVote.findFirst({
      where: { roomItemId, memberId: member.id }
    });

    if (existingVote) {
      await prisma.roomVote.update({
        where: { id: existingVote.id },
        data: { vote }
      });
    } else {
      await prisma.roomVote.create({
        data: {
          roomItemId,
          memberId: member.id,
          vote
        }
      });
    }

    return NextResponse.json({ success: true, message: "Vote recorded" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to vote" }, { status: 500 });
  }
}
