import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    // Generate reset token and 1-hour expiry
    const token = crypto.randomUUID();
    const expiry = new Date(Date.now() + 3600 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpires: expiry,
      },
    });

    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3001"}/reset-password?token=${token}`;

    // Log the link to the server console for local testing
    console.log("\n========================================");
    console.log(`[PASSWORD RESET REQUESTED]`);
    console.log(`User: ${email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log("========================================\n");

    return NextResponse.json({
      success: true,
      message: "Password reset link generated successfully.",
      resetLink, // returned in response so user can test directly from the browser/network panel
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
