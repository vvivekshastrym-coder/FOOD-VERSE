import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { resolveDispute } from "@/lib/trueSize";

export async function GET() {
  try {
    const disputes = await prisma.dispute.findMany({
      include: {
        order: {
          include: {
            restaurant: { select: { name: true } },
            items: { include: { menuItem: true } }
          }
        },
        user: { select: { name: true, email: true, phone: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      disputes
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load disputes" }, { status: 500 });
  }
}

// Approve or reject dispute and process refund
export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    const admin = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const body = await request.json();
    const { disputeId, decision, refundAmount, resolutionNote } = body;

    const result = await resolveDispute({
      disputeId,
      decision,
      refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
      reviewerId: admin.id,
      resolutionNote: resolutionNote || `Reviewed and ${decision.toLowerCase()} by FoodVerse Operations`
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        role: admin.role,
        action: `DISPUTE_${decision}`,
        targetResource: disputeId,
        details: `Dispute resolved with decision ${decision}. Refund: ₹${result.refundAmount || 0}`
      }
    });

    return NextResponse.json({
      success: true,
      message: `Dispute ${decision.toLowerCase()} successfully`,
      dispute: result
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to resolve dispute" }, { status: 500 });
  }
}
