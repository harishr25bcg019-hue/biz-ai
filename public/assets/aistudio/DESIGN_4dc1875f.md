---
name: Obsidian Kinetic
colors:
  surface: '#10131d'
  surface-dim: '#10131d'
  surface-bright: '#363944'
  surface-container-lowest: '#0b0e18'
  surface-container-low: '#181b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#272a35'
  surface-container-highest: '#323440'
  on-surface: '#e0e1f1'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e0e1f1'
  inverse-on-surface: '#2d303b'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb2b7'
  on-tertiary: '#67001b'
  tertiary-container: '#ff516a'
  on-tertiary-container: '#5b0017'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#10131d'
  on-background: '#e0e1f1'
  surface-variant: '#323440'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system delivers an authoritative, high-velocity enterprise interface engineered for intelligent automated operations and AI-augmented support workflows. It balances mission-critical clarity with high-fidelity executive refinement. The experience must feel instantaneous, deeply perceptive, highly structured, and effortlessly composed under heavy informational load.

The visual style blends **Dark Corporate Modern** with **Technical Glassmorphism** and targeted **Luminescent Accents**. It features deep abyssal backgrounds, razor-thin translucent borders, subtle violet-indigo ambient diffusions, and crystalline typography. The atmosphere avoids frivolous neon clutter in favor of intentional spectral signals that highlight predictive actions, anomalous queue alerts, and live agent telemetry.

## Colors

The palette relies on a deep spectral hierarchy tuned specifically for dark environments, ensuring legibility and minimal eye strain during extended operational shifts.

- **Background Canvas & Base**: `#0A0D17` (Deep Obsidian Void).
- **Surface Elevation 1 (Card & Module Base)**: `#11162B` (Sub-Navy).
- **Surface Elevation 2 (Active/Hover/Elevated Rows)**: `#182042` (Deep Slate Indigo).
- **Primary Kinetic Accent (AI Core, Primary Commands)**: `#8B5CF6` (Vivid Violet) and `#7C3AED` (Deep Violet) for focused interactions and progressive computation indicators.
- **Secondary Atmospheric Accent (System Telemetry, Live Streams)**: `#06B6D4` (Electric Cyan) paired with `#3B82F6` (Cobalt) for live connections, verified customer metrics, and real-time state flags.
- **Tertiary Accent (Urgency, Sentiment Alerting, Critical SLA)**: `#F43F5E` (Vivid Crimson/Rose) and `#EC4899` (Magenta) for automated sentiment drop warnings, critical tier escalations, and hard SLA thresholds.
- **Structural Outlines**: `rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.12)` for crisp architectural framing.

## Typography

Typography prioritizes high information density, structural hierarchy, and instant scannability. Inter serves as the foundation across all visual touchpoints, backed by numeric tabular lining (`font-variant-numeric: tabular-nums`) across metrics, counters, and SLA clocks.

For raw agent prompts, regex logic, and JSON payload logs, JetBrains Mono is assigned strictly within contextual inspector panels. Headlines apply tighter tracking to preserve horizontal space in dense dashboards, while labels apply deliberate positive letter spacing to maintain legibility at 11px and 12px sizes against luminous dark backdrops.

## Layout & Spacing

The layout is built upon an adaptive 12-column fluid grid system geared for asynchronous data views, multi-pane ticket triaging, and dynamic live inspector sheets.

- **Desktop (>= 1280px)**: 12-column layout with 24px gutters and 32px canvas margins. Supports persistent collapsible command navigation (64px collapsed, 260px expanded), central analytical/queue stage, and a contextual 380px AI Copilot right rail.
- **Tablet (768px - 1279px)**: 8-column layout with 20px gutters and 24px margins. The AI Copilot shifts to an overlay drawer; data tables switch secondary columns to nested contextual accordions.
- **Mobile (< 768px)**: 4-column layout with 16px gutters and 16px margins. Nav transforms into an app bar with a bottom sheet action deck. High-priority conversation feeds expand to 100% viewport width.

## Elevation & Depth

Visual hierarchy uses tonal surface step-ups coupled with glassmorphism and soft chromatic luminosity, avoiding heavy, muddy dropshadows:

1. **Layer 0 (Canvas Base)**: `#0A0D17`, non-reflective, pure immersion.
2. **Layer 1 (Card & Module Tiers)**: `#11162B` backed by a 1px border of `rgba(255, 255, 255, 0.08)`.
3. **Layer 2 (Floating Popovers, Dropdowns, Hover States)**: `rgba(24, 32, 66, 0.85)` with `backdrop-filter: blur(16px)` and an internal top highlight border of `rgba(255, 255, 255, 0.15)`.
4. **Layer 3 (Modals, High-Priority Flyouts)**: `#182042` with `box-shadow: 0 20px 48px -10px rgba(0, 0, 0, 0.7), 0 0 32px -4px rgba(124, 58, 237, 0.12)`.
5. **Atmospheric Luminescence**: AI-driven components utilize an under-glow gradient: `radial-gradient(circle at top, rgba(139, 92, 246, 0.15) 0%, transparent 70%)`.

## Shapes

The interface balances sleek architecture with welcoming ergonomics. Primary cards, data frames, and modal structures implement standard `1rem` (`rounded-2xl`) corners to anchor the modern SaaS appearance. 

Interactive controls, inner inputs, data table row clusters, and popovers utilize `0.5rem` (`rounded-lg`). Micro-indicators, status badges, and intelligent agent filter triggers adopt full pill shapes (`9999px`) to immediately convey clickability and state differentiation.

## Components

### Buttons
- **Primary (AI / Action)**: Solid gradient from `#7C3AED` to `#8B5CF6`, text `#FFFFFF`, subtle inner bevel highlight `inset 0 1px 0 rgba(255, 255, 255, 0.25)`, hover glow `0 0 20px rgba(139, 92, 246, 0.4)`.
- **Secondary (Neutral Surface)**: Background `rgba(255, 255, 255, 0.05)`, border `1px solid rgba(255, 255, 255, 0.1)`, text `#F1F5F9`, hover background `rgba(255, 255, 255, 0.1)`.
- **Destructive**: Background `rgba(244, 63, 94, 0.12)`, border `1px solid rgba(244, 63, 94, 0.3)`, text `#F43F5E`, hover background `rgba(244, 63, 94, 0.2)`.

### AI Pill Chips & Badges
- **Autonomous Resolution Pill**: Full pill radius (`9999px`), background `rgba(139, 92, 246, 0.12)`, border `1px solid rgba(139, 92, 246, 0.35)`, text `#C4B5FD`, leading sparkling dot with an active animated pulse.
- **SLA Warning Badge**: Background `rgba(244, 63, 94, 0.12)`, border `1px solid rgba(244, 63, 94, 0.35)`, text `#FDA4AF`.
- **Telemetry Active Pill**: Background `rgba(6, 182, 212, 0.12)`, border `1px solid rgba(6, 182, 212, 0.35)`, text `#67E8F9`.

### Data Tables
- Header row fixed with backdrop blur `rgba(10, 13, 23, 0.85)`, borders strictly horizontal via `1px solid rgba(255, 255, 255, 0.06)`.
- Row styling: Zero horizontal lines between elements inside the same group; on hover, entire row illuminates with `background: rgba(24, 32, 66, 0.45)` and reveals quick triage shortcut triggers.
- Cells support inline tabular metric figures, dynamic mini sparks, and assigned-agent avatar rings.

### Input Fields & Search Bars
- Background `rgba(17, 22, 43, 0.75)`, border `1px solid rgba(255, 255, 255, 0.1)`, placeholder text `#64748B`, active text `#F8FAFC`.
- Focus state: Border turns `#8B5CF6` with a ring shadow `0 0 0 3px rgba(139, 92, 246, 0.25)`.
- Global AI Prompt Input: Features a gradient dynamic border, leading model-selector chip, and keyboard shortcut badge (`⌘K`).

### Selection Controls (Checkboxes & Radios)
- Unchecked: `18px` container, background `rgba(255, 255, 255, 0.04)`, border `1px solid rgba(255, 255, 255, 0.2)`.
- Checked: Background `#8B5CF6`, border-color `#8B5CF6`, check icon rendered crisp white with a subtle drop shadow.

### Cards & Modules
- Outer container: `16px` border-radius (`rounded-2xl`), background `#11162B`, border `1px solid rgba(255, 255, 255, 0.08)`.
- Header separator: Optional low-contrast `1px solid rgba(255, 255, 255, 0.05)`.
- Live ticket cards feature a left vertical accent bar (`3px`) keyed to the priority level: Cyan (Normal), Purple (AI Generating), Crimson (SLA Breached).