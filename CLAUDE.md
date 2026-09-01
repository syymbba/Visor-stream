# Visor Stream

React 19 + Vite 6 + TypeScript SPA served by a single Express server
(`server.ts`) — Vite runs in `middlewareMode`, so there is **one process,
one port (3000)**, no separate Vite dev server to proxy to. Firebase Auth
for identity, Supabase (Postgres) for streams/videos/profiles data, Mux for
video upload/playback, Pesapal for payments/tips/payouts.

## Reference docs

- **[DESIGN.md](DESIGN.md)** — the actual design system (tokens,
  typography, spacing, motion conventions) and known drift to converge on.
  Read before styling anything; don't invent a parallel visual language.
- **[SECURITY.md](SECURITY.md)** — audit checklist and confirmed findings
  (IDOR on Mux asset retrieval, missing rate limit, missing CSP, webhook
  trust model). Re-check the relevant items whenever touching auth,
  payments, uploads, or webhooks.

## i18n

`src/lib/i18n.tsx` provides `useLanguage()` (`t`, `language`, `setLanguage`,
`isRTL`) for 16 languages (en, sw, lg, fr, pt, ar, es, de, zh, hi, ru, ja,
ha, yo, am, zu). Coverage spans UI chrome system-wide — nav, headings, CTA
buttons, empty-states, core form labels across essentially every view — see
DESIGN.md's Known Gaps for the specific deep-panel/data-table/legal-prose
exclusions. When adding new UI chrome (buttons, labels, headers — not
dynamic data/content), add a translated key to all 16 languages in
`i18n.tsx` and use `t('key')` rather than a hardcoded string, to avoid
regressing the coverage that exists. RTL is real and automatic for Arabic
(`dir="rtl"` on `<html>`) — don't add manual LTR-only positioning
(`ml-`/`mr-`/`left-`/`right-`) without checking it still works mirrored.
Luganda/Hausa/Yoruba/Amharic/Zulu translations are best-effort, not
native-reviewed.

## Testing

`npm run test:e2e` (Playwright, headless Chromium) runs `e2e/*.spec.ts`
against the dev server — checks for console/page errors and captures
screenshots to `e2e/screenshots/`. `npm run test:e2e:ui` opens Playwright's
UI mode for interactive debugging. There is no unit/component test
framework yet (no vitest/jest) — don't assume one exists.

## MCP servers

`.mcp.json` configures `supabase` (read-only schema/RLS/migration
inspection — requires `SUPABASE_ACCESS_TOKEN` in the environment) and
`context7` (up-to-date docs for Vite/React/Tailwind/Supabase/Mux, avoids
hallucinated APIs on fast-moving libraries). Prefer Context7 over relying
on training-data knowledge when working with any of those five libraries,
since APIs shift between versions.

## Frontend craftsmanship

- Read [DESIGN.md](DESIGN.md)'s Motion section before adding any
  transition/animation — one house easing curve
  (`cubic-bezier(0.16, 1, 0.3, 1)`), sub-300ms micro-interactions, animate
  `transform`/`opacity` only.
- Reuse `.steam-card` for grid cards instead of hand-rolling
  `bg-slate-900 border-slate-800` again — see DESIGN.md for the existing
  drift and which components still need migrating.
- No orphaned hex/rgba when a Tailwind token or existing arbitrary value
  (`border-[#2a475e]`) already expresses it.
- Every async view needs a real loading, empty, and error state — not just
  the happy path.
- This app is dark-mode only — never add `dark:` variants, there's no
  light palette for them to switch against.
