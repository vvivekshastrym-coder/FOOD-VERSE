import { prisma } from "./prisma";

export interface TrueSizeDisputeInput {
  orderId: string;
  userId: string;
  type: "TRUE_SIZE_MISMATCH" | "MISSING_ITEM" | "QUALITY_DEFECT" | "LATE_DELIVERY" | "OTHER";
  description: string;
  evidencePhotoUrl?: string;
  claimedWeightG?: number;
}

export async function fileDispute(input: TrueSizeDisputeInput) {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { items: { include: { menuItem: true } } }
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.userId !== input.userId) {
    throw new Error("Unauthorized to dispute this order");
  }

  // Calculate maximum eligible refund (dish price or full subtotal for critical discrepancies)
  const refundProposal = Math.round(order.totalAmount * 0.5 * 100) / 100;

  const dispute = await prisma.dispute.create({
    data: {
      orderId: input.orderId,
      userId: input.userId,
      type: input.type,
      description: input.description,
      evidencePhotoUrl: input.evidencePhotoUrl,
      status: "OPEN",
      refundAmount: refundProposal
    }
  });

  return dispute;
}

export async function resolveDispute(params: {
  disputeId: string;
  decision: "APPROVED" | "REJECTED";
  refundAmount?: number;
  reviewerId: string;
  resolutionNote: string;
}) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: params.disputeId },
    include: { order: { include: { payments: true } } }
  });

  if (!dispute) {
    throw new Error("Dispute record not found");
  }

  return prisma.$transaction(async (tx) => {
    const updatedDispute = await tx.dispute.update({
      where: { id: params.disputeId },
      data: {
        status: params.decision,
        refundAmount: params.decision === "APPROVED" ? (params.refundAmount ?? dispute.refundAmount) : 0,
        resolutionNote: params.resolutionNote,
        resolvedAt: new Date()
      }
    });

    if (params.decision === "APPROVED" && updatedDispute.refundAmount && updatedDispute.refundAmount > 0) {
      // Record refund entry
      await tx.refund.create({
        data: {
          orderId: dispute.orderId,
          paymentId: dispute.order.payments[0]?.id,
          amount: updatedDispute.refundAmount,
          reason: `Dispute approved: ${params.resolutionNote}`,
          status: "PROCESSED",
          reviewerId: params.reviewerId,
          notes: params.resolutionNote
        }
      });

      // Record financial debit in ledger
      await tx.financialLedgerEntry.create({
        data: {
          orderId: dispute.orderId,
          restaurantId: dispute.order.restaurantId,
          type: "REFUND_DEBIT",
          amount: -updatedDispute.refundAmount,
          balanceAfter: -updatedDispute.refundAmount,
          reference: `Dispute resolution refund for ${dispute.id}`
        }
      });

      // Update order status if full refund
      if (updatedDispute.refundAmount >= dispute.order.totalAmount) {
        await tx.order.update({
          where: { id: dispute.orderId },
          data: { status: "REFUNDED", paymentStatus: "REFUNDED" }
        });
      }
    }

    return updatedDispute;
  });
}
