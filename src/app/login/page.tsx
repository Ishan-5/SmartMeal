import type { Metadata } from "next";

import { AuthForm } from "@/components/auth-form";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Log in",
  description: "Log in to reopen your saved SmartMeal plans.",
  path: "/login",
  index: false,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="login" next={next ?? "/app"} />;
}
