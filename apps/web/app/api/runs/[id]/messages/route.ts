import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { db } from "@/lib/db";
import { userIdFrom } from "@/lib/auth";
import { error, handleError } from "@/lib/http";
import type { Run } from "@/lib/models";

type Context = { params: Promise<{ id: string }> };
async function access(request: NextRequest, context: Context) {
  const userId = await userIdFrom(request);
  if (!userId) return null;
  const { id } = await context.params;
  if (!ObjectId.isValid(id)) return null;
  const run = await (await db()).collection<Run>("runs").findOne({ _id: new ObjectId(id), status: "matched" });
  if (!run || !(run.hostId.equals(userId) || run.acceptedUserId?.equals(userId))) return null;
  return { userId, run };
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const result = await access(request, context);
    if (!result) return error("Chat is available after a match", 403);
    const messages = await (await db()).collection("messages").find({ runId: result.run._id }).sort({ createdAt: 1 }).limit(200).toArray();
    return NextResponse.json({ messages: messages.map(m => ({ id: m._id.toString(), senderId: m.senderId.toString(),
      text: m.text, createdAt: m.createdAt.toISOString() })) });
  } catch (cause) { return handleError(cause); }
}

export async function POST(request: NextRequest, context: Context) {
  try {
    const result = await access(request, context);
    if (!result) return error("Chat is available after a match", 403);
    const { text } = z.object({ text: z.string().trim().min(1).max(1000) }).parse(await request.json());
    const createdAt = new Date();
    const inserted = await (await db()).collection("messages").insertOne({ runId: result.run._id,
      senderId: result.userId, text, createdAt });
    return NextResponse.json({ message: { id: inserted.insertedId.toString(), senderId: result.userId.toString(),
      text, createdAt: createdAt.toISOString() } }, { status: 201 });
  } catch (cause) { return handleError(cause); }
}
