# Security checklist

Repo-native audit workflow, scoped to what actually exists in this app
(Express server in `server.ts`, Firebase Auth, Pesapal payments, Mux video).
Not a substitute for a real pentest — see "Going further" below.

## How to run a check

1. `npm run audit:deps` — dependency CVEs (`npm audit`).
2. `npm run dev` in one terminal, `npm run security:headers` in another —
   verifies the response headers `server.ts:161-176` sets are actually
   present on live routes, and flags the missing CSP header below.
3. Run the `/security-review` skill (built into this Claude Code workspace)
   against a diff before merging any change that touches auth, payments,
   uploads, or webhooks.

## Fixed findings

Found by reading the route handlers directly during the last audit pass,
and fixed the same session:

### 1. ~~IDOR on `GET /api/mux/assets/:assetId`~~ — fixed (server.ts:186-221)
The route required a valid Firebase auth token but never checked that the
requesting user *owned* the asset — any authenticated user could read any
other creator's asset metadata by guessing/enumerating asset IDs. **Fix**:
`POST /api/mux/direct-upload` now stamps the uploader's Firebase UID into
Mux's `new_asset_settings.passthrough` field, which round-trips onto the
created asset. `GET /api/mux/assets/:assetId` now checks
`asset.passthrough === req.user.uid` and returns 404 (not 403, to avoid
confirming the asset exists) otherwise — including for any asset created
before this fix, which has no passthrough and so fails closed. No new
database table needed; this uses Mux's own metadata field.

### 2. ~~No rate limit on `POST /api/mux/direct-upload`~~ — fixed (server.ts:121)
Every other sensitive route (checkout, payouts, auth) was wrapped in
`sensitiveLimiter`; the Mux upload-creation endpoint wasn't. Now is,
matching the existing pattern.

### 3. ~~No `Content-Security-Policy` header~~ — fixed (server.ts:71-85, 143)
Added a CSP covering the app's real external origins (Google Fonts,
Supabase, Mux stream/image delivery, Firebase Auth/Firestore, Vercel
Analytics beacons), enforced in production only — Vite's dev-mode HMR
needs inline/eval script execution a strict CSP would otherwise block.
`style-src` allows `'unsafe-inline'` because components set inline
`style={}` for dynamic values (progress bars, chart widths) with no nonce
plumbing; tightening that further would need a broader refactor.

### 4. Pesapal webhook rate limiting — fixed (server.ts:122-131)
`handlePesapalWebhook` accepts unauthenticated POST/GET pings on 5 route
aliases. **This was never a payment-forgery risk**: the handler never
trusts the webhook body for payment state — it re-queries Pesapal's own
status API (`getPesapalTransactionStatus`) before crediting anything. The
residual risk was availability (flooding the aliases to trigger many
outbound Pesapal lookups), addressed with a generous 300/min-per-IP
limiter — deliberately *not* `sensitiveLimiter`'s fail-closed behavior,
since dropping genuine payment confirmations during a Redis hiccup would
be worse than the flood risk being mitigated. Pesapal v3 has no HMAC
signature scheme to verify against, so this is the practical mitigation
available.

## Ongoing checklist (re-check on every route/auth/payment change)

- **AuthZ, not just AuthN**: every `requireAuth` route that takes an ID
  param — does it verify the resource belongs to `req.user.uid`, or just
  that *some* valid user is logged in? (Finding #1 is this exact bug.)
- **Rate-limit coverage**: does every state-changing or expensive route sit
  behind `createRateLimiter`/`sensitiveLimiter` (`src/lib/rateLimiter.ts`),
  matching the existing pattern at `server.ts:116-131`?
- **CORS**: does `src/lib/cors.ts`'s allow-list still match the real set of
  origins that should be allowed to call `/api/*` with credentials?
- **Webhook trust model**: for any external callback (Pesapal aliases),
  is the payload used only to *look up* authoritative state (safe), or
  trusted directly for amounts/status (unsafe)?
- **Secrets**: no service-role/secret keys in `VITE_`-prefixed env vars
  (browser-exposed) — see the comment in `.env.example` about
  `VITE_SUPABASE_ANON_KEY` vs. the Supabase `service_role` key.
- **Headers**: run `npm run security:headers` after any change to the
  header middleware block (server.ts:161-176).

## Going further: Strix

[Strix](https://github.com/usestrix/strix) is a real open-source autonomous
AI pentesting agent (Apache-2.0) that runs its own agent loop against a
running app and validates findings with actual proof-of-concept exploits.
It's intentionally **not** wired into this repo automatically: it needs its
own LLM API key/budget, and running it means authorizing an agent to
actively attempt exploitation against this app (locally or in a
disposable/staging environment only — never against production). If you
want to run it, install it separately (`pipx install strix-agent` per its
own docs) and point it at a local dev instance — it's a good complement to
the checklist above, not a replacement for fixing findings #1-4.
