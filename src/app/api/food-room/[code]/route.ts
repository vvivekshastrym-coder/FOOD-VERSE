import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const room = await prisma.foodRoom.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            hygieneRating: true,
            menuItems: {
              where: { isAvailable: true },
              select: { id: true, name: true, price: true, imageUrl: true, servingSize: true, isVeg: true },
              take: 12
            }
          }
        },
        members: {
          include: {
            user: { select: { name: true, avatar: true } }
          }
        },
        items: {
          include: {
            member: true,
            votes: true
          }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: "Food Room not found with this code" }, { status: 404 });
    }

    // Auto-join member if logged in and not already in room
    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null;
    let isMember = false;
    let isHost = false;

    if (user) {
      const existingMember = room.members.find(m => m.userId === user.id);
      if (existingMember) {
        isMember = true;
        isHost = existingMember.isHost;
      } else {
        await prisma.roomMember.create({
          data: {
            foodRoomId: room.id,
            userId: user.id,
            name: user.name,
            isHost: false
          }
        });
        isMember = true;
      }
    }

    // Calculate group totals & cost split
    const totalGroupAmount = room.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Split per member
    const memberShares: Record<string, { memberName: string; total: number; itemCount: number }> = {};
    for (const member of room.members) {
      memberShares[member.id] = { memberName: member.name, total: 0, itemCount: 0 };
    }

    if (room.splitType === "EQUAL" && room.members.length > 0) {
      const perPerson = Math.round((totalGroupAmount / room.members.length) * 100) / 100;
      for (const mId of Object.keys(memberShares)) {
        memberShares[mId].total = perPerson;
      }
    } else {
      for (const item of room.items) {
        if (memberShares[item.memberId]) {
          memberShares[item.memberId].total += item.price * item.quantity;
          memberShares[item.memberId].itemCount += item.quantity;
        }
      }
    }

    return NextResponse.json({
      success: true,
      room,
      totalGroupAmount,
      memberShares,
      isMember,
      isHost
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load room" }, { status: 500 });
  }
}

// Lock / Update Food Room
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { status, splitType, spendingLimit } = body;

    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null;

    const room = await prisma.foodRoom.findUnique({ where: { code: code.toUpperCase() } });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    if (user && room.hostId !== user.id) {
      return NextResponse.json({ error: "Only the Food Room host can change room settings" }, { status: 403 });
    }

    const updated = await prisma.foodRoom.update({
      where: { id: room.id },
      data: {
        status: status || undefined,
        splitType: splitType || undefined,
        spendingLimit: spendingLimit !== undefined ? spendingLimit : undefined
      }
    });

    return NextResponse.json({ success: true, room: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update room" }, { status: 500 });
  }
}
