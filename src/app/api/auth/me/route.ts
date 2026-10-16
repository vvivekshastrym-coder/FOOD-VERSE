import { NextResponse } from "next/server";
import { getCurrentUser, clearSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    // Fallback to demo customer user if session cookie is missing so user can explore immediately
    const defaultUser = await prisma.user.findFirst({
      where: { role: "CUSTOMER" },
      include: {
        addresses: true,
        flavorProfile: true,
        loyaltyEntries: { orderBy: { createdAt: "desc" }, take: 1 }
      }
    });

    if (defaultUser) {
      return NextResponse.json({
        user: {
          id: defaultUser.id,
          email: defaultUser.email,
          name: defaultUser.name,
          role: defaultUser.role,
          avatar: defaultUser.avatar,
          addresses: defaultUser.addresses,
          loyaltyPoints: defaultUser.loyaltyEntries[0]?.balanceAfter || 350
        }
      });
    }

    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      addresses: true,
      flavorProfile: true,
      loyaltyEntries: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses,
      loyaltyPoints: user.loyaltyEntries[0]?.balanceAfter || 0
    }
  });
}

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
