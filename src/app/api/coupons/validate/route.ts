import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, subtotal = 0 } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, message: "Invalid or inactive coupon code" });
    }

    if (new Date() > coupon.expiresAt) {
      return NextResponse.json({ valid: false, message: "Coupon has expired" });
    }

    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount);
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountAmount,
      description: coupon.description
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Coupon validation error" }, { status: 500 });
  }
}
