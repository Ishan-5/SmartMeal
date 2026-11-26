import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isValidEmail } from "@/lib/utils";

export async function POST(request: Request) {
  let body: { email?: unknown; source?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const result = await db.addToWaitlist(email, String(body.source ?? "website").slice(0, 60));
  return NextResponse.json({
    ok: true,
    alreadyJoined: !result.added,
    message: result.added ? "You're on the list." : "You were already on the list.",
  });
}
