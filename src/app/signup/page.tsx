import type { Metadata } from "next";

import { AuthForm } from "@/components/auth-form";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Create your account",
  description: "Create a free SmartMeal account to save and reopen your meal plans.",
  path: "/signup",
  index: false,
});

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="signup" next={next ?? "/app"} />;
}
