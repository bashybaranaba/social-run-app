import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userIdFrom } from "@/lib/auth";
import { error, handleError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const id = await userIdFrom(request);
    if (!id) return error("Sign in required", 401);
    const user = await (await db()).collection("users").findOne({ _id: id }, { projection: { name: 1, email: 1, createdAt: 1 } });
    if (!user) return error("User not found", 404);
    return NextResponse.json({ id: user._id.toString(), name: user.name, email: user.email });
  } catch (cause) { return handleError(cause); }
}
