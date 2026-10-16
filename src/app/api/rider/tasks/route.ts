import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { transitionOrderStatus } from "@/lib/orderStateMachine";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const rider = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "RIDER" } });

    if (!rider) {
      return NextResponse.json({ error: "Rider profile not found" }, { status: 404 });
    }

    // Active delivery tasks assigned to rider
    const tasks = await prisma.deliveryTask.findMany({
      where: { riderId: rider.id },
      include: {
        order: {
          include: {
            restaurant: { select: { name: true, phone: true, address: true, latitude: true, longitude: true } },
            items: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    const activeTask = tasks.find(t => !["DELIVERED", "CANCELLED"].includes(t.status));
    const completedTasks = tasks.filter(t => t.status === "DELIVERED");
    const totalEarnings = tasks.reduce((sum, t) => sum + (t.status === "DELIVERED" ? t.earningsAmount : 0), 195.0); // includes base seeded balance

    return NextResponse.json({
      success: true,
      rider: {
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        avatar: rider.avatar,
        isOnline: true
      },
      activeTask,
      totalEarnings,
      completedTrips: completedTasks.length + 3,
      history: tasks
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load rider tasks" }, { status: 500 });
  }
}

// Complete pickup or complete delivery with OTP
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, action, otpCode } = body;

    const task = await prisma.deliveryTask.findUnique({
      where: { id: taskId },
      include: { order: true }
    });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const session = await getCurrentUser();
    const rider = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "RIDER" } });
    const riderId = rider ? rider.id : "rider-default";

    if (action === "PICKUP") {
      await transitionOrderStatus({
        orderId: task.orderId,
        nextStatus: "PICKED_UP",
        actorId: riderId,
        actorRole: "RIDER",
        note: "Rider confirmed parcel pickup from kitchen counter"
      });
    } else if (action === "DELIVER") {
      if (!otpCode || otpCode.trim() !== task.order.otpCode) {
        return NextResponse.json({
          error: `Incorrect Customer Delivery OTP. Please ask the customer for their 4-digit code.`
        }, { status: 400 });
      }

      await transitionOrderStatus({
        orderId: task.orderId,
        nextStatus: "DELIVERED",
        actorId: riderId,
        actorRole: "RIDER",
        note: `Customer handoff verified via OTP ${otpCode}`,
        otpCode
      });
    }

    return NextResponse.json({ success: true, message: `Task ${action} verified successfully.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: 400 });
  }
}
