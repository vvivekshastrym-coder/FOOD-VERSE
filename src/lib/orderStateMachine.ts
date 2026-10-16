import { prisma } from "./prisma";

export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "PLATING"
  | "PACKED"
  | "READY_FOR_PICKUP"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface StateTransitionRule {
  allowedNext: OrderStatus[];
  allowedRoles: string[];
}

export const ORDER_STATE_MACHINE: Record<OrderStatus, StateTransitionRule> = {
  PLACED: {
    allowedNext: ["ACCEPTED", "CANCELLED"],
    allowedRoles: ["RESTAURANT", "RESTAURANT_OWNER", "RESTAURANT_STAFF", "ADMIN", "CUSTOMER"]
  },
  ACCEPTED: {
    allowedNext: ["PREPARING", "CANCELLED"],
    allowedRoles: ["RESTAURANT", "RESTAURANT_OWNER", "RESTAURANT_STAFF", "ADMIN"]
  },
  PREPARING: {
    allowedNext: ["PLATING", "CANCELLED"],
    allowedRoles: ["RESTAURANT", "RESTAURANT_OWNER", "RESTAURANT_STAFF", "ADMIN"]
  },
  PLATING: {
    allowedNext: ["PACKED"],
    allowedRoles: ["RESTAURANT", "RESTAURANT_OWNER", "RESTAURANT_STAFF", "ADMIN"]
  },
  PACKED: {
    allowedNext: ["READY_FOR_PICKUP"],
    allowedRoles: ["RESTAURANT", "RESTAURANT_OWNER", "RESTAURANT_STAFF", "ADMIN"]
  },
  READY_FOR_PICKUP: {
    allowedNext: ["PICKED_UP"],
    allowedRoles: ["RIDER", "RESTAURANT_OWNER", "RESTAURANT_STAFF", "ADMIN"]
  },
  PICKED_UP: {
    allowedNext: ["OUT_FOR_DELIVERY"],
    allowedRoles: ["RIDER", "ADMIN"]
  },
  OUT_FOR_DELIVERY: {
    allowedNext: ["DELIVERED"],
    allowedRoles: ["RIDER", "ADMIN"]
  },
  DELIVERED: {
    allowedNext: ["REFUNDED"],
    allowedRoles: ["ADMIN", "CS_AGENT"]
  },
  CANCELLED: {
    allowedNext: ["REFUNDED"],
    allowedRoles: ["ADMIN", "CS_AGENT"]
  },
  REFUNDED: {
    allowedNext: [],
    allowedRoles: []
  }
};

export async function transitionOrderStatus(params: {
  orderId: string;
  nextStatus: OrderStatus;
  actorId: string;
  actorRole: string;
  note?: string;
  otpCode?: string;
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { deliveryTask: true }
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const currentStatus = order.status as OrderStatus;
  const rules = ORDER_STATE_MACHINE[currentStatus];

  if (!rules.allowedNext.includes(params.nextStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${params.nextStatus}`);
  }

  // Validate OTP handoff on delivery
  if (params.nextStatus === "DELIVERED") {
    if (params.actorRole === "RIDER") {
      if (!params.otpCode || params.otpCode !== order.otpCode) {
        throw new Error("Invalid Customer Delivery OTP code");
      }
    }
  }

  // Execute database transaction
  return prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: params.orderId },
      data: {
        status: params.nextStatus,
        actualDeliveredAt: params.nextStatus === "DELIVERED" ? new Date() : undefined
      }
    });

    await tx.orderEvent.create({
      data: {
        orderId: params.orderId,
        status: params.nextStatus,
        actorId: params.actorId,
        actorRole: params.actorRole,
        note: params.note || `Order transitioned to ${params.nextStatus}`
      }
    });

    // Update associated DeliveryTask status
    if (order.deliveryTask) {
      let taskStatus = order.deliveryTask.status;
      if (params.nextStatus === "READY_FOR_PICKUP") taskStatus = "AT_RESTAURANT";
      if (params.nextStatus === "PICKED_UP") taskStatus = "PICKED_UP";
      if (params.nextStatus === "DELIVERED") taskStatus = "DELIVERED";
      if (params.nextStatus === "CANCELLED") taskStatus = "CANCELLED";

      await tx.deliveryTask.update({
        where: { id: order.deliveryTask.id },
        data: { status: taskStatus }
      });
    }

    return updatedOrder;
  });
}
