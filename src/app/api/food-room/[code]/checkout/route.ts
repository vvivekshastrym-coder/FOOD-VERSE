import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const room = await prisma.foodRoom.findUnique({
      where: { code: code.toUpperCase() },
      include: { items: true, members: true, restaurant: true }
    });

    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (room.hostId !== user.id) {
      return NextResponse.json({ error: "Only the Food Room host can trigger final checkout" }, { status: 403 });
    }

    if (room.items.length === 0) {
      return NextResponse.json({ error: "Cannot checkout an empty group room" }, { status: 400 });
    }

    // Convert room items to an Order
    const subtotal = room.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const platformFee = 5.0;
    const deliveryFee = 35.0;
    const gstAmount = Math.round((subtotal * 0.05) * 100) / 100;
    const totalAmount = Math.round((subtotal + platformFee + deliveryFee + gstAmount) * 100) / 100;

    const orderNumber = `FV-ROOM-${Math.floor(10000 + Math.random() * 90000)}`;

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          restaurantId: room.restaurantId,
          status: "PLACED",
          subtotal,
          discount: 0,
          deliveryFee,
          platformFee,
          gstAmount,
          totalAmount,
          paymentMethod: "UPI_GROUP_SPLIT",
          paymentStatus: "PAID",
          deliveryAddress: "HAL 2nd Stage, Indiranagar, Bengaluru (Food Room Order)",
          otpCode: Math.floor(1000 + Math.random() * 9000).toString(),
          estimatedPrepMinutes: 25,
          estimatedDeliveryMinutes: 15,
          items: {
            create: room.items.map(i => ({
              menuItemId: i.menuItemId,
              name: i.name,
              quantity: i.quantity,
              unitPrice: i.price
            }))
          },
          events: {
            create: [
              {
                status: "PLACED",
                actorId: user.id,
                actorRole: "CUSTOMER",
                note: `Food Room #${room.code} checked out by host ${user.name}. ${room.members.length} participants.`
              }
            ]
          }
        }
      });

      await tx.foodRoom.update({
        where: { id: room.id },
        data: { status: "ORDERED" }
      });

      return createdOrder;
    });

    return NextResponse.json({
      success: true,
      message: "Group order placed successfully!",
      orderId: order.id,
      orderNumber: order.orderNumber
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to checkout room" }, { status: 500 });
  }
}
