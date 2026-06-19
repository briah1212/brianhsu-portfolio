# Brian OS Design System

## PostHog-inspired vibe × macOS portfolio shell

> **Philosophy:** PostHog sells a *Product OS* — a desktop of tools, each opening its own rich page.
> Your site sells **Brian OS** — a desktop of work, each folder/card opening a case study.
> Copy the *craft* (illustration, motion, personality, depth). Not the *format* (10,000px marketing scroll).

---

## Table of contents

1. [How to use this document (with Cursor)](#0-how-to-use-this-document-with-cursor)
2. [PostHog reference breakdown](#1-posthog-reference-breakdown)
3. [Translation map: PostHog → Brian OS](#2-translation-map-posthog--brian-os)
4. [Art direction: rustic & illustrated](#3-art-direction-rustic--illustrated)
5. [Design tokens](#4-design-tokens)
6. [Global layout & information architecture](#5-global-layout--information-architecture)
7. [Component specs (implement in order)](#6-component-specs-implement-in-order)
8. [Animation & motion catalog](#7-animation--motion-catalog)
9. [Copy & voice guide](#8-copy--voice-guide)
10. [Data model for rich case studies](#9-data-model-for-rich-case-studies)
11. [Asset checklist](#10-asset-checklist)
12. [Section-by-section Cursor prompts](#11-section-by-section-cursor-prompts)

---

## 0. How to use this document (with Cursor)

This file is the **single source of truth** for vibe, structure, and build order. Use it incrementally — one phase per agent session, not the whole doc at once.

### Recommended build order


| Step | Phase      | What you get                                                          |
| ---- | ---------- | --------------------------------------------------------------------- |
| 1    | Phase 0    | Warm interior tokens + paper texture (foundation for everything else) |
| 2    | Phase 1    | Illustrated project card grid                                         |
| 3    | Phase 2    | Category folder landing pages                                         |
| 4    | Phase 3    | Full case study template + one real project filled in                 |
| 5    | Phase 4–5  | Rustic desktop folders + Home hero                                    |
| 6    | Phase 6–7  | About manifesto + Terminal commands                                   |
| 7    | Phase 8–12 | Polish, deep links, Contact parody, wallpaper (as wanted)             |


**Do not skip Phase 0.** Later phases assume rustic tokens and `.app-content-rustic` exist.

### How to prompt the agent (template)

Open **Agent mode**, attach or reference this file, and send something like:

```
Read portfolio/systemdesign.md and implement Phase 1 only.

Rules:
- Follow Phase 1 spec and acceptance criteria exactly
- Do not implement other phases
- Use placeholder assets where real art doesn't exist yet (see §3.5)
- Match existing code conventions in portfolio/src/
- Tell me what to verify manually when done
```

Swap `Phase 1` for whichever phase you're on. Copy the pre-written prompts in §11 if you prefer — they already follow this format.

### One phase per chat (usually)

- **One session = one phase** keeps diffs reviewable and reduces regressions.
- After each phase: run `npm run dev`, click through the affected UI, then commit (if you want).
- If a phase is large (e.g. Phase 3), split it: "Phase 3 components only" then "Phase 3 — populate MSK case study."

### Assets vs code (important)

**Brian creates the art separately** — hand-drawn or AI-generated (see §3.5). The agent builds **slots** for assets (paths, fallbacks, accent colors). You drop files into `public/` later and update JSON paths; no need to block code work on finished illustrations.

**Workflow:**

1. Agent implements component with placeholder (colored block, initials, or generic SVG).
2. You add `public/projects/{slug}/hero.svg` (or PNG) when ready.
3. Second small agent pass or manual JSON edit: point `illustration` / `icon` at the real file.

### When adding case study content

Keep **structure** (agent) and **copy** (you) separate at first:

1. Agent: Phase 3 template + extended `Project` type.
2. You: write briefs in JSON or a scratch doc.
3. Agent: "Populate `data/projects/msk-hpc.json` from this brief: …"

### Keeping the doc in sync

When you change a decision (new category, different card layout), update `systemdesign.md` first, then tell the agent: "§6 Phase 1 updated — adjust ProjectCard to match." The doc stays the contract between sessions.

### Quick verification after each phase

- Light + dark theme
- Open a folder → see cards → open case study → back
- Terminal still works
- Dock / windows unaffected unless that phase touched them
- No new lint/TS errors

---

## 1. PostHog reference breakdown

### 1.1 What PostHog's site *is* structurally


| Layer                     | What it does                                             | Visual feel                                        |
| ------------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| **Global nav**            | Product OS, Pricing, Docs, Community, Company            | Sticky, dense, always one click from any "product" |
| **Hero**                  | Bold claim + proof ("190k+ teams")                       | Big type, mascot, immediate personality            |
| **Social proof strip**    | Logo shuffle, testimonials                               | Playful motion, not corporate grid                 |
| **Product OS grid**       | 10+ tiles (Analytics, Replay, Flags…)                    | Each tile = icon + color + label → **own URL**     |
| **Category sections**     | "Data platform", "Automatic tooling", "Data exploration" | Section headers + bento sub-grids                  |
| **Product detail pages**  | Deep dive per product: features, demos, pricing snippet  | Long but scannable; embedded interactive demos     |
| **Manifesto blocks**      | "Why we're different", transparency, anti-SaaS           | Long-form prose with character                     |
| **README blocks**         | Content styled like `.md` files on screen                | Developer-native, rustic UI chrome                 |
| **CTA / parody commerce** | Fake store, floppy disk joke, "$0 off"                   | Easter eggs; never blocks core path                |
| **Footer**                | Everything linked again                                  | Exhaustive but organized                           |


**Core interaction pattern:** *Object on screen → click → dedicated webpage with depth.*
That's exactly your folder → category window → project card → case study flow.

---

### 1.2 PostHog UI features worth stealing

**Navigation & discovery**

- Mega-menu of "products" (your: dock apps + desktop folders)
- Everything has an icon + accent color
- "View all" / browse by category
- Sticky context so you never feel lost

**Cards & tiles**

- Product tiles: rounded rect, bold icon, hover lift/wiggle
- Bento grids: mixed card sizes (1×1, 2×1, 2×2)
- Cards feel *clickable* — shadow, border, slight texture

**Content blocks**

- Feature lists with small icons
- Metric callouts ("98% use free tier" → your: "20% fewer support tickets")
- Code/terminal install blocks
- Comparison tables (you: "Before / After" or "Constraints / Results")
- Timeline / changelog aesthetic for experience

**Motion**

- Staggered entrance on scroll (inside windows: on mount)
- Hover: scale 1.02–1.05, subtle rotate (-1° to 1°)
- Logo shuffle / marquee
- Mascot idle animation
- Spring physics on interactive elements

**Personality**

- Self-aware humor in microcopy
- Transparency (handbook, roadmap) → your: "About this site", shortcuts, stack
- Anti-corporate tone in headings
- Easter eggs that reward exploration (Terminal, hidden pages)

---

### 1.3 PostHog art style ("rustic" / hand-crafted)

PostHog doesn't feel like generic SaaS. It feels like **an indie game UI meets a zine**:


| Trait                         | Description                                 | Portfolio adaptation                                   |
| ----------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| **Hand-drawn illustrations**  | Sketchy SVG lines, imperfect strokes        | Custom project thumbnails, folder decorations          |
| **Mascot**                    | Hedgehog (Max) in scenes                    | Your own character (see §3.2) — *not* a hedgehog clone |
| **Warm paper tones**          | Cream/off-white sections, yellow highlights | Window interiors, card backgrounds                     |
| **Bold product colors**       | Each product has a signature hue            | Each category + project has `accentColor`              |
| **Slight texture**            | Noise, halftone, pencil grain               | `background-image` noise on `.app-content`             |
| **Sticker / label aesthetic** | Badges, tags, handwritten labels            | "Featured", "Internship", "EECS 485" stickers          |
| **Comic annotations**         | Arrows, underlines, circle highlights       | Case study callouts on screenshots                     |
| **Retro tech**                | Floppy disks, CRT vibes, CLI                | Boot sequence, Terminal, README blocks                 |
| **Not overly flat**           | Borders, inset shadows, layered cards       | Replace list-style `ProjectCard` with tile cards       |


**Avoid:** copying PostHog yellow/black palette 1:1, hedgehog, or their exact icon set.

---

## 2. Translation map: PostHog → Brian OS

```
PostHog                          Brian OS (your site)
─────────────────────────────────────────────────────────────
posthog.com homepage             Desktop + Home window (hero)
Product OS mega menu             Menu bar dropdowns + Dock
Product tile (Analytics…)        Illustrated ProjectCard
Product page (/product-analytics) ProjectCaseStudy in window
Product categories on /products  CategoryProjectsView (folder window)d
Pricing page                     Contact / "Availability" window (future)
Docs                             Case study body + README blocks
Handbook / About                 About app + AboutModal
Install wizard (npx @posthog…)   Terminal + boot sequence
Changelog                        "Updates" or Terminal `changelog`
Mascot scenes                    Mascot in Home, boot, empty states
```

### User journeys (keep these short)

**Recruiter (60 sec):**
Boot (skippable) → Home → Work folder → 1 featured card → case study → Contact

**Engineer (5 min):**
Terminal `help` → open projects → Systems folder → deep case studies → easter eggs

**Return visitor:**
Persisted theme + optional saved window state → straight to folder/card via deep link

---

## 3. Art direction: rustic & illustrated

### 3.1 Visual principles

1. **Shell = macOS** (glass, traffic lights, dock) — familiar, polished
2. **Interior = PostHog** (warm, illustrated, playful) — personality inside windows
3. **Serious content, playful frame** — LANL/Lyft metrics in case studies; jokes in chrome
4. **Every project is a "product launch"** — icon, color, tagline, hero art, feature grid
5. **Illustration > screenshot** when no public demo exists

### 3.2 Mascot (optional but high impact)

Create a small original character — **not** PostHog's hedgehog.

Directions that fit you:

- **CRT blob** — cute pixel face on a mini terminal
- **Compass creature** — CS + CogSci (logic + mind)
- **Wrench-fox / tool-animal** — systems builder vibe

**Placement:**

- Boot sequence (small idle loop)
- Home window corner
- Empty states ("No projects yet")
- Loading / error states

**Style:** 2–3 color flat SVG, slightly wobbly outlines (use `stroke-linecap: round`, hand-drawn path jitter or pre-made sketch SVGs from Figma/Procreate).

### 3.3 Illustration system for projects

Each project gets:

- `**illustration`** — 400×240 SVG or PNG, rustic style (diagram, metaphor, not photo)
- `**icon**` — 64×64 app-icon style for cards (like PostHog product icons)
- `**accentColor**` — hex for card border glow, tags, header strip

Illustration types by project kind:


| Kind               | Illustration idea                                      |
| ------------------ | ------------------------------------------------------ |
| HPC / systems      | Rack of nodes, data pipes, SLURM queue sketch          |
| Data / linguistics | Word clouds, graph nodes, survey forms                 |
| Coursework         | Whiteboard diagram, stack of papers with grade sticker |
| Internship         | Building logo abstracted + metric badge                |


Store in: `public/projects/{slug}/icon.svg`, `hero.svg`

### 3.4 Texture & chrome

Add to window *interiors* only (not menu bar/dock):

```css
/* Conceptual — implement in globals.css Phase 0 */
.app-content-rustic {
  background-color: var(--surface-paper);
  background-image:
    url("/textures/paper-noise.png"),
    linear-gradient(180deg, var(--surface-paper) 0%, var(--surface-paper-warm) 100%);
}

.card-rustic {
  border: 2px solid color-mix(in srgb, var(--foreground) 8%, transparent);
  border-radius: 14px;
  box-shadow:
    3px 3px 0 var(--accent-muted),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
```

### 3.5 Asset creation — owner-made art (hand-drawn or generated)

**All custom illustrations, icons, mascot art, and textures are created by Brian** — not sourced from stock or copied from PostHog. The authentic "hand-drawn" / rustic look comes from **original assets**, produced either:

- **Hand-drawn** — Procreate, Figma pencil brush, iPad, scanned ink; export as SVG or PNG
- **AI-assisted** — image generation then **trace/cleanup** in Figma/Illustrator so lines feel sketchy and consistent (avoid raw AI slop; simplify to flat 2–4 colors per §10 style guide)

**Agent responsibility:** wire up paths, dimensions, fallbacks, and `alt` text — **not** generate final art unless explicitly asked for a temporary placeholder.

**Placeholder strategy until real art exists:**


| Asset           | Temporary stand-in                                     |
| --------------- | ------------------------------------------------------ |
| Project hero    | CSS block using `project.accentColor` + title initials |
| Project icon    | Emoji, colored square, or 2-letter monogram            |
| Category banner | Solid gradient using `category.color`                  |
| Mascot          | Simple SVG silhouette or skip until art exists         |
| Paper noise     | Subtle CSS `noise` filter or tiny generated tile       |


**Consistency tips when making art:**

- One outline weight across a set (e.g. all project heroes for Systems folder)
- Reuse the same 5–6 accent hues from categories + per-project `accentColor`
- Slight imperfection is good; perfect vector polish is not the goal
- Export heroes ~**800×480**, icons **64×64** or **128×128** @2x, SVG preferred for icons

**Drop-in paths** (agent should expect these):

```
public/
  textures/paper-noise.png
  mascot/mascot-idle.svg
  brand/brian-os-logo.svg
  categories/{academics|work|research|systems|personal}.svg
  projects/{slug}/icon.svg
  projects/{slug}/hero.svg
```

---

## 4. Design tokens

### 4.1 Colors

Keep macOS shell tokens; add **interior / PostHog-adjacent** tokens:

```css
:root {
  /* Shell (existing) */
  --background: #f5f5f7;
  --foreground: #1d1d1f;
  --window-bg: #ffffff;

  /* NEW: rustic interior palette */
  --surface-paper: #faf8f4;
  --surface-paper-warm: #f3ede4;
  --surface-ink: #2c2825;
  --surface-muted: #6b6560;

  /* Accent — warm primary (PostHog-energy, not PostHog-yellow) */
  --accent-primary: #e8912d;
  --accent-secondary: #3d9a8a;
  --accent-highlight: #f4d03f;

  /* Category colors (align with config/categories.ts) */
  --cat-academics: #5AC8FA;
  --cat-work: #34C759;
  --cat-research: #AF52DE;
  --cat-systems: #FF9500;
  --cat-personal: #FF2D55;

  /* Semantic */
  --metric-up: #34C759;
  --sticker-red: #ff6b6b;
  --link: #007aff;
  --link-interior: #c45e00;
}

[data-theme="dark"] {
  --surface-paper: #1a1816;
  --surface-paper-warm: #221f1c;
  --surface-ink: #f5f0e8;
  --surface-muted: #a39e97;
  --accent-primary: #f0a04a;
}
```

### 4.2 Typography


| Role                      | Font                                 | Usage                                 |
| ------------------------- | ------------------------------------ | ------------------------------------- |
| **UI / body**             | Geist Sans (existing)                | Menu bar, dock, window titles         |
| **Interior headings**     | Geist Sans, weight 650               | Case study titles                     |
| **Mono / terminal**       | Geist Mono                           | Terminal, README blocks, metrics      |
| **Display (optional)**    | `"DM Serif Display"` or `"Fraunces"` | Home hero only — one display font max |
| **Hand label (optional)** | `"Caveat"` or `"Patrick Hand"`       | Stickers, annotations sparingly       |


Scale inside windows:

- Hero title: `text-2xl` / `font-semibold`
- Section label: `text-[11px] uppercase tracking-widest text-surface-muted`
- Body: `text-sm leading-relaxed`
- Metric: `text-3xl font-mono tabular-nums`

### 4.3 Spacing & radii


| Token              | Value | Use                     |
| ------------------ | ----- | ----------------------- |
| `--radius-window`  | 12px  | macOS windows           |
| `--radius-card`    | 14px  | project tiles           |
| `--radius-sticker` | 6px   | badges                  |
| `--radius-icon`    | 16px  | app-style project icons |
| `--space-window`   | 20px  | case study padding      |
| `--space-card-gap` | 12px  | grid gap                |


### 4.4 Shadows (rustic offset)

```css
--shadow-card: 4px 4px 0 rgba(0, 0, 0, 0.12);
--shadow-card-hover: 6px 6px 0 rgba(0, 0, 0, 0.16);
--shadow-sticker: 2px 2px 0 rgba(0, 0, 0, 0.2);
```

Prefer **offset shadows** over soft diffuse blur for interior cards (PostHog/rustic feel).

---

## 5. Global layout & information architecture

### 5.1 Desktop layers (z-index)

```
10000  Loading / modals
9999   Menu bar
9998   Dock
9997   Dock reveal zone
100    Windows (dynamic z-index)
20     Desktop folders
10     Wallpaper
```

### 5.2 Content hierarchy

```
Desktop
├── MenuBar (global nav energy)
├── Windows
│   ├── HomeApp          ← hero / "what is Brian OS"
│   ├── AboutApp         ← manifesto + experience
│   ├── ProjectsApp      ← router:
│   │   ├── CategoryProjectsView  ← folder landing (grid of cards)
│   │   └── ProjectCaseStudy      ← product page
│   ├── ContactApp
│   └── TerminalApp
├── DesktopFolders (5 categories)
└── Dock (5 apps)
```

### 5.3 PostHog-style "product page" anatomy (case study template)

Every `ProjectCaseStudy` should eventually follow this layout **inside the window**:

```
┌─────────────────────────────────────────┐
│ ← Back to {Category}          [stickers]│
├─────────────────────────────────────────┤
│ [Hero illustration - full width]        │
│ Title                          accent bar│
│ Tagline                                 │
│ ┌─────┐ ┌─────┐ ┌─────┐  metric bento   │
│ │ 20% │ │ 400G│ │ 3mo │                 │
│ └─────┘ └─────┘ └─────┘                 │
├─────────────────────────────────────────┤
│ ## Problem    (README-style header)     │
│ prose...                                │
│ ## Approach                             │
│ [architecture diagram illustration]     │
│ ## Solution                             │
│ [screenshot frame with sketch arrow]    │
│ ## Stack                                │
│ icon chips                              │
│ ## What I learned                       │
│ callout box                             │
│ ## Links                                │
│ [ GitHub ] [ PDF ] [ Demo ]             │
└─────────────────────────────────────────┘
```

---

## 6. Component specs (implement in order)

### Phase 0 — Foundation (tokens + textures)

**Files:** `globals.css`, `app/layout.tsx` (optional display font)

- [ ] Add design tokens from §4.1–4.4
- [ ] Add `.app-content-rustic` class for window interiors
- [ ] Add `public/textures/paper-noise.png` (tiny seamless tile)
- [ ] Apply rustic class in `AppContainer` for content apps (not Terminal)

**Acceptance:** About/Projects/Home interiors feel warmer; shell unchanged.

---

### Phase 1 — Illustrated ProjectCard (PostHog product tile)

**Replace** list-row `ProjectCard` with **tile card**.

**Layout (grid in CategoryProjectsView):**

```tsx
// CategoryProjectsView: change flex-col → grid
<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
  {projects.map(...)}
</div>
```

**ProjectCard anatomy:**

```
┌──────────────────────────┐
│  ┌────┐                  │
│  │icon│  Title           │
│  └────┘  tagline (2 lines)│
│  [illustration 16:9]     │
│  tech chips    [Featured]│
└──────────────────────────┘
```

**Props / data:** uses `project.icon`, `project.illustration`, `project.accentColor`, `project.category`

**Interaction:**

- Hover: `translate(-2px, -2px)` + shadow grow (offset shadow style)
- Optional: `rotate: [-0.5, 0.5]` random on mount (seed from slug)
- Click: `onClick()` → navigate to case study (existing)
- Stagger: `delay: index * 0.06`

**CSS class:** `.project-card-rustic`

**Acceptance:** Category windows feel like PostHog product grid, not a list.

---

### Phase 2 — CategoryProjectsView (folder landing page)

PostHog's `/products` section = your folder window.

**Header block:**

```
[category icon at 48px]  Academics
"Coursework & university projects — the foundations."
────────────────────────────────────
Showing 4 projects · Updated 2026
```

**Optional:** category hero banner (wide illustration per category in `public/categories/{id}.svg`)

**Empty state:** mascot + "This folder is empty — check back soon" + Terminal hint `open {slug}`

**Featured row:** if any `featured` in category, show `FeaturedProjectCard` (2× width bento) at top

**Files:** `CategoryProjectsView.tsx`, `config/categories.ts` (add `description`, `heroImage`)

---

### Phase 3 — ProjectCaseStudy (product detail page)

**Upgrade from placeholder to full PostHog-style page.**

**New subcomponents** (create under `components/projects/`):


| Component          | Purpose                                       |
| ------------------ | --------------------------------------------- |
| `CaseStudyHero`    | illustration + title + tagline + accent strip |
| `MetricBento`      | 2–4 stat tiles                                |
| `CaseStudySection` | README-style `## Section` header              |
| `TechChipRow`      | stack icons/text                              |
| `CalloutBox`       | "What I learned" highlighted                  |
| `ScreenshotFrame`  | dashed frame + sketch arrow SVG overlay       |
| `CaseStudyNav`     | back breadcrumb: `{Category} / {Project}`     |


**Extend `Project` type** — see §9.

**Motion:**

- Enter: slide from right (keep) + hero illustration fade-up
- Sections: stagger `opacity/y` on scroll inside window (use `IntersectionObserver` on scroll container, not window)

**Acceptance:** One fully filled case study (pick best internship) looks portfolio-ready.

---

### Phase 4 — DesktopFolder (rustic objects on desktop)

Current: mac folder SVG. Upgrade:

- Folder tint = `category.color` (subtle overlay on icon)
- Hover: bounce + category-colored glow under folder
- Optional: tiny sticker badge with project count (`getProjectsByCategory().length`)
- Double-click opens category (keep current behavior)

**Optional PostHog energy:** on first visit, folders stagger-animate in after boot (from below Home row).

**Files:** `DesktopFolder.tsx`, `DesktopFolders.tsx`, `globals.css`

---

### Phase 5 — HomeApp (hero window)

PostHog homepage energy **inside one window**:

```
┌─────────────────────────────────────┐
│  [mascot]   Hi, I'm Brian Hsu       │
│             CS + CogSci @ UMich     │
│             one-liner with POV      │
│                                     │
│  ┌─────────┐ ┌─────────┐           │
│  │ Work    │ │ Systems │  quick    │
│  │ 2 proj  │ │ 4 proj  │  open     │
│  └─────────┘ └─────────┘           │
│                                     │
│  "Open a folder or try Terminal"    │
│  [Featured project mini-card]       │
└─────────────────────────────────────┘
```

- Quick-open tiles → `openApp("projects", categoryId)`
- Featured project → `openApp("projects", slug)`
- Mascot idle bob animation

---

### Phase 6 — AboutApp (manifesto page)

PostHog `/about` structure:

1. **Opening hook** — honest POV (not corporate)
2. **Timeline** — experience cards (LANL, MSK, Lyft) with metric stickers
3. **Focus areas** — illustrated chips (not just emoji list)
4. **"Why I'm different"** — short manifesto block
5. **Transparency mini** — stack used to build site, link to GitHub
6. Resume download as primary CTA button (rustic button style)

---

### Phase 7 — Terminal (install wizard energy)

PostHog's `npx @posthog/wizard` → your CLI discovery layer.

**Add commands:**

- `ls folders` / `ls projects`
- `cd work` → opens Work folder
- `cat {slug}` → print tagline + problem summary
- `neofetch` → ASCII art + "Brian OS" specs
- `changelog` → site updates
- Tab completion

**Visual:** keep green-on-black; add optional `banner` with rustic ASCII logo on `help`

---

### Phase 8 — LoadingScreen (boot wizard)

Already strong. PostHog upgrades:

- Mascot peek during boot
- Progress bar styled like retro installer (optional)
- "Skip" link for `prefers-reduced-motion` and impatient recruiters
- Final line: `Welcome to Brian OS` instead of generic desktop text

---

### Phase 9 — MenuBar & modals

PostHog nav density:


| Menu       | Items                                            |
| ---------- | ------------------------------------------------ |
| **File**   | Open Resume, Open Contact                        |
| **View**   | Theme, Reduce motion, Show desktop               |
| **Window** | List open windows, Minimize all                  |
| **Help**   | Keyboard shortcuts, About this site, `help` hint |


**About this site modal:** version, stack, "Built by Brian", Easter egg credit

---

### Phase 10 — ContactApp (CTA page)

PostHog pricing CTA energy but for hiring:

- "Currently: Open to Summer 2026 internships"
- Contact links as **large rustic cards** (not plain list)
- Optional playful "pricing table" parody:

```
┌────────────────┬──────────────┐
│ Coffee chat    │ $0           │
│ Technical interview │ $0      │
│ Hire Brian     │ Let's talk   │
└────────────────┴──────────────┘
```

Keep parody clearly joking; real email prominent.

---

### Phase 11 — Wallpaper & ambient delight

- Wallpaper: subtle illustrated landscape OR gradient + paper noise (current gradient OK)
- Optional time-of-day tint (you have SunArc in menu bar — tie together)
- Desktop right-click context menu (future): Change wallpaper

---

### Phase 12 — Deep links & persistence

- URL: `?folder=work` or `?project=msk-hpc-dashboard`
- Optional: remember last opened folder

---

## 7. Animation & motion catalog


| ID  | Element             | Trigger           | Animation                    | Duration            |
| --- | ------------------- | ----------------- | ---------------------------- | ------------------- |
| A1  | Boot text           | load              | scramble (existing)          | —                   |
| A2  | Desktop folders     | after boot        | stagger fade-up + spring     | 400ms, 60ms stagger |
| A3  | Window open         | dock/folder click | genie (existing)             | ~600ms              |
| A4  | ProjectCard         | hover             | translate + shadow offset    | 150ms               |
| A5  | ProjectCard         | mount             | opacity + y stagger          | 300ms               |
| A6  | Case study hero     | route change      | fade-up                      | 350ms               |
| A7  | Case study sections | scroll in window  | fade-up 20px                 | 400ms               |
| A8  | Mascot              | idle              | bob y ±4px loop              | 3s ease-in-out      |
| A9  | Metric bento        | mount             | count-up numbers             | 800ms               |
| A10 | Dock icon           | hover             | gaussian scale (existing)    | spring              |
| A11 | Folder              | hover             | scale 1.04 (existing) + glow | spring              |
| A12 | Sticker badges      | mount             | slight rotate snap-in        | 200ms               |


**Rules:**

- Respect `prefers-reduced-motion`: disable A2, A4–A9, keep instant state changes
- No animation > 600ms except boot (skippable)
- Animate **inside windows** for content; keep shell animations macOS-authentic

---

## 8. Copy & voice guide

### Tone spectrum

```
Corporate ────────────●─────── Unhinged
                  PostHog zone
                  (you: slightly left of center)
```

**Do:**

- First person, specific ("Built SLURM dashboard with Rails")
- Light humor in chrome ("No credit card required" → "No NDAs required to say hi")
- Honest gaps ("Code unavailable — course policy")

**Don't:**

- Sarcasm about recruiters
- Fake metrics
- Copy PostHog jokes verbatim

### Microcopy templates


| Location         | Example                                             |
| ---------------- | --------------------------------------------------- |
| Folder empty     | "Nothing here yet — but the terminal knows things." |
| Case study back  | `← Back to Work`                                    |
| Featured badge   | `Staff pick` or `Featured`                          |
| Boot subline     | `access granted · portfolio v1.0`                   |
| Terminal welcome | `Type 'help' or 'neofetch' to explore Brian OS`     |


---

## 9. Data model for rich case studies

Extend `portfolio/src/types/index.ts`:

```ts
export interface ProjectMetric {
  label: string;
  value: string;
  detail?: string;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  techStack: string[];

  // Visual identity (PostHog product tile)
  accentColor: string;
  icon?: string;
  illustration?: string;

  // Narrative (existing)
  problem: string;
  approach: string;
  solution: string;
  learned: string;

  // Rich content (new)
  metrics?: ProjectMetric[];
  role?: string;
  timeframe?: string;
  context?: string;
  highlights?: string[];
  gallery?: string[];
  architectureImage?: string;

  links: ProjectLink[];
  featured?: boolean;
  status?: "shipped" | "coursework" | "research" | "wip";
}
```

Extend `config/categories.ts`:

```ts
{
  id: "work",
  title: "Work",
  icon: "💼",
  color: "#34C759",
  description: "Internships and industry projects.",
  heroImage: "/categories/work.svg",
}
```

---

## 10. Asset checklist

> **Owner:** Brian creates these assets over time (hand-drawn or AI-generated + cleaned up). See §3.5.
> The codebase should ship with placeholders until each asset is ready — never block a phase on finished art.

### Per category (5)

- [ ] `public/categories/{id}.svg` — wide banner illustration (Brian)
- [ ] Optional folder tint overlay (can be CSS-only from `category.color`)

### Per project

- [ ] `public/projects/{slug}/icon.svg` — 64×64 app icon (Brian)
- [ ] `public/projects/{slug}/hero.svg` — 800×480 hero illustration (Brian)
- [ ] Optional: `screenshot-1.png`, `architecture.svg` (Brian or real screenshots)

### Global

- [ ] `public/textures/paper-noise.png` (Brian or subtle CSS fallback)
- [ ] `public/mascot/mascot-idle.svg` (Brian — optional for early phases)
- [ ] `public/brand/brian-os-logo.svg` — boot + Terminal (Brian)

### Illustration style guide (for Brian's art pipeline)

- Stroke: 2–3px, `#2c2825`, round caps
- Fill: flat, max 4 colors per illustration
- Avoid gradients inside illustrations (keep flat rustic)
- Use accent color as single highlight per drawing
- If using AI generation: regenerate until composition works, then **redraw/trace** key lines for a consistent hand-made set

---

## 11. Section-by-section Cursor prompts

Copy **one** block per Agent session. Start with Prompt A. See §0 for full workflow.

**Always include when pasting:**

```
@portfolio/systemdesign.md
```

(or tell the agent to read `portfolio/systemdesign.md` first)

---

### Prompt A — Phase 0: Tokens & rustic interior

```
Read portfolio/systemdesign.md §0, §4, and Phase 0 in §6.

Implement Phase 0 only for portfolio/:
- Add CSS design tokens (--surface-paper, --accent-primary, category colors, offset shadows)
- Add .app-content-rustic class with paper noise texture (CSS fallback OK until Brian adds public/textures/paper-noise.png)
- Apply to HomeApp, AboutApp, CategoryProjectsView, ProjectCaseStudy, ContactApp interiors
- Do not change menu bar, dock, or window chrome
- Support light/dark themes
- Do not implement Phase 1+

When done, list what I should visually check in the browser.
```

---

### Prompt B — Phase 1: Illustrated ProjectCard grid

```
Read portfolio/systemdesign.md Phase 1 in §6 and §3.5 (assets).

Implement Phase 1 only:
- Redesign ProjectCard as rustic illustrated tile (icon, 16:9 illustration area, accent color, offset shadow hover)
- CategoryProjectsView: 2-column grid on sm+
- Extend Project type with accentColor, icon?, illustration? (defaults if missing)
- Use CSS/placeholder fallbacks for missing art — Brian will add hand-drawn or generated assets later
- Update placeholder JSON files with sample accent colors and paths under public/projects/
- Do not implement Phase 2+
```

---

### Prompt C — Phase 2: Category landing pages

```
Implement Phase 2 of systemdesign.md:
- Add description + heroImage to categories config
- Upgrade CategoryProjectsView header (icon, description, project count)
- Featured bento row at top when featured projects exist
- Illustrated empty state with hint text
```

---

### Prompt D — Phase 3: Full case study template

```
Implement Phase 3 of systemdesign.md:
- Create CaseStudyHero, MetricBento, CaseStudySection, TechChipRow, CalloutBox, ScreenshotFrame, CaseStudyNav
- Rebuild ProjectCaseStudy using these components
- Add scroll-triggered section animations inside window (IntersectionObserver)
- Extend Project type with metrics, role, timeframe, context, highlights, gallery, status
- Fully populate ONE real project (pick best internship) as reference
```

---

### Prompt E — Phase 4–5: Folders + Home hero

```
Implement Phase 4 and 5 of systemdesign.md:
- DesktopFolder: category color tint, project count badge, stagger animation on desktop load
- HomeApp: mascot placeholder, quick-open category tiles, featured project mini-card
```

---

### Prompt F — Phase 6–7: About manifesto + Terminal expansion

```
Implement Phase 6 and 7 of systemdesign.md:
- AboutApp: timeline cards with metrics, manifesto block, rustic resume CTA
- Terminal: add ls, cd, cat, neofetch, changelog commands per spec
```

---

## Appendix: PostHog layout patterns → your components (quick reference)


| PostHog pattern       | Your component                               | Priority |
| --------------------- | -------------------------------------------- | -------- |
| Product icon grid     | `ProjectCard` grid in `CategoryProjectsView` | P0       |
| Product detail page   | `ProjectCaseStudy`                           | P0       |
| Category browse page  | Folder → `CategoryProjectsView`              | Done     |
| Mega menu             | `MenuBar` dropdowns                          | P2       |
| Hero + proof          | `HomeApp`                                    | P1       |
| About manifesto       | `AboutApp`                                   | P2       |
| Install CLI           | `TerminalApp`                                | P2       |
| Mascot                | Boot + Home + empty states                   | P1       |
| README content blocks | `CaseStudySection`                           | P1       |
| Bento metrics         | `MetricBento`                                | P1       |
| Parody CTA            | `ContactApp`                                 | P3       |
| Logo shuffle          | Featured projects rotation on Home           | P3       |


---

*Version 1.0 — Brian OS Design System — PostHog-inspired, macOS-framed.*