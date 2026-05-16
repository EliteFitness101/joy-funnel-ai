# Verify the Reset Funnel payment flow end-to-end

Goal: confirm that a ₦1,000 Paystack test payment triggers `charge.success`, updates the Supabase `payments` row to `success`, and unlocks `/vault`. No new features in this step.

## Prerequisites (you do these)

1. **Webhook URL** — In Paystack Dashboard → Settings → API Keys & Webhooks → **Test Webhook URL**, paste:
   ```
   https://project--0a16330a-44fd-4407-a95d-2c801d0d695b.lovable.app/api/public/paystack-webhook
   ```
   (Note: webhook must hit a stable URL, not the preview URL. We'll publish once before testing.)

2. **Confirm `PAYSTACK_SECRET_KEY`** is your **test** key (starts with `sk_test_`). It's already stored as a secret.

3. **Publish the app** so the webhook URL is reachable — click Publish in the top-right.

## Test steps (you run, I observe)

1. Open the published site → `/` → click CTA → `/checkout`
2. Enter email + phone → submit → you're redirected to Paystack
3. Use a Paystack test card:
   - **Card**: `4084 0840 8408 4081`
   - **Expiry**: any future date (e.g. `12/30`)
   - **CVV**: `408`
   - **PIN** (if asked): `0000`
   - **OTP** (if asked): `123456`
4. After success, Paystack redirects back to `/success`
5. `/success` polls `/api/verify` → should flip to "paid" and reveal the upsell
6. Click "Access Vault" → `/vault` should show the ₦1,000 plan assets unlocked

## What I'll check after you run the test

- **Supabase `payments` row** — query for your reference, confirm `status = 'success'`, `verified_at` is set, `paystack_event_id` is populated.
- **Supabase `users` row** — confirm your email is stored.
- **`analytics` table** — confirm `payment_success` event was logged.
- **Server logs** for `/api/public/paystack-webhook` — confirm HMAC verified and `charge.success` was processed (no idempotency duplicates).
- **`/api/verify` response** for the reference — should return `paid: true`.
- **`/api/vault`** entitlement check — should return the reset kit assets.

## If anything fails

I'll pull the exact failure (signature mismatch, missing event, RLS block, etc.) from logs + DB and fix that specific issue — no scope creep.

## Next step after this passes

Once verified, you choose the expansion path:
- `/api/health` + `devops_incidents` table
- ChatB2K rules engine (pg_cron every 15 min reading analytics → writing recommendations)
- TikTok hook / ad-copy generator (Lovable AI Gateway)
- GitHub Actions + Vercel CI/CD setup doc (markdown deliverable, since CI/CD runs outside Lovable)

I'll plan each separately so we don't overbuild.

## Technical notes

- The webhook route is `src/routes/api/public/paystack-webhook.ts` — already verifies HMAC-SHA512, filters to `charge.success`, dedupes on `paystack_event_id`.
- Idempotency: `payments.reference` and `payments.paystack_event_id` both have unique constraints — a replayed webhook is a no-op insert conflict.
- Rate limit (5/10min per IP) is enforced in `/api/checkout` via the `rate_limits` table.
