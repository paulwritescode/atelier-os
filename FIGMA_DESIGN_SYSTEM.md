# Figma Design System Implementation

This project implements the complete Figma marketing design system with color block sections, pill buttons, proper typography hierarchy, spacing, and responsive behavior.

## Design Tokens

### Colors

All colors are defined as CSS custom properties in `globals.css` and support both light and dark modes.

#### Brand Colors
- `--brand-burgundy`: Primary theme color (burgundy)
- `--brand-gold`: Accent gold color

#### Surface Colors
- `--canvas`: Main background (white in light mode, dark in dark mode)
- `--surface-soft`: Soft background for secondary elements
- `--inverse-canvas`: Dark background for footer/inverse sections

#### Color Blocks (Signature Figma Design)
- `--block-lime`: Lime green for systems/FAQ sections
- `--block-lilac`: Lavender for hero sections
- `--block-cream`: Cream for warm sections
- `--block-mint`: Mint for pastel sections
- `--block-pink`: Pink for pastel sections
- `--block-coral`: Coral for product sections
- `--block-navy`: Deep navy for inverse sections

#### Borders & Dividers
- `--hairline`: Main border color (1px)
- `--hairline-soft`: Subtle divider color

#### Text Colors
- `--ink`: Primary text on light surfaces
- `--inverse-ink`: Text on dark surfaces

### Typography

The system uses fine-grained font weights for hierarchy:

```
.display-xl    → 86px, weight 340, -1.72px tracking
.display-lg    → 64px, weight 340, -0.96px tracking
.headline      → 26px, weight 540, -0.26px tracking
.subhead       → 26px, weight 340, -0.26px tracking
.card-title    → 24px, weight 700
.body-lg       → 20px, weight 330, -0.14px tracking
.body          → 18px, weight 320, -0.26px tracking
.body-sm       → 16px, weight 330, -0.14px tracking
.link          → 20px, weight 480, -0.10px tracking
.button-text   → 20px, weight 480, -0.10px tracking
.eyebrow       → 18px, weight 400, 0.54px tracking (uppercase)
.caption       → 12px, weight 400, 0.60px tracking (uppercase)
```

### Spacing

Base unit: 8px

```
--spacing-hair:    1px
--spacing-xxs:     4px
--spacing-xs:      8px
--spacing-sm:      12px
--spacing-md:      16px
--spacing-lg:      24px
--spacing-xl:      32px
--spacing-xxl:     48px
--spacing-section: 96px
```

### Border Radius

```
--radius-xs:   2px
--radius-sm:   6px
--radius-md:   8px
--radius-lg:   24px (color blocks, large cards)
--radius-xl:   32px
--radius-pill: 50px (buttons)
--radius-full: 9999px (circular icons)
```

## Components

### Buttons

All buttons are pill-shaped (`rounded-pill`). Use the `Button` component:

```tsx
import { Button } from "@/components/Button"

// Primary (burgundy background)
<Button variant="primary">Get Started</Button>

// Secondary (white background, border)
<Button variant="secondary">Learn More</Button>

// Tertiary (text only)
<Button variant="tertiary">Contact Sales</Button>

// Magenta Promo (promotional)
<Button variant="magenta-promo">Save Your Spot</Button>

// Icon Button (circular)
<IconButton icon={SomeIcon} ariaLabel="Close" />
```

### Color Block Sections

Use `ColorBlockSection` for full-width colored panels:

```tsx
import { ColorBlockSection } from "@/components/ColorBlockSection"

<ColorBlockSection variant="lime">
  <h2 className="display-lg mb-4">Systems & FAQ</h2>
  <p className="body">Content goes here...</p>
</ColorBlockSection>
```

Variants: `lime`, `lilac`, `cream`, `mint`, `pink`, `coral`, `navy`

**Key Rules:**
- Navy variant uses `text-inverse-ink` for white text
- Only one color block visible per viewport
- Let white canvas breathe between blocks (96px spacing)
- Color blocks span full content width with `rounded-lg` corners and `p-12` (48px) interior padding

### Forms

Use the `Input` component for form fields:

```tsx
import { Input } from "@/components/Input"

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  helperText="We'll never share your email"
/>
```

Features:
- Hairline border with 1px `--hairline` color
- Soft shadow on focus
- 48px minimum tap target on touch devices
- Consistent padding: 12px vertical, 14px horizontal

### Cards

Use the `Card` components for containers:

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Card"

<Card className="pricing-card">
  <CardHeader>
    <CardTitle>Professional</CardTitle>
  </CardHeader>
  <CardContent>
    <p>$29/month</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Choose Plan</Button>
  </CardFooter>
</Card>
```

Card types:
- `.card-base`: Basic rounded card with hairline border
- `.card-lg`: Large card with 24px padding
- `.card-md`: Medium card with 16px padding
- `.pricing-card`: Full-height card for pricing tiers
- `.template-card`: Thumbnail with soft background
- `.feature-tile`: Large composition tile

### Project Cards

The `ProjectCard` component demonstrates the full design system:

```tsx
import { ProjectCard } from "@/components/ProjectCard"

<ProjectCard
  project={projectData}
  primaryClientName="Client Name"
  viewMode="grid"
  onClick={handleSelect}
/>
```

Features:
- 170px hero image with hover scale effect
- Eyebrow label with burgundy color
- Headline typography for project title
- Body text with proper line clamping
- Hairline dividers
- Responsive image sizing
- 360px minimum height on grid view

## Responsive Behavior

The system includes breakpoint-specific utilities:

```
4k:         1920px
Desktop XL: 1440px
Desktop:    1280px
Tablet:     960px
Mobile L:   768px
Mobile:     560px
Mobile XS:  559px
```

### Key Responsive Changes

| Breakpoint | Changes |
|---|---|
| Below 1280px | Reduce section padding |
| Below 960px | Hamburger nav, pricing grid collapses 4-up → 2-up |
| Below 768px | Color blocks remove rounded corners (full bleed), display-lg shrinks |
| Below 560px | Buttons go full-width, display-xl shrinks to 36px |

### Color Block Responsiveness

Above 768px: Keep 48px padding around blocks so rounded corners read  
Below 768px: Remove rounded corners, let blocks bleed to viewport edges for poster effect

## Elevation & Depth

Figma's system is shadow-light by design. Color blocks are the primary depth device:

- **Level 0 (flat)**: No shadow, no border — default for color blocks
- **Level 1 (hairline)**: 1px hairline border on white canvas — pricing cards, form inputs
- **Level 2 (soft)**: Subtle shadow `0 4px 16px rgba(0,0,0,0.06)` — floating tiles, hover states
- **Level 3 (modal)**: Stronger shadow with overlay scrim — lightbox overlays

## Utility Classes

All utilities are available as Tailwind classes:

```tsx
{/* Color utilities */}
<div className="bg-block-lime text-ink">...</div>

{/* Button classes */}
<button className="btn-primary">...</button>
<button className="btn-secondary">...</button>
<button className="btn-icon-circular">...</button>

{/* Typography classes */}
<h1 className="display-xl">...</h1>
<p className="body-sm">...</p>

{/* Spacing utilities */}
<section className="px-section py-section gap-section">...</section>

{/* Border radius */}
<div className="rounded-pill">...</div>
<div className="rounded-lg">...</div>

{/* Form input */}
<input className="input-text" />

{/* Card utilities */}
<div className="card-base">...</div>
<div className="pricing-card">...</div>
```

## Design Principles

1. **Monochrome Core**: Burgundy/black primary, white secondary — every CTA uses pills
2. **Color Blocks Drive Narrative**: Let colored sections own a full viewport
3. **Weight ≠ Size**: Typography hierarchy comes from variable weights, not size alone
4. **Hairlines, Not Shadows**: Elevation comes from color and borders, shadows are rare
5. **Generous Spacing**: Interior padding on blocks is 48px; rhythm between sections is 96px
6. **Responsive First**: Full bleed color blocks on mobile, rounded corners on desktop

## Implementation Examples

### Hero Section with Color Block

```tsx
<ColorBlockSection variant="lime">
  <div className="max-w-xl mx-auto px-8 py-16">
    <h2 className="display-lg mb-6">Our Systems</h2>
    <p className="body-lg mb-8">
      Discover how we organize every detail of your commission.
    </p>
    <Button variant="primary">Explore</Button>
  </div>
</ColorBlockSection>
```

### Form Section

```tsx
<div className="mx-auto max-w-md px-8 py-16">
  <h2 className="display-lg mb-8">Get in Touch</h2>
  
  <form className="space-y-6">
    <Input label="Name" placeholder="Your name" />
    <Input label="Email" type="email" placeholder="you@example.com" />
    <textarea className="input-text" rows={5} placeholder="Message..." />
    <Button variant="primary" className="w-full">
      Send Message
    </Button>
  </form>
</div>
```

### Pricing Grid

```tsx
<div className="grid md:grid-cols-3 gap-6">
  <Card className="pricing-card">
    <CardHeader>
      <CardTitle>Starter</CardTitle>
      <CardDescription>For individuals</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="display-lg mb-2">$29</p>
      <p className="body-sm text-muted-foreground">/month</p>
    </CardContent>
    <CardFooter>
      <Button variant="primary" className="w-full">Choose</Button>
    </CardFooter>
  </Card>
</div>
```

## Dark Mode

All components respect dark mode automatically via CSS custom properties. The system includes:

- Adjusted color block saturation for dark backgrounds
- Proper contrast ratios for text
- Navy color block as the primary dark section (only dark block above footer)
- All utilities work identically in light/dark modes

## Migration Notes

When updating existing components:

1. Replace `.rounded-xs` with `.rounded-md` or `.rounded-lg`
2. Replace `.bg-card` with `.bg-canvas`
3. Replace `.border-border` with `.border-hairline`
4. Use `.btn-primary` / `.btn-secondary` for all buttons
5. Use typography classes (`.headline`, `.body-sm`, etc.) instead of inline sizes
6. Add `.shadow-soft` for elevation instead of larger shadows
7. Use `ColorBlockSection` for full-width colored panels

## Testing Checklist

- [ ] All buttons render as pills (50px radius)
- [ ] Color blocks have 48px interior padding
- [ ] 96px spacing between major sections
- [ ] Hairline borders on cards/inputs
- [ ] Typography uses correct weights (320, 330, 340, 480, 540, 700)
- [ ] Responsive breakpoints collapse correctly below 960px
- [ ] Mobile: color blocks bleed edges, no border radius
- [ ] Form inputs have 48px min tap height
- [ ] Dark mode colors render correctly
- [ ] No mid-gray text (use weight variation instead)
- [ ] Navy block uses inverse text colors
- [ ] Only one color block visible per viewport
