---
name: Quiet Precision
colors:
  surface: '#f4fbf4'
  surface-dim: '#d4dcd5'
  surface-bright: '#f4fbf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5ef'
  surface-container: '#e8f0e9'
  surface-container-high: '#e3eae3'
  surface-container-highest: '#dde4de'
  on-surface: '#161d19'
  on-surface-variant: '#404945'
  inverse-surface: '#2b322e'
  inverse-on-surface: '#ebf3ec'
  outline: '#707975'
  outline-variant: '#c0c9c3'
  surface-tint: '#346858'
  primary: '#1d5344'
  on-primary: '#ffffff'
  primary-container: '#376b5b'
  on-primary-container: '#b2e9d5'
  inverse-primary: '#9bd2be'
  secondary: '#58605c'
  on-secondary: '#ffffff'
  secondary-container: '#d7dfda'
  on-secondary-container: '#5b635f'
  tertiary: '#6e3c35'
  on-tertiary: '#ffffff'
  tertiary-container: '#8a534b'
  on-tertiary-container: '#ffd4ce'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b7eeda'
  primary-fixed-dim: '#9bd2be'
  on-primary-fixed: '#002018'
  on-primary-fixed-variant: '#194f41'
  secondary-fixed: '#dce4df'
  secondary-fixed-dim: '#c0c8c4'
  on-secondary-fixed: '#161d1a'
  on-secondary-fixed-variant: '#414845'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#fcb5ab'
  on-tertiary-fixed: '#350f0a'
  on-tertiary-fixed-variant: '#6a3932'
  background: '#f4fbf4'
  on-background: '#161d19'
  surface-variant: '#dde4de'
typography:
  display:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-compact: 0.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xxs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system embodies a calm, structured, and profoundly disciplined approach tailored for high-volume customer support operations. Customer service agents and support leads operate in dense, high-stress environments where cognitive fatigue is an active risk. The interface intentionally suppresses visual excess: there are no decorative gradients, no neon AI badges, no glowing highlights, and no illustrative ornamentation.

The aesthetic draws on functional minimalism and modern utility. It prioritizes information density without visual crowding through rigorous typographic alignment, generous macro-whitespace, and hairline structural borders. AI assistance is treated as an embedded, quiet collaborator—integrated directly into line items, summaries, and reply drafts—rather than a heavily branded novelty. The emotional takeaway is one of dependable competence, quiet control, and seamless focus.

## Colors

The palette employs a restrained, nature-infused slate-and-forest spectrum that minimizes eye strain across extended shifts:

- **Base Canvas (`#F8F9F7`):** An organic, light tint establishing a calm, low-glare foundation.
- **Surface / Panels (`#FFFFFF`):** High-clarity white for active cards, drawers, modal layers, and table sheets.
- **Brand Primary (`#376B5B` & Hover `#2B5447`):** A grounded, deep forest green reserved strictly for primary calls-to-action, key state confirmations, and critical focal points.
- **Accent Soft (`#EAF2ED`):** A soft sage tint used for active navigation segments, hover states on subtle components, and quiet metric tags.
- **Text & Hierarchy:** Primary text sits at `#202723` (high contrast, deep evergreen charcoal), while secondary metadata, timestamps, and placeholder labels sit at `#5C6962`.
- **Structural Outlines (`#E5E9E5`):** A crisp, low-contrast boundary line used uniformly to separate modules, grid tracks, and table cells.
- **Status Indicators:** Semantic signals are purposeful and un-saturated: Warning (`#B7791F`), Error/Urgent SLA (`#B54747`), and Success/Resolved (`#34785D`).

## Typography

The dual typographic system pairs geometric clarity with functional density:

- **Manrope:** Drives primary views, top-level ticket counts, customer company titles, and dashboard KPI metrics. Its subtle geometric balance creates an authoritative, welcoming posture without feeling playful.
- **Inter:** The functional workhorse applied across high-density ticket streams, split-pane conversation feeds, sidebars, internal notes, forms, and table rows. Highly legible at compact sizing (`12px` - `13px`) with robust vertical tracking.
- **JetBrains Mono:** Reserved for inline ticket IDs, event tokens, error logs, and customer IP/environment tracking.

## Layout & Spacing

The layout is structured around an immutable 8px grid foundation (with occasional 4px half-steps for micro-alignments like badges and checkbox offsets). 

### Layout Model
Workspaces leverage an asymmetric three-pane fluid architecture:
1. **Utility Navigation Strip (Collapsed / Fixed):** 64px width for immediate workspace-switching.
2. **Master Ticket List / Filter Column:** 320px–380px fixed-width column with sticky filtering headers.
3. **Detail Work Area (Fluid):** Expands dynamically to fill remaining viewport, subdividing between conversation feed (60% width) and customer context / telemetry sidebar (40% width, min 320px).

### Breakpoints & Adaptability
- **Desktop (1280px+):** Full 3-column concurrent layout with inline context sidebar.
- **Tablet / Laptop (768px – 1279px):** Context sidebar collapses into a sliding sheet drawer; the conversation pane claims full workspace width.
- **Mobile (<768px):** Viewports shift into an explicit drill-down hierarchy: List View transitions to full-screen Ticket Thread, with navigation anchored to a 56px bottom bar.

## Elevation & Depth

This system intentionally departs from deep blurred dropshadows, relying instead on structural edges and surface separation:

- **Elevation 0 (Canvas):** Tone `#F8F9F7`. Default background for parent containers and layout shells.
- **Elevation 1 (Panels & Cards):** Tone `#FFFFFF` with a continuous `1px solid #E5E9E5` border. No drop shadow. Depth is communicated strictly via the surface transition from greyish canvas to pure white.
- **Elevation 2 (Floating Popovers, Dropdowns, Datepickers):** Tone `#FFFFFF`, `1px solid #E5E9E5`, accompanied by a minimal, crisp shadow: `0 4px 12px rgba(32, 39, 35, 0.05)`.
- **Elevation 3 (Modals & Command Palettes):** Layered above a backdrop overlay of `#202723` tinted to 20% opacity. The modal retains a clean `1px solid #E5E9E5` boundary with an ambient diffusion: `0 12px 32px rgba(32, 39, 35, 0.08)`.

## Shapes

The geometric framework balances crisp professionalism with subtle ergonomics:
- **Panels, Drawers, & Master Cards:** 10px to 12px (`rounded-lg`), producing neat, defined modules that stack cleanly side by side.
- **Buttons, Form Inputs, & Dropdown Triggers:** Strict 8px border radius (`rounded-md`), establishing an unambiguous interactive affordance.
- **Chips, SLA Tags, & Status Badges:** 4px radius (`rounded-sm`) to avoid a bubbly or playful consumer look.
- **Iconography:** Monoline, 1.5px stroke weight, sharp terminal caps with consistent 16px and 20px bounding boxes.

## Components

### Buttons
- **Primary:** Background `#376B5B`, text `#FFFFFF`, border `transparent`, 8px radius. Hover: `#2B5447`. Active: `#214137`.
- **Secondary / Default:** Background `#FFFFFF`, text `#202723`, border `1px solid #E5E9E5`, 8px radius. Hover: `#F8F9F7` with border `#D5DBD5`.
- **Subtle / Ghost:** Background `transparent`, text `#5C6962`, no border. Hover: `#EAF2ED`, text `#376B5B`.
- **Destructive:** Background `#FFFFFF`, text `#B54747`, border `1px solid #B54747`. Hover: `#B54747`, text `#FFFFFF`.

### Input Fields & Controls
- **Text Inputs & Selects:** Height 36px (compact) or 40px (standard). Background `#FFFFFF`, border `1px solid #E5E9E5`, text `#202723`. Focus: border `#376B5B`, outline `2px solid #EAF2ED`. Placeholder: `#5C6962`.
- **Checkboxes & Radios:** 16px dimensions, 4px corner radius for checkboxes, full circle for radios. Unchecked: `1px solid #E5E9E5`. Checked: `#376B5B` fill with `#FFFFFF` iconography.

### Status Chips & Badges
- Non-pill structure (4px border-radius), padding `2px 6px`, font size `11px`, font weight `500`.
- **Normal / Low:** Background `#EAF2ED`, text `#376B5B`.
- **Urgent / High:** Background `#FDF2F2`, text `#B54747`, border `1px solid rgba(181, 71, 71, 0.2)`.
- **Pending / Warning:** Background `#FEF9EE`, text `#B7791F`, border `1px solid rgba(183, 121, 31, 0.2)`.

### Ticket Lists & Data Rows
- Row height: 48px fixed. Hover state triggers a background shift to `#F8F9F7`. Selected row: background `#EAF2ED` with a left border accent of `3px solid #376B5B`. Bottom row border `1px solid #E5E9E5`.

### AI Assistance Units (Quiet Integration)
- Suggested replies and ticket summaries appear inside white surface cards bounded by `1px solid #E5E9E5`, tagged simply with a small 11px label "Generated Summary" in `#5C6962`. Action triggers ("Insert Draft", "Refine") are rendered as standard secondary buttons to maintain workflow discipline.