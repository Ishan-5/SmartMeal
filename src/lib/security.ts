const allowedOrigins = new Set<string>([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

if (process.env.APP_URL) {
  try {
    allowedOrigins.add(new URL(process.env.APP_URL).origin);
  } catch {
    // Invalid APP_URL is handled elsewhere; do not allow it as an origin here.
  }
}

if (process.env.VERCEL_URL) {
  allowedOrigins.add(`https://${process.env.VERCEL_URL}`);
}

/** Reject browser cross-site writes when an Origin header is present. */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const url = new URL(origin);
    if (allowedOrigins.has(url.origin)) return true;
    const host = request.headers.get("host");
    return Boolean(host && url.host === host);
  } catch {
    return false;
  }
}
