---
name: Predictive Analytics Design System
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e0'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2fa'
  surface-container: '#f2ecf4'
  surface-container-high: '#ece6ee'
  surface-container-highest: '#e6e0e9'
  on-surface: '#1d1b20'
  on-surface-variant: '#494551'
  inverse-surface: '#322f35'
  inverse-on-surface: '#f5eff7'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#63597c'
  on-secondary: '#ffffff'
  secondary-container: '#e1d4fd'
  on-secondary-container: '#645a7d'
  tertiary: '#765b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fdf7ff'
  on-background: '#1d1b20'
  surface-variant: '#e6e0e9'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  bento-gap: 20px
---

## Brand & Style

The design system is engineered for high-stakes decision-making in the retail sector. It prioritizes clarity and predictive intelligence, evoking a sense of calm authority. By fusing the systematic cleanliness of Stripe, the functional density of Linear, and the atmospheric breathing room characteristic of Apple, the system transforms complex datasets into actionable insights.

The aesthetic is **Minimalist-Glassmorphic**. It utilizes a "light-first" approach where white space is not merely empty, but a structural tool to reduce cognitive load. The UI feels like a precision instrument: sharp, responsive, and sophisticated.

## Colors

The palette is anchored by a pristine white foundation to maximize contrast and legibility. 
- **Emerald AI (#10B981):** Used exclusively for growth metrics, success states, and primary CTA actions related to profitability.
- **Electric Indigo (#6366F1):** Signals machine learning layers, predictive trajectories, and automated insights.
- **Slate 900 (#0F172A):** Provides a heavy, authoritative weight for primary typography.
- **Surface Neutrals:** Low-opacity slates are used for borders and subtle backgrounds to maintain a high-end, soft-touch feel without introducing muddy greys.

## Typography

This design system utilizes **Inter** for all interface elements to ensure maximum legibility across dense data views. The typographic hierarchy is tight, with reduced letter-spacing on larger headings to mimic the "Display" variants of SF Pro. 

For raw data points, tabular numbers, and code-based predictive logic, a secondary monospaced font (JetBrains Mono) is used at small scales to provide a technical, high-precision edge.

## Layout & Spacing

The layout utilizes a **Bento Grid** philosophy, organizing content into modular, rectangular units that stack and scale with mathematical precision. 

- **The Grid:** A 12-column system with a 20px gap. Content is grouped into logical "pods" that span varying column counts (typically 3, 4, 6, or 12).
- **Rhythm:** An 8pt linear scale is used for internal component padding, while a 20px/40px scale is used for macro-layout margins to create the "Apple-esque" breathability.
- **Negative Space:** Generous margins surround the primary grid to focus the user's eye on the center of the dashboard.

## Elevation & Depth

Depth is achieved through **Glassmorphism and Layered Tones** rather than traditional heavy shadows.

- **The Glass Effect:** Cards feature a `blur(12px)` backdrop with a `rgba(255, 255, 255, 0.7)` fill.
- **Borders:** A crisp, 1px border (`Slate 900` at 8% opacity) defines the edges, mimicking the look of physical glass panels.
- **Shadows:** Use a single "Ambient" shadow for floating elements (modals/popovers): `0 10px 40px -10px rgba(0,0,0,0.05)`. Avoid shadows on standard grid cards to maintain a flat, structured aesthetic.

## Shapes

The shape language is sophisticated and modern. Standard cards and bento units use a **16px (rounded-lg)** radius to create a soft, approachable frame for complex data. Smaller interactive elements like buttons and input fields use an **8px (rounded-md)** radius to maintain a sense of precision and "tool-like" utility.

## Components

### Buttons & Interactors
- **Primary:** Emerald AI fill with white text. No gradient; high-contrast flat color.
- **Predictive CTA:** Electric Indigo fill, used only for AI actions (e.g., "Generate Forecast").
- **Ghost:** Transparent background with the 1px Slate border.

### Data Visualization
- **Area Charts:** High-stroke weight (2px) for the trend line, with a very subtle, low-opacity gradient fill below.
- **Sparklines:** Compact, monochromatic (Emerald or Indigo) lines without axes, embedded directly within bento cards.
- **Gauges:** Minimalist semi-circles with a "needleless" design, using color fills to indicate progress against quarterly targets.

### Cards & Bento Units
Each card is a glassmorphic container. Header text within cards should use the `label-caps` style for category identification, followed by `h2` for the primary metric.

### Inputs
Search bars and filter selects should have a subtle off-white background (`#F8FAFC`) to distinguish them from the pure white page background, appearing "recessed" into the surface.