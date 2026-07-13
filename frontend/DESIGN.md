# Design Changes: PAC-MAN Brutalist Redesign

> Migration spec for updating the existing PAC/MULTI frontend (`frontend/src/{index.css, App.css}` and
> component CSS) away from the neon-arcade look documented in the original design system, toward a
> brutalist visual language. Read alongside the original `Design System: PAC-MAN ARCADE` doc -- this
> file calls out exactly what changes and what stays the same. Working mockups for all six screens
> below (Login, Lobby, Leaderboard, Game Over, Profile, In-Game HUD) are on the canvas for reference.

## 0. What stays the same

- Product structure, routes, and functionality are unchanged -- this is a visual re-skin, not a
  rebuild. Same pages, same data, same interactions.
- The Pac-Man brand identity (yellow as the core color, ghost-based accent roles) is preserved --
  it is just re-expressed without neon glow.
- Multi-accent roles (yellow / red / green) are preserved conceptually, but red replaces pink as the
  danger/negative accent (see Color Palette below) and cyan is dropped entirely.

## 1. Visual Theme & Atmosphere -- REPLACE

**Old:** deep-space navy cabinet, neon grid overlay, radial glows (cyan/yellow/pink), dark glass
panels with blurred neon shadows. Retro-arcade-at-night mood.

**New:** raw paper background, high-contrast ink borders, flat hard-edged shadows. Printed-scoreboard
mood -- like a poster on an arcade wall, not a glowing screen.

- Remove all radial-gradient ambient glows and the neon background grid.
- Remove backdrop blur / glassmorphism (`backdrop-filter`, translucent panel fills).
- Every surface becomes an opaque, flat-filled box with a solid border -- no transparency layering.
- Density and layout rhythm (stat grids, leaderboard rows, breathing room) stay the same -- only the
  surface treatment changes.

## 2. Color Palette & Roles -- REPLACE

| Role | Old (neon-arcade) | New (brutalist) |
| --- | --- | --- |
| Primary background | Void Navy `#030711` | Paper `#F3EFE3` |
| Secondary background | Cabinet Navy `#070F2D` | Paper Raised `#FAF7EE` |
| Card/panel fill | Glass Surface `rgba(5, 12, 32, 0.9)` | Paper Raised `#FAF7EE` (opaque) |
| Elevated/modal fill | Raised Glass `rgba(8, 18, 44, 0.97)` | Paper Raised `#FAF7EE` (opaque) |
| Primary text | Starlight `#F7FBFF` | Ink `#111111` |
| Secondary text | Ice Cyan-White `#C8F7FF` | Ink Soft `#4A4A45` |
| Muted/helper text | Muted Steel `#85ABC0` | Ink Soft `#4A4A45` at reduced opacity |
| Structural border | Edge Cyan `rgba(0,229,255,0.28)` | Ink `#111111` (solid, 2-3px) |
| Strong/focus border | Edge Cyan Bright `rgba(0,229,255,0.72)` | Ink `#111111` (solid, same weight -- no brightening, use fill-swap instead, see Component Stylings) |
| Core brand accent | Pac Yellow `#FFE600` | Pac Yellow `#F6C500` (flattened, matte) |
| Primary interactive accent | Neon Cyan `#00E5FF` | Dropped -- replaced by Ink for structure, Yellow for primary actions |
| Secondary/danger accent | Ghost Pink `#FF2F87` | Ghost Red `#D8402C` |
| Tertiary/success accent | Ghost Green `#00FF66` | Ghost Green `#1F8A52` (flattened) |

- Delete the ambient three-glow background treatment entirely (no replacement -- brutalist backgrounds
  are flat).
- Every color above is a flat, fully opaque value. No `rgba()` alpha-based accents anywhere in the new
  palette except deliberate muted text.
- "Banned" rules carry over unchanged: no pure `#000000`, no pure `#FFFFFF` -- use `--ink` / `--paper`.

## 3. Typography Rules -- PARTIAL REPLACE

| Use | Old | New |
| --- | --- | --- |
| Display / Headlines | Orbitron, yellow fill + pink offset shadow + glow | Space Grotesk, weight 700, uppercase, flat ink or yellow fill, **no text-shadow glow** |
| Arcade UI / buttons / labels / stats | VT323 pixel mono | Space Mono, uppercase, letter-spacing 0.06-0.08em |
| Body / paragraphs | VT323 18-20px | Space Mono 15-16px, same relaxed leading (1.5-1.6) |
| Form fields | Inter | Space Mono (unify with the rest of the UI -- brutalism doesn't carve out a separate "legible" typeface) |
| Numbers / stats | VT323 | Space Mono (tabular figures where available) |

- Drop the pixel/CRT font stack (VT323, Orbitron) entirely -- this was the single biggest "arcade"
  signal and the brief explicitly rejects it.
- Drop all text-shadow glow effects on headlines. Headlines get their punch from size and weight, not
  glow.
- Banned serif rule carries over unchanged.

## 4. Component Stylings -- REPLACE

**Buttons:**
- Old: transparent/dark fill, 2px accent border, 7px radius, blurred-free hard offset shadow at
  0.18-0.24 alpha, hover brightens border to 0.86 alpha.
- New: opaque paper-raised fill, 3px solid ink border, **0px radius** (sharp corners), hard offset
  shadow in solid `--ink` (not colored, not alpha-blended) -- `5px 5px 0 var(--ink)`. Hover lifts the
  button `translate(-2px,-2px)` and grows the shadow to `7px 7px 0`; active presses it flat
  (`translate(2px,2px)`, shadow `2px 2px 0`). This offset-shadow motif is the one idea worth keeping
  from the old system -- just make the shadow ink-black instead of a colored glow.

**Cards / panels:**
- Old: glass fill, 2px cyan border at 0.28 alpha, 8-10px radius, soft cyan-tinted shadow, 5px gradient
  top bar.
- New: opaque paper-raised fill, 2-3px solid ink border, 0px radius, hard flat shadow
  (`8px 8px 0 var(--ink)`). Drop the gradient top bar -- use a solid flat color block (yellow/red/green)
  as a header strip or corner tag instead, if a panel needs an accent-family signal.

**Inputs:**
- Old: label above input, dark translucent fill, 1px cyan border, 7px radius, focus brightens border
  to accent color.
- New: label above input (Space Mono, uppercase, 13-14px), flat paper fill, 2px solid ink border, 0px
  radius, focus swaps the border to solid yellow (or red for destructive fields) rather than
  "brightening" an alpha value. Error text below in Ghost Red.

**Loaders:** keep the shimmer-over-real-shape guidance from the original doc; render the shimmer as
flat alternating ink/paper bands rather than a soft gradient sweep.

**Tabs / segmented control:** drop the pill-free-but-rounded 8px-radius treatment -- use 0px radius,
solid ink border, active segment gets a solid ink or yellow fill (not a 0.18-alpha tint).

**Badges / tags:** flat fill (not alpha-blended), solid 2px ink border, 0px radius, Space Mono
uppercase text.

## 5. Layout Principles -- KEEP

No changes needed here -- CSS Grid usage, `max-width: 1400px` containers, `auto-fit minmax(...)` stat
and mode-card grids, and the explicit leaderboard row grid (`80px 2fr 1fr 1fr 1fr`) all carry over
unchanged. Brutalism and the existing grid-first layout approach are compatible.

## 6. Motion & Interaction -- MOSTLY KEEP

- Keep transition timing (`0.18s-0.22s ease`) and the scroll-aware auto-hide nav.
- **Remove** the Pac chomp neon-glow loop's visual glow component, but keep a chomp animation on game
  tokens if desired -- render it as a flat geometric wedge-open/close, no glow.
- Keep the `prefers-reduced-motion` rule disabling chomp/ghost transitions.
- Keep "animate only `transform` and `opacity`" performance guidance.

## 7. Animation & Liveness -- NEW

Brutalism means flat and hard-edged, not static. A site with zero motion reads as broken or unfinished
-- the goal is a design that feels snappy and alive through *sharp, purposeful* motion, never through
glow, blur, or soft easing (which would drag the neon-arcade mood back in). Every animation below uses
linear or "snap" easing and moves in whole steps, like a mechanical stamp or a scoreboard flipping --
not a smooth glide.

**Motion vocabulary (the only easing/duration palette to use):**
- Easing: `linear` or a stepped/snap curve (`cubic-bezier(0.2, 0, 0, 1)`) -- never a soft `ease-in-out`
  glide on large moves. Micro-interactions (hover/press) stay at `0.1-0.15s`; entrances/reveals stay
  at `0.15-0.25s`. Nothing in the system takes longer than ~300ms except deliberate idle loops.
- Only animate `transform` and `opacity` (carried over from section 6) -- box-shadow offsets can also
  animate since they're solid, unblurred values, not glow.

**Entrance / on-scroll reveals:**
- Cards, stat blocks, and leaderboard rows enter with a hard offset-shadow "stamp": start at
  `translate(0,0)` with no shadow, and in one snap step settle to `translate(-4px,-4px)` with its full
  `8px 8px 0 var(--ink)` shadow -- like a stamp hitting paper. Stagger rows/cards by ~40-60ms each so
  lists visibly build rather than popping in all at once.
- Headlines can enter with a quick clip-path wipe (like a page turning) instead of a fade -- fades read
  as soft/glowy, wipes read as printed.

**Idle / ambient motion (this is what prevents "stale"):**
- Live data (score ticks, queue counts, "players online", the live feed on Lobby) should visibly update
  on an interval, not just on reload -- increment/decrement with a quick digit-flip or hard
  translate-up/translate-down swap, like a mechanical counter, every few seconds.
- Status tags (`OPTIMAL`, `HUNTER`, `ALIVE`) get a slow, subtle hard-edged pulse on their border or fill
  (step between two flat opacity values, no blur) so the screen never looks like a static screenshot.
- The corner tags / accent blocks (e.g. "HOT", "SECTOR 7G") can have a barely-there idle jitter
  (`translate` by 1-2px on a slow interval) to feel mechanical rather than printed-and-frozen.
- On the in-game HUD specifically, the maze/token view should never be fully still: ghost and player
  tokens take small stepped movements along the grid on an interval, and the timer/score should tick
  in real units, not sit frozen.

**Hover / press (interactive feedback):**
- Buttons and cards: hover lifts `translate(-2px,-2px)` and grows the shadow to `7px 7px 0`; press
  flattens to `translate(2px,2px)` with `2px 2px 0` -- both near-instant (`0.1s linear`). This is the
  single most important interaction pattern in the system; apply it consistently to every clickable
  surface (buttons, cards, leaderboard rows, mode-select tiles) so the whole UI feels physically
  responsive, not just decorated.
- Focus states swap the border to solid yellow/red instantly (no transition needed, or `0.1s` max) --
  brutalist focus is a hard state change, not a soft glow-in.

**What to avoid:** soft fades, blur transitions, spring/bounce easing, glow pulses, parallax, and any
animation slower than ~300ms outside of deliberate idle loops. If a motion choice would look at home in
a neon dashboard, it's wrong here -- it should look like something clicking, stamping, or flipping into
place.

- Keep the `prefers-reduced-motion` rule: idle loops, digit-flips, and jitter all pause; only essential
  state-change transitions (hover/press, page transitions) remain, and even those shorten further.

## 8. Anti-Patterns -- UPDATED LIST

Everything in the original Anti-Patterns section still applies, plus these brutalism-specific
additions:

- No blurred/glowing shadows anywhere -- every shadow is a hard, solid-color, unblurred offset.
- No border-radius greater than 0px on any UI element (buttons, cards, inputs, tags, tabs).
- No translucent/glassmorphic surfaces -- every fill is fully opaque.
- No pixel/CRT fonts (VT323, Orbitron) and no text-shadow glow on headlines.
- No neon-cyan anywhere -- it is fully retired from the palette.

**Brand Overrides carried forward:** the multi-accent role system (yellow / red / green mapped to
brand / danger / success) is still the product identity -- brutalism changes *how* each accent is
rendered (flat, not glowing), not *whether* the accent system exists.

## Reference mockups

Six screens implementing this direction are built in the mockup sandbox at
`artifacts/mockup-sandbox/src/components/mockups/pacman-brutal/`:
`Login.tsx`, `Lobby.tsx`, `Leaderboard.tsx`, `GameOver.tsx`, `Profile.tsx`, `GameUI.tsx`, sharing
`_group.css` (tokens/utilities) and `_shared/AppLayout.tsx` (nav shell). Use these as the literal
source of truth for exact spacing, shadow values, and component composition when updating the real
app's CSS and components.
