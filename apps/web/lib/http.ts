import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleError(cause: unknown) {
  if (cause instanceof ZodError) return error(cause.issues[0]?.message || "Invalid input");
  if (cause && typeof cause === "object" && "code" in cause && cause.code === 11000)
    return error("This already exists", 409);
  console.error(cause);
  return error("Something went wrong", 500);
}
