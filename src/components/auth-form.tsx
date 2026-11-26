"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Leaf, LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";

/** Only allow local paths so `next` cannot become an external redirect. */
function safeNext(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/app";
}

interface Props {
  mode: "login" | "signup";
  next: string;
}

export function AuthForm({ mode, next }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Something went wrong.");
      router.push(safeNext(next));
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-cream">
      <div className="shell grid min-h-screen items-center gap-10 py-12 lg:grid-cols-2 lg:gap-20">
        <div className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-moss text-paper"><Leaf className="h-5 w-5" /></span>
            <span className="font-serif text-2xl font-semibold">SmartMeal</span>
          </Link>
          <div className="mt-14 max-w-lg">
            <p className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> Your AI kitchen assistant</p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.08] tracking-tight">Dinner, with the thinking already done.</h1>
            <p className="muted-text mt-6 text-lg">
              Snap your ingredients, set your household, and get a protein-forward week with an exact shopping list.
            </p>
            <div className="mt-10 space-y-3">
              {["Use what you already have", "Protein-rich meals, every day", "Buy only what you need"].map((item) => (
                <p key={item} className="flex items-center gap-3 text-sm font-medium text-ink">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-mint text-moss"><Check className="h-3.5 w-3.5" /></span>
                  {item}
                </p>
              ))}
            </div>
          </div>
          <p className="mt-16 font-serif text-xl text-moss">Snap. Plan. Eat well.</p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="panel p-7 sm:p-10">
            <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-moss lg:hidden">
              <ArrowLeft className="h-4 w-4" /> Back to site
            </Link>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">
              {mode === "login" ? "Welcome back" : "Start simply"}
            </p>
            <h2 className="mt-2 font-serif text-3xl text-ink">
              {mode === "login" ? "Log in to SmartMeal" : "Create your account"}
            </h2>
            <p className="muted-text mt-3 text-sm">
              {mode === "login"
                ? "Pick up where you left off with your saved plans."
                : "Save your plans and let SmartMeal learn your portions over time."}
            </p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              {mode === "signup" && (
                <div>
                  <label className="field-label" htmlFor="name">Your name</label>
                  <input id="name" className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" required minLength={2} autoComplete="name" />
                </div>
              )}
              <div>
                <label className="field-label" htmlFor="email">Email address</label>
                <input id="email" type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoComplete="email" />
              </div>
              <div>
                <label className="field-label" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="input pr-12"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                    required
                    minLength={mode === "signup" ? 8 : 1}
                    maxLength={128}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-moss"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay" role="alert">{error}</p>}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" /> One moment…</> : <>{mode === "login" ? "Log in" : "Create account"} <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              {mode === "login" ? "New to SmartMeal?" : "Already have an account?"}{" "}
              <Link href={mode === "login" ? `/signup?next=${encodeURIComponent(next)}` : `/login?next=${encodeURIComponent(next)}`} className="font-semibold text-moss hover:underline">
                {mode === "login" ? "Create an account" : "Log in"}
              </Link>
            </p>
            <p className="mt-3 text-center text-xs text-muted">
              Just looking? <Link href="/app" className="font-semibold text-moss hover:underline">Continue with the demo</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
