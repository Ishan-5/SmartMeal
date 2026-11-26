-- SmartMeal free-tier schema.
-- Run this once in your Supabase project's SQL Editor.
-- Column names match the app exactly (camelCase, quoted).

create table if not exists public.users (
  "id" uuid primary key,
  "name" text not null,
  "email" text not null unique,
  "passwordHash" text not null,
  "salt" text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.sessions (
  "token" text primary key,
  "userId" uuid not null references public.users(id) on delete cascade,
  "expiresAt" timestamptz not null
);

create table if not exists public.waitlist (
  "id" uuid primary key,
  "email" text not null unique,
  "source" text not null default 'website',
  "createdAt" timestamptz not null default now()
);

create table if not exists public.plans (
  "id" uuid primary key,
  "userId" uuid not null references public.users(id) on delete cascade,
  "plan" jsonb not null,
  "ingredients" jsonb not null default '[]'::jsonb,
  "household" jsonb not null,
  "createdAt" timestamptz not null default now()
);

create index if not exists sessions_user_id_idx on public.sessions("userId");
create index if not exists plans_user_created_idx on public.plans("userId", "createdAt" desc);
create index if not exists waitlist_created_idx on public.waitlist("createdAt" desc);

-- The app only uses the service role key on the server. No public policies needed.
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.waitlist enable row level security;
alter table public.plans enable row level security;

-- Server-side app uses the service role key.
grant usage on schema public to service_role;
grant all on public.users, public.sessions, public.waitlist, public.plans to service_role;
