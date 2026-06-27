# yhakamay.me

Personal site of yhakamay, built with [Next.js](https://nextjs.org/) (App Router),
Tailwind CSS + daisyUI, and deployed on Vercel. It renders a profile, a list of the
most recently updated GitHub repositories, and the latest [Zenn](https://zenn.dev/yhakamay)
articles.

## Getting Started

Requires Node.js 18+ (LTS recommended).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

- `GITHUB_API_TOKEN` — optional GitHub token used to fetch the repository list
  with a higher rate limit. Without it the site still builds, falling back to
  unauthenticated requests.

## Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Project structure

- `src/app` — App Router pages, layout, and global styles
- `src/components` — React components
- `src/types` — shared TypeScript types
