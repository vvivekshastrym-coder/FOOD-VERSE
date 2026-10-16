import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) {
      return NextResponse.json({ items: [], subtotal: 0 });
    }

    let cart = await prisma.cart.findFirst({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                restaurant: true,
                assets: true
              }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: {
          items: {
            include: {
              menuItem: {
                include: {
                  restaurant: true,
                  assets: true
                }
              }
            }
          }
        }
      });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    return NextResponse.json({
      cartId: cart.id,
      items: cart.items,
      subtotal
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load cart" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const body = await request.json();
    const { menuItemId, quantity = 1, variantId, selectedAddons, customInstructions } = body;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { portionVariants: true }
    });

    if (!menuItem) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    let unitPrice = menuItem.discountedPrice || menuItem.price;
    if (variantId) {
      const variant = menuItem.portionVariants.find(v => v.id === variantId);
      if (variant) unitPrice = variant.price;
    }

    let cart = await prisma.cart.findFirst({
      where: { userId: user.id }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id,
          restaurantId: menuItem.restaurantId
        }
      });
    } else {
      // Check for multi-restaurant conflict
      const cartItemsCount = await prisma.cartItem.count({ where: { cartId: cart.id } });
      if (cartItemsCount > 0 && cart.restaurantId && cart.restaurantId !== menuItem.restaurantId) {
        if (body.clearCart) {
          await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
          await prisma.cart.update({
            where: { id: cart.id },
            data: { restaurantId: menuItem.restaurantId }
          });
        } else {
          const currentRest = await prisma.restaurant.findUnique({ where: { id: cart.restaurantId } });
          return NextResponse.json({
            conflict: true,
            currentRestaurantName: currentRest?.name || "another restaurant",
            message: `Your basket contains items from "${currentRest?.name || "another restaurant"}". Do you want to discard them and start a new order?`
          }, { status: 409 });
        }
      } else if (!cart.restaurantId) {
        await prisma.cart.update({
          where: { id: cart.id },
          data: { restaurantId: menuItem.restaurantId }
        });
      }
    }

    // Check if item already in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        menuItemId: menuItem.id,
        variantId: variantId || null
      }
    });

    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity
        }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId: menuItem.id,
          variantId: variantId || null,
          quantity,
          selectedAddons: typeof selectedAddons === "string" ? selectedAddons : JSON.stringify(selectedAddons || []),
          customInstructions: customInstructions || null,
          unitPrice
        }
      });
    }

    return NextResponse.json({ success: true, message: "Added to cart" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add to cart" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get("id");
    const clearAll = searchParams.get("clear") === "true";

    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cart = await prisma.cart.findFirst({ where: { userId: user.id } });
    if (!cart) return NextResponse.json({ success: true });

    if (clearAll) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    } else if (cartItemId) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to remove item" }, { status: 500 });
  }
}
