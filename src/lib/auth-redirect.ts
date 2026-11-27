const DEFAULT_REDIRECT = "/app";

/** Resolve a post-login destination without allowing an external redirect. */
export function safeNext(value: string | undefined | null): string {
  if (typeof value !== "string") return DEFAULT_REDIRECT;

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return DEFAULT_REDIRECT;
  }

  try {
    const resolved = new URL(trimmed, "http://localhost");
    if (resolved.origin !== "http://localhost") return DEFAULT_REDIRECT;
    return `${resolved.pathname}${resolved.search}${resolved.hash}` || DEFAULT_REDIRECT;
  } catch {
    return DEFAULT_REDIRECT;
  }
}
