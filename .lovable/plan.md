## ResoFlex™ Reset Funnel OS — Build Plan

A complete ₦1,000 entry → ₦3,000 upsell funnel with Paystack, Supabase, referrals, and vault delivery. Built on TanStack Start (same architecture as Next.js App Router — file-based routes + server functions for `/api/*`).

---

### Pages (TanStack file routes)

```
/                  Landing (hero, offer, CTA → /checkout)
/checkout          Email/phone capture → calls /api/checkout → redirect to Paystack
/success           Verifies ref, shows ₦3,000 upsell ONLY, links to /vault
/vault             Gated delivery: PDF links, meal plan, workouts, checklist
/upgrade           ₦3,000 premium checkout (reuses same checkout API)
/$                 Catch-all → redirect to /
```

Session restore: persist `{ user_id, email, ref, last_payment_ref }` in `localStorage`; restore on mount in root layout.

---

### Supabase schema

```
users         id (uuid pk), email (unique), phone, ip, referred_by, created_at
payments      id, user_id, reference (unique), amount, plan ('reset'|'premium'),
              status ('pending'|'success'|'failed'), paystack_event_id (unique),
              created_at, verified_at
referrals     id, referrer_user_id, referred_user_id (unique), payment_id,
              credited (bool), created_at
analytics     id, user_id (nullable), event (page_view|checkout_start|
              payment_success|upsell_click|referral_conversion), meta jsonb, ip, created_at
rate_limits   ip (pk), window_start, count
```

RLS: enabled on all. `payments`, `referrals`, `analytics` writes via server functions using admin client only.

---

### Server functions / API routes

- `POST /api/checkout` (server route) — input: `{ email, plan, ref? }`. Creates/upserts user, applies rate limit (5/10min per IP via `rate_limits` upsert+count), generates unique `reference` (`rf_<plan>_<nanoid>`), inserts `payments` row as `pending`, returns Paystack `authorization_url` from `transaction/initialize`.
- `POST /api/paystack/webhook` (server route, public) — verifies `x-paystack-signature` HMAC-SHA512 with `PAYSTACK_SECRET_KEY`. Accepts only `charge.success`. Idempotent: insert by `paystack_event_id` (unique) — duplicate = 200 noop. Updates payment to `success`, credits referral if applicable, logs analytics.
- `GET /api/vault/verify` — confirms user has a `success` payment before serving vault content.
- Tracking helper `logEvent()` used across pages.

---

### Referral logic

- Landing reads `?ref=<code>` → stores in `localStorage` + a cookie before checkout.
- On checkout, `ref` is sent to `/api/checkout` and stored as `users.referred_by`.
- On `charge.success` webhook, if user has `referred_by`, insert into `referrals` and mark `credited=true` (reward = future feature; structure ready).

---

### Fraud / safety

- IP rate limit table (ad-hoc, as agreed): 5 checkout inits per 10 min per IP.
- Unique constraint on `payments.reference` → no duplicate references.
- Unique constraint on `payments.paystack_event_id` → webhook replay protection.
- Webhook signature verified before any DB write.
- Webhook only processes `event === 'charge.success'`.

---

### Tracking events

Fired client-side to `/api/track`: `page_view`, `checkout_start`, `payment_success` (mirrored server-side from webhook), `upsell_click`, `referral_conversion`.

---

### Secrets to add after approval

- `PAYSTACK_SECRET_KEY` (sk_test_…)
- `PAYSTACK_PUBLIC_KEY` (pk_test_…) — used client-side reference only, fine in code but stored as secret for parity

---

### Vault delivery

Placeholder PDF/asset URLs in `src/assets/vault/` (you'll swap with real files later). Vault page lists:
- ResoFlex 7-Day Reset Kit PDF
- Nigerian fat-loss meal plan PDF
- 10-min home workouts PDF
- Daily checklist PDF
- Upgrade CTA → `/upgrade` for ₦3,000 premium (21-day plan, advanced workouts)

Access logged in `analytics` (event=`vault_access`).

---

### Design direction

Bold wellness-meets-performance aesthetic: deep charcoal background, electric lime/emerald accent, large display serif for headlines (Instrument Serif) + clean sans body (Inter). Conversion-focused: single CTA per section, urgency timer on checkout, social proof strip on landing. Mobile-first (TikTok traffic).

---

### Build order

1. Enable Lovable Cloud + create schema migration
2. Add `PAYSTACK_SECRET_KEY` + `PAYSTACK_PUBLIC_KEY` secrets
3. Landing + checkout + success + vault + upgrade + catch-all routes
4. `/api/checkout` + `/api/paystack/webhook` + `/api/track` server routes
5. Referral capture + session restore
6. Wire Paystack webhook URL: `https://<project>.lovable.app/api/paystack/webhook` (you paste into Paystack dashboard after first deploy)

n8n integration is out of scope for v1 (no Lovable hook for it) — webhook is structured so n8n can subscribe to Supabase row inserts later.
