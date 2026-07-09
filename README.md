# Brian Hsu — Portfolio

Personal portfolio site at **[brianhsu.info](https://brianhsu.info)** — a proof-of-work portfolio built as a fictional artifact OS, where each visible object leads to a real technical case study or artifact.

## Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** + **anime.js** for animations
- **Vitest** + **jsdom** for unit tests
- Deployed on **Vercel** (server routes enabled for the chat assistant)

## Getting Started

```bash
npm install
npm run dev       # http://localhost:3000
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build (static export) |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Watch mode |

## Structure

```
src/app/          # Next.js App Router pages
public/           # Static assets
scripts/          # Build/utility scripts
```

## Deploy

Production runs on Vercel: every push to `main` is built and deployed automatically, including the `/api/chat` route behind the portfolio assistant.
The GitHub Actions `CI` workflow (`.github/workflows/ci.yml`) is the quality gate: it lints, typechecks, runs unit tests, and does a production build on every pull request and push to `main`.
Vercel preview deployments cover visual review on pull requests.
