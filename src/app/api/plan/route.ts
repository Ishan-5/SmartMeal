import { NextResponse } from "next/server";

import { generatePlan, isAiEnabled } from "@/lib/ai";
import { sanitiseIngredients } from "@/lib/ai-output";
import { consumeRateLimit, requestKey } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/security";
import type { Household } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function integerInRange(value: unknown, min: number, max: number, fallback: number): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (isAiEnabled()) {
    const limit = consumeRateLimit(`plan:${requestKey(request)}`, 30, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many plans right now. Please try again in a little while." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }
  }

  let body: { ingredients?: unknown; household?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 100_000) {
      return NextResponse.json({ error: "That request is too large." }, { status: 413 });
    }
    body = JSON.parse(raw) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ingredients = sanitiseIngredients(body.ingredients, 30);
  if (!ingredients.length) {
    return NextResponse.json({ error: "Add at least one ingredient first." }, { status: 400 });
  }

  const raw = (body.household ?? {}) as Partial<Household>;
  const household: Household = {
    people: integerInRange(raw.people, 1, 12, 2),
    portions: oneOf(raw.portions, ["small", "regular", "large"] as const, "regular"),
    days: integerInRange(raw.days, 1, 7, 7),
    focus: oneOf(raw.focus, ["protein", "balanced", "quick"] as const, "protein"),
  };

  try {
    const result = await generatePlan(ingredients, household);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Could not build your plan right now. Please try again." }, { status: 500 });
  }
}
