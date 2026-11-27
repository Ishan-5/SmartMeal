import { NextResponse } from "next/server";

import { endSession, getCurrentUser, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import { consumeRateLimit } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/security";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to delete your account." }, { status: 401 });

  const limit = consumeRateLimit(`account-delete:${user.id}`, 3, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many deletion attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: { password?: unknown; confirm?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 4_096) return NextResponse.json({ error: "That request is too large." }, { status: 413 });
    body = JSON.parse(raw) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.confirm !== true) {
    return NextResponse.json({ error: "Confirm account deletion to continue." }, { status: 400 });
  }

  const password = String(body.password ?? "");
  if (!password || password.length > 128 || !verifyPassword(password, user)) {
    log.warn("Account deletion rejected", { userId: user.id, reason: "invalid-password" });
    return NextResponse.json({ error: "Password is incorrect." }, { status: 401 });
  }

  try {
    await db.deleteAccount(user.id, user.email);
    await endSession();
    log.warn("Account deleted", { userId: user.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error("Account deletion failed", { userId: user.id, error: String(error) });
    return NextResponse.json({ error: "Could not delete your account right now." }, { status: 500 });
  }
}
