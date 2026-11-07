# Virus Hunt

**Play. Get Infected. Stay Safe.**

A browser game that teaches cybersecurity awareness by letting you fall for real scams inside a fake 2004 Windows PC — and only telling you what you did wrong _after_ you've done it.

Built for HackCamp 2026 with React 19, TypeScript, TanStack Start, Tailwind v4 and NES.css.

---

## The idea

Most security training opens with a warning. Players click past it.

Virus Hunt does the opposite. You sit down at a period-accurate Windows XP desktop: a taskbar, a Wi-Fi tray icon, an inbox, a browser. Scams arrive looking exactly the way they looked in 2004 — a found USB stick labelled _Salaries 2004_, a recruiter who loved your CV, a popup counting down to your free iPod.

You are never warned. Nothing says "this is a phishing email". You click, and the scam resolves.

**The lesson lives on the achievement card.** Every scam you fall for unlocks a card in the Achievements tab: what really happened, the red flags you missed, and one concrete thing to do differently. Locked cards show only a hint. The teaching happens on the card, not in the moment — which is the whole point, because real life doesn't warn you either.

## What's in the desktop

| App                                          | What it's for                                            |
| -------------------------------------------- | -------------------------------------------------------- |
| **Internet**                                 | Browsing, including a warez site offering a game "crack" |
| **Email**                                    | Inbox with recruiter and account-signup lures            |
| **Messenger**                                | A live, AI-driven conversation with a scammer            |
| **Wi-Fi tray**                               | Network picker with an open café network                 |
| **Achievements**                             | Every scam in the game, locked and unlocked              |
| **Task Manager / File Explorer / Antivirus** | The dormant infection model, kept for consequences       |

Scams are pure data (`src/game/scams/`), grouped by the track that owns each file, so new content never needs a component change.

## The live scammer chat (Track D)

The Messenger app is the part that isn't scripted. Four personas, each a different con:

| Persona            | The con                                                  | What they're after   |
| ------------------ | -------------------------------------------------------- | -------------------- |
| `ai-techsupport`   | "Dave from SysAssist" — your PC is sending error reports | A remote-access code |
| `ai-friend-abroad` | "Sarah" — bag stolen abroad, needs a hotel tonight       | Gift-card codes      |
| `ai-romance`       | "Alex" — new romance, mother in hospital                 | Gift-card codes      |
| `ai-bank`          | "HotPost fraud desk" — two suspicious payments           | A one-time code      |

Gemini role-plays the scammer against the player's actual messages, so no two runs are identical. The personas are data in `src/game/scams/ai.ts`.

### How "you fell for it" is decided

Deliberately **not** by the model. A deterministic check on the server decides, so the game behaves identically online and offline:

1. **Leaked secrets.** The fake PC hands you secrets — `passwords.txt` on the desktop, a card in a wallet note, a one-time code, a remote-access code. If your message contains one (any casing or spacing), it counts as leaked and the matching secret card unlocks.
2. **Going along with it.** Each persona has compliance phrasing (`"I'll buy the gift cards"`), guarded by a refusal check so `"I'm not sending anything, this is a scam"` never counts against you.

The model only supplies the words. Both paths run through `resolveChatTurn()`, so Gemini and the fallback can never disagree about what happened.

### It cannot break on stage

Every persona ships a fixed scripted conversation. If the gateway is unreachable, rate-limited, slow (12s timeout), or returns something unsafe, the chat plays the next scripted line and **still unlocks achievements**. The window shows a discreet `Messenger: offline, replies are scripted` note so you know which mode you are in.

### Guardrails

- **Key stays server-side.** The gateway key is read only in `src/game/ai.functions.ts`, inside `createServerFn` handlers that compile to server RPCs and are stripped from the client bundle. A test fails if any other module references it.
- **Capped.** History trimmed to 12 messages, input to 400 characters, `max_tokens` 220, 12-second timeout.
- **No real links, numbers or brands.** Model output passes through `sanitizeReply()`: URLs, bare domains, emails and long digit runs become `[link removed]` / `[number removed]`, and real payment or remote-tool brand names are swapped for the in-world equivalents (PixelGift, SysAssist, HotPost).
- **PG.** Anything off-colour is replaced by the scripted line instead of being shown.
- **Never warns.** The system prompt forbids the scammer from mentioning the game, explaining the scam, or coaching the player.

### Gateway details

- Endpoint: `https://ai.gateway.lovable.dev/v1/chat/completions` (OpenAI-compatible)
- Model: `google/gemini-3.8-flash` — Lovable's current recommended chat model; override with the `LOVABLE_CHAT_MODEL` environment variable
- Auth: `Authorization: Bearer $LOVABLE_API_KEY`, set as a Lovable secret or server env var. Never in the repo, never in the browser.

To move to a different provider later, change `GATEWAY_URL` and the model id in `src/game/ai.functions.ts`; nothing else needs to move.

## Run it

```bash
bun install
bun run dev
```

The chat needs a gateway key on the server:

```bash
# .env (never commit this)
LOVABLE_API_KEY=...
```

Without a key the game still runs: the chat falls back to its scripted conversations.

```bash
bun run test    # vitest: game rules, scam data invariants, chat logic
bun run lint    # eslint + prettier
```

> **Windows note:** this checkout has `core.autocrlf=true`, so files are LF in git but CRLF on disk. Prettier expects LF, so `bun run lint` reports thousands of `Delete ␍` errors in files nobody touched. That is a line-ending artefact, not a code problem. Fix it once per clone with `git config core.autocrlf false` and a re-checkout, or accept it and lint only the files you changed.

## Architecture

```
src/game/types.ts              Shared contract: Scam, Lure, LureLocation (incl. "chat")
src/game/state.tsx             Single reducer; useUnlock() is the only way to award a card
src/game/scams/ai.ts           Track D: personas, secrets, fallbacks, guardrails, turn logic
src/game/apps/Chat.tsx         Track D: the Messenger window + "Ask the IT guy"
src/game/ai.functions.ts               Track D: server functions calling Lovable's gateway
src/game/apps/registry.ts      App registry (Track A owns this)
src/game/apps/Achievements.tsx Achievements tab (Track A owns this)
```

### Stretch: "Ask the IT guy"

`AskItGuy` (in `Chat.tsx`) is a drop-in for an unlocked achievement card. It asks Gemini to explain that card's red flags in plain language, grounded strictly in the card's own text, and falls back to the card's own flags if the API is down.

## Docs

- `docs/pitch/slides.md` — six-slide pitch
- `docs/pitch/demo-script.md` — the two-minute demo, including the offline fallback
- `docs/content-qa.md` — accuracy review of every scam in the game, with suggested fixes
- `docs/track-a-handoff.md` — how the Chat app is registered, and what the fake secret props still need

## Project notes

Built with [Lovable](https://lovable.dev). `main` syncs back to the Lovable editor, so avoid force-pushing or rewriting published history.

Content rules for contributors: never warn the player at the moment of the mistake; keep every lure free of real URLs, phone numbers and card numbers (use `.example`); put the lesson on the achievement card.
