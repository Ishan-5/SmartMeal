"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  HeartPulse,
  LoaderCircle,
  RotateCcw,
  ShoppingBasket,
  Sparkles,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { formatQuantity } from "@/lib/plan";
import type { GroceryItem, Household, MealPlan } from "@/lib/types";
import type { AiMode } from "@/lib/ai";
import { cn } from "@/lib/utils";

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

function groceryKey(item: GroceryItem): string {
  return `${item.name}-${item.unit}`;
}

export function PlanStep({ plan, household, ingredients, mode, note, user, onBack, onReset }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);

  function toggleCheck(item: GroceryItem) {
    const key = groceryKey(item);
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function savePlan() {
    setSaveState("saving");
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, ingredients, household }),
      });
      if (!response.ok) throw new Error("Could not save your plan.");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  async function copyList() {
    const lines = plan.groceries.map((item) => `• ${item.name} — ${formatQuantity(item.buy, item.unit)}`);
    await navigator.clipboard.writeText(`SmartMeal shopping list\n${lines.join("\n")}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
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
          <p className="field-label">This week</p>
          <p className="text-xs text-muted">{plan.summary.days} days · {plan.summary.people} {plan.summary.people === 1 ? "person" : "people"}</p>
        </div>
        <div className="mt-4 space-y-3">
          {plan.days.map((meal) => (
            <article key={`${meal.day}-${meal.recipe.id}`} className="overflow-hidden rounded-3xl border border-moss/10 bg-paper">
              <button
                type="button"
                onClick={() => setExpanded(expanded === meal.recipe.id ? null : meal.recipe.id)}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-cream/40"
                aria-expanded={expanded === meal.recipe.id}
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
                <div className="border-t border-moss/10 bg-cream/40 px-5 py-5">
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
            <p className="text-xs text-muted">Quantities are scaled for your household.</p>
          </div>
          <button type="button" onClick={() => void copyList()} className="btn-outline !px-4 !py-2 text-xs">
            {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy list</>}
          </button>
        </div>

        {plan.groceries.length ? (
          <div className="mt-4 overflow-hidden rounded-3xl border border-moss/10">
            {plan.groceries.map((item) => {
              const key = groceryKey(item);
              const done = checked.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleCheck(item)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-moss/10 bg-paper px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-cream/40",
                    done && "opacity-50",
                  )}
                >
                  <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-md border", done ? "border-moss bg-moss text-paper" : "border-moss/30")}>
                    {done && <Check className="h-3 w-3" />}
                  </span>
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", categoryColour[item.category] ?? "bg-sage")} />
                  <span className={cn("flex-1 text-sm font-medium text-ink", done && "line-through")}>{item.name}</span>
                  <span className="text-xs text-muted">need {formatQuantity(item.need, item.unit)} · have {formatQuantity(item.have, item.unit)}</span>
                  <span className="w-20 text-right text-sm font-semibold text-moss">{formatQuantity(item.buy, item.unit)}</span>
                </button>
              );
            })}
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
    </div>
  );
}
