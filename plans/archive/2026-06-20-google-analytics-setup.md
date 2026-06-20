# Google Analytics Setup — 2026-06-20

## Summary
Configured GA4 for the web client via `VITE_GA_MEASUREMENT_ID` in repo-root `.env`.

## Changes
- `web/vite.config.ts` — `envDir` points at repo root
- `.env.example` — documents `VITE_GA_MEASUREMENT_ID`
- `web/src/vite-env.d.ts` — TypeScript env typing
- `web/src/game/analytics.ts` — DNT respect, session event, no placeholder ID
- `web/src/game/progression/achievements.ts` — `achievement_unlock` events
- `web/src/index.html` — gtag preconnect

## Events tracked
- `game_session_start` — on boot when GA enabled
- `discovery`, `xp_gain`, `level_up` — existing gameplay hooks
- `achievement_unlock` — new

## Usage
1. Copy `.env.example` → `.env` if needed
2. Set `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` from GA4 property
3. `cd web && npm run dev` or `npm run build`

Leave blank to disable analytics.
