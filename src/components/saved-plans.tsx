"use client";

import { CalendarDays, FolderOpen, LoaderCircle, Search, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Household, Ingredient, MealPlan } from "@/lib/types";

interface SavedPlanRow {
  id: string;
  createdAt: string;
  summary: {
    meals: number;
    avgProtein: number;
    days: number;
    people: number;
    groceryItems: number;
  };
}

interface SavedPlanDetail {
  plan: MealPlan;
  ingredients: Ingredient[];
  household: Household;
}

export function SavedPlans({
  onLoad,
}: {
  onLoad: (detail: SavedPlanDetail) => void;
}) {
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<SavedPlanRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/plans");
      const data = (await response.json()) as { plans?: SavedPlanRow[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not load your plans.");
      setPlans(data.plans ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your plans.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) void load();
  }, [open]);

  async function openPlan(id: string) {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`/api/plans/${id}`);
      const data = (await response.json()) as SavedPlanDetail & { error?: string };
      if (!response.ok || !data.plan) throw new Error(data.error ?? "Could not open that plan.");
      onLoad(data);
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not open that plan.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this saved plan? This cannot be undone.")) return;
    setBusyId(id);
    try {
      const response = await fetch(`/api/plans/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete that plan.");
      setPlans((current) => current.filter((plan) => plan.id !== id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete that plan.");
    } finally {
      setBusyId(null);
    }
  }

  const needle = query.trim().toLowerCase();
  const visiblePlans = plans.filter((plan) => {
    const searchable = [
      new Date(plan.createdAt).toLocaleDateString(),
      `${plan.summary.days} days`,
      `${plan.summary.meals} meals`,
      `${plan.summary.avgProtein}g protein`,
      `${plan.summary.groceryItems} to buy`,
    ]
      .join(" ")
      .toLowerCase();
    return !needle || searchable.includes(needle);
  });

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="btn-outline !px-4 !py-2 text-xs"
      >
        <FolderOpen className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Saved plans</span><span className="sm:hidden">Plans</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onClick={() => setOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="saved-plans-title"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-4xl border border-moss/10 bg-paper p-6 shadow-soft sm:rounded-4xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="field-label">Your account</p>
                <h2 id="saved-plans-title" className="font-serif text-2xl text-ink">Saved plans</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-cream text-muted hover:text-moss" aria-label="Close saved plans">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-moss/15 bg-cream/60 px-4 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-muted" />
              <label className="sr-only" htmlFor="saved-plan-search">Search saved plans</label>
              <input
                id="saved-plan-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by date, days or protein…"
                className="w-full bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none"
              />
            </div>

            {error && <p className="mt-4 rounded-xl bg-clay/10 px-4 py-3 text-xs text-clay" role="alert">{error}</p>}

            {loading ? (
              <div className="mt-8 flex items-center justify-center gap-2 py-10 text-sm text-muted">
                <LoaderCircle className="h-4 w-4 animate-spin" /> Loading your plans…
              </div>
            ) : visiblePlans.length ? (
              <div className="mt-6 space-y-3">
                {visiblePlans.map((plan) => (
                  <article key={plan.id} className="flex items-center gap-3 rounded-2xl border border-moss/10 bg-cream/60 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-moss">
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">
                        {new Date(plan.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted">
                        {plan.summary.days} days · {plan.summary.meals} meals · {plan.summary.avgProtein}g avg protein · {plan.summary.groceryItems} to buy
                      </p>
                    </div>
                    <button type="button" onClick={() => void openPlan(plan.id)} disabled={busyId === plan.id} className="rounded-full bg-moss px-3 py-1.5 text-[11px] font-semibold text-paper disabled:opacity-50">
                      Open
                    </button>
                    <button type="button" onClick={() => void remove(plan.id)} disabled={busyId === plan.id} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-cream hover:text-clay disabled:opacity-40" aria-label="Delete plan">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl bg-mint/50 p-6 text-center">
                <p className="font-serif text-lg text-moss">{query ? "No plans match that search" : "No saved plans yet"}</p>
                <p className="mt-1 text-xs text-muted">
                  {query ? "Try a different date or detail." : "Build a week, then save it from the plan screen."}
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
