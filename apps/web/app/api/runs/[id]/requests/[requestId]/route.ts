import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { db } from "@/lib/db";
import { userIdFrom } from "@/lib/auth";
import { error, handleError } from "@/lib/http";
import type { JoinRequest, Run } from "@/lib/models";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string; requestId: string }> }) {
  try {
    const userId = await userIdFrom(request);
    if (!userId) return error("Sign in required", 401);
    const { id, requestId } = await context.params;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(requestId)) return error("Request not found", 404);
    const { status } = z.object({ status: z.enum(["accepted", "declined"]) }).parse(await request.json());
    const database = await db();
    const runs = database.collection<Run>("runs");
    const run = await runs.findOne({ _id: new ObjectId(id), hostId: userId });
    if (!run) return error("Run not found", 404);
    const requests = database.collection<JoinRequest>("requests");
    const join = await requests.findOne({ _id: new ObjectId(requestId), runId: run._id, status: "pending" });
    if (!join) return error("Request not found", 404);
    if (status === "accepted") {
      const updated = await runs.updateOne({ _id: run._id, status: "open", startAt: { $gt: new Date() } },
        { $set: { status: "matched", acceptedUserId: join.userId } });
      if (!updated.modifiedCount) return error("This run is no longer open", 409);
      await requests.updateMany({ runId: run._id }, [{ $set: { status: { $cond: [{ $eq: ["$_id", join._id] }, "accepted", "declined"] } } }]);
    } else {
      await requests.updateOne({ _id: join._id, status: "pending" }, { $set: { status: "declined" } });
    }
    return NextResponse.json({ status });
  } catch (cause) { return handleError(cause); }
}
