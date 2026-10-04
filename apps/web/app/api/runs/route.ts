import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { db, ensureIndexes } from "@/lib/db";
import { userIdFrom } from "@/lib/auth";
import { error, handleError } from "@/lib/http";
import { publicRun, runInput, type Run } from "@/lib/models";

async function withHost(run: Run, viewerId: ObjectId | null) {
  const host = await (await db()).collection("users").findOne({ _id: run.hostId }, { projection: { name: 1 } });
  return { ...publicRun(run, viewerId), hostName: host?.name || "Runner" };
}

export async function GET(request: NextRequest) {
  try {
    const userId = await userIdFrom(request);
    if (!userId) return error("Sign in required", 401);
    const database = await db();
    const params = request.nextUrl.searchParams;
    const mine = params.get("mine") === "true";
    let query: Record<string, unknown>;
    if (mine) {
      query = { $or: [{ hostId: userId }, { acceptedUserId: userId }], startAt: { $gte: new Date(Date.now() - 86400000) } };
    } else {
      const lat = Number(params.get("lat") ?? -1.2864);
      const lng = Number(params.get("lng") ?? 36.8172);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
        return error("Invalid location");
      query = { location: { $near: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: 25000 } },
        startAt: { $gte: new Date() }, status: "open" };
    }
    await ensureIndexes();
    const runs = await database.collection<Run>("runs").find(query).limit(60).toArray();
    if (mine) runs.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    return NextResponse.json({ runs: await Promise.all(runs.map(run => withHost(run, userId))) });
  } catch (cause) { return handleError(cause); }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await userIdFrom(request);
    if (!userId) return error("Sign in required", 401);
    const input = runInput.parse(await request.json());
    const startAt = new Date(input.startAt);
    if (startAt.getTime() < Date.now() + 5 * 60000 || startAt.getTime() > Date.now() + 90 * 86400000)
      return error("Choose a start time between 5 minutes and 90 days from now");
    await ensureIndexes();
    const run: Run = {
      hostId: userId, title: input.title, description: input.description, startAt,
      distanceKm: input.distanceKm, paceMin: input.paceMin,
      location: { type: "Point", coordinates: [input.longitude, input.latitude] },
      placeName: input.placeName, status: "open", createdAt: new Date()
    };
    const result = await (await db()).collection<Run>("runs").insertOne(run);
    run._id = result.insertedId;
    return NextResponse.json({ run: await withHost(run, userId) }, { status: 201 });
  } catch (cause) { return handleError(cause); }
}
