import { NextResponse } from "next/server";

import { generatePlan, isAiEnabled } from "@/lib/ai";
import { consumeRateLimit, requestKey } from "@/lib/rate-limit";
import type { Household, Ingredient } from "@/lib/types";

export async function POST(request: Request) {
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
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ingredients = Array.isArray(body.ingredients)
    ? (body.ingredients as Ingredient[])
        .filter((i) => i && typeof i.name === "string" && Number(i.quantity) > 0)
        .slice(0, 30)
    : [];

  if (!ingredients.length) {
    return NextResponse.json({ error: "Add at least one ingredient first." }, { status: 400 });
  }

  const raw = (body.household ?? {}) as Partial<Household>;
  const household: Household = {
    people: Math.min(12, Math.max(1, Number(raw.people) || 1)),
    portions: ["small", "regular", "large"].includes(String(raw.portions))
      ? (raw.portions as Household["portions"])
      : "regular",
    days: Math.min(7, Math.max(1, Number(raw.days) || 7)),
    focus: ["protein", "balanced", "quick"].includes(String(raw.focus))
      ? (raw.focus as Household["focus"])
      : "protein",
  };

  const result = await generatePlan(ingredients, household);
  return NextResponse.json(result);
}
