import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(request: Request) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "CSV export is not enabled." }, { status: 404 });
  }
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (provided !== token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const database = await db.read();
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = [
    "email,source,created_at",
    ...database.waitlist.map((entry) => [entry.email, entry.source, entry.createdAt].map(escape).join(",")),
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=smartmeal-waitlist.csv",
    },
  });
}
