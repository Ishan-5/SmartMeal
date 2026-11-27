import { NextResponse } from "next/server";

import { getPlanProvider, getScanProvider } from "@/lib/ai";
import { inspectEnvironment } from "@/lib/env";
import { log } from "@/lib/logger";
import { sbQuery, supabaseEnabled } from "@/lib/supabase";

export const runtime = "nodejs";

async function databaseCheck(): Promise<{ ok: boolean; mode: string }> {
  if (!supabaseEnabled) {
    return { ok: process.env.NODE_ENV !== "production", mode: "local-json" };
  }

  try {
    await sbQuery("users?select=id&limit=1");
    return { ok: true, mode: "supabase" };
  } catch {
    return { ok: false, mode: "supabase" };
  }
}

export async function GET(request: Request) {
  const requestId = request.headers.get("x-request-id");
  const environment = inspectEnvironment();
  const database = await databaseCheck();
  const scan = getScanProvider();
  const plan = getPlanProvider();
  const aiLive = scan !== "none" && plan !== "none";
  const healthy = environment.ok && database.ok && (process.env.NODE_ENV !== "production" || aiLive);

  if (!healthy) {
    log.warn("Health check failed", {
      database: database.mode,
      databaseOk: database.ok,
      scan,
      plan,
      errors: environment.errors,
    });
  }

  return NextResponse.json(
    {
      ok: healthy,
      status: healthy ? "healthy" : "degraded",
      requestId,
      checks: {
        environment: { ok: environment.ok, errors: environment.errors, warnings: environment.warnings },
        database: { ok: database.ok, mode: database.mode },
        ai: { ok: aiLive, scan, plan },
      },
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
