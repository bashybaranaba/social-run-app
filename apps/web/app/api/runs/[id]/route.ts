import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { db } from "@/lib/db";
import { userIdFrom } from "@/lib/auth";
import { error, handleError } from "@/lib/http";
import { publicRun, type JoinRequest, type Run } from "@/lib/models";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const userId = await userIdFrom(request);
    if (!userId) return error("Sign in required", 401);
    const { id } = await context.params;
    if (!ObjectId.isValid(id)) return error("Run not found", 404);
    const database = await db();
    const run = await database.collection<Run>("runs").findOne({ _id: new ObjectId(id) });
    if (!run) return error("Run not found", 404);
    const host = await database.collection("users").findOne({ _id: run.hostId }, { projection: { name: 1 } });
    const ownRequest = await database.collection<JoinRequest>("requests").findOne({ runId: run._id, userId });
    const isHost = run.hostId.equals(userId);
    const requests = isHost ? await database.collection<JoinRequest>("requests").find({ runId: run._id }).toArray() : [];
    const requestUsers = await Promise.all(requests.map(r => database.collection("users").findOne({ _id: r.userId }, { projection: { name: 1 } })));
    return NextResponse.json({ run: { ...publicRun(run, userId), hostName: host?.name || "Runner" },
      myRequestStatus: ownRequest?.status || null,
      requests: requests.map((r, i) => ({ id: r._id?.toString(), userId: r.userId.toString(),
        userName: requestUsers[i]?.name || "Runner", status: r.status, createdAt: r.createdAt.toISOString() })) });
  } catch (cause) { return handleError(cause); }
}
