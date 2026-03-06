import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

export async function GET() {
  try {
    getEnv();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid environment";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
