# Design Direction: Pacman Arcade Frontend

## Chosen Approach: Brutalist Arcade UI

**Design Movement:** Brutalist graphic design meets retro arcade aesthetics, drawing inspiration from 1980s arcade cabinet interfaces and contemporary brutalist web design.

**Core Principles:**
1. **Uncompromising Geometry** — Thick black borders, sharp right angles, and heavy drop shadows create visual weight and authority. No rounded corners or soft edges.
2. **Functional Typography** — Bold, condensed display fonts for headlines; monospaced/terminal fonts for data and labels. Typography hierarchy is structural, not decorative.
3. **Saturated Accent Colors** — Bright yellow, red, green, and blue used strategically to denote state, action, and urgency. Color is functional, not ornamental.
4. **Paper-Like Materiality** — Off-white background with visible texture suggests arcade cabinet surfaces and printed materials. High contrast ensures readability.

**Color Philosophy:**
- **Primary Accent:** Saturated yellow (`#FFD700` / `oklch(0.85 0.25 80)`) — signals action, energy, and arcade nostalgia
- **Secondary Accents:** Red (`#E63946`), Green (`#06A77D`), Blue (`#0066CC`) — state indicators (danger, success, info)
- **Neutral Base:** Off-white (`#F5F1E8` / `oklch(0.97 0.005 80)`) — arcade cabinet paper texture
- **Text:** Black (`#000000`) — maximum contrast and legibility
- **Borders & Shadows:** Black with heavy drop shadows — visual weight and depth

**Layout Paradigm:**
- **Boxed Panels:** All content lives in framed rectangular containers with thick black borders and 3–4px drop shadows.
- **Horizontal Dividers:** Strong black lines separate sections and create rhythm.
- **Multi-Column Grids:** Asymmetric two- and three-column layouts (not centered grids). Left sidebar for status/controls, center for main content, right sidebar for secondary info.
- **Generous Spacing:** Padding and margins follow a 16px base unit; sections are clearly separated.

**Signature Elements:**
1. **Bold Letter Tiles** — User avatars rendered as large letters in colored backgrounds (yellow for primary, green/red/blue for secondary). Emulates arcade player tokens.
2. **Framed Data Cards** — All metrics, stats, and secondary content live in bordered boxes with clear labels and monospaced values.
3. **Heavy Button States** — Buttons use thick borders, solid backgrounds, and scale/shadow changes on interaction. No subtle hover effects.

**Interaction Philosophy:**
- **Immediate Feedback** — Buttons respond instantly with scale and shadow changes. No loading spinners; state changes are direct.
- **Arcade Directness** — Interactions are binary and clear: active/inactive, enabled/disabled. No ambiguous states.
- **No Animations** — Transitions are snappy (100–160ms) but minimal. Motion is functional, not decorative.

**Animation:**
- Button press: `transform: scale(0.97)` with 120ms ease-out on `:active`
- State transitions: 150ms ease-out for opacity and color changes
- No entrance animations; content appears instantly
- Respect `prefers-reduced-motion` by disabling all non-essential motion

**Typography System:**
- **Display Font:** Bold, condensed sans-serif (e.g., "Space Mono Bold" or similar monospaced bold for headlines)
- **Body Font:** Monospaced (e.g., "Courier New", "Space Mono", or system monospace) for all UI labels, data, and secondary copy
- **Hierarchy:** Headline size 2.5–3rem, subheading 1.5–2rem, body 0.875–1rem, labels 0.75rem
- **Line Height:** Tight (1.2) for headlines, normal (1.5) for body

**Brand Essence:**
*Competitive arcade action distilled into a brutalist interface—no frills, maximum clarity, pure gameplay.*
**Personality:** Bold, Direct, Uncompromising, Nostalgic

**Brand Voice:**
- Uppercase labels and commands: "SELECT PROTOCOL", "ENTER GAME", "FINAL SCORE"
- Monospaced data presentation: "WAKA_THEODORE // 48,200"
- No marketing fluff; every word is functional
- Example lines:
  - "COMPETITIVE ARENA ACTION. LIVE GHOST HUNTERS. ZERO QUARTERS REQUIRED."
  - "CHOOSE YOUR ARENA. NO HESITATION."

**Wordmark & Logo:**
- Bold letter "P" in a thick-bordered yellow square with black shadow
- No text; pure geometric symbol
- Used in header and as favicon

**Signature Brand Color:**
Saturated yellow (`#FFD700` / `oklch(0.85 0.25 80)`) — unmistakably arcade, unmistakably this brand.

---

## Implementation Notes

- All components use `border-2 border-black` and `shadow-lg` (or custom heavy shadow)
- Buttons: `bg-yellow-400 text-black border-2 border-black` with hover scale
- Text: `font-mono text-black` for labels; bold display fonts for headlines
- Spacing: 16px base unit; sections separated by 32–48px margins
- No Tailwind rounded corners; all `rounded-none`
- Background: `bg-amber-50` or similar off-white with optional subtle texture
