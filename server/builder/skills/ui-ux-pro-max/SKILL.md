---
name: ui-ux-pro-max
description: UI/UX design intelligence: ten priority categories of rules, style and palette choice, the design dials, and 119 UX guidelines on demand (UI UX Pro Max)
---
> Forja note: this text comes from UI UX Pro Max by Next Level Builder (MIT; see NOTICE.md and the LICENSE next to it). Forja has no search.py database: use the tables and the quick reference here. The stack is fixed (React 19, CSS Modules with tokens, @forja/ui, lucide-react, motion). The Forja manual's rules win over anything here: tokens in base.css, screens built from @forja/ui, CSS Modules for layout, no inline visual styles, no new npm packages outside the catalog.

# UI/UX Pro Max - Design Intelligence

## When to Apply

Use this Skill when the task involves **UI structure, visual design decisions, interaction patterns, or user experience quality control**: designing new pages, creating/refactoring UI components, choosing color/typography/spacing/layout systems, reviewing UI for UX/accessibility/consistency, implementing navigation/animation/responsive behavior, or improving perceived quality and usability.

Skip it for pure backend logic, API/database design, non-visual performance work, infrastructure/DevOps, or non-visual scripts — unless the task changes how something **looks, feels, moves, or is interacted with**.

## Rule Categories by Priority

*Follow priority 1 to 10 to decide which category to focus on first. The full rule text for every category is in part `quick-reference`; load it on demand.*

| Priority | Category | Impact | Domain | Key Checks (Must Have) | Anti-Patterns (Avoid) |
|----------|----------|--------|--------|------------------------|------------------------|
| 1 | Accessibility | CRITICAL | `ux` | Contrast 4.5:1, Alt text, Keyboard nav, Aria-labels | Removing focus rings, Icon-only buttons without labels |
| 2 | Touch & Interaction | CRITICAL | `ux` | Min size 44×44px, 8px+ spacing, Loading feedback | Reliance on hover only, Instant state changes (0ms) |
| 3 | Performance | HIGH | `ux` | WebP/AVIF, Lazy loading, Reserve space (CLS &lt; 0.1) | Layout thrashing, Cumulative Layout Shift |
| 4 | Style Selection | HIGH | `style`, `product` | Match product type, Consistency, SVG icons (no emoji) | Mixing flat & skeuomorphic randomly, Emoji as icons |
| 5 | Layout & Responsive | HIGH | `ux` | Mobile-first breakpoints, Viewport meta, No horizontal scroll | Horizontal scroll, Fixed px container widths, Disable zoom |
| 6 | Typography & Color | MEDIUM | `typography`, `color` | Base 16px, Line-height 1.5, Semantic color tokens | Text &lt; 12px body, Gray-on-gray, Raw hex in components |
| 7 | Animation | MEDIUM | `ux`, `gsap` | Context-aware timing, Motion conveys meaning, Spatial continuity | One duration for every transition, Animating width/height, No reduced-motion |
| 8 | Forms & Feedback | MEDIUM | `ux` | Visible labels, Error near field, Helper text, Progressive disclosure | Placeholder-only label, Errors only at top, Overwhelm upfront |
| 9 | Navigation Patterns | HIGH | `ux` | Predictable back, Bottom nav ≤5, Deep linking | Overloaded nav, Broken back behavior, No deep links |
| 10 | Charts & Data | LOW | `chart` | Legends, Tooltips, Accessible colors | Relying on color alone to convey meaning |

## Workflow in Forja

1. Analyze: product type (SaaS, e-commerce, portfolio, dashboard, tool, productivity), audience and context of use, style keywords (playful, vibrant, minimal, dark, content-first).
2. Choose the visual direction for the whole product: a style that matches the product type, one palette and one type pairing (the skill `design-system` has tested palettes and the token recipe), applied consistently.
3. Go through the priority table from 1 to 10 while building; accessibility and touch come first, charts last.
4. For one concern (forms, navigation, animation, dark mode, performance) load part `quick-reference` and read only that section.
5. Verify with browser_test screenshots at desktop and mobile in light and dark.

## Design dials

Three optional 1-10 sliders to decide before you build (there is no command here: apply them yourself):

| Dial | Low (1-3) | Mid (4-7) | High (8-10) |
|------|-----------|-----------|-------------|
| `--variance` | Centered / minimal (biases toward Minimalism-style categories) | Balanced / modern | Bold / asymmetric (biases toward Brutalism, Bento Grids) |
| `--motion` | Subtle micro-interactions | Standard scroll/stagger motion | Complex choreography (pin, Flip, SplitText) |
| `--density` | Spacious (24-96px spacing scale) | Standard (16-64px, current default) | Dense/dashboard (8-32px spacing scale) |

- Motion: at the high tier use the `animations` skill; at the low tier, hover, focus and press feedback only.
- Density: it sets the spacing scale in base.css (the `--space-*` tokens): dense for dashboards, spacious for marketing pages.

## Parts

Load one with `load_skill` using `name: "ui-ux-pro-max"` and `part: "<name>"`.

| Part | Use it to |
|---|---|
| `quick-reference` | The full rule text of the ten categories (119 UX guidelines with rationale) |
