import type { SavedPlan, User, WaitlistEntry } from "./db";

export interface AccountExport {
  exportedAt: string;
  account: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  plans: Array<{
    id: string;
    createdAt: string;
    plan: SavedPlan["plan"];
    ingredients: SavedPlan["ingredients"];
    household: SavedPlan["household"];
  }>;
  sessions: {
    active: number;
  };
  waitlist: {
    joined: boolean;
    source?: string;
    createdAt?: string;
  };
}

/** Build a downloadable copy without password hashes, salts or session tokens. */
export function buildAccountExport(input: {
  user: User;
  plans: SavedPlan[];
  sessionCount: number;
  waitlist?: WaitlistEntry;
}): AccountExport {
  const { user, plans, sessionCount, waitlist } = input;
  return {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    plans: plans.map((saved) => ({
      id: saved.id,
      createdAt: saved.createdAt,
      plan: saved.plan,
      ingredients: saved.ingredients,
      household: saved.household,
    })),
    sessions: { active: Math.max(0, Math.floor(sessionCount)) },
    waitlist: waitlist
      ? { joined: true, source: waitlist.source, createdAt: waitlist.createdAt }
      : { joined: false },
  };
}

/** Safe for a Content-Disposition filename header. */
export function accountExportFilename(email: string): string {
  const stem =
    email
      .split("@")[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "account";
  return `smartmeal-data-${stem}.json`;
}
