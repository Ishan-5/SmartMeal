import { NextResponse } from "next/server";

import { isAiEnabled, recogniseIngredients } from "@/lib/ai";
import { consumeRateLimit, requestKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
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
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const image = typeof body.image === "string" ? body.image : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType : "image/jpeg";

  if (!image.startsWith("data:image/")) {
    return NextResponse.json({ error: "Please upload an image." }, { status: 400 });
  }
  if (image.length > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "That image is too large. Try a smaller photo." }, { status: 413 });
  }

  const result = await recogniseIngredients(image, mimeType);
  return NextResponse.json(result);
}
