# Brian Hsu — Portfolio

Personal portfolio site at **[brianhsu.info](https://brianhsu.info)** — a proof-of-work portfolio built as a fictional artifact OS, where each visible object leads to a real technical case study or artifact.

## Stack

- **Next.js** (App Router, static export)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** + **anime.js** for animations
- **Vitest** + **jsdom** for unit tests
- Deployed to **GitHub Pages** via GitHub Actions

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

Pushes to `main` trigger the GitHub Actions workflow (`.github/workflows/`) which builds and deploys to GitHub Pages automatically.
