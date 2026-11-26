import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isValidEmail } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: unknown; source?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (email.length > 254 || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const requestedSource = String(body.source ?? "website").toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 60);
  const source = requestedSource || "website";

  try {
    const result = await db.addToWaitlist(email, source);
    return NextResponse.json({
      ok: true,
      alreadyJoined: !result.added,
      message: result.added ? "You're on the list." : "You were already on the list.",
    });
  } catch {
    return NextResponse.json({ error: "Could not join the waitlist right now. Please try again." }, { status: 500 });
  }
}
