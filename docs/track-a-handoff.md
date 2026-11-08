# Track A handoff — what Track D needed from shared files

Track D (Gemini chats + lesson cards) is built on PaneOS Stage 1. Almost everything lives in files
Track D owns; this page lists the **only** shared-file changes, so Track A can review or move them.

## 1. Shared files — two additive lines

### `src/game/apps/registry.ts`

Added, purely additive:

```ts
import { Achievements } from "../scams/Achievements";
// ...
{
  id: "achievements",
  title: "Achievements",
  icon: "info",
  process: null,
  w: 540,
  h: 470,
  component: Achievements,
},
```

Why: the lesson cards need somewhere to be read, and the Start menu builds itself from `APPS`.
Nothing existing was reordered or removed, so it is a safe merge. If Track A would rather own the
Achievements app outright (likely, once Stage 2 ports `LureCard`), keep the entry and point
`component` at your version — the data it reads is `AI_SCAMS` from `src/game/scams/ai.ts`.

### `src/game/shell/StartMenu.tsx`

The Start menu is a hardcoded list rather than a loop over `APPS`, so the app was registered but
unreachable. One line was needed:

```ts
{ label: "Achievements", icon: "info", app: "achievements" },
```

If Track A later generates the Start menu from `APPS`, delete it - the registry entry alone will
then be enough.

**No other shared file was touched:** not `types.ts` (does not exist on this branch), not
`state.tsx` (does not exist), not `LureCard` (does not exist), not `Desktop.tsx`, not
`system/people.ts`, not `system/events.ts`, not `styles.css`.

## 1b. `src/styles.css` — chat spacing and reply-choice size

Small, scoped edit to the `pm-*` chat rules only (16 insertions, 2 deletions, line endings left as
CRLF so the diff stays readable):

- `.pm-msg` reserves `padding-bottom: 16px` for the NES balloon's tail and adds `margin-bottom: 18px`
  between messages, so a tail never overlaps the next speaker's name.
- `.pm-msg-who` goes from 7px to 10px with 6px of space under it.
- `.pm-log .nes-balloon` caps the bubble at `min(78%, 420px)` and wraps long words. The bubble text
  stays at the shell default (20px); it was briefly raised to 26px and reverted.
- `.os .pm-reply .pm-choice` raises the reply choices to 21px/1.15 (shell sits at 18px) and gives
  them `flex: 1 1 0` + `align-self: stretch`, so a pair is always the same width and height even when
  one label wraps to an extra line. The extra class also wins the specificity tie with NES.css
  `.is-small` without `!important`; stretch is on the choices only so Nudge keeps its own size.

Measured in the live page: bubbles 20px, choices 21px, a two-label pair both 218x64 with identical
tops (a 24px version and a `flex-basis: 45%` version both produced mismatched boxes). Speaker label
10px, 34px of clear space between a bubble's tail and the next name. The scripts top out at two
choices per node (11 nodes with two, 7 with one), so the pair layout is the one that matters.
Applies to both the scripted PingMe chats and the live Gemini ones, since they share `.pm-msg`.

## 2. `chat` app registration — already done, nothing needed

The brief asked me to request the `chat` app and the `chat` lure location. On PaneOS both already
exist: `registry.ts` registers `chat` → `apps/messenger/Chat.tsx`, and the window is opened by
`openChat()`. Track D hooks into that existing window instead of adding a second one.

## 3. Messenger integration (Track D files, for your review)

- `src/game/apps/messenger/Chat.tsx` — now a two-line router: contacts whose id starts with `ai-`
  get `<AiChat/>`, everyone else gets the unchanged scripted `ScriptedChat`.
- `src/game/apps/messenger/Messenger.tsx` — adds an **Unknown** group listing the four scammers, so
  they are reachable without inventing a new app.

## 4. Something Track A must eventually decide

`src/game/ai.functions.ts` is **not** at `src/server/ai.ts` as the brief says, because TanStack
Start's import protection blocks any client import that resolves inside a `server/` directory
(`[import-protection] Import denied ... Denied by file pattern: **/server/**`) — and the browser has
to import the `createServerFn` stubs. The file name is the only deviation; `LOVABLE_API_KEY` is
read there and nowhere else, and a test enforces that.

If Track A later adds a real `src/server/` convention, move it then — and move the test's expected
path with it (`src/game/scams/ai.test.ts`, "the API key never reaches the browser").

## 5. What Track A gets for free

- `scamStore` (`vh-scams`) already persists unlocked card ids: `useScams()`, `unlockScam(id)`,
  `isUnlocked(id)`, `unlockedCount()`. A Stage 2 achievement UI can subscribe without a rewrite.
- Every chat turn emits nothing new — no edits to `system/events.ts` were needed. If Stage 2 wants
  quest hooks, `chat.reply` still fires exactly as before for scripted chats; a suggested addition
  is `{ type: "scam.fell"; cardId }` emitted from `AiChat` once you own the event union.
