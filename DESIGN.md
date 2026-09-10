# Design

## Theme
Dark "ember & gold" (reverted from light on user request, 2026-06-15). Charcoal-black surface with a warm volumetric WebGL smoke hero, film grain, and a global vignette, framed by a thin gold double rule with ornamental corner brackets. Text is cream; accents are gold. Mood: a dim dining room lit by the grill. Note: token NAMES are still `--marble` / `--ink` (semantic roles: page bg / primary text) but now hold dark/light values respectively, so component CSS did not need rewriting, only the token values plus the gold-fill button text and the image/scrim overlays.

## Color (dark)
- `--marble`      #0a0907  page base (charcoal)  | `--marble-2` #13100c | `--marble-3` #1a1610
- `--paper`       #16120b  lifted card / panel
- `--ink`         #f4ecdc  primary text (cream) — very high contrast on charcoal
- `--ink-2`       #cdc1a8  body text
- `--ink-3`       #ab9d82  muted tan (section titles, meta) — ~7:1 on charcoal
- `--gold`        #c9a35c  primary gold (rules, fills, accents)
- `--gold-2`      #e8cf9a  lighter gold (hover, highlights)
- `--gold-deep`   #d8b878  light gold for TEXT on dark — ~9:1
- `--btn-on-gold` #14100a  dark text used on gold fills (buttons, active pills)
- `--line`        rgba(201,163,92,.28) gold hairline rules
Selection: gold bg / dark ink. Focus ring: 2px `--gold-deep`.

## Typography (3 families, all off the reflex-reject list)
- **Italiana** — display / hero wordmark / elegant Turkish accents. High-contrast Didone; dramatic, fashion-serif. (brand continuity from existing site)
- **Marcellus** — section headings, dish names, structural serif. Inscriptional Roman, low-contrast; pairs with Italiana on the contrast axis (Didone × glyphic), not against it.
- **Jost** — body, UI, labels, descriptions. Geometric humanist sans for the serif/sans contrast.
Cormorant Garamond and Playfair are deliberately dropped (reflex-reject) and replaced by Marcellus.
Scale: fluid `clamp()`, ratio ≥1.25. Hero wordmark ceiling ~6rem on mobile up; large but framed. Headings `text-wrap: balance`, prose `text-wrap: pretty`. No all-caps body; caps only for short labels/badges.

## Signature components
- **Dark surface** — charcoal base + layered dark radial gradients + global vignette + film-grain overlay (`.grain`, overlay blend). The light marble-vein layer is disabled in dark mode.
- **Gold frame** — fixed thin double rule inset from viewport with corner-bracket motifs (matches menu pages).
- **Brand mark** — recolorable inline SVG coffee-cup-with-steam (matches the menu cover line art) in `--gold-deep`; gold PNG logo used where a richer treatment fits.
- **Diamond price badge** — gold rhombus holding size/price (from the drinks pages).
- **Numbered bilingual menu row** — `nr` · German name / Turkish · dotted leader · price; allergen legend + "ask at table" note (no fabricated per-item codes).
- **Section title pattern** — big Marcellus primary word + Italiana secondary (Turkish) word offset, echoing the menu's bilingual headers. Not a tiny uppercase eyebrow.

## Motion
Lenis smooth scroll; GSAP + ScrollTrigger reveals (staggered, fit-to-content); custom gold cursor (pointer devices only); **hero WebGL smoke + embers** (Three.js r128 fragment-shader smoke column with additive ember points, stretches/heats on scroll via `uScroll`; `js/app.js` `startSteam()`, degrades to `.hero-fallback` gradient when WebGL/THREE absent and to a static frame when rAF is unavailable); horizontal signature scroll; subtle tilt on dessert cards. Easing: ease-out-expo/quart, no bounce. Every effect has a `prefers-reduced-motion` static fallback; content is visible by default (`html.js` gates hidden states, with setTimeout failsafes).

## Layout
Shared chrome: gold frame, marble bg, top nav (brand left, links + Reservieren right), footer with hours/contact/legal. Content shell `min(1180px, 92vw)`. Fluid `clamp()` spacing with deliberate rhythm. Image-led: full-bleed food photography with marble-framed overlays. Responsive via `auto-fit minmax` grids; menu collapses to single column on mobile; nav to full-screen overlay.

## Pages
index · menu · about · reservation · gallery · contact · impressum · datenschutz. Shared `css/style.css`, `js/app.js`, `js/menu-data.js`. Business details are marked placeholders (`⚑ PLATZHALTER`).
