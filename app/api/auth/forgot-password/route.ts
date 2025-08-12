// app/api/auth/forgot-password/route.js
import { NextResponse } from "next/server";
import User from "@/models/User";
import connectToDB from "@/lib/dbConnect";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectToDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
    await user.save();

    // Here you would send resetCode via email using your email service
    console.log(`Reset code for ${email}: ${resetCode}`);

    return NextResponse.json({ success: true, message: "Reset code sent to email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
