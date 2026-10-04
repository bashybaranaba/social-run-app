import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { db, ensureIndexes } from "@/lib/db";
import { tokenFor } from "@/lib/auth";
import { error, handleError } from "@/lib/http";
import { registration } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const input = registration.parse(await request.json());
    await ensureIndexes();
    const users = (await db()).collection("users");
    if (await users.findOne({ email: input.email })) return error("Email is already registered", 409);
    const result = await users.insertOne({
      name: input.name, email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12), createdAt: new Date()
    });
    return NextResponse.json({ token: await tokenFor(result.insertedId.toString()),
      user: { id: result.insertedId.toString(), name: input.name, email: input.email } }, { status: 201 });
  } catch (cause) { return handleError(cause); }
}
