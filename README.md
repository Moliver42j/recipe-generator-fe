# DishFromThis SPA (Frontend)

React + TypeScript + Vite frontend for the DishFromThis recipe generator.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS (via `@tailwindcss/vite`)
- Framer Motion
- Heroicons

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

## App routes

- `/` — Home
- `/configuration` — Pantry / spices / dietary settings
- `/favourites` — Saved recipes
- `/export` — Copy data export
- `/auth/callback` — Cognito Hosted UI callback handler

## API

Recipe generation currently calls the hosted endpoint in:

`src/services/recipeApi.ts`

```ts
const API_URL = 'https://n9f4glumj7.execute-api.eu-west-1.amazonaws.com/default/recipeApi';
```

### Current deployed architecture (production)

- SPA hosting: `arn:aws:s3:::dish-from-this`
- Backend Lambda: `arn:aws:lambda:eu-west-1:594386530121:function:recipeApi`
- Current API URL above is backed by API Gateway REST (v1), not HTTP API (v2).

## Social auth infrastructure (Cognito Hosted UI + Google + Apple)

Terraform for Cognito social auth lives in:

- `infrastructure/terraform/cognito-social-auth`

Quick start:

```bash
cd infrastructure/terraform/cognito-social-auth
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
```

Frontend env contract is defined in `.env.example`:

- `VITE_COGNITO_REGION`
- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_APP_CLIENT_ID`
- `VITE_COGNITO_HOSTED_UI_DOMAIN`
- `VITE_COGNITO_REDIRECT_URI`
- `VITE_COGNITO_LOGOUT_URI`

### Production frontend Cognito env wiring

Set these in your frontend deployment environment (for `www.dishfromthis.com`):

- `VITE_COGNITO_REGION=eu-west-1`
- `VITE_COGNITO_USER_POOL_ID=eu-west-1_LBlFHAYmA`
- `VITE_COGNITO_APP_CLIENT_ID=78m5qqfn3busc331g7882eo9n5`
- `VITE_COGNITO_HOSTED_UI_DOMAIN=dishfromthis-prod-auth.auth.eu-west-1.amazoncognito.com`
- `VITE_COGNITO_REDIRECT_URI=https://www.dishfromthis.com/auth/callback`
- `VITE_COGNITO_LOGOUT_URI=https://www.dishfromthis.com/`

For local development, keep redirect/logout overrides in `.env.local` (uncommitted).

## API security + persistence infrastructure (JWT auth + DynamoDB)

Terraform for authenticated account route infrastructure lives in:

- `infrastructure/terraform/api-security-persistence`

Quick start:

```bash
cd infrastructure/terraform/api-security-persistence
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
```

> This stack is optional for Google login itself.  
> It is only needed if you want authenticated `/account/*` persistence (server-side state sync/migration).  
> It currently assumes API Gateway **v2 HTTP API** and a separate deployable account Lambda artifact.

## Auth/session layer

- Auth state is provided by `src/context/AuthContext.tsx`.
- Account state sync orchestration runs in `src/context/AccountSyncContext.tsx`.
- `useAuth()` exposes:
  - `status` (`guest` | `authenticated`)
  - `isGuest` / `isAuthenticated`
  - `isAuthEnabled` (false when Cognito env vars are unset/placeholders)
  - `login()`, `continueAsGuest()`, `logout()`, `handleAuthCallback(url)`
- Hosted UI URL/session helpers live in `src/services/authService.ts`.
- Hosted UI sign-in now uses Cognito Authorization Code + PKCE (`response_type=code`) with
  callback token exchange against `/oauth2/token`.
- Guest mode is the default when no valid stored session exists.
- Guest mode continues to use localStorage-only state; authenticated mode hydrates/syncs via `/account/state` and `/account/migrate-guest`.

## Design system notes (current)

- Theme: **Fresh Green Glassmorphism**
- Typography: **Inter**
- Dark mode: class-based (`html.dark`), controlled by `ThemeContext`
- Tailwind dark variant is explicitly class-bound in `src/index.css`:

```css
@variant dark (&:where(.dark, .dark *));
```

- Core design tokens/utilities live in `src/index.css` (`@theme`, `.glass-card`, `.gradient-green-cta`, `.gradient-green-badge`, `.gradient-text-green`)

## Project structure

```text
src/
  components/        # Layout shell and shared UI
  context/           # Theme/Home/Config context providers
  tests/             # node:test unit tests for frontend utilities
  pages/             # Route pages
  services/          # API calls
  utils/             # storage helpers
  router.tsx         # Route configuration
```
