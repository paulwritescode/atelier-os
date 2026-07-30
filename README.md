# Canvas Manager

Client canvas management for tailors — track projects, measurements, pricing, and
design notes per client, and share a read-only view with the customer.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 |
| Styling | Tailwind CSS v4 (CSS-first — no `tailwind.config`) |
| Components | shadcn/ui, `base-luma` style, on [Base UI](https://base-ui.com) |
| Icons | [Hugeicons](https://hugeicons.com) |
| Fonts | Inter (sans + headings), Geist Mono |
| Runtime | Bun |

## Getting started

```bash
bun install
bun run dev          # http://localhost:3000
```

| Script | |
|---|---|
| `bun run dev` | dev server |
| `bun run build` | production build |
| `bun run start` | serve the production build |
| `bun run lint` | ESLint |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run format` | Prettier |

## Routes

| Path | |
|---|---|
| `/` | Dashboard — canvas grid/list, search, status filter, canvas editor |
| `/profile` | Tailor profile |
| `/customer-view` | Read-only client view with comments |

## Structure

```
app/            routes, root layout, globals.css
components/     app components
components/ui/  shadcn primitives — regenerate, don't hand-edit
hooks/          use-mobile
lib/            cn(), shared types, PDF export
```

## Theming

All colors are semantic tokens (`bg-primary`, `text-muted-foreground`,
`border-border`) defined as `oklch()` values in `app/globals.css`. The palette is
gold on neutral greys. Light and dark are both defined — `next-themes` follows the
system setting, and `d` toggles it.

Prefer tokens over literal color classes so both themes stay correct.

## Adding components

```bash
bunx --bun shadcn@latest add <component>
```

Components resolve against the `base-luma` style set in `components.json`. Note
these are **Base UI**, not Radix: composition uses the `render` prop rather than
`asChild`.

## Notes

- Data is in-memory mock state; there is no persistence layer yet.
- `lib/pdfExport.ts` opens a print window rather than generating a real PDF.

See `MIGRATION.lips` for the record of the Vite → Next.js migration.
