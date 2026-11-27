import { headers } from "next/headers";

type Level = "debug" | "info" | "warn" | "error";

const priority: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const minimum = priority[(process.env.LOG_LEVEL as Level | undefined) ?? "info"] ?? priority.info;

async function currentRequestId(): Promise<string> {
  try {
    const store = await headers();
    return store.get("x-request-id") ?? "no-request-id";
  } catch {
    return "startup";
  }
}

function emit(level: Level, message: string, meta: Record<string, unknown> = {}): void {
  if (priority[level] < minimum) return;

  void currentRequestId().then((requestId) => {
    const line = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      requestId,
      message,
      ...meta,
    });
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  });
}

export const log = {
  debug: (message: string, meta?: Record<string, unknown>) => emit("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => emit("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => emit("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => emit("error", message, meta),
};
