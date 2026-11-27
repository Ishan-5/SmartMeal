export interface EnvironmentReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

const isProduction = process.env.NODE_ENV === "production";

function publicUrl(): string | undefined {
  return process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
}

/** Inspect runtime configuration without exposing any secret values. */
export function inspectEnvironment(): EnvironmentReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isProduction) {
    return { ok: true, errors, warnings };
  }

  const url = publicUrl();
  if (!url) {
    errors.push("APP_URL is required in production.");
  } else if (!/^https:\/\//i.test(url)) {
    errors.push("APP_URL must use https in production.");
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production.");
  }

  if (!process.env.OPENROUTER_API_KEY) {
    warnings.push("OPENROUTER_API_KEY is missing; photo scanning will use demo recognition.");
  }
  if (!process.env.GROQ_API_KEY) {
    warnings.push("GROQ_API_KEY is missing; planning will use the local engine.");
  }
  if (!process.env.ADMIN_TOKEN || process.env.ADMIN_TOKEN.length < 16) {
    warnings.push("ADMIN_TOKEN is missing or too short; CSV export is disabled or weak.");
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function assertProductionEnvironment(): void {
  const report = inspectEnvironment();
  for (const warning of report.warnings) {
    console.warn(`[SmartMeal] ${warning}`);
  }
  if (!report.ok) {
    throw new Error(`SmartMeal production configuration is invalid: ${report.errors.join(" ")}`);
  }
}
