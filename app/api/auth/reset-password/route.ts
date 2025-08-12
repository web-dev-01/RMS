// app/api/auth/reset-password/route.js
import { NextResponse } from "next/server";
import User from "@/models/User";
import connectToDB from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectToDB();
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (
      user.resetPasswordCode !== code ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < Date.now()
    ) {
      return NextResponse.json({ success: false, message: "Invalid or expired reset code" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = "";
    user.resetPasswordExpires = null;
    user.passwordChangedAt = Date.now();
    await user.save();

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
