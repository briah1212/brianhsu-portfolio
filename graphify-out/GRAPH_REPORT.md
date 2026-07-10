# Graph Report - .  (2026-07-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 409 nodes · 755 edges · 25 communities (15 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `63330b69`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CodeApp.tsx
- windowStore.ts
- TerminalApp.tsx
- MenuBar.tsx
- HomeApp.tsx
- compilerOptions
- dependencies
- devDependencies
- Window.tsx
- AppContainer.tsx
- IntersectionObserverStub
- LoadingScreen.tsx
- route.ts
- layout.tsx
- ClickSpark.tsx
- brian.sh
- dev.sh
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- manifest.json
- rebuild-git-history.sh
- .start
- verify-docker.sh

## God Nodes (most connected - your core abstractions)
1. `useWindowStore` - 25 edges
2. `compilerOptions` - 16 edges
3. `TerminalApp()` - 13 edges
4. `useCodeStore` - 11 edges
5. `tokenize()` - 10 edges
6. `getAppConfig()` - 10 edges
7. `ProjectCategory` - 10 edges
8. `CodeApp()` - 9 edges
9. `getAllFiles()` - 9 edges
10. `MenuBar()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `AppContainerProps` --references--> `AppId`  [EXTRACTED]
  src/components/apps/AppContainer.tsx → src/types/index.ts
- `WindowProps` --references--> `WindowState`  [EXTRACTED]
  src/components/window/Window.tsx → src/types/index.ts
- `HomeApp()` --calls--> `getAppConfig()`  [EXTRACTED]
  src/components/apps/HomeApp.tsx → src/config/apps.ts
- `HomeApp()` --calls--> `useWindowStore`  [EXTRACTED]
  src/components/apps/HomeApp.tsx → src/store/windowStore.ts
- `ProjectsApp()` --calls--> `useWindowStore`  [EXTRACTED]
  src/components/apps/ProjectsApp.tsx → src/store/windowStore.ts

## Import Cycles
- None detected.

## Communities (25 total, 10 thin omitted)

### Community 0 - "CodeApp.tsx"
Cohesion: 0.08
Nodes (48): CodeApp(), ExplorerNode(), ExplorerNodeProps, FILE_ICONS, SearchHit, SearchView(), SourceControlView(), CODE_PROJECT (+40 more)

### Community 1 - "windowStore.ts"
Cohesion: 0.09
Nodes (33): Desktop(), resetWindowStore(), DesktopFolders(), Dock(), DockIcon, DockIconProps, DockTooltipProps, getRevealProximityPx() (+25 more)

### Community 2 - "TerminalApp.tsx"
Cohesion: 0.13
Nodes (30): ProjectsApp(), ProjectsAppProps, buildFilesystem(), CommandHandler, DirNode, FileNode, FSNode, getNode() (+22 more)

### Community 3 - "MenuBar.tsx"
Cohesion: 0.09
Nodes (29): AboutModal(), AboutModalProps, TECH_STACK, formatClockTime(), formatFullDate(), formatStatusBarTime(), getLocalTimeZone(), getLocalTimeZoneLabel() (+21 more)

### Community 4 - "HomeApp.tsx"
Cohesion: 0.09
Nodes (21): HomeActionButton(), HomeActionButtonProps, shade(), HOME_ACTIONS, HomeApp(), SECTION_EASE, ChatButton(), ChatMessage() (+13 more)

### Community 5 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+22 more)

### Community 6 - "dependencies"
Cohesion: 0.07
Nodes (29): animejs, @anthropic-ai/sdk, framer-motion, lucide-react, next, openai, dependencies, animejs (+21 more)

### Community 7 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, tailwindcss (+17 more)

### Community 8 - "Window.tsx"
Cohesion: 0.15
Nodes (20): AppContainer(), DesktopItem(), DesktopItemProps, ITEM_SPRING, BoundsTargetInput, computeResizedWindow(), ComputeResizeInput, getEffectiveDockArea() (+12 more)

### Community 9 - "AppContainer.tsx"
Cohesion: 0.11
Nodes (16): AboutApp(), experiences, focusAreas, skills, AppContainerProps, CalcButtonProps, CalculatorApp(), Operator (+8 more)

### Community 11 - "LoadingScreen.tsx"
Cohesion: 0.43
Nodes (7): addBootStep(), addCinematicExit(), BOOT_SEQUENCE, LoadingScreen(), LoadingScreenProps, scrambleIn(), scrambleOut()

### Community 12 - "route.ts"
Cohesion: 0.50
Nodes (4): ChatMessage, checkRateLimit(), POST(), rateLimitMap

### Community 13 - "layout.tsx"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 14 - "ClickSpark.tsx"
Cohesion: 0.40
Nodes (4): ClickSpark(), ClickSparkProps, Spark, SparkEasing

## Knowledge Gaps
- **136 isolated node(s):** `.start script`, `brian.sh script`, `dev.sh script`, `eslintConfig`, `nextConfig` (+131 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useWindowStore` connect `windowStore.ts` to `CodeApp.tsx`, `TerminalApp.tsx`, `MenuBar.tsx`, `HomeApp.tsx`, `Window.tsx`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `.start script`, `brian.sh script`, `dev.sh script` to the rest of the system?**
  _137 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CodeApp.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07656341320864991 - nodes in this community are weakly interconnected._
- **Should `windowStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08563134978229318 - nodes in this community are weakly interconnected._
- **Should `TerminalApp.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12955465587044535 - nodes in this community are weakly interconnected._
- **Should `MenuBar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09041835357624832 - nodes in this community are weakly interconnected._