import { prisma } from "./prisma";

export interface BillCalculationInput {
  subtotal: number;
  couponCode?: string;
  isEcoDelivery?: boolean;
  hasUserSubscription?: boolean;
  deliveryDistanceKm?: number;
}

export interface BillBreakdown {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  platformFee: number;
  gstAmount: number;
  totalAmount: number;
  couponApplied?: {
    code: string;
    discountValue: number;
  };
}

export async function calculateBill(input: BillCalculationInput): Promise<BillBreakdown> {
  const { subtotal, couponCode, isEcoDelivery = true, hasUserSubscription = false, deliveryDistanceKm = 4 } = input;

  let discount = 0;
  let couponApplied: { code: string; discountValue: number } | undefined = undefined;

  // 1. Validate & calculate coupon if present
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.trim().toUpperCase() }
    });

    if (coupon && coupon.isActive && new Date() <= coupon.expiresAt && subtotal >= coupon.minOrderValue) {
      if (coupon.discountType === "PERCENTAGE") {
        discount = Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount);
      } else {
        discount = Math.min(coupon.discountValue, subtotal);
      }
      couponApplied = {
        code: coupon.code,
        discountValue: discount
      };
    }
  }

  // 2. Delivery fee calculation
  // Base delivery: ₹35 for up to 5km, +₹10 per extra km. Free if subscribed or GREENEARTH coupon
  let deliveryFee = 35;
  if (deliveryDistanceKm > 5) {
    deliveryFee += Math.ceil(deliveryDistanceKm - 5) * 10;
  }
  if (hasUserSubscription || (couponApplied && couponApplied.code === "GREENEARTH")) {
    deliveryFee = 0;
  }

  // 3. Platform fee (₹5 marketplace charge)
  const platformFee = 5.0;

  // 4. GST in India (5% on restaurant food services)
  const discountedFoodValue = Math.max(0, subtotal - discount);
  const gstAmount = Math.round((discountedFoodValue * 0.05) * 100) / 100;

  // 5. Total payable amount
  const totalAmount = Math.round((discountedFoodValue + deliveryFee + platformFee + gstAmount) * 100) / 100;

  return {
    subtotal,
    discount,
    deliveryFee,
    platformFee,
    gstAmount,
    totalAmount,
    couponApplied
  };
}

// Decimal-safe financial ledger transaction recorder
export async function recordFinancialTransaction(params: {
  orderId: string;
  restaurantId: string;
  totalAmount: number;
  platformFee: number;
  commissionRate: number; // e.g. 15%
}) {
  const restaurantShare = Math.round((params.totalAmount * (1 - params.commissionRate / 100)) * 100) / 100;
  const platformShare = Math.round((params.totalAmount - restaurantShare) * 100) / 100;

  await prisma.financialLedgerEntry.createMany({
    data: [
      {
        orderId: params.orderId,
        restaurantId: params.restaurantId,
        type: "ORDER_PAYMENT",
        amount: restaurantShare,
        balanceAfter: restaurantShare,
        reference: `Net settlement to partner after ${params.commissionRate}% commission`
      },
      {
        orderId: params.orderId,
        type: "PLATFORM_COMMISSION",
        amount: platformShare,
        balanceAfter: platformShare,
        reference: `Platform commission and fees for Order ${params.orderId}`
      }
    ]
  });
}
