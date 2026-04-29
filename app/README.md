# Financial Tracker — Frontend

React SPA for tracking personal investments across gold, mutual fund certificates, and bank deposits.

## Tech Stack

- **React 18** + **Vite 8** + **TypeScript 5**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **React Router v7** — URL-based navigation
- **TanStack Query v5** — data fetching / mutation layer
- **Zustand v5** — UI state store
- **Recharts** — portfolio allocation chart
- **date-fns** — deposit interest calculations
- **Vitest** — unit tests

- **Supabase** — Postgres database + Auth (Google OAuth) + Row Level Security

See [`openspec/docs/tech-stack.md`](../openspec/docs/tech-stack.md) for the full stack including the backend.

## Project Structure

```
src/
├── components/       # Shared + domain UI components
│   ├── dashboard/
│   ├── gold/
│   ├── funds/
│   └── deposits/
├── hooks/            # TanStack Query data/mutation hooks
├── lib/              # localStorage utility, generateId
├── pages/            # Route-level page components
├── store/            # Zustand UI store
├── types/            # TypeScript types + INITIAL_STATE
└── utils/            # calculations, format, io (export/import)
```

## Routes

| Path | Page |
|---|---|
| `/` | Dashboard (portfolio summary + allocation) |
| `/gold` | Gold holdings + spot price |
| `/funds` | Mutual fund holdings + NAVs |
| `/deposits` | Bank deposits |

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build (tsc + vite)
npm run preview   # Preview production build
npx vitest run    # Run tests
```
