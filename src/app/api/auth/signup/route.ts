import { NextResponse } from "next/server";

import { createSalt, hashPassword, startSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import { consumeRateLimit, requestKey } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/security";
import { isValidEmail } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const limit = consumeRateLimit(`signup:${requestKey(request)}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many accounts created from this network. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: { name?: unknown; email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 80);
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (email.length > 254 || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "Use between 8 and 128 characters for your password." }, { status: 400 });
  }

  try {
    if (await db.findUserByEmail(email)) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const salt = createSalt();
    const user = await db.createUser(name, email, hashPassword(password, salt), salt);
    await startSession(user.id);
    log.info("Account created", { userId: user.id });
    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    log.error("Signup failed", { error: String(error) });
    return NextResponse.json({ error: "Could not create your account right now. Please try again." }, { status: 500 });
  }
}
