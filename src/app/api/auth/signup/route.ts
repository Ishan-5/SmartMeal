import { NextResponse } from "next/server";

import { createSalt, hashPassword, startSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidEmail } from "@/lib/utils";

export async function POST(request: Request) {
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
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Use at least 8 characters for your password." }, { status: 400 });
  }
  if (await db.findUserByEmail(email)) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const salt = createSalt();
  const user = await db.createUser(name, email, hashPassword(password, salt), salt);
  await startSession(user.id);

  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
}
