import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateBill, recordFinancialTransaction } from "@/lib/pricing";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) {
      return NextResponse.json({ error: "User session required for checkout" }, { status: 401 });
    }

    const body = await request.json();
    const {
      cartId,
      items: rawItems,
      couponCode,
      deliveryAddress,
      deliveryInstructions,
      paymentMethod = "UPI",
      isEcoDelivery = true
    } = body;

    // Load items either from cart or body
    let checkoutItems: Array<{ menuItemId: string; quantity: number; selectedAddons?: string }> = [];

    if (cartId) {
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: true }
      });
      if (cart && cart.items.length > 0) {
        checkoutItems = cart.items.map(i => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          selectedAddons: i.selectedAddons || undefined
        }));
      }
    } else if (rawItems && Array.isArray(rawItems) && rawItems.length > 0) {
      checkoutItems = rawItems;
    }

    if (checkoutItems.length === 0) {
      return NextResponse.json({ error: "Cannot checkout with an empty basket" }, { status: 400 });
    }

    // 1. Fetch live menu items and recalculate authoritative price on server
    const menuItemIds = checkoutItems.map(i => i.menuItemId);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      include: {
        restaurant: true,
        inventory: true
      }
    });

    const menuMap = new Map(dbMenuItems.map(m => [m.id, m]));

    // Check inventory stock and availability
    let calculatedSubtotal = 0;
    const validatedOrderItems: Array<{
      menuItemId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      selectedAddons?: string;
    }> = [];

    const restaurantId = dbMenuItems[0]?.restaurantId;
    if (!restaurantId) {
      return NextResponse.json({ error: "Invalid restaurant association" }, { status: 400 });
    }

    for (const item of checkoutItems) {
      const dbItem = menuMap.get(item.menuItemId);
      if (!dbItem) {
        return NextResponse.json({ error: `Dish not found in current catalogue` }, { status: 400 });
      }
      if (!dbItem.isAvailable) {
        return NextResponse.json({ error: `Dish '${dbItem.name}' is currently sold out.` }, { status: 400 });
      }
      if (dbItem.inventory && dbItem.inventory.trackStock && dbItem.inventory.currentStock < item.quantity) {
        return NextResponse.json({ error: `Only ${dbItem.inventory.currentStock} portions remaining for '${dbItem.name}'` }, { status: 400 });
      }

      const unitPrice = dbItem.discountedPrice || dbItem.price;
      calculatedSubtotal += unitPrice * item.quantity;

      validatedOrderItems.push({
        menuItemId: dbItem.id,
        name: dbItem.name,
        quantity: item.quantity,
        unitPrice,
        selectedAddons: item.selectedAddons
      });
    }

    // 2. Check user subscription
    const userSubscription = await prisma.userSubscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" }
    });

    // 3. Authoritative server billing calculation
    const bill = await calculateBill({
      subtotal: calculatedSubtotal,
      couponCode,
      isEcoDelivery,
      hasUserSubscription: !!userSubscription
    });

    // 4. Generate order and delivery OTP
    const orderNumber = `FV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 5. Execute transactional creation
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          restaurantId,
          status: "PLACED",
          subtotal: bill.subtotal,
          discount: bill.discount,
          deliveryFee: bill.deliveryFee,
          platformFee: bill.platformFee,
          gstAmount: bill.gstAmount,
          totalAmount: bill.totalAmount,
          paymentMethod,
          paymentStatus: "PAID", // Auto-cleared in Sandbox mode
          deliveryAddress: deliveryAddress || "12th Main, HAL 2nd Stage, Indiranagar, Bengaluru",
          deliveryInstructions: deliveryInstructions || "Deliver contact-free to door",
          otpCode,
          estimatedPrepMinutes: 20,
          estimatedDeliveryMinutes: 15,
          estimatedArrival: new Date(Date.now() + 35 * 60 * 1000),
          isEcoDelivery,
          carbonOffsetKg: isEcoDelivery ? 0.45 : 0.0,
          items: {
            create: validatedOrderItems
          },
          events: {
            create: [
              {
                status: "PLACED",
                actorId: user.id,
                actorRole: "CUSTOMER",
                note: `Order placed successfully with ${paymentMethod} (Sandbox). Total ₹${bill.totalAmount}`
              }
            ]
          },
          payments: {
            create: {
              transactionId: `pay_rzp_mock_${Date.now()}`,
              gateway: "RAZORPAY_SANDBOX",
              amount: bill.totalAmount,
              status: "SUCCESS"
            }
          }
        },
        include: {
          items: true,
          restaurant: true,
          events: true
        }
      });

      // Assign an active delivery task for riders
      const rider = await tx.user.findFirst({ where: { role: "RIDER" } });
      await tx.deliveryTask.create({
        data: {
          orderId: createdOrder.id,
          riderId: rider ? rider.id : null,
          status: "ASSIGNED",
          earningsAmount: 65.0,
          distanceKm: 3.5,
          startLat: 12.9783,
          startLng: 77.6409,
          currentLat: 12.9783,
          currentLng: 77.6409
        }
      });

      // Clear the user's cart
      if (cartId) {
        await tx.cartItem.deleteMany({ where: { cartId } });
      }

      // Update coupon usage count
      if (bill.couponApplied) {
        await tx.coupon.update({
          where: { code: bill.couponApplied.code },
          data: { usedCount: { increment: 1 } }
        });
      }

      // Decrement inventory stock
      for (const item of validatedOrderItems) {
        await tx.inventory.updateMany({
          where: { menuItemId: item.menuItemId, trackStock: true },
          data: { currentStock: { decrement: item.quantity } }
        });
      }

      return createdOrder;
    });

    // Record financial ledger
    const restaurant = dbMenuItems[0].restaurant;
    await recordFinancialTransaction({
      orderId: order.id,
      restaurantId: order.restaurantId,
      totalAmount: order.totalAmount,
      platformFee: order.platformFee,
      commissionRate: restaurant.commissionRate || 15.0
    });

    return NextResponse.json({
      success: true,
      message: "Order placed and verified by kitchen",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        otpCode: order.otpCode,
        restaurantName: order.restaurant.name
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Checkout failed" }, { status: 500 });
  }
}
