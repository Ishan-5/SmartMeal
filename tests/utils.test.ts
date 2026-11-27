import { describe, expect, it } from "vitest";

import { initialiseName, isValidEmail, youtubeSearchUrl } from "../src/lib/utils";

describe("utility helpers", () => {
  it("validates email addresses", () => {
    expect(isValidEmail("  user@example.com ")).toBe(true);
    expect(isValidEmail("user@example")).toBe(false);
    expect(isValidEmail("not an email")).toBe(false);
  });

  it("builds avatar initials", () => {
    expect(initialiseName("  ada lovelace ")).toBe("AL");
    expect(initialiseName("Prince")).toBe("P");
  });

  it("encodes recipe searches", () => {
    expect(youtubeSearchUrl("Egg Skillet")).toBe(
      "https://www.youtube.com/results?search_query=Egg%20Skillet%20recipe",
    );
  });
});
