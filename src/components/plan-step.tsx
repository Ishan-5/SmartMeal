"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Download,
  HeartPulse,
  LoaderCircle,
  RotateCcw,
  ShoppingBasket,
  Sparkles,
  Utensils,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { formatQuantity } from "@/lib/plan";
import type { GroceryItem, Household, IngredientCategory, MealPlan } from "@/lib/types";
import type { AiMode } from "@/lib/ai";
import { cn, youtubeSearchUrl } from "@/lib/utils";

interface Props {
  plan: MealPlan;
  household: Household;
  ingredients: unknown[];
  mode: AiMode | null;
  note: string;
  user: { name: string } | null;
  onBack: () => void;
  onReset: () => void;
}

const categoryColour: Record<string, string> = {
  protein: "bg-[#E8B9A9]",
  vegetable: "bg-[#9DBE8F]",
  dairy: "bg-[#E4D6B4]",
  grain: "bg-[#D9C08E]",
  fruit: "bg-[#E7C56B]",
  pantry: "bg-[#B9C6B5]",
};

const categoryLabel: Record<IngredientCategory, string> = {
  protein: "Protein",
  vegetable: "Vegetables",
  dairy: "Dairy",
  grain: "Grains",
  fruit: "Fruit",
  pantry: "Pantry",
};

type GroceryFilter = "all" | IngredientCategory;

function groceryKey(item: GroceryItem): string {
  return `${item.name}-${item.unit}`;
}

export function PlanStep({ plan, household, ingredients, mode, note, user, onBack, onReset }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [category, setCategory] = useState<GroceryFilter>("all");

  const planKey = `${plan.summary.days}:${plan.days.map((meal) => meal.recipe.id).join("|")}`;
  const groceryCategories = Array.from(new Set(plan.groceries.map((item) => item.category ?? "pantry")));
  const visibleGroceries =
    category === "all" ? plan.groceries : plan.groceries.filter((item) => (item.category ?? "pantry") === category);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`smartmeal-checked:${planKey}`);
      const values = stored ? (JSON.parse(stored) as string[]) : [];
      setChecked(new Set(values));
    } catch {
      setChecked(new Set());
    }
    setCategory("all");
  }, [planKey]);

  function toggleCheck(item: GroceryItem) {
    const key = groceryKey(item);
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        localStorage.setItem(`smartmeal-checked:${planKey}`, JSON.stringify([...next]));
      } catch {
        // Checked state is a convenience; the plan still works without storage.
      }
      return next;
    });
  }

  function markAll(done: boolean) {
    const next = done ? new Set(plan.groceries.map(groceryKey)) : new Set<string>();
    setChecked(next);
    try {
      localStorage.setItem(`smartmeal-checked:${planKey}`, JSON.stringify([...next]));
    } catch {
      // Checked state is a convenience; the plan still works without storage.
    }
  }

  async function savePlan() {
    setSaveState("saving");
    setSaveError("");
    setSessionExpired(false);
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, ingredients, household }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (response.status === 401) {
        setSessionExpired(true);
        throw new Error("Your session expired. Log in to save this plan.");
      }
      if (!response.ok) throw new Error(data.error ?? "Could not save your plan.");
      setSaveState("saved");
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Could not save your plan.");
      setSaveState("error");
    }
  }

  function listText() {
    const lines = plan.groceries.map((item) => `• ${item.name} — ${formatQuantity(item.buy, item.unit)}`);
    return `SmartMeal shopping list\n${plan.summary.days} days · ${plan.summary.people} ${plan.summary.people === 1 ? "person" : "people"}\n\n${lines.join("\n")}`;
  }

  async function copyList() {
    try {
      await navigator.clipboard.writeText(listText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function downloadList() {
    const blob = new Blob([listText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "smartmeal-shopping-list.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">Step 03 · Your week</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">A calmer plan, ready to cook.</h2>
          <p className="muted-text mt-2 text-sm">Built around what you already have, with only the gaps added to your shopping list.</p>
        </div>
        <span className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold", mode === "ai" ? "bg-mint text-moss" : "bg-sand text-moss")}>
          {mode === "ai" ? "Made with AI" : "Demo plan"}
        </span>
      </div>

      {note && <p className="mt-5 rounded-2xl bg-sand/60 px-4 py-3 text-xs text-muted">{note}</p>}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { value: plan.summary.meals, label: "meals planned", icon: Utensils },
          { value: `${plan.summary.avgProtein}g`, label: "average protein", icon: HeartPulse },
          { value: plan.summary.groceryItems, label: "things to buy", icon: ShoppingBasket },
          { value: plan.summary.servings, label: "servings per meal", icon: Sparkles },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-cream p-4">
            <stat.icon className="h-4 w-4 text-moss/60" />
            <p className="mt-3 font-serif text-2xl text-ink">{stat.value}</p>
            <p className="mt-1 text-[11px] text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <p className="field-label">Your {plan.summary.days}-day plan</p>
          <p className="text-xs text-muted">{plan.summary.days} days · {plan.summary.people} {plan.summary.people === 1 ? "person" : "people"}</p>
        </div>
        <div className="mt-4 space-y-3">
          {plan.days.map((meal, index) => (
            <article key={`${meal.day}-${meal.recipe.id}`} className="overflow-hidden rounded-3xl border border-moss/10 bg-paper">
              <button
                type="button"
                id={`meal-button-${index}`}
                onClick={() => setExpanded(expanded === meal.recipe.id ? null : meal.recipe.id)}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-cream/40"
                aria-expanded={expanded === meal.recipe.id}
                aria-controls={`meal-panel-${index}`}
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-mint text-2xl">{meal.recipe.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-clay">{meal.day}</span>
                    <span className="h-1 w-1 rounded-full bg-moss/30" />
                    <span className="flex items-center gap-1 text-[11px] text-muted"><Clock3 className="h-3 w-3" /> {meal.recipe.minutes} min</span>
                  </div>
                  <p className="mt-1 truncate font-serif text-lg text-ink">{meal.recipe.name}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {meal.recipe.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-medium text-muted">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-serif text-2xl text-moss">{meal.protein}<span className="text-sm">g</span></p>
                  <p className="text-[10px] text-muted">protein</p>
                </div>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted transition-transform", expanded === meal.recipe.id && "rotate-180")} />
              </button>
              {expanded === meal.recipe.id && (
                <div id={`meal-panel-${index}`} role="region" aria-labelledby={`meal-button-${index}`} className="border-t border-moss/10 bg-cream/40 px-5 py-5">
                  <p className="field-label">For {meal.servings} {meal.servings === 1 ? "serving" : "servings"}</p>
                  <ol className="mt-2 space-y-2">
                    {meal.recipe.steps.map((step, index) => (
                      <li key={step} className="flex gap-3 text-sm text-ink">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint text-[10px] font-bold text-moss">{index + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {meal.recipe.ingredients.map((item) => (
                      <span key={`${item.name}-${item.unit}`} className="rounded-full border border-moss/10 bg-paper px-3 py-1 text-[11px] text-muted">
                        {formatQuantity(item.quantity * meal.servings, item.unit)} {item.name}
                      </span>
                    ))}
                  </div>
                  <a
                    href={meal.recipe.videoUrl ?? youtubeSearchUrl(meal.recipe.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-moss/15 bg-paper px-3 py-1.5 text-xs font-medium text-moss transition-colors hover:bg-mint"
                  >
                    <Youtube className="h-3.5 w-3.5" /> Watch this recipe on YouTube
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="mt-10 border-t border-moss/10 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="field-label">Grocery list · buy only the gaps</p>
            <p className="text-xs text-muted">
              Quantities are scaled for your household.{" "}
              <span className="font-semibold text-moss">{checked.size} of {plan.groceries.length} picked up</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.groceries.length > 0 && (
              <button
                type="button"
                onClick={() => markAll(checked.size !== plan.groceries.length)}
                className="btn-outline !px-4 !py-2 text-xs"
              >
                {checked.size === plan.groceries.length ? "Clear all" : "Mark all"}
              </button>
            )}
            <button type="button" onClick={downloadList} className="btn-outline !px-4 !py-2 text-xs" aria-label="Download shopping list">
              <Download className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => void copyList()} className="btn-outline !px-4 !py-2 text-xs">
              {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy list</>}
            </button>
            <span className="sr-only" aria-live="polite">{copied ? "Shopping list copied to clipboard." : ""}</span>
          </div>
        </div>

        {plan.groceries.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter grocery list by category">
            <button
              type="button"
              onClick={() => setCategory("all")}
              aria-pressed={category === "all"}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                category === "all" ? "border-moss bg-moss text-paper" : "border-moss/15 bg-paper text-muted hover:border-moss/40 hover:text-moss",
              )}
            >
              All · {plan.groceries.length}
            </button>
            {groceryCategories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                  category === item ? "border-moss bg-moss text-paper" : "border-moss/15 bg-paper text-muted hover:border-moss/40 hover:text-moss",
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", categoryColour[item])} />
                {categoryLabel[item]} · {plan.groceries.filter((grocery) => (grocery.category ?? "pantry") === item).length}
              </button>
            ))}
          </div>
        )}

        {visibleGroceries.length ? (
          <div className="mt-4 overflow-hidden rounded-3xl border border-moss/10">
            {visibleGroceries.map((item) => {
              const key = groceryKey(item);
              const done = checked.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleCheck(item)}
                  aria-pressed={done}
                  className={cn(
                    "flex w-full flex-wrap items-center gap-x-3 gap-y-1 border-b border-moss/10 bg-paper px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-cream/40",
                    done && "opacity-50",
                  )}
                >
                  <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-md border", done ? "border-moss bg-moss text-paper" : "border-moss/30")}>
                    {done && <Check className="h-3 w-3" />}
                  </span>
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", categoryColour[item.category] ?? "bg-sage")} />
                  <span className={cn("min-w-0 flex-1 text-sm font-medium text-ink", done && "line-through")}>{item.name}</span>
                  <span className="shrink-0 text-right text-sm font-semibold text-moss sm:w-20">{formatQuantity(item.buy, item.unit)}</span>
                  <span className="w-full text-[11px] text-muted sm:hidden">need {formatQuantity(item.need, item.unit)} · have {formatQuantity(item.have, item.unit)}</span>
                  <span className="hidden text-xs text-muted sm:inline">need {formatQuantity(item.need, item.unit)} · have {formatQuantity(item.have, item.unit)}</span>
                </button>
              );
            })}
          </div>
        ) : plan.groceries.length ? (
          <div className="mt-4 rounded-3xl bg-mint/60 p-6 text-sm text-moss">
            Nothing to buy in {categoryLabel[category === "all" ? "pantry" : category]}. Try another category.
          </div>
        ) : (
          <div className="mt-4 rounded-3xl bg-mint/60 p-6 text-sm text-moss">
            Everything you need is already in your kitchen. No shopping required.
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-moss/10 pt-8">
        <div className="flex gap-2">
          <button type="button" onClick={onBack} className="btn-outline !px-4"><ArrowLeft className="h-4 w-4" /> Adjust household</button>
          <button type="button" onClick={onReset} className="btn-outline !px-4"><RotateCcw className="h-4 w-4" /> Start over</button>
        </div>
        {user ? (
          <button type="button" onClick={() => void savePlan()} disabled={saveState === "saving" || saveState === "saved"} className="btn-primary disabled:opacity-60">
            {saveState === "saving" ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Saving…</>
              : saveState === "saved" ? <><Check className="h-4 w-4" /> Saved to your account</>
              : saveState === "error" ? "Try saving again" : "Save to my account"}
          </button>
        ) : (
          <Link href="/login?next=/app" className="btn-primary">Log in to save this plan</Link>
        )}
      </div>

      {saveError && (
        <p className="mt-4 rounded-xl bg-clay/10 px-4 py-3 text-xs text-clay" role="alert">
          {saveError}{" "}
          {sessionExpired && <Link href="/login?next=/app" className="font-semibold underline">Log in again</Link>}
        </p>
      )}
    </div>
  );
}
