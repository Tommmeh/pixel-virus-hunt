# Virus Hunt — CLAUDE.md

@AGENTS.md

HackCamp 2026 project (team of 4). A browser game that simulates a retro 2004-style Windows PC so people can
**experience scams and malware safely instead of on their real machine**.

## Concept

- The player freely explores a fake PC: desktop, email, browser, Wi-Fi, popups, files.
- **Every scam they fall for unlocks an achievement.** The Achievements app lists every obtainable scam:
  locked = name hidden ("???") + a vague hint; unlocked = what happened, red flags, how to stay safe.
- Retro pixel look (NES.css + Win98 layout), but scams are both retro (USB worms, cracks) and modern
  (tech-support calls, phishing, crypto, parcel fees).
- **Design rule: never warn the player at the moment of the mistake.** No "are you sure?", no red text on the
  bait. The lesson lives only on the unlocked achievement card.
- For now unlocking is the only consequence. Infection/cleanup consequences (`malware.ts`) are dormant and may
  be switched back on later via `Scam.malwareId`.

## Commands

bun is the project's package manager (`bun.lock`). Without bun, use npm but **don't create a package-lock.json**.

- Install: `bun install` or `npm install --no-package-lock`
- Dev server: `bun run dev` / `npm run dev`
- Tests: `bun run test` / `npm test`. Single file: `npx vitest run src/game/scams/scams.test.ts`
- Type check: `npx tsc --noEmit` (strict: `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`)
- Lint / format: `npm run lint`, `npm run format` (prettier is enforced through eslint)
- Build: `npm run build` (Nitro, Cloudflare target)

## Stack

React 19 + TypeScript, TanStack Start/Router (file routes in `src/routes/`, **SSR**: guard `window`,
`localStorage`, `Audio` and read storage in `useEffect`), Tailwind v4 (config lives in `src/styles.css`),
NES.css, "Press Start 2P" font (loaded in `src/routes/__root.tsx`). `src/components/ui/` is unused shadcn
boilerplate from the Lovable template; the game uses NES.css + custom classes. Path alias `@/` → `src/`.

## Architecture (`src/game/`)

| File | Purpose |
|---|---|
| `types.ts` | **Shared contract**: `Scam`, `Lure`, `LureLocation` |
| `state.tsx` | Reducer + `GameProvider`, `useGame()`, **`useUnlock()`** (the only way to award an achievement), localStorage persistence |
| `desktop-context.ts` | **`useDesktop()`**: `openApp(id, args?)`, `closeApp(id)`, `openLure(scamId)` so apps can link to each other |
| `Desktop.tsx` | Window manager, desktop icons, Start menu, taskbar + tray (Wi-Fi, mute, trophy counter), popup scheduler, toast, 100% celebration |
| `Window.tsx` | Draggable window chrome (`variant="alert"` for popups) |
| `Screens.tsx` | Title screen (Start/Continue, progress, reset) |
| `components/LureCard.tsx` | **Shared** renderer for any lure: body + bait button (→ unlock) + optional safe button |
| `components/PixelIcon.tsx`, `icons.ts` | 16×16 pixel-art icons as char grids; unknown names render as text, so emoji work |
| `components/AchievementToast.tsx`, `sound.ts` | Unlock toast + 8-bit Web Audio jingles |
| `apps/registry.ts` | **Every app window** (id, label, icon, title, width, `listed`, component) |
| `apps/*.tsx` | Achievements, Email, Browser, WifiPicker, TaskManager, StartupPrograms, FileExplorer, Antivirus, RecycleBin |
| `scams/{system,email,web,ai}.ts` | Scam content, one file per track; `scams/index.ts` merges them into `SCAMS` |
| `malware.ts` | Dormant infection model (MALWARE, decoy legit processes/files/startup) used by the tool apps |

Lure locations → renderer: `email` → Email app, `browser` → Browser app (matched by `lure.url`), `popup` →
Desktop popup scheduler, `desktop` → desktop icon that opens a lure window, `tray` → Wi-Fi picker,
`chat` → reserved for Track D's Chat app (not registered yet).

### How to add a scam

1. Append a `Scam` to **your track's** file in `src/game/scams/` (id prefix `sys-`, `email-`, `web-` or `ai-`).
2. Fill in name, icon (key from `icons.ts` or an emoji), era, type, a vague `hint`, `whatHappened`,
   `redFlags`, `tip`, and a `lure` with a `location`, `body`, `bait` and optional `safe`.
3. Use fictional brands and domains only (`.example`, HotPost, WebStart…): no real companies, logos, phone
   numbers, crypto addresses or links that leave the game.
4. Run `npx vitest run src/game/scams/scams.test.ts`. It checks unique ids, prefixes, required fields, that
   the location has a renderer, unique browser URLs, and the pixel icon grids.

No component changes are needed unless you add a new lure location.

## Team tracks and file ownership

| Track | Owns |
|---|---|
| A, Platform & Desktop | `types.ts`, `state.tsx`, `desktop-context.ts`, `Desktop.tsx`, `Window.tsx`, `Screens.tsx`, `components/*`, `apps/registry.ts`, `apps/Achievements.tsx`, `apps/WifiPicker.tsx`, `scams/system.ts`, `src/styles.css` |
| B, Email scams | `apps/Email.tsx` (+ `apps/email/`), `scams/email.ts` |
| C, Browser scams | `apps/Browser.tsx` (+ `apps/browser/`), `scams/web.ts` |
| D, Gemini AI + pitch | `src/server/ai.ts`, `apps/Chat.tsx`, `scams/ai.ts`, README, `docs/pitch/` |

- Don't edit another track's files. Changes to the **shared contract** (`types.ts`, `state.tsx`,
  `desktop-context.ts`, `LureCard`, `registry.ts`) go through Track A and must stay backwards compatible.
- Per-member AI prompts are in `docs/TEAM_PROMPTS.md`.

## Git and Lovable

- `main` syncs to the Lovable editor: keep it working, **never force-push** or rewrite pushed history.
- One branch per track (`track-a-desktop`, `track-b-email`, `track-c-browser`, `track-d-ai`), small PRs into `main`.
- Don't edit generated files (`src/routeTree.gen.ts`) or the plugin list in `vite.config.ts`.

## Gemini (Track D)

Model calls go through Lovable's AI gateway with `LOVABLE_API_KEY` **on the server only** (TanStack Start
server functions in `src/server/`). Never ship a key to the browser. Every AI feature needs a scripted fallback
so the demo works offline.

## Conventions

- Keep the chunky pixel / Win98 look: NES.css classes (`nes-btn`, `nes-container`, `nes-progress`) plus custom
  classes in `src/styles.css` (`.win`, `.xp-table`, `.taskbar`, `.ach-card`, `.toast`…). Nothing glossy.
- Small text sizes (`text-[8px]`–`text-[10px]`) are deliberate because Press Start 2P is very wide.
- Custom CSS in `styles.css` is unlayered, so it beats Tailwind utilities on the same property. Use inline
  styles to override it.
- localStorage keys: `virushunt-achievements` (scam id → unlock time), `virushunt-muted`.
- Update tests (`src/game/state.test.ts`, `src/game/scams/scams.test.ts`) when changing rules or data.
