## What is this?

Augend is an open-source dashboard for tracking financial assets ([augend.app](https://augend.app)). Users build dashboards out of cards: crypto prices, exchange balances, currency conversions, Uniswap positions, forex, precious metals, and more.

## Stack

A single Next.js (App Router) app in TypeScript:

- **Framework:** Next.js + React, `npm run dev` (Turbopack) / `npm run build` (webpack) / `npm run lint`.
- **API:** tRPC v11 with TanStack Query on the client. Routers live in `src/server/trpc/api` (crypto, forex, ui), setup in `src/server/trpc/setup`.
- **Database:** PostgreSQL via Drizzle ORM. Schema is `src/server/db/schema.ts`, migrations in `src/server/db/migrations` (generated with drizzle-kit — don't edit by hand), query helpers in `src/server/db/repo`.
- **Cache:** Redis via ioredis (`src/server/redis`). External price/market data (CMC, Tiingo, metals.dev, CCXT exchanges, Alchemy/ethers) is fetched server-side and cached here.
- **Auth:** NextAuth v5 (beta) with the Drizzle adapter — Google, Discord, and Ethereum sign-in (SIWE/wagmi). Lives in `src/server/auth`.
- **UI:** Tailwind + shadcn/ui (`src/components/ui`), Zustand stores (`src/lib/stores`), react-hook-form + zod, Recharts for charts. Each card type has its own folder in `src/components/cards`.
- **Env:** validated with `@t3-oss/env-nextjs` in `src/lib/env.ts`. `env.example` documents what's required vs optional. Add new env vars to both.
- **Routes:** `src/app/(app)` is the product (dashboards under `[username]`, account, pricing, sign-in), `src/app/(doc)` is blog/legal/support (MDX + Ghost), `src/app/api` holds the auth, tRPC, and webhook handlers.

## General Rules:

- Keep it simple. Do not overcomplicate things.
- Follow the codebase's existing conventions. The design system in `src/components/ui` and the card patterns in `src/components/cards` show how things are done — match them.
- This handles people's financial data and API keys. Keep server-only secrets on the server (`server-only`, env validation) and be careful with anything touching auth or third-party keys.
- Do not start editing code in response to a question. We'll tell you when to edit code.
- Do not leave paragraphs of comments on top of the code. You should try to avoid them as much as possible with understandable function names and code. If they are necessary even then, make them concise. Remove such comments when you come by them in the codebase. Comments should always move with code, not be left behind.
- Use guard statement patterns in any code you write.
- Do not edit generated code directly (Drizzle migrations, lockfiles).
- If we are missing a glaring issue when we ask you to do something, do not hesitate to point it out.
- Reinvent the wheel but do not reinvent the car. If you are solving a simple problem do not introduce a library. If you are solving a complex but a common problem, there is likely a modern library for it, if so, use it.
- Never commit or push code unless explicitly asked to do so.
- Never make a PR unless explicitly asked to do so.
- Do not insert yourself into our code, commits or PRs in any way. Our codebase is not your ad space.
- After you make code changes, run `npm run lint` and fix any issues that arise from it.

## Commit Messages

Short, imperative, sentence-case titles with no prefix, matching the existing history:
Fix Next.js memory retention
Remove unused imports

The title should be concise. Description should explain the work in more detail (only if required) while still being concise. Use simple language, do not try to sound smart.
