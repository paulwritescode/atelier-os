# Graph Report - .  (2026-07-30)

## Corpus Check
- Corpus is ~8,987 words - fits in a single context window. You may not need a graph.

## Summary
- 251 nodes · 424 edges · 17 communities (11 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- UI Primitives & Sidebar
- Pages & App Router
- TypeScript References
- External Dependencies
- Component Config & Aliases
- Dev Tooling & Lint
- Root Layout & Fonts
- Package Scripts
- Project Documentation
- Customer View & Cards
- Vercel Deploy Config
- ESLint Config
- Next.js Config
- PostCSS Config
- UI Framework (Base UI)
- SEO Config

## God Nodes (most connected - your core abstractions)
1. `cn()` - 56 edges
2. `compilerOptions` - 16 edges
3. `Button()` - 12 edges
4. `Canvas` - 11 edges
5. `Input()` - 9 edges
6. `Label()` - 8 edges
7. `include` - 8 edges
8. `Textarea()` - 7 edges
9. `scripts` - 7 edges
10. `react` - 7 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `CardFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `CanvasCardProps` --references--> `Canvas`  [EXTRACTED]
  components/CanvasCard.tsx → lib/types.ts
- `ClientInfoPanelProps` --references--> `Canvas`  [EXTRACTED]
  components/ClientInfoPanel.tsx → lib/types.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **UI Component Stack** — readme_shadcn_ui, readme_base_ui, readme_tailwind_css_v4, readme_hugeicons [EXTRACTED 0.95]

## Communities (17 total, 6 thin omitted)

### Community 0 - "UI Primitives & Sidebar"
Cohesion: 0.09
Nodes (41): menuItems, Separator(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay() (+33 more)

### Community 1 - "Pages & App Router"
Cohesion: 0.14
Nodes (25): AppSidebar(), CanvasCard(), CanvasCardProps, statusColors, CanvasEditor(), CanvasEditorProps, SavedSection, TextSection (+17 more)

### Community 2 - "TypeScript References"
Cohesion: 0.07
Nodes (29): dom, dom.iterable, esnext, **/*.mts, next.config.ts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+21 more)

### Community 3 - "External Dependencies"
Cohesion: 0.08
Nodes (25): @base-ui/react, class-variance-authority, clsx, @hugeicons/core-free-icons, @hugeicons/react, next, next-themes, dependencies (+17 more)

### Community 4 - "Component Config & Aliases"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 5 - "Dev Tooling & Lint"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, tailwindcss (+13 more)

### Community 6 - "Root Layout & Fonts"
Cohesion: 0.15
Nodes (11): fontMono, inter, metadata, RootLayout(), ThemeHotkey(), ThemeProvider(), SidebarProvider(), Toaster() (+3 more)

### Community 7 - "Package Scripts"
Cohesion: 0.17
Nodes (11): name, private, scripts, build, dev, format, lint, start (+3 more)

### Community 8 - "Project Documentation"
Cohesion: 0.20
Nodes (10): Next.js Agent Rules, Canvas Manager, Customer View Route, Dashboard Route, Hugeicons, In-Memory Mock State, Next.js 16 App Router, Profile Route (+2 more)

### Community 9 - "Customer View & Cards"
Cohesion: 0.31
Nodes (7): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle()

## Knowledge Gaps
- **101 isolated node(s):** `inter`, `fontMono`, `metadata`, `$schema`, `style` (+96 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `External Dependencies` to `Root Layout & Fonts`, `Package Scripts`?**
  _High betweenness centrality (0.248) - this node is a cross-community bridge._
- **Why does `react` connect `Root Layout & Fonts` to `UI Primitives & Sidebar`, `External Dependencies`?**
  _High betweenness centrality (0.223) - this node is a cross-community bridge._
- **Why does `cn()` connect `UI Primitives & Sidebar` to `Pages & App Router`, `Root Layout & Fonts`, `Customer View & Cards`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **What connects `inter`, `fontMono`, `metadata` to the rest of the system?**
  _101 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Primitives & Sidebar` be split into smaller, more focused modules?**
  _Cohesion score 0.08862745098039215 - nodes in this community are weakly interconnected._
- **Should `Pages & App Router` be split into smaller, more focused modules?**
  _Cohesion score 0.1358974358974359 - nodes in this community are weakly interconnected._
- **Should `TypeScript References` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._