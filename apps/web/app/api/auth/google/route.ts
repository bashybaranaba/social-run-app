import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { db, ensureIndexes } from "@/lib/db";
import { tokenFor, userIdFrom } from "@/lib/auth";
import { error, handleError } from "@/lib/http";
import { z } from "zod";

const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const bodySchema = z.object({ idToken: z.string().min(20).max(10000) });

export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_WEB_CLIENT_ID;
    if (!clientId) throw new Error("GOOGLE_WEB_CLIENT_ID is not configured");
    const { idToken } = bodySchema.parse(await request.json());
    let claims;
    try {
      ({ payload: claims } = await jwtVerify(idToken, googleKeys, {
        issuer: ["https://accounts.google.com", "accounts.google.com"],
        audience: clientId,
        algorithms: ["RS256"]
      }));
    } catch { return error("Google sign-in could not be verified. Please try again.", 401); }
    if (typeof claims.sub !== "string" || !claims.sub ||
        typeof claims.email !== "string" || claims.email_verified !== true)
      return error("A verified Google email is required", 401);

    const email = claims.email.toLowerCase();
    const name = typeof claims.name === "string" && claims.name.trim()
      ? claims.name.trim().slice(0, 60) : email.split("@")[0];
    await ensureIndexes();
    const users = (await db()).collection("users");
    const currentId = await userIdFrom(request);
    if (request.headers.has("authorization") && !currentId) return error("Sign in again before connecting Google", 401);
    const linked = await users.findOne({ googleSub: claims.sub });
    if (currentId) {
      if (linked && !linked._id.equals(currentId)) return error("This Google account is linked to another RunSide account", 409);
      const current = await users.findOne({ _id: currentId });
      if (!current) return error("Account not found", 404);
      if (current.email !== email) return error("Google email must match your RunSide email", 409);
      if (current.googleSub && current.googleSub !== claims.sub) return error("A different Google account is already linked", 409);
      if (!linked) await users.updateOne({ _id: currentId }, { $set: { googleSub: claims.sub } });
      return NextResponse.json({ token: await tokenFor(currentId.toString()),
        user: { id: currentId.toString(), name: current.name, email: current.email, googleLinked: true } });
    }

    let user = linked;
    if (!user) {
      if (await users.findOne({ email }))
        return error("An account with this email exists. Sign in with your password, then connect Google in Profile.", 409);
      const result = await users.insertOne({ name, email, googleSub: claims.sub, createdAt: new Date() });
      user = await users.findOne({ _id: result.insertedId });
    }
    if (!user) throw new Error("Google account could not be created");
    return NextResponse.json({ token: await tokenFor(user._id.toString()),
      user: { id: user._id.toString(), name: user.name, email: user.email, googleLinked: true } });
  } catch (cause) { return handleError(cause); }
}
