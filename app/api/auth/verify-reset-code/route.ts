import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

interface IVerifyResetCodeBody {
  email: string;
  code: string;
}

export async function POST(req: Request) {
  try {
    const body: IVerifyResetCodeBody = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email and code are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (
      user.resetPasswordCode === code &&
      user.resetPasswordExpires &&
      user.resetPasswordExpires > Date.now()
    ) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json(
      { success: false, message: "Invalid or expired code" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error verifying reset code:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
