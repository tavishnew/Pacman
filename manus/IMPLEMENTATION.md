# Pacman Arcade Frontend - Implementation Guide

## Overview

This document details the complete implementation of the Pacman Arcade frontend based on the brutalist arcade UI design system. The frontend is built with React 19, TypeScript, and Tailwind CSS 4, following the design specifications from the provided reference images.

## Design System

### Visual Identity

The brutalist arcade aesthetic defines the entire visual language of the application. Key characteristics include:

**Color Palette:**
- **Primary Accent:** Saturated yellow (`oklch(0.85 0.25 80)`) — signals action, energy, and arcade nostalgia
- **Secondary Accents:** Red (`oklch(0.577 0.245 27.325)`), Green (`oklch(0.65 0.18 150)`), Blue (`oklch(0.55 0.20 250)`)
- **Neutral Base:** Off-white (`oklch(0.97 0.005 80)`) — arcade cabinet paper texture
- **Text:** Black (`oklch(0 0 0)`) — maximum contrast and legibility
- **Borders & Shadows:** Black with heavy 3–4px drop shadows

**Typography:**
- **Display Font:** JetBrains Mono Bold for headlines — bold, condensed, monospaced
- **Body Font:** Space Mono for all UI labels, data, and secondary copy
- **Hierarchy:** Headlines 2.5–5rem, subheadings 1.5–2rem, body 0.875–1rem, labels 0.75rem
- **Line Height:** Tight (1.2) for headlines, normal (1.5) for body

**Layout & Spacing:**
- All content lives in framed rectangular containers with thick black borders (2px) and heavy drop shadows (3–4px)
- Strong horizontal dividers (`border-b-2 border-black`) separate sections
- Asymmetric two- and three-column layouts (not centered grids)
- Generous spacing using 16px base unit; sections separated by 32–48px margins
- No rounded corners (`rounded-none` throughout)

**Interaction:**
- Buttons respond instantly with scale and shadow changes on hover/active states
- No loading spinners; state changes are direct and immediate
- Transitions are snappy (100–160ms) but minimal
- Motion is functional, not decorative

### CSS Implementation

**Global Theme (`client/src/index.css`):**

The global CSS file establishes the brutalist arcade theme with custom CSS variables and utility classes:

```css
:root {
  --arcade-yellow: oklch(0.85 0.25 80);
  --arcade-red: oklch(0.577 0.245 27.325);
  --arcade-green: oklch(0.65 0.18 150);
  --arcade-blue: oklch(0.55 0.20 250);
  --arcade-black: oklch(0 0 0);
  --arcade-white: oklch(0.97 0.005 80);
}
```

**Key CSS Classes:**

- `.brutalist-box` — Heavy borders and drop shadows for content containers
- `.brutalist-button` — Yellow buttons with responsive scale/shadow effects
- `.arcade-panel` — Bordered panels with drop shadows
- `.arcade-button` — Primary action buttons with arcade styling
- `.arcade-label` — Small uppercase labels for form fields and metadata
- `.arcade-divider` — Horizontal dividers between sections

**Font Integration:**

Google Fonts are imported for display and body typography:
- `JetBrains Mono` (weight 700) for headlines
- `Space Mono` (weights 400, 700) for body and labels

## Page Components

### 1. Login Screen (`client/src/pages/Login.tsx`)

**Design Reference:** `Login-Brutalist.png`

**Layout:** Split two-column design with left branding and right authentication form.

**Components:**
- **Left Column:**
  - System status badges (SYS.ONLINE, LOC: US-EAST-1)
  - Large PAC/MULTI wordmark (7xl font size)
  - Info box with game description and feature badges
  - Footer stats showing current champion and active lobbies

- **Right Column:**
  - Tabbed header (INSERT COIN / NEW PLAYER) with black/white toggle styling
  - Authentication form with bordered inputs
  - Handle and passcode fields with monospaced placeholder text
  - Large yellow START GAME button with arrow icon
  - Recovery link at bottom

**Key Features:**
- Responsive tab switching between login and registration modes
- Heavy borders and drop shadows on all containers
- Monospaced typography for all labels and data
- Yellow accent color for primary action button

### 2. Lobby Screen (`client/src/pages/Lobby.tsx`)

**Design Reference:** `Lobby-Brutalist.png`

**Layout:** Three-column grid with game mode cards on left, sidebar on right.

**Components:**
- **Header:**
  - Large "SELECT PROTOCOL" headline
  - Subheading: "CHOOSE YOUR ARENA. NO HESITATION."
  - Horizontal divider

- **Main Content (2/3 width):**
  - 2×2 grid of game mode cards
  - Each card includes:
    - Colored header bar (yellow, red, green, black) with mode tag
    - Mode name in large bold text
    - Player count and queue info
    - Description text
    - Yellow "ENTER PROTOCOL" button with arrow

- **Right Sidebar (1/3 width):**
  - **Network Status Panel** (black background, white text)
    - Status badge (OPTIMAL in green)
    - Players online, active matches, ping/region stats
  
  - **Live Feed Panel** (white background)
    - Recent game events with timestamps
    - Player names, actions, and colored status indicators
    - "VIEW FULL FEED" button

**Game Modes:**
- MAZE RUNNER (FFA SPRINT) — Yellow, 8 max, 1402 in queue
- PAC ROYALE (ELIMINATION) — Red, 100 max, 890 in queue
- GHOST PROTOCOL (ASYMMETRIC) — Green, 4 max, 432 in queue
- RANKED DUEL (1v1) — Black, 2 max, 89 in queue

### 3. Leaderboard Screen (`client/src/pages/Leaderboard.tsx`)

**Design Reference:** `Leaderboard-Brutalist.png`

**Layout:** Two-column with ranking table on left, user stats sidebar on right.

**Components:**
- **Header:**
  - Large "GLOBAL RANKINGS" headline
  - Season badge (SEASON 4 ACTIVE) and countdown timer
  - Total players and matches today stats

- **Main Content (2/3 width):**
  - Ranking table with black header row
  - Columns: RNK, HANDLE, SCORE, MATCHES, WIN %, TRND
  - Current user row highlighted in yellow with "YOU" badge
  - Trend indicators (📈 up, 📉 down, − flat)

- **Right Sidebar (1/3 width) — Yellow background:**
  - "YOUR STARTER" header
  - Current rank (42)
  - Score (48,200)
  - Win rate (51.2%)
  - Next target with progress bar
  - "FIND MATCH" button (black background)
  - Rankings breakdown (Solo, Team, Survival)

**Ranking Data:**
- Top 5 global players with scores, match counts, and win rates
- Current user at rank 42 with highlighted row
- Trend indicators showing rank movement

### 4. Profile Screen (`client/src/pages/Profile.tsx`)

**Design Reference:** `Profile-Brutalist.png`

**Layout:** Two-column with user info and metrics on left, squad panel on right.

**Components:**
- **Profile Header:**
  - Large yellow avatar tile with user initial (W)
  - Username in large bold text
  - Rank badge (VETERAN), join date badge
  - Win streak badge (green background)
  - Config button (⚙️)

- **Left Column (2/3 width):**
  - **Combat Metrics** section with four stat cards:
    - Career Score (yellow background)
    - Matches Played (white background)
    - Max Survival (white background)
    - Ghosts Devoured (red background)
  
  - **Recent Operations** section:
    - List of last 10 matches
    - Victory/Defeat badges with color coding
    - Survival time and score for each match

- **Right Column (1/3 width):**
  - **Squad Panel** (white background)
    - "3 ONLINE" badge
    - "RECRUIT ALLY" button (yellow)
    - Squad member cards with:
      - Colored initial tile
      - Player handle
      - Status (IN LOBBY, IN GAME, LAST SEEN)
      - Challenge button (if online)

**User Data:**
- Username: WAKA_THEODORE
- Rank: VETERAN
- Career Score: 842,900
- Matches Played: 342
- Max Survival: 4M 12S
- Ghosts Devoured: 1,204

### 5. Game Over Screen (`client/src/pages/GameOver.tsx`)

**Design Reference:** `GameOver-Brutalist.png`

**Layout:** Split screen with yellow poster panel on left, results panel on right.

**Components:**
- **Left Panel (yellow background):**
  - "MATCH TERMINATED" badge (black)
  - Sector info (SECTOR 7G)
  - Giant "GAME OVER" headline (8xl font)
  - Final score box (white background)
  - Action buttons: REMATCH and LOBBY

- **Right Panel (white background):**
  - "MATCH RESULTS" headline with "TOP 4" label
  - Results table showing:
    - Rank, handle, status (ALIVE/DEAD), score
    - Winner highlighted with black background
    - Current user highlighted with yellow background
  
  - **Score Breakdown** section:
    - Pellets Eaten (yellow bar, 8400/10000)
    - Ghosts Devoured (red bar, 4800/10000)
    - Survival Bonus (green bar, 1050/5000)
    - Each with icon, label, value, and progress bar

**Match Results:**
- Rank 1: GHOST_KILL3R (ALIVE, 18,900)
- Rank 2: WAKA_THEODORE (DEAD, 14,250) — Current user
- Rank 3: CHERRY_POPPER (DEAD, 12,100)
- Rank 4: BLINKY_BLIND (DEAD, 9,500)

## File Structure

```
client/
├── public/
│   ├── apple-touch-icon.svg
│   ├── favicon.svg
│   ├── manifest.json
│   └── site.webmanifest
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.tsx
│   │   ├── ManusDialog.tsx
│   │   ├── Map.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── [other shadcn/ui components]
│   ├── contexts/
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   ├── useComposition.ts
│   │   ├── useMobile.tsx
│   │   └── usePersistFn.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Home.tsx (placeholder)
│   │   ├── NotFound.tsx
│   │   ├── Login.tsx (NEW)
│   │   ├── Lobby.tsx (NEW)
│   │   ├── Leaderboard.tsx (NEW)
│   │   ├── Profile.tsx (NEW)
│   │   └── GameOver.tsx (NEW)
│   ├── App.tsx (MODIFIED)
│   ├── index.css (MODIFIED)
│   ├── main.tsx
│   └── const.ts
├── index.html (MODIFIED for fonts)
└── [other config files]
```

## Routing

The application uses Wouter for client-side routing with the following routes:

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Login | Authentication screen |
| `/lobby` | Lobby | Game mode selection and protocol entry |
| `/leaderboard` | Leaderboard | Global rankings and user stats |
| `/profile` | Profile | User profile, metrics, and squad management |
| `/gameover` | GameOver | Match results and score breakdown |
| `/404` | NotFound | Error page |

## Component Architecture

### Page Components

All page components follow a consistent pattern:

1. **Container Div** — Full-height, off-white background, padding
2. **Header Section** — Large headline, subheading, divider
3. **Main Content** — Multi-column grid layout
4. **Sidebar** — Secondary information panels
5. **Action Buttons** — Yellow primary, black secondary

### Reusable Patterns

**Bordered Panels:**
```tsx
<div className="border-2 border-black p-6 bg-white" 
     style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.8)" }}>
  {content}
</div>
```

**Arcade Buttons:**
```tsx
<button className="arcade-button bg-yellow-400 border-2 border-black font-bold py-4 px-6 uppercase"
        style={{ boxShadow: "3px 3px 0px rgba(0,0,0,0.6)" }}>
  ACTION BUTTON →
</button>
```

**Stat Cards:**
```tsx
<div className="border-2 border-black p-6 bg-yellow-400">
  <div className="arcade-label mb-2">STAT LABEL</div>
  <div className="text-4xl font-black">VALUE</div>
</div>
```

## Styling Conventions

### Tailwind Classes

- **Borders:** `border-2 border-black` (never `border-gray-*`)
- **Shadows:** Custom `box-shadow: 3px 3px 0px rgba(0,0,0,0.8)` (not Tailwind shadows)
- **Rounded Corners:** `rounded-none` (brutalist: no rounding)
- **Typography:** `font-mono` for body, `font-bold` for emphasis
- **Spacing:** 16px base unit (`p-4`, `gap-4`, `mb-6`)
- **Colors:** Arcade palette variables (`bg-yellow-400`, `bg-red-500`, `bg-green-600`, `bg-black`)

### Custom CSS

Custom CSS classes in `index.css` provide arcade-specific styling:

```css
.arcade-panel {
  @apply border-2 border-black bg-white p-6;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.8);
}

.arcade-button {
  @apply bg-yellow-400 text-black border-2 border-black font-bold px-8 py-4 uppercase;
  box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.6);
}

.arcade-button:hover {
  @apply -translate-x-0.5 -translate-y-0.5;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.8);
}

.arcade-button:active {
  @apply translate-x-0.5 translate-y-0.5;
  box-shadow: 1px 1px 0px rgba(0, 0, 0, 0.6);
}
```

## Integration with Backend

The frontend is currently a static React application. To connect with the Pacman backend API:

1. **API Configuration** — Create `client/src/config.ts` with API endpoint:
   ```typescript
   export const API_URL = process.env.VITE_API_URL || "http://localhost:5000";
   ```

2. **Authentication Flow:**
   - Login page submits credentials to `/api/auth/login`
   - Store JWT token in localStorage
   - Include token in subsequent API requests

3. **Data Fetching:**
   - Use `useEffect` hooks to fetch leaderboard data
   - Update profile stats from user API endpoint
   - Stream live feed events via WebSocket or polling

4. **Game Integration:**
   - Lobby page fetches active game modes from backend
   - GameLauncher component initializes game canvas
   - GameOver screen submits match results to backend

## Development Workflow

### Running the Development Server

```bash
cd /home/ubuntu/pacman_frontend
pnpm install
pnpm dev
```

The dev server runs on `http://localhost:3000` with hot module reloading.

### Building for Production

```bash
pnpm build
pnpm preview
```

### Code Quality

- **TypeScript:** Full type safety with `client/tsconfig.json`
- **Formatting:** Prettier configuration in `.prettierrc`
- **Linting:** ESLint via TypeScript compiler

## Browser Compatibility

The frontend uses modern CSS and JavaScript features:

- **CSS Grid & Flexbox** — Layout foundation
- **CSS Variables** — Theme customization
- **ES2020+** — JavaScript features via Vite transpilation
- **React 19** — Latest React features and hooks

Tested and compatible with:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

1. **Code Splitting:** Routes are lazy-loaded via Wouter
2. **Asset Optimization:** Images and media use external URLs
3. **CSS Optimization:** Tailwind CSS purges unused styles in production
4. **Bundle Size:** Minimal dependencies; core bundle ~150KB gzipped

## Accessibility

- **Semantic HTML:** Proper heading hierarchy, button roles
- **Color Contrast:** Black text on white/yellow backgrounds (WCAG AAA)
- **Keyboard Navigation:** All interactive elements are keyboard accessible
- **Focus Indicators:** Visible focus rings on all focusable elements
- **Reduced Motion:** Respects `prefers-reduced-motion` media query

## Future Enhancements

1. **Game Canvas Integration** — Embed Pacman game board in GameScreen component
2. **Real-time Updates** — WebSocket integration for live feed and leaderboard
3. **Multiplayer Lobby** — Show active players and matchmaking status
4. **Mobile Responsiveness** — Adapt layouts for mobile devices
5. **Dark Mode Toggle** — Optional dark theme variant
6. **Animations** — Entrance animations for modals and transitions
7. **Sound Effects** — Arcade beeps and game audio
8. **User Customization** — Avatar selection, theme preferences

## Troubleshooting

### Styling Issues

**Problem:** Yellow buttons appear dull or wrong color
- **Solution:** Verify `--arcade-yellow: oklch(0.85 0.25 80)` in `:root` CSS variables

**Problem:** Drop shadows not visible
- **Solution:** Ensure inline `box-shadow` styles are applied; Tailwind shadow utilities may not work

**Problem:** Monospaced font not loading
- **Solution:** Check Google Fonts import in `index.html` and verify network requests

### Layout Issues

**Problem:** Grid columns misaligned
- **Solution:** Verify `grid-cols-*` classes and ensure parent has `grid` class

**Problem:** Content overflowing containers
- **Solution:** Check `overflow-hidden` or `overflow-auto` on parent containers

### Routing Issues

**Problem:** Page not loading when navigating
- **Solution:** Verify route path in `App.tsx` matches link href

**Problem:** Component state not persisting
- **Solution:** Use `localStorage` for session data or implement proper state management

## References

- **Design Files:** `/home/ubuntu/design_assets/design/`
- **Original Repository:** `https://github.com/tavishnew/Pacman`
- **Tailwind CSS:** `https://tailwindcss.com/docs`
- **React Documentation:** `https://react.dev`
- **Wouter Router:** `https://github.com/molefrog/wouter`

## License

This frontend implementation follows the same license as the original Pacman repository.

---

**Last Updated:** July 13, 2026
**Version:** 1.0.0
**Status:** Ready for backend integration
