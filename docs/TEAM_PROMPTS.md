# Team prompts

Paste the prompt for your track into your AI assistant (Claude, Gemini, Cursor…). Each one stands on its own.
They all build on the shared foundation (`src/game/types.ts`, `LureCard`, `useUnlock`, `useDesktop`,
`apps/registry.ts`, `scams/*`), which is already in the repo. See `CLAUDE.md` for file ownership.

> Track A's first pass (pixel icons, tray, popup scheduler, system scams, achievements polish, title screen)
> was done together with the foundation. Use Prompt 1 for further polish.

---

## Prompt 1: Track A, Platform & Desktop

```
You're helping build "Virus Hunt", a HackCamp 2026 cybersecurity-awareness web game
(React 19 + TypeScript, TanStack Start with SSR, Tailwind v4, NES.css, "Press Start 2P" font, bun).
Repo: github.com/Tommmeh/pixel-virus-hunt. Players explore a fake 2004-style Windows PC. Every scam
they fall for unlocks an achievement. The Achievements tab lists all scams (locked = "???" + a vague
hint). Core rule: NEVER warn the player when they make the mistake; the lesson lives only on the
unlocked achievement card.

First read CLAUDE.md, AGENTS.md, src/game/types.ts, src/game/state.tsx and
src/game/components/LureCard.tsx, and follow their conventions.

I own Track A: Platform & Desktop.
My files: src/game/Desktop.tsx, Window.tsx, state.tsx, types.ts, desktop-context.ts, apps/registry.ts,
apps/Achievements.tsx, apps/WifiPicker.tsx, components/*, src/styles.css, src/game/scams/system.ts,
Screens.tsx.
Do NOT edit: apps/Email.tsx, scams/email.ts, apps/Browser.tsx, scams/web.ts, apps/Chat.tsx,
scams/ai.ts, src/server/*. I own the shared contract (types.ts, state.tsx, LureCard, registry,
useDesktop). Any change to it must stay backwards compatible, and I'll tell the team before merging.

Tasks, in order (one small PR each):
1. Replace the emoji desktop/start-menu icons with chunky pixel-art icons (inline SVG or CSS),
   matching NES.css. Nothing glossy or modern.
2. Taskbar tray: a Wi-Fi icon that opens a network-picker window built from `tray` lures, plus a
   volume icon and the clock.
3. Popup scheduler polish: random `popup` lures every 30–45s, max 2 on screen, draggable, closable,
   never covering the Achievements window.
4. Add 4–5 system scams to scams/system.ts (ids prefixed "sys-"): fake tech-support "call this number"
   popup, "SpeedBoost 2004" scareware, "You are visitor 1,000,000" prize, the found USB drive
   "Removable Disk (E:)", fake "Windows Update required" popup. Each needs name, icon, era
   (retro/modern), type, a vague hint, whatHappened, 2–4 redFlags, tip, and a lure with bait + safe buttons.
5. Achievements polish: unlock animation, 8-bit unlock sound (Web Audio, with a mute toggle),
   retro/modern filter, a celebration screen at 100%.
6. Title screen: "Get Infected. Collect Them All. Stay Safe." with Continue/Reset and a progress count.

Rules: use fictional brands only (no real company logos/names). Guard browser-only APIs
(window, localStorage, Audio) for SSR. Work on branch `track-a-desktop`. Run `bun run test` and
`bun run lint` before every PR. Never force-push (main syncs to Lovable). Don't edit
src/routeTree.gen.ts or the plugin list in vite.config.ts.
Done when: all locations render, every sys- scam unlocks once with a toast, progress survives a
refresh, and tests and lint pass.
```

## Prompt 2: Track B, Email Scams

```
You're helping build "Virus Hunt", a HackCamp 2026 cybersecurity-awareness web game
(React 19 + TypeScript, TanStack Start with SSR, Tailwind v4, NES.css, bun).
Repo: github.com/Tommmeh/pixel-virus-hunt. Players explore a fake 2004-style Windows PC. Every scam
they fall for unlocks an achievement shown in an Achievements tab. Core rule: NEVER warn the player
when they make the mistake; the lesson lives only on the unlocked achievement card.

First read CLAUDE.md, AGENTS.md, src/game/types.ts and src/game/components/LureCard.tsx, and
follow their conventions. Award achievements ONLY via `useUnlock()`. Open other apps ONLY via
`useDesktop().openApp(...)` (src/game/desktop-context.ts).

I own Track B: Email & messaging scams.
My files: src/game/apps/Email.tsx, src/game/scams/email.ts (and new files under src/game/apps/email/).
Do NOT edit shared files (types.ts, state.tsx, desktop-context.ts, LureCard, registry.ts, Desktop.tsx);
ask the Track A owner instead. Don't edit other tracks' files (Browser, Chat, scams/web.ts,
scams/ai.ts, scams/system.ts).

Tasks, in order (one small PR each):
1. Turn the "HotPost Mail" app into a believable inbox: Inbox/Junk/Sent folders, unread in bold,
   dates, a display name you can hover to reveal the real sender address, an attachments list, and
   links (a link can call openApp("browser", { url })).
2. Mix in 5+ harmless, normal emails (family, newsletter, IT notice) so not every email is a scam.
   Spotting the difference is the skill.
3. Add 7–9 email scams to scams/email.ts (ids prefixed "email-"), retro and modern: account
   "verify now" phishing, Invoice_8823.pdf.exe double extension, CEO gift-card request, parcel
   "pay a £1.99 redelivery fee", fake recruiter InterviewSetup.exe, weak password "password123",
   advance-fee "foreign prince" inheritance, tax-refund phishing, sextortion "I hacked your webcam".
   Each needs name, icon, era, type, a vague hint, whatHappened, 2–4 redFlags, tip, and a lure with
   a bait action and an optional safe action.
4. Make the red flags visible inside the email itself (typo domains, urgency, mismatched sender,
   odd attachments), so a careful player can spot them.

Rules: fictional brands and domains only (e.g. HotPost, hotp0st-secure.example). No real company
names or logos, and no real phone numbers. Keep content PG. Branch `track-b-email`. Run
`bun run test` and `bun run lint` before every PR. Never force-push (main syncs to Lovable).
Done when: every email- scam unlocks exactly once via its bait, safe actions do nothing visible,
and tests and lint pass (the scams test checks for unique ids).
```

## Prompt 3: Track C, Browser & Web Scams

```
You're helping build "Virus Hunt", a HackCamp 2026 cybersecurity-awareness web game
(React 19 + TypeScript, TanStack Start with SSR, Tailwind v4, NES.css, bun).
Repo: github.com/Tommmeh/pixel-virus-hunt. Players explore a fake 2004-style Windows PC. Every scam
they fall for unlocks an achievement shown in an Achievements tab. Core rule: NEVER warn the player
when they make the mistake; the lesson lives only on the unlocked achievement card.

First read CLAUDE.md, AGENTS.md, src/game/types.ts and src/game/components/LureCard.tsx, and
follow their conventions. Award achievements ONLY via `useUnlock()`. The Browser receives
`{ url }` args from `openApp("browser", { url })`, which other apps (e.g. Email) use to link to your pages.

I own Track C: Browser & web scams.
My files: src/game/apps/Browser.tsx, src/game/scams/web.ts (and new files under src/game/apps/browser/,
e.g. a pages registry for normal, non-scam sites).
Do NOT edit shared files (types.ts, state.tsx, desktop-context.ts, LureCard, registry.ts, Desktop.tsx);
ask the Track A owner instead. Don't edit other tracks' files.

Tasks, in order (one small PR each):
1. A real-feeling retro browser: an editable address bar, Back/Home buttons, a Favorites bar, a
   "page not found" page, and a fictional portal homepage and search engine.
2. 4–5 normal, harmless sites (news, weather, an official game store, a webmail login on the
   correct domain) so players have to compare against the scam versions.
3. Add 6–8 web scams to scams/web.ts (ids prefixed "web-"): warez forum free_game_crack.exe with
   fake "DOWNLOAD" buttons, crypto "send 0.1 BTC get 0.2 back" giveaway, lookalike login page
   (hotp0st vs hotpost), too-good-to-be-true online shop, fake antivirus download, "Allow
   notifications to continue" prompt, fake "your browser is out of date" update, typosquatted URL
   (typing a misspelled address lands on a scam). Each needs name, icon, era, type, a vague hint,
   whatHappened, 2–4 redFlags, tip, and a lure with bait + optional safe action.
4. Put visible red flags on the pages (wrong domain, no padlock, countdown timers, fake reviews).

Rules: fictional brands and domains only. No real company names/logos, and no real crypto
addresses or real links that leave the game. Branch `track-c-browser`. Run `bun run test` and
`bun run lint` before every PR. Never force-push (main syncs to Lovable).
Done when: every web- scam unlocks once via its bait, email links open the right page, and tests
and lint pass.
```

## Prompt 4: Track D, Gemini AI & Pitch

```
You're helping build "Virus Hunt", a HackCamp 2026 cybersecurity-awareness web game
(React 19 + TypeScript, TanStack Start with SSR and server functions, Tailwind v4, NES.css, bun),
originally built with Lovable. Repo: github.com/Tommmeh/pixel-virus-hunt. Players explore a fake
2004-style Windows PC. Every scam they fall for unlocks an achievement in an Achievements tab.
Core rule: NEVER warn the player when they make the mistake; the lesson lives only on the
unlocked achievement card.

First read CLAUDE.md, AGENTS.md, src/game/types.ts and src/game/components/LureCard.tsx.
AGENTS.md requires model calls to go through Lovable's AI gateway (it serves Gemini models) using
LOVABLE_API_KEY on the SERVER only. Never put the key in browser code. Check Lovable's AI gateway
docs for the current endpoint and Gemini model name before coding. If we choose a direct Gemini
API key instead, store it in Lovable Secrets and still call it only from the server.

I own Track D: Gemini AI features + pitch.
My files: src/server/ai.ts (TanStack Start server functions), src/game/apps/Chat.tsx,
src/game/scams/ai.ts, README.md, docs/pitch/*.
Do NOT edit shared files (types.ts, state.tsx, desktop-context.ts, LureCard, registry.ts, Desktop.tsx);
ask the Track A owner to register the Chat app in apps/registry.ts and add "chat" to the rendered
locations in scams.test.ts. Don't edit other tracks' files.

Tasks, in order:
1. Live scammer chat ("Messenger" app): Gemini role-plays scammer personas defined as data in
   scams/ai.ts (ids "ai-"): fake tech support asking for a remote-access code, a "friend stuck
   abroad" needing a gift card, a romance scammer, a fake bank fraud team asking for a one-time code.
   The server function sends the persona system prompt + chat history and returns
   { reply, playerFellForIt }. Also do a deterministic check: the game gives the player fake
   secrets (e.g. passwords.txt on the desktop, a fake card in a wallet note). If the player's
   message contains one, call useUnlock(). Cap tokens and history length, keep it PG, never output
   real links/numbers/brands.
2. Scripted fallback for every persona (fixed lines) when the API fails or is offline, so the
   demo can't break.
3. Stretch: Gemini generates fresh variants of phishing emails each run (coordinate the data shape
   with Track B), or an "Ask the IT guy" button on unlocked achievement cards that explains the red flags.
4. Content QA across ALL scams (read-only): check that red flags and tips are accurate and current,
   and suggest fixes to owners via PR comments.
5. Pitch: README rewrite, a 2-minute demo script that unlocks 4–5 achievements including the live
   chat, and 5–6 slides (problem, concept, demo, how Gemini is used, impact, next steps).

Branch `track-d-ai`. Run `bun run test` and `bun run lint` before every PR. Never force-push
(main syncs to Lovable).
Done when: the chat unlocks achievements both with Gemini and with the fallback, no key ships to
the client, and the demo script runs end to end.
```
