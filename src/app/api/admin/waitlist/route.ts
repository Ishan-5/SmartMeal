import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const runtime = "nodejs";

function authorised(provided: string | undefined, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function csvCell(value: string): string {
  const prefixed = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${prefixed.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "CSV export is not enabled." }, { status: 404 });
  }

  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!authorised(provided, token)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const database = await db.read();
    const rows = [
      "email,source,created_at",
      ...database.waitlist.map((entry) => [entry.email, entry.source, entry.createdAt].map(csvCell).join(",")),
    ];
    return new NextResponse(rows.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=smartmeal-waitlist.csv",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not export the waitlist right now." }, { status: 500 });
  }
}
