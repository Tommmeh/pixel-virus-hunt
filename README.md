# Virus Hunt

A browser game that puts you in front of a fake 2004-era PC — **PaneOS** — so you can meet real
scams somewhere it costs nothing to get them wrong.

Play it, get caught out, and find out what happened **afterwards**.

## The one rule

**Never warn the player at the moment of the mistake.**

No red banners, no "are you sure?", no pop-up explaining that the nice support person was a
scammer. The consequences speak for themselves and the lesson lives on an achievement card the
player reads later, when they are actually ready to learn it.

## What is in the box

PaneOS is a working desktop drawn in NES.css pixel style: windows you drag around, a taskbar and
Start menu, a Control Panel with themes and wallpapers, My Computer with real folders and files,
WebVoyager with playable fake websites, HotPost Mail, Copperleaf Bank, FriendSpace, Notepad, Mines,
and PingMe Messenger.

Scams arrive where they really arrive — in chat, in email, on a website — and each one you fall for
unlocks a lesson card.

## The live scammer chats (Track D)

The Messenger has an **Unknown** group with four contacts who message you out of nowhere:

| Contact | The scam | What they want |
|---|---|---|
| `SysAssist_Support` | Fake tech support | Remote access, and the code `QC-4471-882` read back to them |
| `sarah_s_2004` | "Friend stranded abroad" | A gift card code |
| `Alex_D_2004` | Romance | Money and personal details |
| `HotPost_Security` | Fake fraud team | A one-time code and your password |

Each conversation is written live by **Gemini** through a server function, and each one has a
scripted fallback so the demo cannot break without a network.

### How the "you fell for it" decision is made

Not by the model. A model is a good liar and a bad judge. The verdict comes from a deterministic
check on **your own message** in `src/game/scams/ai.ts`:

- you typed one of the game's fake secrets (the support code, the gift card code, the one-time
  code, the password that is written in your own `notes.txt`), or
- you went along with it ("ok, I'll install it", "sure, here's the code")

…unless you pushed back. A refusal always wins: "no, I won't share that" is never counted against
you, even though it contains words the compliance pattern matches.

Because the rule lives in pure shared code, Gemini and the offline fallback can never disagree
about what happened.

### Safety rails around the model

- `LOVABLE_API_KEY` is read from the environment **inside a server function only**. It is never
  imported by browser code and a test fails if it appears in any other non-test source file.
- Replies are sanitised: links, long numbers and real brand names are stripped out, while the fake
  codes the scammer is supposed to hand over are preserved.
- History is capped at 12 turns, player messages at 400 characters, replies at 220 output tokens.
- Every persona is PG, fictional, and has at least three scripted lines.

## Running it

```sh
npm install          # bun install also works; bun.lock is committed
npm run dev          # http://localhost:8080
npm test             # vitest
npx tsc --noEmit     # strict type check
npm run lint         # eslint + prettier
```

To get live Gemini replies, put a key in `.env` (never commit it, never put it in client code):

```
LOVABLE_API_KEY=...
# optional: override the model
LOVABLE_CHAT_MODEL=google/gemini-3.7-flash
```

Without a key the game still works end to end — the chat answers from its scripted lines and the
same lesson card unlocks. That path is deliberate, not a degraded mode.

## Architecture, briefly

```
src/game/
  system/     the "OS": stores, window manager, event bus, virtual file system, settings, contacts
  shell/      boot screen, desktop, window chrome, taskbar, start menu, balloons
  apps/       one folder per program; registry.ts lists them all
    messenger/  PingMe: scripts.ts (scripted chats), store.ts, Chat.tsx, AiChat.tsx
  scams/      Track D — ai.ts (personas + rules), store.ts (cards + threads), Achievements.tsx
  ai.functions.ts   server-only Gemini calls (see note below)
```

`src/game/ai.functions.ts` is not at `src/server/ai.ts` because TanStack Start's import protection
refuses any client import that resolves inside a `server/` directory, and the browser must import
the `createServerFn` stubs. The handlers themselves are compiled to server RPCs and stripped from
the client bundle.

Fictional brands only — PaneOS, PingMe, WebVoyager, Searchly, HotPost, Copperleaf Bank,
FriendSpace, The Daily Byte. Nothing is ever fetched from the outside world.

## Docs

- `docs/pitch/slides.md` — six pitch slides
- `docs/pitch/demo-script.md` — the two-minute demo, including the offline plan
- `docs/content-qa.md` — read-only content review of the scam cards
- `docs/track-a-handoff.md` — the only shared-file changes Track D needed

## Built with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4bafb1ff-2569-4aa3-b695-03292aea7d06).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into
  Lovable, ready for your next prompt.

`main` syncs to Lovable — keep it working and never force-push.
