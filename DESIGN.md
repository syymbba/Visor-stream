# Design system

Rigid, premium design system for Visor Stream — Steam/Prime Video-inspired
structure, dark-mode-first, with strict contrast rules to prevent generic
"AI slop" UI. Grounded in what's actually in the codebase today (confirmed
via grep across `src/components/*` and `src/index.css`), extended where the
brief calls for something new (tertiary accent, explicit contrast rules,
typography scale). Tailwind **v4**, CSS-first config via `@tailwindcss/vite`
— there is no `tailwind.config.*` file and there won't be one; new tokens
go in `src/index.css`, not a JS config.

## 1. Color palette

Dark-mode only. No `dark:` variants anywhere — there's no light palette
for them to switch against, and there shouldn't be one.

### Primary — light blue (existing brand color, retained)

| Token | Hex | Tailwind |
|---|---|---|
| Primary | `#38bdf8` | `sky-400` |
| Primary (deeper, hover/pressed) | `#0284c7` | `sky-600` |
| Primary glow (box-shadow use) | `rgba(56,189,248,0.25)` | `.glow-sky` in `index.css` |

`sky-400`/`#38bdf8` is confirmed as the dominant brand color already (400+
occurrences across components — the Navbar wordmark, primary CTAs, live
indicators, active nav states, focus/hover borders). Keep it as the single
primary — don't introduce a second "brand blue."

### Background — deep charcoal / midnight (existing, formalized)

| Token | Hex | Tailwind | Use |
|---|---|---|---|
| Page background | `#0b0e14` | — (custom, `body` in `index.css`) | App shell background |
| Card background | `#171a21` | — (`.steam-card`) | Default card surface |
| Card hover background | `#1b2838` | — (`.steam-card:hover`) | Card hover/focus state |
| Card border | `rgba(42,71,94,0.6)` | `border-[#2a475e]` | Default card border |
| Fallback surfaces | — | `bg-slate-900` / `bg-slate-950` / `border-slate-800` | One-off, non-card containers |
| Body text | `#e2e8f0` | `text-slate-200` | Default readable text |

### Tertiary — warm/earthy accent (new, formalized)

The brief asks for a warm accent, used *strictly* for badges/secondary
states, to complement the cool primary and read as regionally warm rather
than generic tech-blue. **Amber is already the de-facto tertiary** in this
codebase (170+ occurrences: tip jar, payouts, money-related badges) — this
formalizes it rather than inventing a competing color:

| Token | Hex | Tailwind | Use |
|---|---|---|---|
| Tertiary (amber) | `#f59e0b` | `amber-500` | Badges, tip/payout/money UI, secondary CTAs |
| Tertiary (light, on dark bg) | `#fbbf24` | `amber-400` | Icon fills, small badge text on transparent/dark bg |
| Tertiary glow | `rgba(245,158,11,0.5)` | — (existing pattern, e.g. tip-goal progress bar) | Progress fills, active-goal glow |

Don't add ochre/terracotta as *additional* hex values — that would create a
fourth color family to maintain. If more warmth is wanted in a specific
spot, use `amber-600`/`orange-400` (already Tailwind-native, already used
for the `Flame` "GRAND FINALS" badge) rather than a new custom hex.

### Semantic accents (existing, keep as-is)

| Role | Tailwind |
|---|---|
| Predictions/wagering | `purple-400`/`purple-500` |
| Success/live-positive | `emerald-400`/`emerald-500` |
| Likes/destructive | `rose-400`/`rose-500` |

## 2. Strict contrast rules (fixes generic-UI gray-text issues)

**Rule: any element with a solid `bg-sky-*`, `bg-amber-*`, or `bg-blue-*`
background must use high-contrast text — `text-slate-950` (near-black) or
`text-white` — never a mid-gray (`text-slate-400/500/600`,
`text-gray-400/500`).** This is already followed correctly by every solid
primary-color button and badge found in an audit of `src/components/*`
(they pair `bg-sky-500`/`bg-sky-400`/`bg-blue-500`/`bg-blue-600` with
`text-slate-950`) — this rule exists to make that consistency a hard
requirement going forward, not a retrofit of a bug found in this pass.

- **Solid-fill buttons/badges** (`bg-sky-500`, `bg-amber-500`, etc.):
  text is `text-slate-950` or `text-white`. Never gray.
  ```
  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold ..."
  ```
- **Low-opacity "soft" badges** (`bg-sky-500/20`, `bg-amber-500/15`, etc.):
  text uses the *matching* hue at full/near-full opacity (`text-sky-300`,
  `text-amber-400`), never gray. This is the existing convention for status
  pills and is correct — keep it.
  ```
  className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
  ```
- **Gray text (`text-slate-400`/`text-slate-500`) is reserved for inactive
  states only** — unselected tabs, disabled buttons, secondary metadata on
  a neutral card background (never on a colored fill). If a tab/toggle
  becomes active, its text must switch to a high-contrast pairing per the
  rule above, not stay gray on a new colored background.
- **Minimum contrast**: body text `#e2e8f0` on `#0b0e14`/`#171a21`
  backgrounds already clears WCAG AA by a wide margin — don't introduce
  anything darker than `slate-400` for text that needs to stay readable at
  a glance (stats, timestamps, captions).

## 3. Typography

| Role | Font | Tailwind class | Source |
|---|---|---|---|
| Headings, display numbers, broadcast/esports chrome | Rajdhani | `.font-rajdhani` | Google Fonts (already loaded in `index.html`) |
| Stats, timestamps, IDs, stream keys | JetBrains Mono | `.font-mono-code` | Google Fonts (already loaded) |
| Body copy | Inter (system fallback stack) | default | Google Fonts (already loaded) |

All three are already loaded via the single `<link>` in `index.html` —
don't add a fourth family or a second way to load fonts.

**Scale** (Tailwind defaults, applied consistently):

| Use | Class | Weight |
|---|---|---|
| Hero/page title | `text-2xl sm:text-3xl` + `.font-rajdhani` | `font-black` |
| Section heading | `text-xl sm:text-2xl` + `.font-rajdhani` | `font-black`/`font-bold` |
| Card title | `text-sm sm:text-base` | `font-bold` |
| Body | `text-sm` | `font-medium`/`font-normal` |
| Caption/meta | `text-[11px]`/`text-xs` + `.font-mono-code` for numeric | `font-medium` |
| Badge/pill | `text-[10px]`/`text-[11px]` + `.font-mono-code` | `font-bold` + `uppercase tracking-wide` |

## 4. Layout: grids, spacing, carousels (Steam/Prime Video structure)

- **Dense scannable grids** (Steam library style) for VOD/game listings:
  `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3
  sm:gap-4` — favor more, smaller tiles over fewer large ones; this is
  already the pattern in `LibraryView.tsx`/`GamesView.tsx`.
- **Horizontal carousels** (Prime Video row style) for curated/featured
  content: `flex gap-3 overflow-x-auto scroll-contained snap-x
  snap-mandatory` with each item `shrink-0 snap-start`. Use
  `.scroll-contained` (already in `index.css`) to prevent scroll-chaining
  into the page.
- **Immersive hero banners**: full-bleed `aspect-video` or taller media
  with a `bg-gradient-to-t from-slate-950 via-transparent to-transparent`
  overlay for legible text over the image — the existing pattern in
  `LandingPageView.tsx`/`LivePlayerView.tsx` thumbnail overlays.
- **Spacing scale**: Tailwind defaults (`gap-1`…`gap-4`, `p-3`/`p-4`/`p-6`),
  with a consistent mobile-first upsize: `p-4 sm:p-6`, `rounded-2xl
  sm:rounded-3xl`. Don't jump straight to the desktop size on mobile.
- **Radius**: standardize on the Tailwind scale — `rounded-xl` for small
  controls, `rounded-2xl` for standard cards, `rounded-3xl` for large
  hero/feature containers. Several existing containers use arbitrary pixel
  radii (`rounded-[24px]`/`[28px]`/`[32px]` in `GamesView.tsx`,
  `TutorialsView.tsx`, `AboutPolicyView.tsx`) — those are legacy, not a
  second intentional scale; migrate to the Tailwind scale when touching
  those files, don't add more arbitrary values elsewhere.

## 5. Component guidelines

### Buttons
- **Primary action**: `bg-sky-500 hover:bg-sky-400 text-slate-950
  font-bold` — the highest-contrast pairing, reserved for the one primary
  action per view (Go Live, Subscribe, Send Tip).
- **Secondary action**: `bg-slate-800 hover:bg-slate-700 text-slate-200
  border border-slate-700` — neutral, not competing with primary.
- **Tertiary/money action** (tip, payout): `bg-amber-500 hover:bg-amber-400
  text-slate-950 font-bold` — same high-contrast rule as primary, just the
  warm hue.
- Never a solid colored button with gray text, per §2.

### Video/stream cards (Steam-tile pattern)
- Use `.steam-card` (`src/index.css`) as the base — don't hand-roll
  `bg-slate-900 border-slate-800` for a new grid card; several existing
  components do this instead of reusing `.steam-card`
  (`GamesView.tsx`, `TutorialsView.tsx`, `EsportsTournamentBracket.tsx`) —
  migrate rather than add a fifth variant.
- Thumbnail: `aspect-video`, `object-cover`, with a live/status badge
  pinned `absolute top-2.5 left-2.5` using the semantic accent colors
  (`bg-rose-500 text-white` for LIVE, per contrast rule).
- Title: `.font-rajdhani` or default bold, `line-clamp-1`/`line-clamp-2` —
  never let a title push a grid row out of alignment.
- Hover: `hover:border-sky-400/50` (or the existing
  `hover:border-[#38bdf8]/50`) + `hover:-translate-y-1` lift, per the
  Motion section below.

### Navigation
- Persistent dark bar (`bg-slate-900`/`#0b0e14`-adjacent), brand wordmark
  in `.font-rajdhani` with the primary color on the second word (existing
  `Navbar.tsx` pattern: "VISOR" neutral + "STREAM" in `text-[#38bdf8]`) —
  keep this split-color wordmark, it's the one deliberate brand flourish.
- Active nav item: primary-color text or underline, never gray-on-color.
  Inactive nav item: `text-slate-400`, per §2's rule that gray is for
  inactive states only.

## 6. Motion & micro-interactions

No animation library in the render path — `motion` (Framer Motion) is
installed but unused anywhere in `src`. Everything is plain CSS/Tailwind
transitions; keep it that way unless a specific interaction genuinely needs
spring physics.

- **Keep micro-interactions under ~300ms** (`duration-200`/`duration-300`,
  already the norm).
- **Animate `transform`/`opacity`, not layout properties** — the existing
  `hover:-translate-y-1` card-lift is the right shape; don't animate
  `width`/`height`/`margin`.
- **Reuse one easing curve**: `.steam-card` already defines
  `cubic-bezier(0.16, 1, 0.3, 1)` for its hover transition — use this as
  the house easing for new hover/press transitions instead of mixing in
  Tailwind's default `ease`.
- **Border-glow-on-hover** (`hover:border-sky-400/80`, etc.) is the
  established "interactive" signal — reach for that before inventing a new
  hover treatment.
- **Respect `prefers-reduced-motion`** when adding a non-trivial animation
  (`@media (prefers-reduced-motion: no-preference)`).

## Known gaps (documented, not silently fixed)

- **i18n covers UI chrome system-wide across 16 languages**, not literally
  every string. `en, sw, lg, fr, pt, ar, es, de, zh, hi, ru, ja, ha, yo, am,
  zu` are all fully translated in `src/lib/i18n.tsx` (~235 keys each). Nearly
  every component now renders its primary headings, nav/tab labels, CTA
  buttons, empty-states, and core form labels through `t()` — Navbar,
  Settings, Landing, Auth/GoLive/Tip modals, LivePlayerView, Reels, Library,
  Community, Store, Esports (+ bracket/scrims), Games, CreatorStudio,
  Tutorials, Pricing, About, and the smaller payment/payout/overlay/
  notification widgets. RTL is real and app-wide (`dir="rtl"` on `<html>`
  when Arabic is selected, set in `LanguageProvider`) — mirrors every
  flexbox row automatically, verified visually.
  Deliberately still English-only, by design not oversight: long-form
  marketing/testimonial prose on the landing page, `FeatureInfoView`'s deep
  per-feature content blocks, legal page bodies (Privacy/Terms), the mock
  Gmail client (`GmailView` — an auxiliary demo feature), deep diagnostic/
  data-table panels (payment gateway diagnostics, revenue chart legends,
  payout ledger table columns), and — as ever — actual content vs. chrome:
  chat messages, mock social posts, and other user-generated-style text are
  never translated, since that's data, not interface. Luganda, Hausa,
  Yoruba, Amharic, and Zulu translations are best-effort (not
  native-reviewed) — worth a native speaker's pass before treating them as
  production-quality.
- **Icon glyphs don't mirror under RTL.** `ChevronRight`/`ArrowRight` etc.
  keep pointing the same visual direction in Arabic instead of flipping to
  match reading direction — a real but minor polish gap, not a functional
  one (the actual text and layout both mirror correctly).
- **Card convention drift** and **radius scale drift** — see §4/§5 above.

## Craft checklist (apply before calling UI work done)

- Every new card/container reuses `.steam-card`, not a hand-rolled
  `bg-slate-900 border-slate-800` variant.
- Any solid-fill colored element passes the §2 contrast rule — check this
  explicitly, it's the single most common way "AI slop" UI ships.
- No orphaned hex/rgba literal when a Tailwind token or the existing
  `border-[#2a475e]` arbitrary value already expresses it.
- Every async view has a real loading state, empty state, and error
  state — not just the happy path.
- Touch targets on mobile stay at least 40px in the smallest dimension.
- Transitions animate `transform`/`opacity`, stay under ~300ms, and reuse
  the house easing curve per §6.
