import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
  return new TextEncoder().encode(value);
}

export async function tokenFor(userId: string) {
  return new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(userId)
    .setIssuedAt().setExpirationTime("30d").sign(secret());
}

export async function userIdFrom(request: NextRequest): Promise<ObjectId | null> {
  const bearer = request.headers.get("authorization");
  if (!bearer?.startsWith("Bearer ")) return null;
  try {
    const { payload } = await jwtVerify(bearer.slice(7), secret());
    return payload.sub && ObjectId.isValid(payload.sub) ? new ObjectId(payload.sub) : null;
  } catch { return null; }
}
