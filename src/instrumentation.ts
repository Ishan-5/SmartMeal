export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Fail fast on Vercel instead of silently falling back to ephemeral local JSON.
  const { assertProductionEnvironment } = await import("./lib/env");
  assertProductionEnvironment();
}
