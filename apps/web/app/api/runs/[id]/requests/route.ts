import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { db, ensureIndexes } from "@/lib/db";
import { userIdFrom } from "@/lib/auth";
import { error, handleError } from "@/lib/http";
import type { JoinRequest, Run } from "@/lib/models";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await userIdFrom(request);
    if (!userId) return error("Sign in required", 401);
    const { id } = await context.params;
    if (!ObjectId.isValid(id)) return error("Run not found", 404);
    const database = await db();
    const run = await database.collection<Run>("runs").findOne({ _id: new ObjectId(id) });
    if (!run || run.status !== "open" || run.startAt < new Date()) return error("This run is no longer open", 409);
    if (run.hostId.equals(userId)) return error("You cannot join your own run");
    await ensureIndexes();
    const result = await database.collection<JoinRequest>("requests").updateOne(
      { runId: run._id!, userId },
      { $setOnInsert: { runId: run._id!, userId, status: "pending", createdAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ status: result.upsertedCount ? "pending" : "already_requested" });
  } catch (cause) { return handleError(cause); }
}
