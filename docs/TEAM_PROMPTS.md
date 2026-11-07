# Team prompts — Stage 1 (a normal, working PC)

Everything uses NES.css classes (nes-btn, nes-input, nes-container…) + the PaneOS palette tokens; see CLAUDE.md → Conventions.
Never use NES.css's character sprites (Mario, Kirby, Pokémon, Octocat…).

Paste the prompt for your track into your AI assistant (Claude, Gemini, Cursor…). Each one stands on its own.
The Stage 1 base (PaneOS shell, apps, websites, messenger) is already built; these prompts are for polishing and
extending it. **No viruses, scams or achievements in Stage 1** — those come in Stage 2.

The earlier Stage 2 (scam achievement) prompts are kept in git: `git show fe51eaf:docs/TEAM_PROMPTS.md`.

---

## Prompt A: Shell, themes & settings

```
You're helping build "Virus Hunt", a HackCamp 2026 web game (React 19 + TypeScript, TanStack Start with SSR,
Tailwind v4, NES.css for the pixel look). It simulates a retro 2004 PC called "PaneOS" (a Windows-style desktop drawn in NES.css style) so people can later
practise spotting scams safely. We're in Stage 1: a normal, working PC with NO viruses, scams or achievements.

First read CLAUDE.md and AGENTS.md, then src/game/system/windows.ts, src/game/shell/* and src/styles.css.

I own Track A: the shell and shared core.
My files: src/game/system/*, src/game/shell/*, src/game/apps/registry.ts, src/game/apps/settings/*,
src/game/apps/taskmgr/*, src/game/apps/explorer/*, src/game/components/*, src/styles.css (shared tokens).
Other people own apps/webvoyager/* (Track C), apps/webvoyager/sites/hotpost + friendspace (Track B) and
apps/messenger/* (Track D). Changes to shared APIs (wm, stores, events, registry) must stay backwards compatible.

Tasks (one small PR each):
1. Desktop polish: drag desktop icons to rearrange (persist positions), right-click desktop menu
   (Arrange Icons, Refresh, Properties → Settings), keyboard: Alt+Tab-style window switching, Esc closes menus.
2. Windows: resize from all edges, snap to screen edges, minimize/restore animation, remember last position.
3. Explorer: list/details view toggle, New Folder in My Documents, Delete → Recycle Bin with Restore/Empty.
4. Settings: screen saver (starts after 60s idle), desktop background picker with thumbnails, more themes.
5. A simple "Picture Viewer" app so .jpg files open (draw placeholder pictures in CSS/SVG, no real photos).
6. Keep every NES palette working (classic/night/pocket/retro) — use the CSS tokens, never hard-code colours.

Rules: fictional brands only. Guard browser-only APIs for SSR. Branch `track-a-shell`. Run `npm test`,
`npx tsc --noEmit` and `npm run lint` before every PR. Never force-push (main syncs to Lovable).
Don't edit src/routeTree.gen.ts or the plugin list in vite.config.ts.
```

## Prompt B: HotPost Mail & FriendSpace

```
You're helping build "Virus Hunt", a HackCamp 2026 web game (React 19 + TypeScript, TanStack Start with SSR).
It simulates a retro 2004 PC called "PaneOS" (Windows-style layout in NES.css pixel style) so people can later practise spotting scams safely.
We're in Stage 1: a normal, working PC with NO viruses, scams or achievements.

First read CLAUDE.md and AGENTS.md, then src/game/apps/webvoyager/sites/hotpost/* and
src/game/apps/webvoyager/sites/friendspace/*, plus src/game/system/people.ts and events.ts.

I own Track B: the email site (HotPost Mail, mail.hotpost.com) and the social site (FriendSpace).
My files: src/game/apps/webvoyager/sites/hotpost/*, src/game/apps/webvoyager/sites/friendspace/*.
Don't edit the browser itself (apps/webvoyager/WebVoyager.tsx, Track C) or shared system files (Track A) —
ask the owner. Keep data in each site's createStore("vh-…") and emit events from system/events.ts.

Tasks (one small PR each):
1. HotPost: Junk folder, Delete/Trash, unread counts, attachments shown as file chips, Forward, address book
   from people.ts, "Remember me" checkbox, search inbox.
2. More ordinary emails (school newsletter, game shop receipt, library reminder, friends' chain email) so the
   inbox feels lived-in. Write them as data in SEED_INBOX.
3. FriendSpace: profile pages for each contact (/profile?u=alex), comments on posts, photo albums drawn in CSS,
   privacy settings page (who can see my posts) — these become quest material later.
4. Emit useful events for later quests (e.g. social.comment, mail.delete) — add the event types in
   system/events.ts via a small PR to Track A.

Rules: fictional brands, domains and people only; keep content PG. Branch `track-b-sites`. Run `npm test`,
`npx tsc --noEmit` and `npm run lint` before every PR. Never force-push (main syncs to Lovable).
```

## Prompt C: WebVoyager, Copperleaf Bank & Searchly

```
You're helping build "Virus Hunt", a HackCamp 2026 web game (React 19 + TypeScript, TanStack Start with SSR).
It simulates a retro 2004 PC called "PaneOS" (Windows-style layout in NES.css pixel style) so people can later practise spotting scams safely.
We're in Stage 1: a normal, working PC with NO viruses, scams or achievements.

First read CLAUDE.md and AGENTS.md, then src/game/apps/webvoyager/* (WebVoyager.tsx, url.ts, catalog.ts,
sites/registry.ts, sites/copperleaf/*, sites/Searchly.tsx).

I own Track C: the WebVoyager browser, Copperleaf Bank, Searchly, The Daily Byte and new websites.
My files: src/game/apps/webvoyager/* except sites/hotpost and sites/friendspace (Track B).
Don't edit shared system files (Track A) — ask the owner.

Tasks (one small PR each):
1. WebVoyager: tabs or multiple windows, History list, add/remove Favorites (persisted), View Source joke page,
   a padlock info dialog showing the site name and https status (important for later phishing quests).
2. Copperleaf Bank: statements page, saved payees, "security questions" settings page, session timeout that logs
   you out after 5 minutes idle.
3. New harmless sites: an official game store (Galaxy Blasters 3), a weather site, a school website with
   homework links, a music download store. Add them to catalog.ts (+ search index) and sites/registry.ts.
4. Searchly: results pages with ads labelled "Sponsored", image-free "Images" tab, spelling suggestions.

Rules: fictional brands and domains only, nothing ever fetched from the real internet. Branch
`track-c-browser`. Run `npm test`, `npx tsc --noEmit` and `npm run lint` before every PR. Never force-push.
```

## Prompt D: PingMe Messenger (Gemini later)

```
You're helping build "Virus Hunt", a HackCamp 2026 web game (React 19 + TypeScript, TanStack Start with SSR and
server functions). It simulates a retro 2004 PC called "PaneOS" (Windows-style layout in NES.css pixel style) so people can later practise spotting
scams safely. We're in Stage 1: a normal, working PC with NO viruses, scams or achievements.

First read CLAUDE.md and AGENTS.md, then src/game/apps/messenger/* (scripts.ts, store.ts, Messenger.tsx,
Chat.tsx, MessengerService.tsx) and src/game/system/people.ts.

I own Track D: PingMe Messenger, and later the Gemini integration and the pitch.
My files: src/game/apps/messenger/*, src/server/* (later), README.md, docs/pitch/*.
Don't edit shared system files (Track A) — ask the owner.

Tasks (one small PR each):
1. More scripted conversations for every contact (2–3 each), including ones a contact starts by themselves
   (opensAfterMs) at different times, so the PC feels alive. Keep `scripts.test.ts` passing.
2. Messenger features: emoticons (text → emoji), "is typing" sounds, chat history window, block contact, add
   contact by email, personal message editing, group chat with two contacts.
3. File transfer UI in chats (a contact sends "holiday_photos.zip" → accept/decline). Harmless in Stage 1, but
   this is where Stage 2 quests will hook in.
4. Prepare Gemini (Stage 3): design a server function in src/server/ai.ts that would take a persona + history
   and return a reply, using Lovable's AI gateway with LOVABLE_API_KEY on the server only, plus a scripted
   fallback. Don't ship it to users until the team agrees.
5. Pitch: README rewrite and a 2-minute demo script of the Stage 1 PC.

Rules: fictional people and brands only; keep content PG. Branch `track-d-messenger`. Run `npm test`,
`npx tsc --noEmit` and `npm run lint` before every PR. Never force-push (main syncs to Lovable).
```
