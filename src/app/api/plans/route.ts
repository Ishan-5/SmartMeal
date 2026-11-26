import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Household, Ingredient, MealPlan } from "@/lib/types";

export const runtime = "nodejs";

function validPlan(value: unknown): value is MealPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Partial<MealPlan>;
  return (
    Array.isArray(plan.days) &&
    plan.days.length > 0 &&
    plan.days.length <= 14 &&
    plan.days.every((day) => day && typeof day.day === "string" && day.recipe && typeof day.recipe.name === "string") &&
    Array.isArray(plan.groceries) &&
    plan.groceries.length <= 200 &&
    Boolean(plan.summary && typeof plan.summary.meals === "number")
  );
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to see saved plans." }, { status: 401 });
  try {
    const plans = await db.listPlans(user.id);
    return NextResponse.json({
      plans: plans.map((p) => ({ id: p.id, createdAt: p.createdAt, summary: p.plan.summary })),
    });
  } catch {
    return NextResponse.json({ error: "Could not load saved plans right now." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to save a plan." }, { status: 401 });

  let body: { plan?: unknown; ingredients?: unknown; household?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 1_000_000) {
      return NextResponse.json({ error: "That plan is too large to save." }, { status: 413 });
    }
    body = JSON.parse(raw) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!validPlan(body.plan)) {
    return NextResponse.json({ error: "That plan is not in a savable shape." }, { status: 400 });
  }

  const ingredients = Array.isArray(body.ingredients)
    ? (body.ingredients as Ingredient[]).filter((item) => item && typeof item.name === "string").slice(0, 30)
    : [];
  const household = (body.household ?? {}) as Household;

  try {
    const saved = await db.savePlan(user.id, body.plan, ingredients, household);
    return NextResponse.json({ ok: true, id: saved.id });
  } catch {
    return NextResponse.json({ error: "Could not save your plan right now. Please try again." }, { status: 500 });
  }
}
