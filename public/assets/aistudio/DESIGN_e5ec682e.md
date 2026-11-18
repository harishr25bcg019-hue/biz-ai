---
name: Executive Precision
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464554'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#712ae2'
  on-tertiary: '#ffffff'
  tertiary-container: '#8a4cfc'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.025em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system targets enterprise operators, executive teams, and high-velocity business professionals who demand clarity, operational speed, and frictionless intelligence. The aesthetic embodies modern operational excellence: decisive, uncluttered, and meticulously engineered. 

It synthesizes modern enterprise minimalism with high-end SaaS tactility (evoking Linear, Stripe, and modern Zendesk). The atmosphere relies on expansive cool-white surfaces, architectural hierarchy, razor-sharp typography, and micro-delight delivered through luminous kinetic accents rather than decorative noise. The interface feels lightweight yet structurally authoritative.

## Colors
The color architecture prioritizes legibility, visual discipline, and purposeful focal points:

- **Canvas & Surfaces:** Primary application background sits on crisp `#FFFFFF`, transitioning to `#F8FAFC` for page shells, sidebars, and grouped canvas areas. Subtle separation is maintained using `#E2E8F0` structural line work.
- **Typography & Neutrals:** Deep slate tones anchor visual weight. `#0F172A` delivers high-contrast priority to primary headers and critical metrics; `#1E293B` serves secondary copy and standard UI controls; `#334155` guides body content; `#64748B` isolates metadata and placeholders.
- **Accents:** Electric Violet (`#6366F1`) drives primary interactive commitments and focal triggers. Trust Blue (`#2563EB`) governs operational indicators, transactional flows, and links. Vivid Deep Purple (`#7C3AED`) is reserved for highlights, intelligent assistant triggers, and elevated system states.

## Typography
Typographic hierarchy is achieved entirely through calibrated weights, strict optical scales, and subtle tracking adjustments within Inter. Large headings leverage negative tracking to retain density and commanding posture, while body text and data tables balance generous line heights for sustained analytical review. Numeric data and analytical metrics must always deploy tabular lining figures (`font-variant-numeric: tabular-nums`) to preserve vertical rhythm and baseline alignment across complex dashboards.

## Layout & Spacing
The layout model employs a fluid 12-column responsive grid bound to strict horizontal rhythm:
- **Desktop (1280px+):** 12 columns, 24px (`1.5rem`) gutters, and dynamic margins scaling to a maximum width of 1440px for contained analytical views. Generous canvas padding ensures high breathing room.
- **Tablet (768px - 1279px):** 8 columns, 16px (`1rem`) gutters, and 24px (`1.5rem`) outer canvas margins. Secondary sidebars collapse into overlay rails or sliding contextual sheets.
- **Mobile (<768px):** 4 columns, 16px (`1rem`) gutters, and 16px (`1rem`) outer margins. Multi-column data layouts reflow into vertically stacked cards.

Vertical spacing strictly abides by an 8px baseline matrix. Content sections utilize `space-xl` for macroscopic isolation, while internal card groupings maintain tight relations via `space-sm` and `space-md`.

## Elevation & Depth
Depth is produced through subtle multi-layered ambient shadows combined with crisp 1px hairpins, avoiding heavy dark drops:

- **Level 0 (Flat):** Used for base page canvas (`#F8FAFC`) and embedded panels. No shadow; separation achieved via `#E2E8F0` hairline borders.
- **Level 1 (Cards & Data Tiles):** `#FFFFFF` surfaces with a 1px border (`#E2E8F0`) and an ambient micro-shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Hover States & Segmented Controls):** Elevated interactive components with active focus: `0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03)`.
- **Level 3 (Flyouts, Popovers & Context Menus):** `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.
- **Level 4 (Modals & Command Palettes):** Deep atmospheric backdrop blur (`backdrop-filter: blur(8px)`) paired with `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes
The shape ecosystem blends precision engineering with tactile approachability:
- Standard control elements (buttons, inputs, dropdown triggers) leverage `rounded` geometry (8px).
- Structural containers, dashboard cards, and workflow nodes implement `rounded-lg` (16px) or `rounded-xl` (24px) for macroscopic frame distinction.
- Status badges, operational avatars, and filter pills utilize fully rounded cylindrical bounds to establish clear semiotic contrast against rectangular information architecture.

## Components

### Buttons
- **Primary:** `#6366F1` background, `#FFFFFF` text, subtle inset highlight `inset 0 1px 0 rgba(255, 255, 255, 0.2)`, `rounded` (8px). Hover triggers transition to `#4F46E5` with Level 2 elevation.
- **Secondary:** `#FFFFFF` background, `#1E293B` text, 1px `#E2E8F0` border. Hover introduces `#F8FAFC` background and `#CBD5E1` border.
- **Ghost/Tertiary:** Transparent background, `#334155` text, zero border. Hover introduces subtle `#F1F5F9` wash.

### Cards & Panels
- Constructed from `#FFFFFF` surfaces nested over `#F8FAFC` canvas. Bound by 1px `#E2E8F0` perimeter borders and `rounded-lg` (16px).
- Card headers utilize clean separation via an integrated divider line or distinct typographic baseline spacing without excessive line clutter.

### Inputs & Form Controls
- **Text Inputs:** Height 40px, `#FFFFFF` background, 1px `#E2E8F0` border, `rounded` (8px), `#0F172A` typography. Active focus yields a 1px `#6366F1` ring with a 3px soft indigo halo (`rgba(99, 102, 241, 0.15)`).
- **Checkboxes & Radios:** 16px square/circle with `#E2E8F0` boundary, filling with `#6366F1` and crisp white check icon when activated.

### Chips & Badges
- Compact heights (22px to 26px), fully pill-shaped.
- Contextual states feature tinted fills paired with high-contrast text:
  - **Info/Trust:** Tinted `#EFF6FF` with `#1D4ED8` text.
  - **AI / Smart Assistant:** Tinted `#F5F3FF` with `#6D28D9` text and `#DDD6FE` border.
  - **Neutral:** Tinted `#F1F5F9` with `#475569` text.

### Key Operational Components
- **Command Palette (KBar / Quick Action):** Centered floating overlay with Level 4 elevation, `rounded-xl` (24px), embedded search input, and segmented keyboard shortcuts.
- **Metric Tiles:** Minimalist KPIs featuring large `headline-lg` numeric values in `#0F172A`, small uppercase `label-md` titles in `#64748B`, and inline delta pill indicators.