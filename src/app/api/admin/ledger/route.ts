import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const entries = await prisma.financialLedgerEntry.findMany({
      include: {
        order: {
          select: {
            orderNumber: true,
            totalAmount: true,
            paymentMethod: true,
            createdAt: true
          }
        },
        restaurant: {
          select: {
            name: true,
            fssaiNumber: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    const totalInflow = entries
      .filter(e => e.type === "ORDER_PAYMENT")
      .reduce((sum, e) => sum + e.amount, 0);

    const platformCommission = entries
      .filter(e => e.type === "PLATFORM_COMMISSION")
      .reduce((sum, e) => sum + e.amount, 0);

    const refundsDebited = entries
      .filter(e => e.type === "REFUND_DEBIT")
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalInflow: Math.round(totalInflow * 100) / 100,
        platformCommission: Math.round(platformCommission * 100) / 100,
        refundsDebited: Math.round(refundsDebited * 100) / 100,
        netPlatformBalance: Math.round((platformCommission - refundsDebited) * 100) / 100
      },
      entries
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load financial ledger" }, { status: 500 });
  }
}
