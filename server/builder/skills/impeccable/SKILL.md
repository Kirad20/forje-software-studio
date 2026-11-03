---
name: impeccable
description: Design, critique, audit and polish an interface: craft floor, UX review, layout, type, color, motion, copy and hardening (Impeccable)
---
> Forja note: this text comes from Impeccable by Paul Bakaus (Apache-2.0; see NOTICE.md and the LICENSE next to it). Forja has no `impeccable` launcher, detector, live server, critique storage, hooks or PRODUCT.md/DESIGN.md capture: skip every step that runs one. Look at the result with browser_test screenshots (desktop and viewport "mobile") and run check_standards. The Forja manual's rules win over anything here: tokens in base.css, screens built from @forja/ui, CSS Modules for layout, no inline visual styles, no new npm packages outside the catalog.

This skill gives you the tools and permission to make design that earns the name out-of-distribution craft. Work as an award-winning design director would: production-grade code, a clear POV, a deep grasp of what the client and its users need, and exceptional craft.

Core principles:
- Finish the job. No hedging, no shortcuts: the deliverable is complete, except assets the user must provide.
- Scale ambition to the surface's mode (see Modes). Persuade and Experience get full commitment: bold, distinct work with a point of view. On Operate and Read, ambition shows as precision and restraint, and patterns the visitor already knows earn their place.
- Verify by looking at the rendered result at the sizes it ships at, and batch the checks: fix what one look shows before looking again, rather than screenshotting after every tweak.

## How to design

- **The brief wins.** Honor pinned aesthetics, eras, materials, fonts, and palettes even when they conflict with a saturated-pattern warning. Redirecting a clear brief toward your taste is failure.
- **Refinement preserves; redesign replaces.** Refinement keeps the incumbent identity, behavior, copy, and everything outside scope. Ask before replacing factual copy or adding claims. Redesign keeps product truth, content, function, native affordances, and constraints, but treats the old look as evidence and anti-reference; choose a replacement world in new-work and replace DESIGN.md. Never split the difference into polish on the discarded look.
- **Loaded symbols stay out of the decoration.** A subject's world does not license emblems tied to militarism, supremacy, or hate movements as motifs, badges, or ornament, such as the Rising Sun flag's rays, the Confederate battle flag, or Nazi-era insignia and their stylised variants; reach for that world's neutral forms instead. Content that documents such a symbol as fact stays as it is.
- **Visual authority is evidence, not a filename.** Missing DESIGN.md alone does not make a project greenfield; new-work decides whether to preserve, expand, or replace the incumbent world.

## Modes

The mode names what the visitor's success looks like on this surface.

- **Persuade:** the visitor decides and acts; design is the product. Landing pages, marketing, campaigns, pricing. Earn attention and action. Ship real imagery when the brief needs it; follow the committed world, not category habit.
- **Operate:** the visitor completes a task. App UI, dashboards, editors, admin, settings, tools. Scanability, consistency, native expectations, and the real usage scene outrank expression. Brand lives in precise details.
- **Read:** the visitor understands something. Docs, articles, guides, help, changelogs. Structure for comprehension, then make the reading experience worth staying in.
- **Experience:** the visitor is inside the work itself. Portfolios, galleries, showcases. Let the artifact lead from the first viewport; the interface recedes.

Choose the mode from the requested surface, not the product, and persist it only in that surface brief. A tool's landing page is still Persuade; a fashion house's documentation is still Read; a docs index is Read, not Persuade. See [new-work.md](reference/new-work.md) for new surfaces and [operate.md](reference/operate.md) for deeper Operate/Read guidance.

## Parts

Load one with `load_skill` using `name: "impeccable"` and `part: "<name>"`. Before ANY UI edit, load `craft-floor`. To review work, load `critique` (UX) and `audit` (technical); to finish, `polish`.

| Part | Use it to |
|---|---|
| `craft-floor` | Quality floor, absolute bans and reflexes: read before ANY UI edit |
| `critique` | UX design review with heuristic scoring |
| `audit` | Technical quality checks: accessibility, performance, responsive |
| `polish` | Final quality pass before shipping |
| `layout` | Fix spacing, rhythm and visual hierarchy |
| `typeset` | Improve typography hierarchy and fonts |
| `colorize` | Add strategic color to monochromatic UIs |
| `animate` | Add purposeful animation and motion |
| `bolder` | Amplify safe or bland designs |
| `quieter` | Tone down aggressive or overstimulating designs |
| `distill` | Strip to essence, remove complexity |
| `clarify` | Improve UX copy, labels and error messages |
| `harden` | Production-ready: errors, i18n, edge cases |
| `adapt` | Adapt for different devices and screen sizes |
| `onboard` | First-run flows, empty states, activation |
| `delight` | Personality and memorable touches |
| `mode-operate` | Mode guide: app UI, dashboards, tools |
| `mode-persuade` | Mode guide: landing pages, marketing |
| `mode-read` | Mode guide: docs, articles, help |
| `operate` | Deeper guidance for Operate and Read surfaces |
