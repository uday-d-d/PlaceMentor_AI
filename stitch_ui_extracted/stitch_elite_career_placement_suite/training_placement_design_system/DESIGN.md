---
name: Training & Placement Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  h1:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  button:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The brand personality is authoritative yet encouraging, designed to bridge the gap between academic learning and professional employment. It evokes a sense of structured growth, reliability, and career-ready sophistication. 

The visual style follows a **Corporate / Modern** aesthetic. It prioritizes clarity and functional elegance through high-contrast information hierarchies and a focus on "Data-Density without Clutter." The interface utilizes ample whitespace to reduce cognitive load during complex tasks like skill assessment or job matching, while maintaining a premium feel through high-quality component construction.

## Colors

The palette is anchored by a deep Navy Blue (Primary), conveying stability and professional depth. This is paired with a crisp White and Cool Gray foundation to maintain a clean SaaS environment.

*   **Primary (Deep Blue):** Used for navigation, primary buttons, and headers to establish authority.
*   **Secondary (Energetic Orange):** Reserved for high-priority Call-to-Actions (CTAs) and "Apply" buttons to drive conversion.
*   **Tertiary (Success Green):** Utilized for progress indicators, "Passed" statuses, and career-ready milestones.
*   **Neutral & Background:** A range of slate grays provides soft contrast for borders and secondary text, while the background remains off-white to reduce eye strain.

## Typography

This design system utilizes **Inter** for its systematic and utilitarian qualities. As a highly legible sans-serif, it ensures that educational content and data-heavy tables remain accessible. 

Headlines use a slightly tighter letter spacing and heavier weights to provide a strong visual anchor. Body text utilizes a generous line height (1.6) to facilitate long-form reading in training modules. Labels and button text are slightly weighted to distinguish interactive elements from static content.

## Layout & Spacing

The design system employs a **Fixed Grid** model for desktop dashboards (1280px max-width) and a fluid model for the student learning interface. A 12-column grid with 24px gutters ensures consistent alignment across complex layouts.

Spacing follows a strict 4px/8px baseline rhythm. Generous padding (24px - 32px) is applied within card components and between sections to prevent the UI from feeling cramped, which is essential for a platform containing data tables and charts.

## Elevation & Depth

Visual hierarchy is established through **Ambient Shadows** and tonal layering. Surfaces are elevated using soft, multi-layered shadows with low-opacity blue-tinted hex codes (e.g., `#0F172A` at 4-8% opacity) to maintain a modern, "floating" feel without looking dated.

*   **Level 0 (Surface):** Default background (`#F8FAFC`).
*   **Level 1 (Cards/Tables):** White background with a subtle 1px border (`#E2E8F0`) and a soft shadow (0px 4px 6px).
*   **Level 2 (Popovers/Modals):** Higher elevation shadow (0px 10px 15px) to draw immediate focus over the interface.

## Shapes

The design system utilizes a **Rounded** shape language to soften the professional tone, making the platform feel approachable and modern. 

Base components like input fields and buttons use a 0.5rem (8px) radius. Larger containers, such as dashboard cards and progress widgets, use 1rem (16px) to emphasize their containerized nature. Circular indicators are reserved exclusively for status badges and user avatars.

## Components

### Buttons
Primary buttons are solid Deep Blue. Secondary "CTA" buttons for placement applications use Energetic Orange. All buttons feature a subtle hover state transition that deepens the color and increases the shadow slightly.

### Cards
Cards are the primary container for the "Training and Placement" experience. They feature a white background, 16px corner radius, and 24px internal padding. Cards used for "Job Postings" include a hover-lift effect (moving -4px on the Y-axis) to indicate interactivity.

### Data Tables
Tables are designed for high readability with zero vertical borders. Only horizontal dividers in light gray (`#F1F5F9`) are used. Header rows have a subtle gray background to anchor the column titles.

### Progress Widgets
Interactive charts and progress bars use a rounded cap design. Success metrics utilize Tertiary Green, while "In Progress" states use a medium blue. These widgets should be housed within high-quality cards with clear, bold percentage labels.

### Form Fields
Inputs use a white background with a 1px border. When focused, the border transitions to Primary Blue with a soft 3px "glow" shadow to guide user attention during profile building or assessment tests.

### Navigation
The sidebar navigation uses a dark-mode theme (Deep Blue background) to contrast against the light content area, clearly separating the platform's structure from the user's workspace.