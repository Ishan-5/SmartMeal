import { describe, expect, it } from "vitest";

import { isSameOriginRequest } from "../src/lib/security";

function requestWithOrigin(origin?: string): Request {
  return new Request("http://localhost:3000/api/plan", {
    method: "POST",
    headers: origin ? { origin } : {},
  });
}

describe("same-origin guard", () => {
  it("allows local app and non-browser requests", () => {
    expect(isSameOriginRequest(requestWithOrigin())).toBe(true);
    expect(isSameOriginRequest(requestWithOrigin("http://localhost:3000"))).toBe(true);
  });

  it("rejects a foreign browser origin", () => {
    expect(isSameOriginRequest(requestWithOrigin("https://evil.example"))).toBe(false);
  });
});
