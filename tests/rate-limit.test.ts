import { describe, expect, it } from "vitest";

import { consumeRateLimit, requestKey } from "../src/lib/rate-limit";

describe("rate limiting", () => {
  it("allows a fixed number of hits then reports retry time", () => {
    const key = `test-${Date.now()}-${Math.random()}`;

    expect(consumeRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(consumeRateLimit(key, 2, 60_000).allowed).toBe(true);
    const blocked = consumeRateLimit(key, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("prefers the platform IP and falls back to the last forwarded value", () => {
    const withRealIp = new Request("http://localhost:3000/api/plan", {
      headers: { "x-real-ip": "1.2.3.4", "x-forwarded-for": "9.9.9.9, 8.8.8.8" },
    });
    const forwardedOnly = new Request("http://localhost:3000/api/plan", {
      headers: { "x-forwarded-for": "9.9.9.9, 8.8.8.8" },
    });

    expect(requestKey(withRealIp)).toBe("1.2.3.4");
    expect(requestKey(forwardedOnly)).toBe("8.8.8.8");
  });
});
