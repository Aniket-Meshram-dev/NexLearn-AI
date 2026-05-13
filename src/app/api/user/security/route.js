import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { send2FAEmail, sendVerificationEmail, sendEnable2FAEmail, sendDisable2FAEmail } from "@/lib/mailer";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    return NextResponse.json({ 
      twoFactorEnabled: user.twoFactorEnabled,
      isVerified: user.isVerified,
      hasPassword: !!user.password,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await request.json();
    const { action, currentPassword, newPassword, otp } = payload;

    if (action === "changePassword") {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return NextResponse.json({ error: "Password must contain at least 8 characters, including upper case, lower case, number, and symbol" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({ message: "Password updated successfully" });
    }

    // New logic for account verification (separate from 2FA)
    if (action === "sendVerification") {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorCode: otpCode, twoFactorExpires: new Date(Date.now() + 10 * 60 * 1000) }
      });
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      await sendVerificationEmail(user.email, otpCode);
      return NextResponse.json({ message: "Verification OTP sent to your email" });
    }

    if (action === "confirmVerification") {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!otp || user.twoFactorCode !== otp || new Date() > user.twoFactorExpires) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: session.user.id },
        data: { isVerified: true, twoFactorCode: null, twoFactorExpires: null }
      });
      return NextResponse.json({ message: "Account successfully verified" });
    }

    if (action === "enable2FA") {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorCode: otpCode, twoFactorExpires: new Date(Date.now() + 10 * 60 * 1000) }
      });
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      await sendEnable2FAEmail(user.email, otpCode);
      return NextResponse.json({ message: "2FA Activation OTP sent to your email" });
    }

    if (action === "verify2FA") {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!otp || user.twoFactorCode !== otp || new Date() > user.twoFactorExpires) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorEnabled: true, twoFactorCode: null, twoFactorExpires: null }
      });
      return NextResponse.json({ message: "Two-Factor Authentication enabled" });
    }

    if (action === "disable2FA") {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorCode: otpCode, twoFactorExpires: new Date(Date.now() + 10 * 60 * 1000) }
      });
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      await sendDisable2FAEmail(user.email, otpCode);
      return NextResponse.json({ message: "Disable 2FA OTP sent to your email" });
    }

    if (action === "confirmDisable2FA") {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      
      if (!otp || user.twoFactorCode !== otp || new Date() > user.twoFactorExpires) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          twoFactorEnabled: false,
          twoFactorCode: null,
          twoFactorExpires: null
        }
      });
      return NextResponse.json({ message: "Two-Factor Authentication disabled" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Security API error:", err);
    return NextResponse.json({ error: "Server error: " + err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Delete the user - Prisma cascade will remove all related data
    // (courses, modules, quizzes, bookmarks, notifications, achievements, study sessions)
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    return NextResponse.json({ success: true, message: "Account and all data permanently deleted." });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: "Failed to delete account: " + err.message }, { status: 500 });
  }
}
