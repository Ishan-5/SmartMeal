import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Household, Ingredient, MealPlan } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to see saved plans." }, { status: 401 });
  const plans = await db.listPlans(user.id);
  return NextResponse.json({ plans: plans.map((p) => ({ id: p.id, createdAt: p.createdAt, summary: p.plan.summary })) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to save a plan." }, { status: 401 });

  let body: { plan?: MealPlan; ingredients?: Ingredient[]; household?: Household };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.plan?.days?.length) {
    return NextResponse.json({ error: "There is no plan to save yet." }, { status: 400 });
  }

  const saved = await db.savePlan(user.id, body.plan, body.ingredients ?? [], body.household as Household);
  return NextResponse.json({ ok: true, id: saved.id });
}
