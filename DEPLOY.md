# Deployment — GitHub → Vercel → reset.resofit.fit

Auto-deploy: every push to `main` triggers a Vercel build; on success Vercel promotes the build to `reset.resofit.fit`. GitHub Actions also pings make.com so your scenario fires in parallel.

---

## 1. One-time setup

### a) Connect GitHub to Lovable
Lovable editor → **GitHub** (top bar) → **Connect to GitHub** → **Create Repository**. All current code syncs automatically going forward (two-way sync).

### b) Import the repo into Vercel
1. https://vercel.com/new → import the new GitHub repo.
2. **Framework Preset:** Other (Vercel picks up `vercel.json`).
3. **Install Command:** `bun install` (from `vercel.json`)
4. **Build Command:** `bun run build:vercel` (from `vercel.json`)
5. **Output Directory:** leave empty. The build emits `.vercel/output` (Vercel Build Output API v3), which Vercel detects automatically — do **not** set an output directory.
6. Click **Deploy**. `/api/*` routes work on the first deploy; no extra adapter package is needed.

### c) How the Vercel build works (no adapter package)
TanStack Start v1 no longer ships per-host adapters — there is **no** `@tanstack/start-adapter-vercel` package. Hosting output comes from Nitro (already a dependency):

- `vite.config.ts` — Lovable/Cloudflare preview config. **Unchanged, do not edit.**
- `vite.config.vercel.ts` — Vercel build config: `tsConfigPaths` + `tailwindcss` + `tanstackStart({ server: { entry: "server" } })` + `nitro({ preset: "vercel" })` + `viteReact`.
- `package.json` → `build:vercel` = `vite build --config vite.config.vercel.ts`.

The build produces `.vercel/output/functions/__server.func/` (one serverless function that serves SSR **and** every route under `src/routes/api/**`) plus static client assets, with a catch-all route `/(.*) → /__server` in `.vercel/output/config.json`. `src/server.ts` (the branded SSR error wrapper) stays the server entry on both hosts.

Verified reachable on the Vercel build output: `/api/checkout`, `/api/verify`, `/api/vault`, `/api/track`, `/api/public/webhook`, `/api/public/paystack-webhook`.


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

---

## 5. Staging / Preview deployments

Vercel auto-deploys **every branch and every PR** that isn't `main` as a
preview, with its own unique URL like `resofit-git-<branch>-<team>.vercel.app`.
Production (`reset.resofit.fit`) is only updated when `main` is pushed.

Recommended flow:

```
feature/* ──▶ open PR ──▶ Vercel preview URL posted in PR ──▶ review
                            │
                            ▼
                       merge to main ──▶ auto-promote to reset.resofit.fit
```

Per-env knobs you can set in **Vercel → Settings → Environment Variables**:
- Mark sensitive vars as **Production only** so previews can't leak secrets.
- Set `APP_URL=https://$VERCEL_URL` on the **Preview** scope so OAuth/callbacks
  resolve to the preview origin instead of `reset.resofit.fit`.

To **block auto-promotion** and require manual approval for production:
Vercel → Project → **Settings → Git → Production Branch** → enable
**"Require approval for production deployments"** (Pro plan).

---

## 6. Make.com webhook signature verification

GitHub Actions now signs every webhook body with HMAC-SHA256 and sends the
digest in the `X-Signature: sha256=<hex>` header. To complete the loop:

1. Generate a shared secret:
   ```bash
   openssl rand -hex 32
   ```
2. Add it as a **GitHub repo secret** → Settings → Secrets and variables →
   Actions → New repository secret → name `MAKE_WEBHOOK_SECRET`.
3. In make.com, add a **Tools → Set variable** step that recomputes the HMAC
   over the raw body using the same secret, then a **Router → Filter** that
   only continues when `{{X-Signature}} == "sha256=" + {{computed}}`.
   Any request without a matching signature is dropped — only signed
   GitHub-triggered events (i.e. Paystack-verified deploys) run automation.

---

## 7. Post-deploy smoke test

The `Smoke test (production)` job in
`.github/workflows/deploy-notify.yml` runs after every `main` push:

1. Waits 90s for Vercel to finish building.
2. `POST https://reset.resofit.fit/api/checkout` with a junk body.
3. Asserts the response is **not 404** (which would mean the Vercel adapter
   is misconfigured) and **not 5xx**. A 400 / 429 = healthy.
4. Pings make.com with the smoke-test result (also HMAC-signed).

To run it manually: GitHub → Actions → **Deploy Notify + Smoke Test** →
**Run workflow**.
