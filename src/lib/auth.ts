import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { db, type User } from "./db";

const COOKIE_NAME = process.env.NODE_ENV === "production" ? "__Host-smartmeal_session" : "smartmeal_session";
const SESSION_DAYS = 30;

export function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

export function createSalt(): string {
  return randomBytes(16).toString("hex");
}

function sessionDigest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyPassword(password: string, user: User): boolean {
  const attempted = Buffer.from(hashPassword(password, user.salt), "hex");
  const stored = Buffer.from(user.passwordHash, "hex");
  if (attempted.length !== stored.length) return false;
  return timingSafeEqual(attempted, stored);
}

export async function startSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await db.createSession(userId, sessionDigest(token), expiresAt);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
    priority: "high",
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) await db.deleteSession(sessionDigest(token));
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await db.findSession(sessionDigest(token));
  if (!session || new Date(session.expiresAt).getTime() < Date.now()) return null;
  return (await db.findUserById(session.userId)) ?? null;
}

export const SESSION_COOKIE = COOKIE_NAME;
