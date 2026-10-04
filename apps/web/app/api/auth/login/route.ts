import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tokenFor } from "@/lib/auth";
import { error, handleError } from "@/lib/http";
import { login } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const input = login.parse(await request.json());
    const user = await (await db()).collection("users").findOne({ email: input.email });
    if (!user || !await bcrypt.compare(input.password, user.passwordHash))
      return error("Invalid email or password", 401);
    return NextResponse.json({ token: await tokenFor(user._id.toString()),
      user: { id: user._id.toString(), name: user.name, email: user.email } });
  } catch (cause) { return handleError(cause); }
}
