# Deployment Notes

Lessons learned deploying this monorepo (NestJS backend on Render, React/Vite frontend on Netlify, PostgreSQL on Supabase).

---

## Render (Backend)

### `render.yaml` is ignored for manually created services
Render only reads `render.yaml` when using the **Blueprint** feature (New Blueprint Instance). If you create a Web Service manually via the dashboard, the `render.yaml` file has no effect — all settings must be configured in the dashboard.

### `NODE_ENV=production` skips devDependencies
Render sets `NODE_ENV=production` during the build phase. This causes `npm install` to skip `devDependencies`. Any tool needed at build time (e.g. `@nestjs/cli`, `typescript`) must be in `dependencies`, not `devDependencies`.

**Applied fix:** `@nestjs/cli` and `@nestjs/schematics` moved to `dependencies`.

### Prisma client must be generated before building
`nest build` compiles TypeScript which imports from `@prisma/client`. If `prisma generate` hasn't run yet, the generated types don't exist and the build fails with errors like:
```
Module '"@prisma/client"' has no exported member 'PrismaClient'
Property 'user' does not exist on type 'PrismaService'
```

**Applied fix:** Added `"postinstall": "prisma generate"` to `package.json` so it runs automatically after every `npm install`.

### `rootDir` must be set in `tsconfig.json`
Without `"rootDir": "src"`, TypeScript infers the root from input files and outputs:
- `src/main.ts` → `dist/src/main.js` ❌

With `"rootDir": "src"` set explicitly:
- `src/main.ts` → `dist/main.js` ✓

The Render start command `node dist/main` depends on this being correct.

### Files outside `rootDir` must be excluded from the build
`prisma.config.ts` lives at the server root (not inside `src/`). With `rootDir: "src"`, TypeScript rejects it with error TS6059.

**Applied fix:** Added `"prisma.config.ts"` to the `exclude` list in `tsconfig.build.json`.

### Pre-deploy vs build commands
- **Build command** (`npm install && nest build`): compiles the app, runs in the build phase
- **Pre-deploy command** (`npx prisma migrate deploy`): runs migrations against the live database before the new version goes live
- **Start command** (`node dist/main`): starts the compiled app

Keep migrations in pre-deploy, not build — migrations need `DATABASE_URL` and should run against the real database.

---

## Netlify (Frontend)

### TypeScript errors fail the build
Netlify runs `tsc -b && vite build`. Any TypeScript error (including unused imports) will fail the deploy. Common issues found:
- Unused imports (`TS6133`) — remove them
- Missing type properties (`TS2339`) — ensure interfaces match actual return shapes

### `netlify.toml` must be in the `app/` directory
When connecting Netlify to a monorepo with base directory set to `app/`, the `netlify.toml` must be inside `app/`, not at the repo root.

### SPA routing requires a redirect rule
Without a catch-all redirect, deep links (e.g. `/gold`) return 404 on Netlify. The `netlify.toml` must include:
```toml
[[redirects]]
  from   = "/*"
  to     = "/index.html"
  status = 200
```

---

## Environment Variables

| Variable | Where set | Used by |
|---|---|---|
| `DATABASE_URL` | Render dashboard | NestJS (Prisma), also available during build for `prisma generate` |
| `JWT_SECRET` | Render dashboard | NestJS auth |
| `GOOGLE_CLIENT_ID` | Render dashboard | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Render dashboard | Google OAuth |
| `FRONTEND_URL` | Render dashboard | NestJS CORS — must match Netlify URL exactly (including `https://`) |
| `BACKEND_URL` | Render dashboard | NestJS Google OAuth callback URL — must be the Render service URL (e.g. `https://financial-tracking-h8aa.onrender.com`) |
| `NODE_ENV` | Render dashboard | Set to `production` |
| `VITE_API_URL` | Netlify dashboard | React app — must point to Render service URL |

### Google OAuth callback URL is hardcoded by default
`google.strategy.ts` originally had `callbackURL` hardcoded to `localhost:3000`. In production this causes Google to redirect back to localhost after login. Always read it from `BACKEND_URL` env var:
```typescript
callbackURL: `${process.env.BACKEND_URL ?? 'http://localhost:3000'}/auth/google/callback`
```

### Google OAuth after deployment
After deploying, update Google Cloud Console OAuth credentials:
- **Authorized redirect URI:** `https://<render-service>.onrender.com/auth/google/callback`
- **Authorized JavaScript origin:** `https://<netlify-site>.netlify.app`

---

## Render Free Tier Caveats
- Service spins down after 15 minutes of inactivity → ~30s cold start on first request
- Auto-deploy requires the GitHub repo to be connected via Settings → Build & Deploy (webhook must be wired up)
