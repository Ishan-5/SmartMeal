import { afterEach, describe, expect, it } from "vitest";

import { inspectEnvironment } from "../src/lib/env";

const keys = [
  "NODE_ENV",
  "APP_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENROUTER_API_KEY",
  "GROQ_API_KEY",
  "ADMIN_TOKEN",
] as const;

const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

function configureProduction() {
  process.env.NODE_ENV = "production";
  process.env.APP_URL = "https://smartmeal.vercel.app";
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  process.env.OPENROUTER_API_KEY = "openrouter-key";
  process.env.GROQ_API_KEY = "groq-key";
  process.env.ADMIN_TOKEN = "a-long-random-admin-token";
}

afterEach(() => {
  for (const key of keys) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("production environment validation", () => {
  it("accepts a complete production configuration", () => {
    configureProduction();
    const report = inspectEnvironment();
    expect(report.ok).toBe(true);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
  });

  it("rejects missing Supabase configuration", () => {
    configureProduction();
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const report = inspectEnvironment();
    expect(report.ok).toBe(false);
    expect(report.errors.join(" ")).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("rejects a non-https public URL", () => {
    configureProduction();
    process.env.APP_URL = "http://localhost:3000";
    const report = inspectEnvironment();
    expect(report.ok).toBe(false);
    expect(report.errors.join(" ")).toContain("https");
  });

  it("warns about optional providers and weak admin tokens", () => {
    configureProduction();
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.GROQ_API_KEY;
    process.env.ADMIN_TOKEN = "short";
    const report = inspectEnvironment();
    expect(report.warnings).toHaveLength(3);
  });
});
