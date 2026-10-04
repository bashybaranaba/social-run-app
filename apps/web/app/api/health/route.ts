import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() {
  try { await (await db()).command({ ping: 1 }); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ ok: false }, { status: 503 }); }
}
