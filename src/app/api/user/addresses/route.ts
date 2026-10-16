import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCurrentUser();
    let userId = session?.userId;

    if (!userId) {
      const demoUser = await prisma.user.findFirst({
        where: { role: "CUSTOMER" }
      });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ addresses: [] });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load addresses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    let userId = session?.userId;

    if (!userId) {
      const demoUser = await prisma.user.findFirst({
        where: { role: "CUSTOMER" }
      });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, addressLine, landmark, city, postalCode, isDefault } = body;

    if (!addressLine) {
      return NextResponse.json({ error: "Address line is required" }, { status: 400 });
    }

    // If marked default, unmark other addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        title: title || "Home",
        addressLine,
        landmark: landmark || null,
        city: city || "Bengaluru",
        postalCode: postalCode || "560001",
        isDefault: Boolean(isDefault)
      }
    });

    return NextResponse.json({ success: true, address: newAddress });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create address" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    await prisma.address.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Address deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete address" }, { status: 500 });
  }
}
