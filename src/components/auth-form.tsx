"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth-shell";
import { safeNext } from "@/lib/auth-redirect";
import { cn, isValidEmail } from "@/lib/utils";

interface Props {
  mode: "login" | "signup";
  next: string;
}

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

type Status = "idle" | "loading" | "success";

const copy = {
  login: {
    eyebrow: "Welcome back",
    title: "Log in",
    subtitle: "Your saved plans are one step away.",
    action: "Log in",
    busy: "Logging in…",
  },
  signup: {
    eyebrow: "Start simply",
    title: "Create your account",
    subtitle: "Save plans, portions and grocery lists in one free place.",
    action: "Create account",
    busy: "Creating account…",
  },
};

function fieldClass(hasError?: string): string {
  return cn("input", hasError && "border-clay/60 focus:border-clay focus:ring-clay/10");
}

export function AuthForm({ mode, next }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const target = safeNext(next);
  const busy = status === "loading";
  const locked = status !== "idle";
  const content = copy[mode];
  const switchHref = `/${mode === "login" ? "signup" : "login"}?next=${encodeURIComponent(target)}`;

  function clearError(field: keyof FieldErrors): void {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
  }

  function validate(): boolean {
    const nextErrors: FieldErrors = {};

    if (mode === "signup" && name.trim().length < 2) {
      nextErrors.name = "Please enter your name.";
    }
    if (!email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "That email address does not look right.";
    }
    if (!password) {
      nextErrors.password = "Please enter your password.";
    } else if (mode === "signup" && password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    } else if (password.length > 128) {
      nextErrors.password = "Keep your password under 128 characters.";
    }

    setErrors(nextErrors);
    return Object.values(nextErrors).every((message) => !message);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "idle") return;

    setError("");
    setSuccess("");
    if (!validate()) return;

    setStatus("loading");
    try {
      const payload = {
        ...(mode === "signup" ? { name: name.trim() } : {}),
        email: email.trim().toLowerCase(),
        password,
      };
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        const fallback =
          response.status === 429
            ? "Too many attempts. Please wait a moment and try again."
            : response.status >= 500
              ? "SmartMeal is busy right now. Please try again."
              : "Something went wrong. Please try again.";
        throw new Error(data.error ?? fallback);
      }

      setStatus("success");
      setSuccess(mode === "login" ? "Logged in. Opening your workspace…" : "Account created. Opening your workspace…");
      router.replace(target);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <AuthShell mode={mode}>
      <div className="panel relative p-7 shadow-soft sm:p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-moss">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full border border-moss/15 bg-mint/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-moss sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure
          </span>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">{content.eyebrow}</p>
        <h1 className="mt-2 font-serif text-3xl leading-tight text-ink">{content.title}</h1>
        <p className="muted-text mt-3 text-sm">{content.subtitle}</p>

        <form onSubmit={submit} noValidate aria-busy={busy} className="mt-8 space-y-5">
          {mode === "signup" && (
            <div>
              <label className="field-label" htmlFor="name">
                Your name
              </label>
              <input
                id="name"
                className={fieldClass(errors.name)}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  clearError("name");
                }}
                placeholder="Alex Morgan"
                autoComplete="name"
                maxLength={80}
                disabled={locked}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-2 text-xs font-medium text-clay">
                  {errors.name}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="field-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              className={fieldClass(errors.email)}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearError("email");
              }}
              placeholder="you@example.com"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={254}
              disabled={locked}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-2 text-xs font-medium text-clay">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={cn(fieldClass(errors.password), "pr-12")}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearError("password");
                }}
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                maxLength={128}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                disabled={locked}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={cn(errors.password && "password-error", mode === "signup" && "password-hint") || undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-moss disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                disabled={locked}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-2 text-xs font-medium text-clay">
                {errors.password}
              </p>
            )}
            {mode === "signup" && (
              <p id="password-hint" className={cn("mt-2 flex items-center gap-1.5 text-xs", password.length >= 8 ? "text-moss" : "text-muted")}>
                {password.length >= 8 ? <Check className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
                {password.length >= 8 ? "Password looks good" : "Use at least 8 characters"}
              </p>
            )}
          </div>

          {error && (
            <div role="alert" aria-live="assertive" className="flex gap-3 rounded-2xl border border-clay/20 bg-clay/10 px-4 py-3 text-sm text-clay">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <p role="status" aria-live="polite" className="flex items-center gap-2 rounded-2xl border border-moss/15 bg-mint/50 px-4 py-3 text-sm font-medium text-moss">
              <Check className="h-4 w-4" /> {success}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={locked}>
            {busy ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" /> {content.busy}
              </>
            ) : (
              <>
                {content.action} <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === "login" ? "New to SmartMeal?" : "Already have an account?"}{" "}
          <Link href={switchHref} className="font-semibold text-moss hover:underline">
            {mode === "login" ? "Create an account" : "Log in"}
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-muted">
          Just looking? <Link href="/app" className="font-semibold text-moss hover:underline">Continue with the demo</Link>
        </p>
        {mode === "signup" && (
          <p className="mt-5 text-center text-[11px] leading-relaxed text-muted">
            By creating an account you agree to our <Link href="/terms" className="font-semibold text-moss hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="font-semibold text-moss hover:underline">Privacy Policy</Link>.
          </p>
        )}
      </div>
    </AuthShell>
  );
}
