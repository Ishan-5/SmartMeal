import { NextResponse } from "next/server";

import { startSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import { consumeRateLimit, requestKey } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/security";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const limit = consumeRateLimit(`login:${requestKey(request)}`, 20, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  try {
    const user = await db.findUserByEmail(email);

    if (!user || !verifyPassword(password, user)) {
      log.warn("Login rejected", { reason: "invalid-credentials" });
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    await startSession(user.id);
    log.info("Login succeeded", { userId: user.id });
    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    log.error("Login failed", { error: String(error) });
    return NextResponse.json({ error: "Could not sign in right now. Please try again." }, { status: 500 });
  }
}
