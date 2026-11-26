import { NextResponse } from "next/server";

import { startSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const user = await db.findUserByEmail(email);

  if (!user || !verifyPassword(password, user)) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  await startSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
}
