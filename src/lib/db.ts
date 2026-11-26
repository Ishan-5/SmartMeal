import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { enc, sbQuery, supabaseEnabled } from "./supabase";
import type { Household, Ingredient, MealPlan } from "./types";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}

export interface SavedPlan {
  id: string;
  userId: string;
  plan: MealPlan;
  ingredients: Ingredient[];
  household: Household;
  createdAt: string;
}

export interface Database {
  users: User[];
  sessions: Session[];
  waitlist: WaitlistEntry[];
  plans: SavedPlan[];
}

const emptyDb = (): Database => ({ users: [], sessions: [], waitlist: [], plans: [] });

const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "db.json");

/** Serialise local writes so concurrent requests cannot lose data. */
let writeQueue: Promise<unknown> = Promise.resolve();
function locked<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task, task);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function localRead(): Promise<Database> {
  try {
    const raw = await readFile(dbPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<Database>;
    return {
      users: parsed.users ?? [],
      sessions: parsed.sessions ?? [],
      waitlist: parsed.waitlist ?? [],
      plans: parsed.plans ?? [],
    };
  } catch {
    return emptyDb();
  }
}

async function localWrite(database: Database): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dbPath, JSON.stringify(database, null, 2), "utf8");
}

async function read(): Promise<Database> {
  if (!supabaseEnabled) return localRead();
  const [users, sessions, waitlist, plans] = await Promise.all([
    sbQuery<User[]>("users?select=*&order=createdAt.desc"),
    sbQuery<Session[]>("sessions?select=*"),
    sbQuery<WaitlistEntry[]>("waitlist?select=*&order=createdAt.desc"),
    sbQuery<SavedPlan[]>("plans?select=*&order=createdAt.desc&limit=50"),
  ]);
  return { users, sessions, waitlist, plans };
}

async function trimPlans(userId: string) {
  const rows = await sbQuery<Array<{ id: string }>>(`plans?select=id&userId=eq.${enc(userId)}&order=createdAt.desc`);
  const stale = rows.slice(50).map((row) => `"${row.id}"`);
  if (stale.length) {
    await sbQuery(`plans?id=in.(${enc(stale.join(","))})`, { method: "DELETE" });
  }
}

export const db = {
  storageMode: (): "supabase" | "local" => (supabaseEnabled ? "supabase" : "local"),

  read,

  async createUser(name: string, email: string, passwordHash: string, salt: string) {
    const user: User = {
      id: randomUUID(),
      name,
      email: email.toLowerCase(),
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };
    if (supabaseEnabled) {
      const rows = await sbQuery<User[]>("users?select=*", { method: "POST", body: JSON.stringify(user) });
      return rows[0] ?? user;
    }
    return locked(async () => {
      const database = await localRead();
      database.users.push(user);
      await localWrite(database);
      return user;
    });
  },

  async findUserByEmail(email: string) {
    if (supabaseEnabled) {
      const rows = await sbQuery<User[]>(`users?select=*&email=eq.${enc(email.toLowerCase())}&limit=1`);
      return rows[0];
    }
    const database = await localRead();
    return database.users.find((u) => u.email === email.toLowerCase());
  },

  async findUserById(id: string) {
    if (supabaseEnabled) {
      const rows = await sbQuery<User[]>(`users?select=*&id=eq.${enc(id)}&limit=1`);
      return rows[0];
    }
    const database = await localRead();
    return database.users.find((u) => u.id === id);
  },

  async createSession(userId: string, token: string, expiresAt: string) {
    if (supabaseEnabled) {
      await sbQuery(`sessions?userId=eq.${enc(userId)}`, { method: "DELETE" });
      await sbQuery("sessions?select=*", {
        method: "POST",
        body: JSON.stringify({ token, userId, expiresAt } satisfies Session),
      });
      return;
    }
    await locked(async () => {
      const database = await localRead();
      database.sessions = database.sessions.filter((s) => s.userId !== userId);
      database.sessions.push({ token, userId, expiresAt });
      await localWrite(database);
    });
  },

  async findSession(token: string) {
    if (supabaseEnabled) {
      const rows = await sbQuery<Session[]>(`sessions?select=*&token=eq.${enc(token)}&limit=1`);
      return rows[0];
    }
    const database = await localRead();
    return database.sessions.find((s) => s.token === token);
  },

  async deleteSession(token: string) {
    if (supabaseEnabled) {
      await sbQuery(`sessions?token=eq.${enc(token)}`, { method: "DELETE" });
      return;
    }
    await locked(async () => {
      const database = await localRead();
      database.sessions = database.sessions.filter((s) => s.token !== token);
      await localWrite(database);
    });
  },

  async addToWaitlist(email: string, source: string) {
    const normalised = email.toLowerCase();
    if (supabaseEnabled) {
      const existing = await sbQuery<WaitlistEntry[]>(`waitlist?select=*&email=eq.${enc(normalised)}&limit=1`);
      if (existing[0]) return { added: false, entry: existing[0] };
      const entry: WaitlistEntry = {
        id: randomUUID(),
        email: normalised,
        source,
        createdAt: new Date().toISOString(),
      };
      const rows = await sbQuery<WaitlistEntry[]>("waitlist?select=*", { method: "POST", body: JSON.stringify(entry) });
      return { added: true, entry: rows[0] ?? entry };
    }
    return locked(async () => {
      const database = await localRead();
      const existing = database.waitlist.find((entry) => entry.email === normalised);
      if (existing) return { added: false, entry: existing };
      const entry: WaitlistEntry = {
        id: randomUUID(),
        email: normalised,
        source,
        createdAt: new Date().toISOString(),
      };
      database.waitlist.push(entry);
      await localWrite(database);
      return { added: true, entry };
    });
  },

  async savePlan(userId: string, plan: MealPlan, ingredients: Ingredient[], household: Household) {
    const saved: SavedPlan = {
      id: randomUUID(),
      userId,
      plan,
      ingredients,
      household,
      createdAt: new Date().toISOString(),
    };
    if (supabaseEnabled) {
      const rows = await sbQuery<SavedPlan[]>("plans?select=*", { method: "POST", body: JSON.stringify(saved) });
      await trimPlans(userId);
      return rows[0] ?? saved;
    }
    return locked(async () => {
      const database = await localRead();
      database.plans.unshift(saved);
      database.plans = database.plans.slice(0, 50);
      await localWrite(database);
      return saved;
    });
  },

  async listPlans(userId: string) {
    if (supabaseEnabled) {
      return sbQuery<SavedPlan[]>(`plans?select=*&userId=eq.${enc(userId)}&order=createdAt.desc&limit=50`);
    }
    const database = await localRead();
    return database.plans
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};
