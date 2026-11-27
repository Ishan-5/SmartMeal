import { NextResponse } from "next/server";

import { getPlanProvider, getScanProvider } from "@/lib/ai";
import { db } from "@/lib/db";

const models: Record<string, string | undefined> = {
  groq: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  openrouter: process.env.OPENROUTER_MODEL || "particle-ai/particle-1:free",
  gemini: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  openai: process.env.OPENAI_MODEL || "gpt-4o-mini",
};

function describe(provider: string) {
  return { provider, live: provider !== "none", model: provider === "none" ? null : models[provider] ?? null };
}

export async function GET() {
  const scanProvider = getScanProvider();
  const planProvider = getPlanProvider();
  const configurationOk = scanProvider !== "none" && planProvider !== "none";

  return NextResponse.json({
    ok: true,
    configurationOk,
    demoMode: !configurationOk,
    ai: {
      scan: describe(scanProvider),
      plan: describe(planProvider),
    },
    storage: db.storageMode(),
    waitlistExport: Boolean(process.env.ADMIN_TOKEN),
  });
}
