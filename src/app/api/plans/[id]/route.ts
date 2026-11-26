import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

function validId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function GET(_request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to open saved plans." }, { status: 401 });

  const { id } = await context.params;
  if (!validId(id)) return NextResponse.json({ error: "Invalid plan id." }, { status: 400 });

  try {
    const saved = await db.findPlan(user.id, id);
    if (!saved) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    return NextResponse.json({
      plan: saved.plan,
      ingredients: saved.ingredients,
      household: saved.household,
      createdAt: saved.createdAt,
    });
  } catch {
    return NextResponse.json({ error: "Could not open that plan right now." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to manage saved plans." }, { status: 401 });

  const { id } = await context.params;
  if (!validId(id)) return NextResponse.json({ error: "Invalid plan id." }, { status: 400 });

  try {
    await db.deletePlan(user.id, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete that plan right now." }, { status: 500 });
  }
}
