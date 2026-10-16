import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fileDispute } from "@/lib/trueSize";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type = "TRUE_SIZE_MISMATCH", description, evidencePhotoUrl, claimedWeightG } = body;

    const session = await getCurrentUser();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json({ error: "Please provide a detailed description of the portion mismatch or issue" }, { status: 400 });
    }

    const dispute = await fileDispute({
      orderId: id,
      userId: user.id,
      type,
      description,
      evidencePhotoUrl,
      claimedWeightG
    });

    return NextResponse.json({
      success: true,
      message: "Dispute lodged under FoodVerse True-Size Guarantee. Case assigned to Operations.",
      dispute
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to file dispute" }, { status: 400 });
  }
}
