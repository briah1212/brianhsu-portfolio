# brianhsu-portfolio

Brian Hsu's portfolio at [brianhsu.info](https://brianhsu.info): a proof-of-work site framed as a fictional desktop OS, where each object leads to a real case study.
Product language and intent live in `CONTEXT.md`; the original design notes are in `systemdesign.md`.

## Stack

Next.js (App Router) and React 19, TypeScript, Tailwind CSS 4, Framer Motion and anime.js, Zustand for window state, Vitest with jsdom.
Deployed on Vercel from `main`; the only server code is the chat route in `src/app/api/chat/route.ts`.

## Develop

```bash
npm ci
npm run dev        # http://localhost:3000
```

Node 22 matches CI.
Screens narrower than the `md` breakpoint get the mobile feed (`src/components/mobile/MobileView.tsx`) instead of the desktop.
The chatbot only renders in production builds, because it needs API keys.

## Checks

CI (`.github/workflows/ci.yml`) runs these on every PR; run them before pushing:

```bash
npm run lint       # must be clean, warnings included
npx tsc --noEmit
npm test
npm run build
```

## Where things live

- `src/data/profile.ts` - the single source of truth for name, education, experience, skills, and contact links. Home, About, Contact, the mobile feed, the terminal, the code viewer, and the chatbot prompt all read from it.
- `src/data/projects/*.json` and `index.ts` - case studies. `comingSoon: true` hides an entry everywhere, including slug lookups.
- `src/lib/chatPrompt.ts` - builds the chatbot's system prompt from the data above and sanitizes incoming chat history.
- `src/config/` - apps, desktop icons, folder categories, and the default desktop layout.
- `src/components/` - `desktop/` (shell, dock, menu bar), `window/` (window chrome, drag, resize), `apps/` (one component per app), `projects/`, `mobile/`, `chatbot/`.
- `public/Resume.pdf` - the resume every "Resume" link serves.

## Content rules

- Every claim on the site must match Brian's current resume. Never invent metrics, projects, or results; ask Brian when unsure.
- Change a fact once, in `src/data/profile.ts` or the project JSON; never hard-code it in a component.

## Chatbot

`POST /api/chat` tries OpenAI (`gpt-4o-mini`) first and falls back to Claude.
It needs `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` set in the Vercel project.
Rate limiting is an in-memory map per server instance, so it is best-effort only.

## Deploy

Vercel builds every push; `main` deploys to production.
After a merge, confirm the live site serves the new commit before calling it done.
