import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Household, MealPlan } from "../src/lib/types";

let directory: string;
let db: typeof import("../src/lib/db").db;

const household: Household = { people: 2, portions: "regular", days: 3, focus: "protein" };
const plan: MealPlan = {
  days: [],
  groceries: [],
  usedIngredients: [],
  summary: { meals: 0, avgProtein: 0, groceryItems: 0, people: 2, days: 3, servings: 2 },
  createdAt: "2026-01-02T00:00:00.000Z",
};

beforeEach(async () => {
  vi.resetModules();
  directory = await mkdtemp(path.join(tmpdir(), "smartmeal-db-"));
  vi.stubEnv("DATA_DIR", directory);
  vi.stubEnv("SUPABASE_URL", "");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  ({ db } = await import("../src/lib/db"));
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(directory, { recursive: true, force: true });
});

describe("local account data", () => {
  it("finds waitlist entries and counts active sessions", async () => {
    const user = await db.createUser("Ada", "ada@example.com", "hash", "salt");
    await db.createSession(user.id, "session-digest", new Date(Date.now() + 3_600_000).toISOString());
    await db.addToWaitlist("ADA@example.com", "landing");

    expect(await db.countSessions(user.id)).toBe(1);
    expect(await db.findWaitlistEntry("ada@example.com")).toMatchObject({
      email: "ada@example.com",
      source: "landing",
    });

    await db.deleteSession("session-digest");
    expect(await db.countSessions(user.id)).toBe(0);
  });

  it("deletes the account and every linked record", async () => {
    const user = await db.createUser("Ada", "ada@example.com", "hash", "salt");
    await db.createSession(user.id, "session-digest", new Date(Date.now() + 3_600_000).toISOString());
    await db.addToWaitlist(user.email, "landing");
    await db.savePlan(user.id, plan, [], household);

    await db.deleteAccount(user.id, user.email);

    expect(await db.findUserById(user.id)).toBeUndefined();
    expect(await db.findUserByEmail(user.email)).toBeUndefined();
    expect(await db.findWaitlistEntry(user.email)).toBeUndefined();
    expect(await db.listPlans(user.id)).toEqual([]);
    expect(await db.countSessions(user.id)).toBe(0);
  });
});
