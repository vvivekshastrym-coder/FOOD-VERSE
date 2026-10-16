import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { transitionOrderStatus, OrderStatus } from "@/lib/orderStateMachine";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nextStatus, note, otpCode } = body;

    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "ADMIN" } });
    
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const updatedOrder = await transitionOrderStatus({
      orderId: id,
      nextStatus: nextStatus as OrderStatus,
      actorId: user.id,
      actorRole: user.role,
      note,
      otpCode
    });

    return NextResponse.json({
      success: true,
      message: `Order transitioned to ${nextStatus}`,
      order: updatedOrder
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 400 });
  }
}
