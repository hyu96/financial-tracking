# Financial Tracking

A personal finance tracker for managing a Vietnamese investment portfolio — gold holdings, mutual funds, and bank deposits — with real-time market data, allocation planning, and portfolio snapshots.

## Features

- **Dashboard** — portfolio value overview, allocation chart vs. target, VN Index and gold price widgets
- **Gold Tracking** — log holdings by weight/unit, auto-fetch live gold prices (SJC/XAU-USD), track P&L per lot
- **Mutual Funds** — track fund holdings and NAVs, import transactions from FMarket Excel exports, lot-by-lot history
- **Bank Deposits** — track fixed deposits with interest calculations across banks
- **Allocation Planner** — set target allocation percentages and compare against current portfolio
- **Portfolio Snapshots** — daily snapshots for historical performance tracking
- **Google OAuth** — sign in with Google, per-user data isolation

## Tech Stack

### Frontend (`app/`)
| | |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Data fetching | TanStack Query |
| Charts | Recharts |
| State | Zustand |
| Excel import | xlsx |

### Backend (`server/`)
| | |
|---|---|
| Framework | NestJS 11 |
| Database | PostgreSQL via Prisma |
| Auth | Google OAuth 2.0 + JWT (Passport) |
| Scheduler | `@nestjs/schedule` (NAV/price auto-fetch) |
| Runtime | Node.js |

### Infrastructure
| | |
|---|---|
| Frontend hosting | Netlify |
| Backend hosting | Render.com (free tier) |
| Database | Supabase (managed PostgreSQL) |

## Project Structure

```
financial-tracking/
├── app/          # React frontend (git submodule)
├── server/       # NestJS backend (git submodule)
├── render.yaml   # Render.com deployment config
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (or a Supabase project)
- A Google Cloud project with OAuth 2.0 credentials

### Backend

```bash
cd server
cp .env.example .env   # fill in your values
npm install
npx prisma migrate deploy
npm run start:dev
```

`.env` values needed:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `JWT_SECRET` | Secret for signing JWTs |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |

### Frontend

```bash
cd app
npm install
npm run dev
```

Set `VITE_API_URL` in `app/.env` if the backend runs on a port other than `3000`:

```
VITE_API_URL=http://localhost:3000
```

## Deployment

See [`render.yaml`](render.yaml) for backend deployment config and [`app/netlify.toml`](app/netlify.toml) for frontend config.

### Environment variables to set in production

**Render (backend):**
`DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`

**Netlify (frontend):**
`VITE_API_URL` — set to your Render service URL

### Google OAuth setup

Add these to your Google Cloud Console OAuth 2.0 credentials:
- Authorized redirect URI: `https://<service>.onrender.com/auth/google/callback`
- Authorized JavaScript origin: `https://<site>.netlify.app`

## Submodules

If you cloned this repo without `--recurse-submodules`, initialize the submodules with:

```bash
git submodule update --init --recursive
```
