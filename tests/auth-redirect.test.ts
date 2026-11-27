import { describe, expect, it } from "vitest";

import { safeNext } from "../src/lib/auth-redirect";

describe("safe auth redirect", () => {
  it("keeps local paths with queries and hashes", () => {
    expect(safeNext("/app")).toBe("/app");
    expect(safeNext("/app?tab=saved#plans")).toBe("/app?tab=saved#plans");
  });

  it("rejects external and malformed destinations", () => {
    expect(safeNext("https://evil.example")).toBe("/app");
    expect(safeNext("//evil.example")).toBe("/app");
    expect(safeNext("/\\evil.example")).toBe("/app");
    expect(safeNext("javascript:alert(1)")).toBe("/app");
    expect(safeNext(undefined)).toBe("/app");
  });

  it("trims whitespace before deciding", () => {
    expect(safeNext("  /app  ")).toBe("/app");
  });
});
