# Deployment — GitHub → Vercel → reset.resofit.fit

Auto-deploy: every push to `main` triggers a Vercel build; on success Vercel promotes the build to `reset.resofit.fit`. GitHub Actions also pings make.com so your scenario fires in parallel.

---

## 1. One-time setup

### a) Connect GitHub to Lovable
Lovable editor → **GitHub** (top bar) → **Connect to GitHub** → **Create Repository**. All current code syncs automatically going forward (two-way sync).

### b) Import the repo into Vercel
1. https://vercel.com/new → import the new GitHub repo.
2. **Framework Preset:** Other (Vercel will pick up `vercel.json`).
3. **Install Command:** `bun install`
4. **Build Command:** `bun run build` (overridden by `vercel.json`)
5. **Output Directory:** `.vercel/output`
6. Click **Deploy** — first build will succeed but `/api/*` routes 404 until step (c).

### c) Switch to the Vercel adapter (REQUIRED for `/api/*` routes)
The Lovable preview uses a Cloudflare Workers adapter. Vercel needs its own:

```bash
bun add -d @tanstack/start-adapter-vercel
```

Then in `package.json` change the `build` script (only when deploying to Vercel) to:
```json
"build": "vite build --config vite.config.vercel.ts"
```
Or set `VERCEL_BUILD_COMMAND` in Vercel → Project Settings → Build → **Build Command Override**:
```
vite build --config vite.config.vercel.ts
```
Push, redeploy — Vercel now emits `.vercel/output/functions/_server.func/` and every `/api/*` route works.

### d) Domain
Vercel → Project → **Settings → Domains** → add `reset.resofit.fit`. Add the CNAME at your DNS provider:
```
reset   CNAME   cname.vercel-dns.com.
```
Wait for SSL (~1 min). Set as **Primary**.

### e) Add GitHub Actions secret (optional — already hard-coded as a webhook URL, no secret needed)
The make.com webhook URL is public; no secret required. If you ever rotate it, replace it in `.github/workflows/deploy-notify.yml`.

---

## 2. Vercel Environment Variables checklist

Paste these in **Vercel → Project → Settings → Environment Variables**. Mark each for **Production**, **Preview**, and **Development** unless noted.

### Supabase (Lovable Cloud backend)
| Name | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | `https://cegjgcrfhnehwkbnfubl.supabase.co` | server-side |
| `SUPABASE_PUBLISHABLE_KEY` | *(copy from `.env` — `SUPABASE_PUBLISHABLE_KEY`)* | server-side |
| `SUPABASE_PROJECT_ID` | `cegjgcrfhnehwkbnfubl` | server-side |
| `SUPABASE_SERVICE_ROLE_KEY` | *(from Lovable backend panel → Service Role Key)* | **server-only, never expose** |
| `VITE_SUPABASE_URL` | `https://cegjgcrfhnehwkbnfubl.supabase.co` | client bundle |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | *(same value as `SUPABASE_PUBLISHABLE_KEY`)* | client bundle |
| `VITE_SUPABASE_PROJECT_ID` | `cegjgcrfhnehwkbnfubl` | client bundle |

### Paystack
| Name | Value | Notes |
|---|---|---|
| `PAYSTACK_SECRET_KEY` | `sk_live_...` | server-only; from Paystack dashboard → Settings → API Keys |
| `PAYSTACK_PUBLIC_KEY` | `pk_live_...` | client checkout init |
| `VITE_PAYSTACK_PUBLIC_KEY` | `pk_live_...` | mirror for browser |
| `PAYSTACK_WEBHOOK_SECRET` | *(Paystack → Settings → API Keys → Webhook secret)* | verifies `/api/public/paystack-webhook` signatures |

### App
| Name | Value | Notes |
|---|---|---|
| `APP_URL` | `https://reset.resofit.fit` | used for callbacks & emails |
| `VITE_APP_URL` | `https://reset.resofit.fit` | client-side base URL |
| `MAKE_WEBHOOK_URL` | `https://hook.eu1.make.com/p0c26asklninfrxhp2sw6nkdjjb19a89` | optional server-side relay |
| `NODE_ENV` | `production` | Production env only |

After adding/changing any variable: **Deployments → ⋯ → Redeploy** (env vars only apply to new builds).

---

## 3. After first successful deploy

1. **Paystack webhook URL** → set in Paystack dashboard → Settings → API Keys & Webhooks:
   ```
   https://reset.resofit.fit/api/public/paystack-webhook
   ```
2. **make.com scenarios** → point any "Resofit deploy" trigger at the same webhook URL already wired in `.github/workflows/deploy-notify.yml`.
3. Smoke test:
   ```bash
   curl https://reset.resofit.fit/api/verify?reference=test
   # expect 400 invalid reference (proves API route reachable)
   ```

---

## 4. Rollback

Vercel → Deployments → pick the last green deploy → **⋯ → Promote to Production**. Instant, no rebuild.
