# SmartMeal

**Turn a photo of your fridge into a week of protein-forward meals — with an exact shopping list.**

SmartMeal is a real, free-to-run AI kitchen assistant. Upload a photo, edit the recognised inventory, set your household, and get a seven-day plan built around what you already own. Save plans to an account, reopen them later, and export the waitlist as CSV without paying for email tooling.

No credit card, no sign-up needed to try the full flow.

---

## Why it exists

Most meal planners assume an empty kitchen and a full shopping budget. SmartMeal starts with the food you already have, scales portions to the people eating, and only adds the missing gaps to the grocery list.

| Problem | SmartMeal answer |
| --- | --- |
| “What can I cook with this?” | Vision model reads a fridge/pantry photo into an editable inventory |
| “How much do I actually need?” | Every quantity is scaled by household size and portion setting |
| “I don't want to buy protein again” | Protein-first planning enforces a minimum per meal and retries if needed |
| “I lost my plan” | Optional account saves up to 50 plans per user |
| “AI is down” | Automatic fallback to the local planning engine keeps the app usable |
| “Free tier or bust” | OpenRouter + Groq + Supabase + Vercel free tiers, no paid services |

---

## Live product map

| Route | Purpose |
| --- | --- |
| `/` | Landing page, product story, FAQ and waitlist |
| `/app` | Full workspace: scan → household → plan → grocery list |
| `/login`, `/signup` | Accounts for saved plans |
| `/privacy`, `/terms` | Honest policies for a product that handles photos and email |
| `/api/status` | Which provider is live for scanning and planning |
| `/api/admin/waitlist` | CSV export, protected by `ADMIN_TOKEN` |

---

## Run locally

Requires **Node.js 20.6+** (for `node --env-file` in the optional migration script).

```bash
git clone https://github.com/Ishan-5/SmartMeal.git
cd SmartMeal
npm install
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000**. With an empty `.env.local` you get demo recognition and local planning, stored in `data/db.json`. No external service is required.

Useful commands:

```bash
npm run typecheck   # TypeScript only
npm run build       # Production build
npm run check       # Typecheck + build
npm run db:migrate  # Optional: create Supabase tables from DATABASE_URL
```

---

## The free stack

| Job | Service | Free-tier choice |
| --- | --- | --- |
| Photo recognition | OpenRouter | `particle-ai/particle-1:free`, fallback `nvidia/nemotron-3.5-super-vl:free` |
| Weekly planning | Groq | `openai/gpt-oss-120b` |
| Database/auth storage | Supabase | Free Postgres project |
| Hosting | Vercel | Hobby plan and free `*.vercel.app` domain |
| Waitlist export | CSV over HTTP | No paid email service |

Gemini is supported as an optional fallback, but some Google Cloud projects do not have the Gemini free tier enabled and return `403: free tier is not available for this project`. That is why it is not the primary provider.

Every plan includes a YouTube link: an exact URL when the model returns a valid one, otherwise a search for the dish.

---

## Make it real

### 1. Connect the AI

1. Create free keys at [OpenRouter](https://openrouter.ai/keys) and [Groq](https://console.groq.com/keys).
2. Add them to `.env.local`:

```env
OPENROUTER_API_KEY= your-key
OPENROUTER_MODEL=particle-ai/particle-1:free
OPENROUTER_FALLBACK_MODEL=nvidia/nemotron-3.5-super-vl:free
GROQ_API_KEY= your-key
GROQ_MODEL=openai/gpt-oss-120b
```

3. Restart `npm run dev`.

Check the result at `http://localhost:3000/api/status`:

```json
{
  "ok": true,
  "ai": {
    "scan": { "provider": "openrouter", "live": true, "model": "particle-ai/particle-1:free" },
    "plan": { "provider": "groq", "live": true, "model": "openai/gpt-oss-120b" }
  },
  "storage": "supabase",
  "waitlistExport": true
}
```

Recognition tries OpenRouter → Gemini → OpenAI → sample inventory. Planning tries Groq → OpenRouter → Gemini → OpenAI → local engine. A slow or rate-limited provider never breaks the flow.

### 2. Add persistent storage

Local JSON works on your machine, but Vercel's filesystem is read-only and ephemeral. **A deployed product needs Supabase.**

1. Create a free project at [database.new](https://database.new).
2. Open **SQL Editor**, paste `supabase/schema.sql`, and run it.
3. In **Project Settings → API**, copy the **Project URL** and **service_role** key. Never use the anon key.
4. Add to `.env.local`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

5. Restart the server. Accounts, sessions, waitlist entries and saved plans now live in Postgres.

If you prefer running the schema from the CLI, set `DATABASE_URL` and run `npm run db:migrate`.

### 3. Export the waitlist

```env
ADMIN_TOKEN=a-long-random-string
```

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://your-app.vercel.app/api/admin/waitlist \
  -o smartmeal-waitlist.csv
```

Import that CSV into any free email tool. No paid mail service is needed.

### 4. Deploy free on Vercel

1. Push the repository to GitHub.
2. In Vercel, **Add New → Project** and import `Ishan-5/SmartMeal`.
3. Add **all** variables from `.env.local` to the Vercel project, especially:
   - `APP_URL=https://your-project.vercel.app`
   - `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_FALLBACK_MODEL`
   - `GROQ_API_KEY`, `GROQ_MODEL`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_TOKEN`
4. Deploy. Use the free `*.vercel.app` URL; a custom domain costs money.

`APP_URL` must be set before the build so canonical URLs, Open Graph tags, `robots.txt` and `sitemap.xml` use the production domain. A Vercel redeploy is required after changing it.

---

## Environment reference

See `.env.example` for a copyable template. Everything is optional locally; Supabase is required in production.

| Variable | Purpose |
| --- | --- |
| `APP_URL` | Public URL used for metadata, canonical links and sitemap |
| `OPENROUTER_API_KEY` | Free vision key for photo recognition |
| `OPENROUTER_MODEL` | Vision model; default `particle-ai/particle-1:free` |
| `OPENROUTER_FALLBACK_MODEL` | Backup vision model |
| `GROQ_API_KEY` | Free fast text key for planning |
| `GROQ_MODEL` | Plan model; default `openai/gpt-oss-120b` |
| `AI_SCAN_PROVIDER`, `AI_PLAN_PROVIDER` | Force a provider: `groq`, `openrouter`, `gemini`, `openai`, `demo` |
| `AI_TIMEOUT_MS`, `AI_SCAN_TIMEOUT_MS` | Optional provider timeouts in milliseconds; defaults are 20s/25s |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | Optional Gemini fallback |
| `GEMINI_MODEL` | Optional Gemini model override |
| `OPENAI_API_KEY`, `OPENAI_MODEL`, `AI_PROVIDER=openai` | Optional paid fallback; not needed for free setup |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Hosted Postgres storage |
| `DATABASE_URL` | Only used by `npm run db:migrate` |
| `DATA_DIR` | Local JSON fallback directory |
| `ADMIN_TOKEN` | Protects the waitlist CSV export |
| `NEXT_DIST_DIR` | Internal: allows a production build beside a dev server |

Never commit `.env.local`. `.gitignore` also covers `.env.*.local`.

---

## API reference

| Endpoint | Auth | Notes |
| --- | --- | --- |
| `POST /api/scan` | None | `{ image: dataURL, mimeType }`; validates size/type; returns ingredients + mode |
| `POST /api/plan` | None | `{ ingredients, household }`; returns plan, mode and optional note |
| `POST /api/waitlist` | None | `{ email, source }`; duplicate-safe |
| `GET /api/auth/me` | Cookie | Current user or `{ user: null }` |
| `POST /api/auth/signup` | None | Creates account and starts session |
| `POST /api/auth/login` | None | Starts session |
| `POST /api/auth/logout` | Cookie | Ends session |
| `GET /api/plans` | Cookie | Saved plan summaries |
| `POST /api/plans` | Cookie | Saves a validated plan |
| `GET /api/plans/[id]` | Cookie | Reopens a plan owned by the user |
| `DELETE /api/plans/[id]` | Cookie | Deletes a plan owned by the user |
| `GET /api/status` | None | Provider health summary |
| `GET /api/admin/waitlist` | Bearer token | CSV export |

Errors are JSON: `{ "error": "Human-readable message" }`. Rate limits return `429` with `Retry-After`.

---

## How it works

```text
Photo → browser resize → OpenRouter vision → editable inventory
                                      ↓
Household settings → Groq planner → protein check/retry → 7-day plan
                                      ↓
Grocery math → exact buy quantities → copy/download/save
```

`src/lib/ai.ts` owns provider chains and prompts. `src/lib/plan.ts` owns plan assembly, grocery math and aliases. `src/lib/db.ts` switches between Supabase and a local JSON fallback. UI lives in `src/components`, routes in `src/app`.

### Security notes

- The Supabase **service_role** key stays server-side and is never prefixed with `NEXT_PUBLIC_`. It bypasses RLS, so every query is scoped by `userId` in server code.
- Session tokens are random 256-bit values; only their SHA-256 digest is stored. Cookies are `httpOnly`, `SameSite=Lax`, secure in production, and use the `__Host-` prefix there.
- OAuth/password reset are intentionally out of scope for this free MVP. Signing in replaces other sessions for that user.
- Photos are resized in the browser and sent to the recognition provider; images are not written to the database. Saved plans store ingredients and settings only.
- Write endpoints reject cross-site browser requests with an `Origin` header that does not match the app host. Requests without an Origin (curl, server-to-server) still work.
- Rate limits are best-effort and in-memory: 30 scans/plans, 10 signups/waitlist entries and 20 logins per hour per process. They are not a distributed guarantee on serverless.
- External AI calls have `AbortSignal` timeouts and skip the second vision model when the first fails with a fatal 4xx error, so bad keys do not waste the whole fallback chain.
- Signup, login and waitlist are public by design. Add a dedicated WAF or CAPTCHA if you expect abuse.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `/api/status` says both providers are unavailable | Check key names and restart the dev server or redeploy |
| Scan takes ~60s | The primary vision model is busy; the fallback chain is working. Try again later |
| Plan says “Demo plan” | Groq/OpenRouter quota hit, or no key set; local engine took over |
| Deployed signup/waitlist fails silently | Supabase env missing or `supabase/schema.sql` not applied |
| Canonical URL is localhost | Set `APP_URL` and redeploy |
| Gemini returns `403 free tier not available` | Expected on some Google projects; use OpenRouter + Groq |
| `npm run db:migrate` fails | Use Node 20.6+ and set `DATABASE_URL` |
| Build collides with dev server | `NEXT_DIST_DIR=.next-build npm run build`, then delete `.next-build` |

---

## Deployment checklist

- [ ] Supabase project created and `schema.sql` applied
- [ ] `APP_URL` set to the final `https://*.vercel.app` URL
- [ ] OpenRouter, Groq and Supabase variables added in Vercel
- [ ] `ADMIN_TOKEN` set to a long random string
- [ ] `/api/status` reports `live: true` for both providers
- [ ] `/api/admin/waitlist` returns CSV with the bearer token
- [ ] Signup → save plan → reopen plan tested on the deployed URL
- [ ] `/privacy` and `/terms` reachable from the footer

---

## Contributing

Issues and pull requests are welcome at [github.com/Ishan-5/SmartMeal](https://github.com/Ishan-5/SmartMeal). Keep changes small, run `npm run check`, and never commit secrets.

---

**Snap. Plan. Eat well.**
