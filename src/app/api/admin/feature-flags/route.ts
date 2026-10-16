import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: "asc" }
    });

    return NextResponse.json({
      success: true,
      flags
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load feature flags" }, { status: 500 });
  }
}

// Toggle a feature flag
export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    const admin = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const body = await request.json();
    const { key, isEnabled, rolloutPercent } = body;

    const updated = await prisma.featureFlag.update({
      where: { key },
      data: {
        isEnabled: isEnabled !== undefined ? isEnabled : undefined,
        rolloutPercent: rolloutPercent !== undefined ? parseInt(rolloutPercent, 10) : undefined,
        updatedAt: new Date()
      }
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        role: admin.role,
        action: "FEATURE_FLAG_TOGGLED",
        targetResource: key,
        details: `Flag ${key} set to ${isEnabled} (Rollout: ${rolloutPercent ?? updated.rolloutPercent}%)`
      }
    });

    return NextResponse.json({
      success: true,
      flag: updated
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update feature flag" }, { status: 500 });
  }
}
