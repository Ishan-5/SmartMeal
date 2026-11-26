import { NextResponse } from "next/server";

import { isAiEnabled, recogniseIngredients } from "@/lib/ai";
import { consumeRateLimit, requestKey } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 60;

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (isAiEnabled()) {
    const limit = consumeRateLimit(`scan:${requestKey(request)}`, 30, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many scans right now. Please try again in a little while." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }
  }

  let body: { image?: unknown; mimeType?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "That image is too large. Try a smaller photo." }, { status: 413 });
    }
    body = JSON.parse(raw) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const image = typeof body.image === "string" ? body.image : "";
  const match = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(image);
  if (!match) {
    return NextResponse.json({ error: "Please upload a valid image." }, { status: 400 });
  }

  const [, detectedMime, payload] = match;
  if (!allowedMimeTypes.has(detectedMime.toLowerCase())) {
    return NextResponse.json({ error: "Use a JPG, PNG, WEBP or GIF image." }, { status: 400 });
  }
  const bytes = Buffer.from(payload.replace(/\s/g, ""), "base64");
  if (!bytes.length || bytes.length > 6 * 1024 * 1024) {
    return NextResponse.json({ error: "That image is too large or empty. Try a smaller photo." }, { status: 413 });
  }

  try {
    return NextResponse.json(await recogniseIngredients(image, detectedMime.toLowerCase()));
  } catch {
    return NextResponse.json({ error: "Could not read that photo right now. Please try again." }, { status: 500 });
  }
}
