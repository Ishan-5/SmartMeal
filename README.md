# SmartMeal

Your AI kitchen assistant for effortless, protein-rich meals.

Snap a photo of your fridge or pantry, get a usable ingredient inventory, set your household, and receive a weekly protein-forward plan with exact grocery quantities.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Everything works in demo mode with no keys.

## Make it real — 100% free

### 1. Real AI (two free providers)

SmartMeal uses the right free tool for each job:

- **Photo recognition → OpenRouter vision** (`particle-ai/particle-1:free`), because it can see images (~10s). A slower free model (`nvidia/nemotron-3.5-super-vl:free`) is used automatically if the first one is rate-limited.
- **Weekly planning → Groq** (`openai/gpt-oss-120b`), because it is much faster for text (~2-3s instead of ~25s).

Setup:

1. Get an OpenRouter key at https://openrouter.ai/keys and a Groq key at https://console.groq.com/keys.
2. Copy `.env.example` to `.env.local` and set:
   ```env
   OPENROUTER_API_KEY=your-openrouter-key
   OPENROUTER_MODEL=particle-ai/particle-1:free
   OPENROUTER_FALLBACK_MODEL=nvidia/nemotron-3.5-super-vl:free
   GROQ_API_KEY=your-groq-key
   GROQ_MODEL=openai/gpt-oss-120b
   ```
3. Restart `npm run dev`.

Each step falls back automatically: planning tries Groq → OpenRouter → Gemini → OpenAI → local engine; scanning tries OpenRouter → Gemini → OpenAI → sample inventory. The app never breaks because one provider is slow or rate-limited.

Every planned meal includes a **YouTube link**: an exact URL when the AI knows one, otherwise a search for that dish. Open a meal in the plan to see **Watch this recipe on YouTube**.

To check what is live: http://localhost:3000/api/status — it reports `ai.scan` and `ai.plan` separately.

Rate limits (30 scans and 30 plans per hour per IP) protect the free keys.

**Why not Gemini?** Some Google Cloud projects do not have the Gemini free tier enabled and return `403: free tier is not available for this project`. Gemini is still supported as a fallback if your project has free access.

### 2. Persistent data (Supabase free tier)

Local JSON (`data/db.json`) works on your machine but not on a hosted server. For a real deployed product:

1. Create a free project at https://database.new.
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.
3. In **Project Settings → API**, copy the **Project URL** and the **service_role** key (never use the anon key here).
4. Add to `.env.local`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

5. Restart the server. Accounts, sessions, waitlist entries and saved plans now live in Postgres.

### 3. Waitlist export

Set `ADMIN_TOKEN=some-long-random-string` in `.env.local`, then download the list as CSV:

```bash
curl -H "Authorization: Bearer your-token" http://localhost:3000/api/admin/waitlist
```

No paid email service required — you get the emails as a CSV you can import into any free email tool.

### 4. Deploy free on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, **Add New → Project**, import that repo.
3. Add the same environment variables from `.env.local` to the Vercel project.
4. Deploy. You get a free `*.vercel.app` URL.

A custom domain costs money, so the free URL is the zero-cost option.

## Environment reference

See `.env.example`. All values are optional.

| Variable | Purpose |
| --- | --- |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` | Free photo recognition (vision model) |
| `GROQ_API_KEY`, `GROQ_MODEL` | Fast free weekly planning |
| `AI_SCAN_PROVIDER`, `AI_PLAN_PROVIDER` | Optional provider overrides (`groq`, `openrouter`, `gemini`, `openai`) |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Optional Gemini fallback (free tier must be enabled) |
| `OPENAI_API_KEY` + `AI_PROVIDER=openai` | Optional paid alternative provider |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Free hosted Postgres storage |
| `ADMIN_TOKEN` | Protects the waitlist CSV export |
| `DATA_DIR` | Local JSON fallback location |

## Pages and APIs

| Route | What it does |
| --- | --- |
| `/` | Landing page + waitlist form |
| `/app` | Scan → household → plan → grocery list |
| `/login`, `/signup` | Accounts with saved plans |
| `/api/status` | Shows which free services are live |
| `/api/admin/waitlist` | CSV export (requires `ADMIN_TOKEN`) |

## Security note

The Supabase **service role** key must stay server-side. Never prefix it with `NEXT_PUBLIC_`. RLS is enabled on all tables, and the app only accesses them from server routes.
