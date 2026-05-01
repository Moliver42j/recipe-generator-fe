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

## API

Recipe generation currently calls the hosted endpoint in:

`src/services/recipeApi.ts`

```ts
const API_URL = 'https://n9f4glumj7.execute-api.eu-west-1.amazonaws.com/default/recipeApi';
```

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
  pages/             # Route pages
  services/          # API calls
  utils/             # storage helpers
  router.tsx         # Route configuration
```
