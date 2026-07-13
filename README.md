# akira — Next.js

The **"Cozy Cream" (1a)** design, built out as a runnable Next.js app (App Router + TypeScript, mobile-first — no device-bezel mockup). Log bottle and breast feeds with a tap; data is stored in Supabase and synced live across devices.

## Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the project's **SQL Editor**, run [`supabase/setup.sql`](supabase/setup.sql) — creates the `feeds` table, opens it to the `anon` role (no login), and enables Realtime.
3. In **Project Settings → API Keys**, copy the **Project URL** and the **publishable** key (`sb_publishable_...`).
4. Copy `.env.local.example` to `.env.local` and fill in those two values:
   ```bash
   cp .env.local.example .env.local
   ```

There's no login — anyone with the URL and publishable key can read/write the table. That's intentional for a single-household tracker; add Supabase Auth + a `user_id` column and RLS policies later if you need per-user data.

## Run it

```bash
cd akira
npm install
npm run dev
```

Open http://localhost:3000. The feed list starts empty until you log your first feed.

Requires Node 18.17+.

## What it does

- **Log a feed** → sheet asks Bottle or Breast.
  - **Breast** logs instantly at the current time.
  - **Bottle** opens a ml dial (± stepper + quick presets), then logs the time and amount.
- **Home screen**: time since last feed (ticks live), today's feed count + total bottle ml, and a 7-day trend chart.
- **Tap any recent entry** to edit its time (and ml for bottles) or delete it.
- Everything persists to Supabase (`feeds` table) and syncs live to every open tab/device via Realtime.

## Project structure

```
app/
  layout.tsx        Fonts (Fredoka + Quicksand via next/font) + metadata
  page.tsx          Renders FeedTracker full-viewport
  globals.css       Reset, body background, keyframes (sheet / fade / toast)
components/
  FeedTracker.tsx   Main client component: home screen + state + flow wiring
  LogSheet.tsx      Bottom sheet (choose / bottle / edit) — presentational
hooks/
  useFeeds.ts       Feed log state — Supabase fetch/insert/update/delete + Realtime sync
lib/
  types.ts          Feed / FeedType
  theme.ts          "Cozy Cream" design tokens
  stats.ts          Time formatting, today totals, 7-day trend helpers
  supabaseClient.ts Supabase browser client (reads env vars)
supabase/
  setup.sql         Table + RLS policy + Realtime setup — run once in the SQL Editor
```

## Design tokens (Cozy Cream)

Defined in `lib/theme.ts`:

- Background `#FBF3EA` · surfaces `#FFFFFF` / `#FCEFE6` · borders `#F1E5D8`
- Text `#4A3B33` · muted `#A2907F`
- Accent `#F2946B` · deep accent `#E97A4E` · button gradient `#F8AC80 → #EC7A55`
- Fonts: **Fredoka** (headings/numbers), **Quicksand** (body) — loaded with `next/font/google`, no external link needed
- Danger (delete) `#E0574F`

## Notes for taking this further

- **Styling approach**: components use inline styles driven by `lib/theme.ts`, mirroring the prototype exactly. If your codebase uses Tailwind or CSS Modules, port the tokens there — the values are all in one file.
- **Full-viewport, mobile-first**: the layout fills the real device viewport (`100dvh`, safe-area insets for notches) instead of a phone-bezel mockup.
- **Auth**: currently none — the `feeds` table is open to anyone with the anon key ([see setup](#set-up-supabase)). To scope data per user, add Supabase Auth, a `user_id` column, and swap the RLS policy in `supabase/setup.sql` to check `auth.uid()`.
- **Easy next features** discussed: a live breastfeeding timer, left/right side tracking on breast feeds, and a baby-name/profile setting.

## Fidelity

High-fidelity. Colors, typography, spacing, and interactions match the approved prototype. Recreate pixel-for-pixel or adapt into your own design system as needed.
