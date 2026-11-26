import { NextResponse } from "next/server";

import { endSession } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/security";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  await endSession();
  return NextResponse.json({ ok: true });
}
