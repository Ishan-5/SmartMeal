import { NextResponse } from "next/server";

import { getAiProvider } from "@/lib/ai";
import { db } from "@/lib/db";

export async function GET() {
  const provider = getAiProvider();
  return NextResponse.json({
    ok: true,
    ai: {
      provider,
      live: provider !== "none",
      model: provider === "openrouter"
        ? process.env.OPENROUTER_MODEL || "nvidia/nemotron-3.5-super-vl:free"
        : provider === "gemini"
          ? process.env.GEMINI_MODEL || "gemini-2.5-flash"
          : provider === "openai"
            ? process.env.OPENAI_MODEL || "gpt-4o-mini"
            : null,
    },
    storage: db.storageMode(),
    waitlistExport: Boolean(process.env.ADMIN_TOKEN),
  });
}
