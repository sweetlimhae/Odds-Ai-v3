# Odds AI (오즈 AI)

Korean-language sports betting odds analysis dashboard — shows upcoming soccer/baseball games, scores picks with AI signals, and recommends 2-fold parlay combos in three risk styles.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/odds-ai run dev` — run the React frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (artifacts/api-server)
- Frontend: React + Vite + Tailwind (artifacts/odds-ai)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- DB: PostgreSQL + Drizzle ORM (not yet used — demo data only)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — React Query hooks (generated)
- `lib/api-zod/src/generated/` — Zod schemas (generated)
- `artifacts/api-server/src/routes/odds.ts` — games + recommendations backend logic
- `artifacts/odds-ai/src/` — React frontend

## Architecture decisions

- Demo data is generated in-memory in `odds.ts`; no database required for the current version.
- Korean UI throughout — all labels, buttons, messages in Korean.
- Dark mode only — deep navy/charcoal with neon green/amber/red risk accents.
- Sport filter: 전체 / 축구 / 야구; window filter: 30분 전 / 1시간 전.
- Combo algorithm ports Python's `combinations(candidates, 2)` logic for 신중형/균형형/공격형.

## Product

- **오늘 경기**: Lists upcoming games filtered by sport and time window, showing each market's odds, AI score, and signal reasons.
- **AI 분석**: Shows three 2-fold parlay combos (신중형, 균형형, 공격형) plus excluded picks.
- Next step: connect real odds data from Odds API / BMBets / Pinnacle.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always run `pnpm --filter @workspace/api-spec run codegen` before touching route or frontend files.
- Zod schema names from codegen: `GetGamesResponse`, `GetRecommendationsResponse` (not `GamesResponse`/`RecommendationsResponse`).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
