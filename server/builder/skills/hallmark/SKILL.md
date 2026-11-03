---
name: hallmark
description: Make new UI look designed, not generated: a hard floor against model defaults, one idea per screen, a sweep before handing back (Hallmark)
---
> Forja note: this text comes from Hallmark (github.com/Nutlope/hallmark) (MIT; see NOTICE.md and the LICENSE next to it). Forja has no node scripts (sloplint, theme.mjs, capture.mjs), no .hallmark folder and no Together API: skip every step that runs one, and the Hallmark stamp. Use check_standards and browser_test instead. The Forja manual's rules win over anything here: tokens in base.css, screens built from @forja/ui, CSS Modules for layout, no inline visual styles, no new npm packages outside the catalog.

# Hallmark

Makes the UIs a coding assistant generates look made, not generated: a hard floor against the defaults every model was trained into, a dealt direction so consecutive builds do not converge, one idea per screen. Above the floor the page is yours: you are a capable designer.

## The Floor

Binds every output in every harness, none of it waivable, even when nothing else is read.

1. Every colour and every font goes through a token declared at `:root` (or a declared theme block). No literal colour or `font-family` past the token block. (48)
2. Never `transition: all`. Never animate `width`, `height`, `top` or `left`. (10a)
3. Never one italic word inside a roman heading. (38i)
4. `overflow-x: clip` on both `html` and `body`. Never `hidden`, never `100vw`. (34)
5. Image-bearing grid tracks use `minmax(0, 1fr)`; display heads carry `overflow-wrap: break-word; min-width: 0`. (50)
6. Every interactive element has `:focus-visible`, appearing instantly. (26a, 15)
7. Every animation has a `prefers-reduced-motion: reduce` fallback, and content is visible with scripting off. (27, 62)
8. Never an invented metric, testimonial, logo wall or case-study count. (46a)
9. Never an eyebrow, and never a label in tracked capitals or small caps: labels, captions, table heads, tags and nav links are the body face (or the theme's label face), a step smaller, sentence or lower case, untracked. (54, 67)
10. Never middle-dot-joined meta strings, arrows glued to link text, or decorative status dots. (63)
11. Never a purple-to-blue gradient, a card inside a card, an emoji as an icon, or a hand-drawn browser or OS window. (2a, 4, 30a, 47a)
12. The hero's headline, one sentence and primary action are all visible at 1280 x 800 without scrolling. (44b)
13. About 80 words on any one screen; the hero's text is the headline, one sentence and its actions. (58)
14. The container is capped and centred: at 1920 the gutters grow, the measure and the grids do not. (44d)

Above the Floor, a **Reflex** gate is a default a model falls into, waivable on the record with a real reason, and a **Finish** check is craft detail, answered, never blocking (part `gates`, § 1 and § 2).

## Flow in Forja

1. Pre-flight: read the project first (project_map, the tokens in base.css, existing pages). Existing tokens and components are the system; do not start a second one.
2. Decide material, audience, the one action the page drives and a tone from the extremes (editorial, brutalist, soft, utilitarian, luxury, playful, technical, austere; "clean and modern" is not a tone). Do not ask the owner unless a missing fact blocks the work: infer, and say what you inferred in one line.
3. Shape the page before styling: what it opens with, each section's content and composition, the nav and the footer. One idea per screen, set big; never invent a number, a quote or a logo.
4. Build the hero first, check it at 1280 x 800 and at viewport "mobile" with browser_test, then the rest of the page.
5. Sweep: run check_standards, load part `gates` and walk the Floor and Reflex gates against the screenshots, fix every Floor finding, and say honestly in your summary what you did not check.

## Parts

Load one with `load_skill` using `name: "hallmark"` and `part: "<name>"`.

| Part | Use it to |
|---|---|
| `gates` | The full catalogue of Floor, Reflex and Finish gates (what generated pages get wrong) |
| `craft` | Craft detail: type, spacing, color, motion |
| `layout` | Compositions, navs, footers and the first screen |
| `interaction-and-states` | Forms and every control state |
| `microinteractions` | Stateful UI motion |
| `dark-mode` | Doing both themes well |
| `data-viz` | Charts that read as designed |
| `responsive` | Unusual responsive layouts |
