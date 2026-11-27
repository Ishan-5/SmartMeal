import { NextResponse } from "next/server";

import { buildAccountExport, accountExportFilename } from "@/lib/account-data";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import { consumeRateLimit } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to export your data." }, { status: 401 });

  const limit = consumeRateLimit(`account-export:${user.id}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many export requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const [plans, sessionCount, waitlist] = await Promise.all([
      db.listPlans(user.id),
      db.countSessions(user.id),
      db.findWaitlistEntry(user.email),
    ]);
    const payload = buildAccountExport({ user, plans, sessionCount, waitlist });
    log.info("Account data exported", { userId: user.id, plans: plans.length });

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${accountExportFilename(user.email)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    log.error("Account export failed", { userId: user.id, error: String(error) });
    return NextResponse.json({ error: "Could not export your data right now." }, { status: 500 });
  }
}
