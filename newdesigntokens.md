# Anio Regalia Operating System
## Design Tokens v2.0

Version: 2.0
Status: Approved
Owner: Design
Last Updated: 2026-08-03
Source: Extracted from approved design boards + brand logo

---

# Purpose

This document defines every design token used throughout the Anio Regalia Operating System.
These tokens are the single source of truth.
Developers must never hardcode colors, spacing, typography, shadows, radii, or transitions.
Every UI component consumes these tokens.

---

# Brand Foundation

The interface represents Anio Regalia — House of Anio Regalia.
Logo: `/public/logo.png` (AR monogram with crown, burgundy A, gold R, suit silhouette).
The visual language communicates craftsmanship, heritage, quiet confidence, editorial design, luxury, old money, precision, and timelessness.

---

# 1. COLOR SYSTEM

## Primary Palette

### Deep Burgundy
```css
--color-primary: #4B1E2A;
```
Purpose: Primary actions, sidebar background, primary buttons, selected states, active icons, status badge (Active).

### Antique Gold
```css
--color-accent: #C8A46B;
```
Purpose: Accent color, section labels (eyebrow text), focus borders, active sidebar icons, tertiary link color, gold divider beneath hero heading, category labels on cards.

### Warm Ivory
```css
--color-background: #F6F2EC;
```
Purpose: Application background (page canvas), hero background, input field default background, surface tint.

---

## Neutral Palette

### Charcoal Black
```css
--color-text: #1B1A17;
```
Purpose: Primary text, titles, headings, secondary button text, input text.

### Warm Gray
```css
--color-muted: #5C5852;
```
Purpose: Body text (secondary), icon default color, descriptions, metadata, supporting stat text.

### Stone
```css
--color-border: #E7E2DB;
```
Purpose: Borders, dividers, disabled inputs, card borders, filter pill borders, input borders.

### Soft Ivory
```css
--color-surface: #F3EFEA;
```
Purpose: Hover backgrounds on filters/nav, skeleton loaders, large recessed surfaces.

### White
```css
--color-white: #FFFFFF;
```
Purpose: Card backgrounds, inputs (focused/dropdown), modals, popovers, stat card backgrounds, top nav search background.

---

## Semantic Colors

### Forest Green (Success)
```css
--color-success: #2E6B4E;
```
Purpose: Completed status badge, paid, delivered, available.

### Burnished Amber (Warning)
```css
--color-warning: #B8863B;
```
Purpose: Draft status badge, pending, awaiting client, needs review.

### Muted Crimson (Danger)
```css
--color-danger: #8C2F2F;
```
Purpose: Cancelled, overdue, failed payment, delete confirmation, notification badge.

### Slate Blue (Information)
```css
--color-info: #2F4A6D;
```
Purpose: Announcements, system messages, information cards.

---

## Sidebar-Specific Colors

```css
--sidebar-bg: #4B1E2A;                     /* Deep Burgundy */
--sidebar-text-active: #FFFFFF;
--sidebar-text-default: #E8E1D6;           /* 90% white warmth */
--sidebar-icon-active: #C8A46B;            /* Antique Gold */
--sidebar-icon-default: #8E8072;
--sidebar-active-bg: rgba(255, 255, 255, 0.08);
--sidebar-section-label: #C8A46B;          /* Gold, uppercase */
```

---

# 2. TYPOGRAPHY

## Font Family

### Display / Headings
```
Playfair Display
```
Purpose: Hero headline, section titles, project names on cards, H1–H3.
Never use for body paragraphs. Never use for numeric values.

### Interface / Body
```
Inter
```
Purpose: Everything else — body, forms, navigation, tables, buttons, descriptions, badges, captions, eyebrows.

### Numeric / Data
```
JetBrains Mono
```
Purpose: All numeric values — stat metrics, payment amounts, KES figures, dates in data contexts, member counts, badge counts, delivery dates, percentages, measurements.
CSS variable: `--font-mono`
Utility class: `.font-numeric` (applies font-family + tabular-nums)
font-variant-numeric: tabular-nums (ensures consistent column alignment).

---

## Type Scale

| Style       | Font            | Weight | Size  | Line Height | Letter Spacing |
|-------------|-----------------|--------|-------|-------------|----------------|
| H1 (Hero)   | Playfair Display | 700    | 56px  | 64px        | -2%            |
| H2           | Playfair Display | 600    | 36px  | 44px        | -1%            |
| H3           | Playfair Display | 600    | 28px  | 36px        | 0%             |
| H4           | Inter           | 450    | 20px  | 28px        | 0%             |
| Body Large   | Inter           | 450    | 16px  | 24px        | 0%             |
| Body         | Inter           | 400    | 14px  | 22px        | 0%             |
| Small        | Inter           | 400    | 12px  | 18px        | 0%             |
| Caption      | Inter           | 400    | 11px  | 16px        | 0%             |
| Eyebrow      | Inter           | 700    | 11px  | 16px        | +8% (uppercase)|

## Font Weights Permitted
400 Regular, 450 Medium, 600 SemiBold, 700 Bold.
Never use 800 or 900.

---

# 3. SPACING SYSTEM (8pt Grid)

Base unit: 8px.

Allowed values only:
```
4  8  12  16  20  24  32  40  48  64  80  96  128
```

No arbitrary spacing. No exceptions.

---

# 4. BORDER RADIUS

| Name        | Value  | Use                                    |
|-------------|--------|----------------------------------------|
| Small       | 8px    | Inputs, checkboxes, badges (non-pill)  |
| Medium      | 12px   | Dropdowns, menus, popovers, nav items (active state) |
| Large       | 20px   | Panels, containers                     |
| Extra Large | 40px   | Hero card container                    |
| Pill        | 999px  | Buttons, search bar, status badges, filter pills |

Never invent additional radius values.

---

# 5. SHADOWS

Only three shadows exist in this system. No others permitted.

### Shadow 1 (Card)
```css
box-shadow: 0 2px 8px rgba(20, 20, 19, 0.06);
```

### Shadow 2 (Elevated)
```css
box-shadow: 0 8px 24px rgba(20, 20, 19, 0.08);
```

### Shadow 3 (Floating)
```css
box-shadow: 0 16px 40px rgba(20, 20, 19, 0.10);
```

---

# 6. BUTTONS

## Primary
```
Height: 44px
Padding: 0 20px
Radius: 22px
Background: #4B1E2A (Deep Burgundy)
Text: #FFFFFF
Font: Inter 14px / weight 500
Icon: left, 16px gap, 18px size
Hover: opacity 0.9
Active: opacity 0.85
```

## Secondary (Outline)
```
Height: 44px
Padding: 0 20px
Radius: 22px
Border: 1px solid #D9D2C7
Background: transparent
Text: #1B1A17
Font: Inter 14px / weight 500
Hover: background #F3EFEA
Active: background #E7E2DB
```

## Tertiary (Text)
```
Padding: 8px 0
Background: none
Text: #C8A46B (Antique Gold)
Font: Inter 14px / weight 600
Icon: right arrow (→), 8px gap
Hover: underline
```

---

# 7. BADGES / STATUS

```
Height: 32px
Radius: 999px (pill)
Padding: 0 16px
Font: Inter 12px / weight 500
Text: #FFFFFF (except Archived)
```

| Status    | Background           | Text    |
|-----------|----------------------|---------|
| Active    | #4B1E2A (Burgundy)   | #FFFFFF |
| Draft     | #C8A46B (Gold)       | #FFFFFF |
| Completed | #2E6B4E (Green)      | #FFFFFF |
| On Hold   | #5C5852 (Warm Gray)  | #FFFFFF |
| Archived  | #E7E2DB (Stone)      | #1B1A17 |

Position on project cards: top-right of hero image, 16px margin from edges.

---

# 8. INPUT FIELDS

## Default State
```
Height: 44px
Radius: 22px
Border: 1px solid #E0DAD0
Background: #F6F2EC
Padding: 0 16px
Text: #1B1A17
Placeholder: #8C857D
```

## Focused State
```
Border: 1px solid #C8A46B
Ring: 0 0 3px rgba(200, 164, 107, 0.15)
Background: #FFFFFF
```

## Search Bar (Top Nav)
```
Height: 44px
Radius: 999px (pill)
Border: 1px solid #E0DAD0
Background: #FFFFFF
Padding: 0 16px
Max-width: 420px (centered in top nav)
Leading icon: Search, #8C857D
Placeholder: "Search projects or clients..."
```

## Dropdown
```
Height: 44px
Radius: 12px
Border: 1px solid #E0DAD0
Background: #FFFFFF
Padding: 0 16px
Trailing icon: chevron or filter icon
```

---

# 9. CARDS

## Project Card
```
Width: flexible (grid column)
Min-height: 360px
Radius: 24px
Padding: 0 (hero image flush) + 24px (content area)
Background: #FFFFFF
Border: 1px solid #E9E3DB
Shadow: 0 2px 8px rgba(20, 20, 19, 0.06)
```

### Structure (top to bottom):
1. Hero Image — 170px height, 100% width, object-fit cover, radius 24px 24px 0 0
2. Status Badge — pill, positioned top-right of image (16px inset)
3. Category Eyebrow — 11px / 700 / uppercase / #C8A46B / 8% letter-spacing
4. Project Name — Playfair Display / 28px / 600 / #1B1A17
5. Description — Inter / 14px / 400 / #5C5852 / max 2 lines / ellipsis overflow
6. Footer Row — calendar icon + delivery date | people icon + member count / #8C857D / 12px

### Card Images by Project Type
- Wedding: `/public/hero-scissors-linen.jpg` (tuxedo/boutonniere also acceptable)
- Corporate: `/public/project-corporate-fabrics.jpg`
- Individual: `/public/project-individual-suit.jpg`

---

## Stat Card (Dashboard)
```
Height: auto (content-driven, ~140px)
Radius: 24px
Padding: 24px
Background: #FFFFFF
Border: 1px solid #E9E3DB
Shadow: 0 2px 8px rgba(20, 20, 19, 0.06)
```

### Structure:
1. Icon Container — 48px circle, Deep Burgundy background, white icon (20px)
2. Eyebrow Label — 11px / 700 / uppercase / #5C5852 / +8% letter-spacing
3. Metric — JetBrains Mono / 36px / 600 / #1B1A17 / tabular-nums
4. Supporting Text — Inter / 13px / 400 / #8C857D, includes leading icon (trend arrow, clock dot, etc.)

Always exactly 4 stat cards in one row on desktop. Never 3 or 5.

---

# 10. ICON STYLE

```
Library: Lucide (or Hugeicons outline)
Style: Outline
Stroke: 1.5px
Corner: Rounded
Size default: 20px
Size large: 24px
Size small: 16px
Color default: #5C5852
Color active: #4B1E2A
Color sidebar-default: #8E8072
Color sidebar-active: #C8A46B
```

No filled icons. Icons should never become decorative.

---

# 11. NAVIGATION

## Sidebar
```
Width: 260px (desktop)
Collapsed: 72px
Background: #4B1E2A (Deep Burgundy)
```

### Nav Item
```
Height: 44px
Padding: 0 16px 0 20px
Gap (icon to text): 12px
Icon: 20px
Text: Inter 15px / weight 450
Radius: 12px (active state only)
```

### States
| State    | Background                  | Text     | Icon     |
|----------|----------------------------|----------|----------|
| Default  | transparent                | #E8E1D6  | #8E8072  |
| Hover    | rgba(255,255,255,0.04)     | #FFFFFF  | #C8A46B  |
| Active   | rgba(255,255,255,0.08)     | #FFFFFF  | #C8A46B  |

### Section Labels (OPERATIONS, ACCOUNT)
```
Font: Inter 11px / weight 700
Color: #C8A46B (Antique Gold)
Letter-spacing: 8%
Text-transform: uppercase
Margin-top: 32px
Margin-bottom: 12px
Padding-left: 20px
```

### Atelier Switcher (bottom of sidebar)
```
Height: 56px
Padding: 0 16px
Radius: 12px
Background: transparent
Hover: rgba(255,255,255,0.04)
Avatar: 36px circle, gold background #C8A46B, burgundy text
Name: Inter 14px / 500 / white
Subtitle: Inter 12px / 400 / rgba(255,255,255,0.50)
Trailing: chevron-down icon, rgba(255,255,255,0.40)
```

---

## Top Navigation
```
Height: 72px
Background: #F6F2EC (Warm Ivory) — same as page canvas
Border-bottom: 1px solid #E7E2DB
Z-index: 200
Position: sticky top-0
```

### Left Zone
- Logo image: `/public/logo.png` or AR monogram mark
- Business name: Inter 16px / 500 / #1B1A17
- Commission count: dot separator + "3 commissions" / Inter 13px / 400 / #8C857D

### Centre Zone
- Search bar (see Input Fields §8)

### Right Zone
- Notification bell: 20px icon / #1B1A17 / badge circle (16px, #8C2F2F bg, white text 10px)
- Staff avatar: 32px circle / burgundy or initial
- Staff name + chevron: Inter 14px / 500 / #1B1A17
- Primary CTA: "New Project" burgundy pill button (see Buttons §6)

---

# 12. APPLICATION LAYOUT

```
Top bar height: 72px
Sidebar width: 260px (collapsed: 72px)
Content max width: 1440px
Section padding: 40px (desktop)
Card gap: 24px
Section gap: 48px
Page gap: 64px
Use 8px grid for all spacing
Maintain generous white space — whitespace is a feature
```

---

# 13. HERO SECTION (Dashboard)

The hero is the emotional anchor of the dashboard. It communicates craftsmanship immediately.

## Layout
```
Structure: Single full-width container with editorial photography as background
The photo bleeds behind the text content
Min-height: ~400px
Radius: 0 (bleeds to content edges) or 24px if contained within a card
Overflow: hidden
```

## Content (overlaid on photo)
```
Eyebrow: "WELCOME BACK" / Inter 11px / 700 / uppercase / #C8A46B / ls +8%
Headline: "Anio Regalia" / Playfair Display / 56px / 700 / #FFFFFF (on dark photo areas)
Subtitle: "Oversee your atelier. Elevate every detail." / Inter 16px / 450 / rgba(255,255,255,0.80)
```

## Hero Image
```
Source: /public/hero-scissors-linen.jpg
Object-fit: cover
Position: center
```

## Stat Cards within Hero
The four stat cards sit inside the hero area at the bottom, partially overlapping the photo edge. White cards on the dark photographic background create a layered depth.

---

# 14. FILTER PILLS

```
Height: 40px
Radius: 999px
Padding: 0 18px
Font: Inter 14px / 450
Border: 1px solid #E7E2DB
```

| State    | Background | Border   | Text     |
|----------|-----------|----------|----------|
| Default  | #FFFFFF   | #E7E2DB  | #5C5852  |
| Hover    | #F3EFEA   | #E7E2DB  | #1B1A17  |
| Active   | #4B1E2A   | #4B1E2A  | #FFFFFF  |

Never animate filter transitions.

---

# 15. PHOTOGRAPHY STYLE

Photography is part of the interface. Every image communicates craftsmanship, heritage, luxury.

## Camera
- 50mm or 85mm prime only
- Never wide angle, never fish-eye

## Lighting
- Natural light, golden hour warmth, soft window light
- No flash, no HDR, no artificial colored lighting

## Color Grading
- Warm, muted, soft contrast
- Cream whites, rich burgundy, warm browns
- No cool blue, no teal-orange, no oversaturation

## Available Images
| File                          | Use                          |
|-------------------------------|------------------------------|
| `/public/hero-scissors-linen.jpg`      | Dashboard hero background   |
| `/public/atelier-cutting-table.jpg`    | Empty states, alternative hero |
| `/public/project-individual-suit.jpg`  | Individual project cards     |
| `/public/project-corporate-fabrics.jpg`| Corporate project cards      |
| `/public/logo.png`                     | Logo mark (AR monogram)      |

## Project Card Image Assignments
- Wedding: `hero-scissors-linen.jpg` (brass scissors, ivory linen, burgundy fabric)
- Corporate: `project-corporate-fabrics.jpg` (tailor cutting navy fabric at table)
- Individual: `project-individual-suit.jpg` (same angle — tailor cutting)
- Empty States: `atelier-cutting-table.jpg` (full atelier interior, warm, inviting)

---

# 16. MOTION TOKENS

```
Fast: 150ms
Normal: 200ms
Slow: 300ms
Easing: ease-out
```

No bounce. No elastic. Motion explains changes — never entertains.

---

# 17. OPACITY TOKENS

```
Disabled: 40%
Muted text: 70%
Borders: 100%
Hover overlay: 4%
Pressed overlay: 8%
Focus ring: 15%
```

---

# 18. Z-INDEX SCALE

```
Base: 0
Dropdown: 100
Sticky header: 200
Sidebar: 300
Modal overlay: 900
Modal: 1000
Toast: 1100
Command palette: 1200
```

---

# 19. NON-NEGOTIABLE RULES

Never introduce new colors.
Never introduce new spacing values.
Never introduce new radii.
Never introduce new typography.
Never introduce new shadows.
Never use gradients.
Never use glassmorphism.
Never use neumorphism.
Never use bright saturated colors.
Never use stock SaaS illustrations.
Never use filled icons.
Never use emoji.
Never animate for entertainment.
Every new component must derive every visual decision from this document.
If a component requires a value that does not exist here, this document must be updated before implementation.

When in doubt, ask: "Would this feel at home inside a luxury tailoring atelier?"
If the answer is no, redesign it.
