import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, setSessionCookie, SessionPayload } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, demoRole } = body;

    let user;

    // Fast demo login for immediate role testing
    if (demoRole) {
      user = await prisma.user.findFirst({
        where: { role: demoRole }
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
      if (user && password) {
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payload: SessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any
    };

    const token = signToken(payload);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
  }
}
