# yhakamay.me

Personal site of **Yusuke Hakamaya** ([@yhakamay](https://github.com/yhakamay)).
A fully rebuilt, motion-rich single page that renders a profile, live GitHub
repositories, and the latest [Zenn](https://zenn.dev/yhakamay) articles.

## Stack

- **[Next.js 15](https://nextjs.org/)** (App Router, RSC, Turbopack)
- **[React 19](https://react.dev/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)** — CSS-first config, no `tailwind.config.js`
- **[Motion](https://motion.dev/)** for scroll & entrance animations
- **[fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)** for the Zenn feed
- TypeScript · Geist font · deployed on Vercel

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

- `GITHUB_API_TOKEN` — optional. Raises the GitHub API rate limit when fetching
  the repository list. Without it the site still builds, falling back to
  unauthenticated requests.

## Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint

## Structure

```
src/
  app/         App Router: layout, page, global styles
  components/  UI: hero, nav, sections, spotlight cards, footer
  lib/         data fetching (github, zenn) + site content config
  types/       shared TypeScript types
```

Content (name, role, socials, skills) lives in `src/lib/site.ts`.
