import { describe, expect, it } from "vitest";

import { accountExportFilename, buildAccountExport } from "../src/lib/account-data";
import type { SavedPlan, User } from "../src/lib/db";

const user: User = {
  id: "user-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  passwordHash: "super-secret-hash",
  salt: "super-secret-salt",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const savedPlan: SavedPlan = {
  id: "plan-1",
  userId: user.id,
  createdAt: "2026-01-02T00:00:00.000Z",
  household: { people: 2, portions: "regular", days: 3, focus: "protein" },
  ingredients: [],
  plan: {
    days: [],
    groceries: [],
    usedIngredients: [],
    summary: { meals: 0, avgProtein: 0, groceryItems: 0, people: 2, days: 3, servings: 2 },
    createdAt: "2026-01-02T00:00:00.000Z",
  },
};

describe("account export helpers", () => {
  it("exports profile, plans and waitlist state without secrets", () => {
    const result = buildAccountExport({
      user,
      plans: [savedPlan],
      sessionCount: 2,
      waitlist: { id: "w-1", email: user.email, source: " landing ", createdAt: "2026-01-03T00:00:00.000Z" },
    });

    expect(result.account).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
    expect(result.plans).toHaveLength(1);
    expect(result.plans[0]?.id).toBe("plan-1");
    expect(result.sessions).toEqual({ active: 2 });
    expect(result.waitlist).toEqual({
      joined: true,
      source: " landing ",
      createdAt: "2026-01-03T00:00:00.000Z",
    });

    const serialised = JSON.stringify(result);
    expect(serialised).not.toContain("super-secret-hash");
    expect(serialised).not.toContain("super-secret-salt");
  });

  it("marks non-waitlist users and clamps session counts", () => {
    const result = buildAccountExport({ user, plans: [], sessionCount: -3 });
    expect(result.waitlist).toEqual({ joined: false });
    expect(result.sessions).toEqual({ active: 0 });
    expect(result.plans).toEqual([]);
  });

  it("makes safe download filenames", () => {
    expect(accountExportFilename("ada@example.com")).toBe("smartmeal-data-ada.json");
    expect(accountExportFilename("a.b+tag@example.com")).toBe("smartmeal-data-a-b-tag.json");
    expect(accountExportFilename("@@@")).toBe("smartmeal-data-account.json");
  });
});
