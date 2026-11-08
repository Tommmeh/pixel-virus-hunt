# Virus Hunt — CLAUDE.md

@AGENTS.md

HackCamp 2026 project (team of 4). A browser game that simulates a retro 2004-style PC ("VirusHuntOS": a Windows-style desktop drawn in NES.css pixel style)
so people can **experience scams and malware safely instead of on their real machine**.

## Roadmap (4 stages)

1. **Stage 1 — a normal, working PC (current).** No viruses, no scams, no achievements. It has to feel like a
   real computer: windows, taskbar, Start menu, tray settings, drives, browser with websites, messenger.
2. **Stage 2 — questlines.** Scam/virus quests built on top of Stage 1 (emails, websites, chats, USB files),
   plus achievements. The earlier scam-achievement prototype is in git (commit `fe51eaf`, branch
   `track-a-desktop`: `src/game/scams/`, `Achievements`, `LureCard`) and can be ported.
3. **Stages 3–4 — to be decided by the team** (e.g. Gemini-powered scammer chats, consequences/cleanup).

**Design rule (for Stage 2+):** never warn the player at the moment of the mistake. Lessons come afterwards.

## Commands

bun is the project's package manager (`bun.lock`). Without bun, use npm but don't commit a `package-lock.json`.

- Install: `bun install` or `npm install --no-package-lock`
- Dev server: `npm run dev` → http://localhost:8080
- Tests: `npm test`. Single file: `npx vitest run src/game/system/windows.test.ts`
- Type check: `npx tsc --noEmit` (strict: `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, so
  read args as `win.args?.["url"]`)
- Lint / format: `npm run lint`, `npm run format` (prettier is enforced through eslint)

## Stack

React 19 + TypeScript, TanStack Start/Router (**SSR**: guard `window`/`localStorage`/`Audio`), Tailwind v4
(config in `src/styles.css`), **NES.css** for the pixel look (imported in `src/styles.css`; fonts "Press Start 2P" +
"VT323" loaded in `src/routes/__root.tsx`). `src/components/ui/` is unused shadcn boilerplate. Path alias `@/` → `src/`.

## Architecture (`src/game/`)

```
system/      core "OS" — no React components
  store.ts       createStore(key|null, initial): tiny shared stores (useSyncExternalStore); "vh-*" keys persist
  windows.ts     window manager: pure wmReducer (tested) + `wm` API: open/close/focus/minimize/alert/flash/shake
  events.ts      event bus: emit()/useSystemEvent() — Stage 2 quests listen here
  session.ts     phase: boot → welcome → desktop → shutdown → off; logIn/logOff/turnOff
  settings.ts    theme, wallpaper, user name/avatar, volume, clock, wifi, chat status (persisted)
  fs.ts          virtual drives C: and E: (data) + persisted user files; listDir/readFile/writeFile
  people.ts      contacts shared by Messenger, HotPost Mail and FriendSpace
  profile.ts     the player's logins (same password everywhere, written in notes.txt — quest hook)
  notify.ts      balloon notifications above the tray
  processes.ts   system processes for Task Manager
shell/       BootScreen (boot/welcome/shutdown), Desktop, WindowFrame, Taskbar (+tray), StartMenu, Balloons
apps/        registry.ts lists every program; one folder per app:
  explorer/      My Computer / folders; open.ts decides which program opens a file
  webvoyager/    browser: url.ts, catalog.ts (site metadata + search index), sites/registry.ts (host → page)
    sites/       Searchly, hotpost/ (mail), copperleaf/ (bank), friendspace/ (social), DailyByte, NotFound
  messenger/     PingMe: scripts.ts (conversations as data), store.ts, Messenger (buddy list), Chat, MessengerService
  taskmgr/ settings/ notepad/ mines/ misc/ (MessageBox, RecycleBin)
components/  PixelIcon + icons.ts (16×16 grids), ui.tsx (Tabs, GroupBox, useNow, formatMoney), sound.ts
```

### How to add things

- **An app:** write `({ win }: { win: Win }) => JSX`, add an entry to `apps/registry.ts` (id, title, icon,
  process, size). Open it with `wm.open("id", args?, { key?, title? })`.
- **A website:** add metadata to `apps/webvoyager/catalog.ts` (`SITE_INFO`, optional `SEARCH_INDEX` entries)
  and a page component to `sites/registry.ts`. Pages get `{ url }` (host, path, query, secure); link with
  `<A href>` and `useBrowser().navigate()`. Keep each site's data in its own `createStore("vh-…")`.
- **A messenger conversation:** add nodes to `apps/messenger/scripts.ts` (`them` lines + `choices` → `next`).
  `opensAfterMs` makes the contact start the chat. The test checks every `next` exists and nodes are reachable.
- **An email:** add to `SEED_INBOX` in `sites/hotpost/store.ts`, or call `receiveMail()` at runtime.
- **A file:** add nodes to `DRIVES` in `system/fs.ts`. Text files open in Notepad; `program` files launch `app`.
- **An icon:** add a 16-row × 16-char grid to `components/icons.ts` (palette letters, `.` = transparent).

### Events (for Stage 2 questlines)

`app.open, site.visit, search, mail.signin, mail.open, mail.send, bank.login, bank.transfer, social.post,
social.friend, chat.message, chat.reply, file.open, file.save, drive.open, settings.change, session.login,
session.logoff` — see `system/events.ts`. Subscribe with `onEvent()` / `useSystemEvent()`.

### Persistence (localStorage)

`vh-settings`, `vh-fs`, `vh-mail`, `vh-bank`, `vh-social`, `vh-chat`. Windows, session phase and bank login are
session-only. Settings → Reset clears everything (`resetAllStores()`).

### Storylines (Stage 2)

Each virus storyline lives in its own folder, `src/game/storylines/<name>/`, with a small `story.ts` (persisted
stage + transitions), a `<Name>Service.tsx` mounted in `shell/Desktop.tsx` (timers, event listeners) and its own
pages/windows. Shared files only get small additive registrations (app registry, site catalog, desktop/Start menu).
- **Aaron — PhotoWorm** (`storylines/aaron/`, `vh-aaron`): Mum's FriendSpace post links to the lookalike
  `friendspace.com.photo-album.net` → "PhotoViewer" download → escalating pop-ups → swarm (closing one spawns two,
  capped at 24) → cleared by PaneGuard Antivirus.
- **Threats** (`system/threats.ts`, `vh-threats`): storylines `addThreat()` when the PC gets infected; **PaneGuard
  Antivirus** (`apps/antivirus/`) scans and `removeThreat()`s them, which emits `threat.removed` for the storyline.
- **Achievements:** each storyline defines `LessonCard`s in its folder (e.g. `storylines/aaron/cards.ts`), adds them
  to `scams/cards.ts`, and unlocks them silently with `unlockScam(id)` at the matching stage.

### Tutorial — Scout (`src/game/tutorial/`)

An original pixel magnifying-glass detective who auto-starts on first login (`vh-tutorial`), can be skipped, and is
replayed from Start → Tutorial or the "Scout's Tips" desktop icon. Story text can use `{name}` → the player's name
(`personalize()` in `system/profile.ts`). The script is data in `steps.ts`: each step can spotlight a `data-tour="..."`
element (add the attribute in the UI and the id to `TOUR_TARGETS`) and/or wait for a system event (`waitFor`).
It explains the layout and purpose, then walks the player into the HotPost inbox — the start of Anish's bank
storyline — and leaves before any scam (never warn at the moment of the mistake).

## Conventions

- **Fictional brands only:** VirusHuntOS, WebVoyager, PingMe, Searchly, HotPost, Copperleaf Bank, FriendSpace, The
  Daily Byte. No real companies, logos, phone numbers or links that leave the game. Nothing is ever fetched.
- **Look = NES.css** (https://nostalgic-css.github.io/NES.css/). Use its classes for controls: `nes-btn`
  (+ `is-small`, `is-primary`/`is-success`/`is-warning`/`is-error`), `nes-input`, `nes-textarea`,
  `nes-table is-bordered`, `nes-progress`, `nes-balloon`, `nes-container`. Helpers in `components/ui.tsx`:
  `Tabs`, `GroupBox`, `Select`, `Check` (checkbox/radio). Structural shell classes are `os-*` (`os-win`, `os-title`,
  `os-toolbar`, `os-status`…). Sizes are compacted under `.os` in `styles.css`.
- **Fonts:** "Press Start 2P" (`--font-sans`) for UI chrome — titles, buttons, menus, headings; "VT323"
  (`--font-body`) for reading text — emails, chats, Notepad, web page text, inputs.
- **Themes** are NES palettes as CSS variables on `.os[data-theme]`: `classic` (default), `night`, `pocket`, `retro`.
  Use the tokens (`--face`, `--text`, `--border`, `--sel`, `--title-a`…) so every theme works; old saved ids fall back
  via `resolveTheme()`. Wallpapers are pixel art generated in `shell/wallpaper.ts`.
- **Never use NES.css's character/brand sprites** (`nes-mario`, `nes-kirby`, `nes-ash`, Pokémon, `nes-octocat`,
  `nes-logo`…) — they're other companies' characters. Use `PixelIcon` instead.
- Window chrome is shared: never draw your own title bar. Use `wm.alert()` for message boxes.
- Update/add tests next to the code (`*.test.ts`) when changing system logic or data.

## Team, git and Lovable

- Shared core (`system/`, `shell/`, `apps/registry.ts`, `styles.css` tokens) has one owner (Track A). Others own
  their app folders. See `docs/TEAM_PROMPTS.md`.
- `main` syncs to Lovable: keep it working, **never force-push**. One branch per track, small PRs.
- Don't edit `src/routeTree.gen.ts` (the dev server may rewrite its line endings; restore it with git) or the
  plugin list in `vite.config.ts`.
- Gemini (later stages): call it from a TanStack Start server function via Lovable's AI gateway; never ship a key
  to the browser; always keep a scripted fallback.
