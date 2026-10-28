# SmartCop frontend

React 18 + Vite + TypeScript + shadcn/ui. It is a client for the SmartCop Django REST backend (`/api/v1/`). The contract between the two lives in the backend repo at `docs/FRONTEND_CONTRACT.md`.

## Run

```bash
npm ci
cp .env.example .env     # then edit VITE_API_BASE_URL
npm run dev              # http://localhost:8080
```

## Environment variables

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend origin, without `/api/v1` |
| `VITE_ENABLE_DOCUCHAT` | `false` | Load the third-party DocuChat widget |
| `VITE_ENABLE_VOICE_ASSISTANT` | `false` | Use backend voice and legal assistant endpoints (otherwise "coming soon") |
| `VITE_IDLE_TIMEOUT_MINUTES` | `20` | Automatic sign-out after inactivity |

No secret belongs in a `VITE_*` variable: they are public in the built bundle. AI providers are only called by the backend.

## Scripts

`npm run dev` · `npm run build` · `npm run typecheck` · `npm run lint` · `npm test`

## How it talks to the backend

- `src/api/client.ts` is the only HTTP layer: Bearer token, the `{error:{code,message,details},request_id}` error format (`ApiError`), single-flight refresh on 401 (refresh tokens rotate and work once), `Idempotency-Key` for complaint creation.
- `src/auth/tokenStore.ts` is the only place tokens are kept (access token in memory, refresh token in `sessionStorage`). Switching to an HttpOnly cookie later means changing this one file.
- `src/auth/AuthContext.tsx` restores the session and loads `/auth/me`; the role always comes from the server. `RequireRole` guards routes.
- Server data is fetched with React Query. Feedback uses `src/lib/notify.ts` (toasts), never `alert()`.
- Tests use Vitest + Testing Library; `src/mocks/` holds MSW handlers that follow the contract (including planned endpoints).

## Languages

English, Hindi and Telugu via `react-i18next` (`src/i18n/`). The choice is remembered in the browser and sets `<html lang>`. Citizen screens (home, login, dashboard, filing form) are translated; officer, magistrate and admin screens are English only for now. To add a string, add the key to `locales/en.ts` and to `hi.ts` and `te.ts` (the TypeScript types and a test fail if a key or placeholder is missing). The Hindi and Telugu text is a draft and needs a native speaker's review before launch.

## Accessibility and performance

`src/test/a11y.test.tsx` runs axe on key screens (colour contrast needs a real browser and is not covered). Routes load on demand (`React.lazy`), with React, React Query and i18n in separate vendor chunks.

## Local demo logins

With the backend in dev mode (`DEV_FIXED_OTP=123456`) and `seed_demo` run, any login code is `123456`. Phones: citizen `9000000001`, head constable `9000000011`, sub-inspector `9000000012`, SHO `9000000013`, magistrate `9000000021`, admin `9000000031`.

## Hosting

`vercel.json` has suggested security headers; replace `YOUR-API-HOST` in the CSP. For error monitoring add Sentry's browser SDK in `src/main.tsx` and call `Sentry.captureException` from `ErrorBoundary.componentDidCatch`; never attach complaint text or personal data.
