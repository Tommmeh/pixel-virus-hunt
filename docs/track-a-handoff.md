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

## 6. Zhuming's storyline (RAM Capital) — shared-file edits

Everything new lives in `src/game/storylines/zhuming/`. Eleven shared files gained small additive
edits, listed here so nobody loses track of them in a merge:

- `apps/webvoyager/catalog.ts` — one `SITE_INFO` entry for `www.stockladder-trade.com` (plain http,
  not a favourite, not in the search index).
- `apps/webvoyager/sites/registry.ts` — one host → `StockSite` mapping.
- `apps/webvoyager/sites/DailyByte.tsx` — renders the sponsored post from `article.ts` once `story.ts`
  has published it, plus the "Add … on PingMe" button on its article page. The five real articles are
  unchanged.
- `apps/messenger/scripts.ts` — `ALL_SCRIPTS = [...SCRIPTS, ...ZHUMING_SCRIPTS]`; `getScript` searches
  that. No existing script or node was touched.
- `apps/messenger/Messenger.tsx` — a "Recent" group with Kevin, shown only after the player adds him
  from the article (stage past `posted`). The existing Online/Offline/Unknown groups are unchanged.
- `system/people.ts` — `getPerson` falls back to `storyPeople()`, so the chat window and its title can
  find a contact a storyline introduces. `PEOPLE` itself is untouched: he is never in the buddy list
  before the add, and no real contact changed.
- `apps/registry.ts` — one app entry (`stockladder`).
- `scams/cards.ts` + `scams/cards.test.ts` — Zhuming's four cards appended to `LESSON_CARDS`; the
  length and prefix assertions now cover both storylines.
- `shell/Desktop.tsx` — mounts `<ZhumingService />` and shows the StockLadder desktop icon while the
  app is installed.
- `shell/startOver.ts` — resets `zhumingStore` and `marketStore` (`vh-stockladder`: the fake broker's
  cash, positions and the bank link it collected) alongside the other storylines.
- `storylines/zhuming/bank.ts` reads and debits `bankStore` (`vh-bank`, Copperleaf's own store)
  rather than editing Copperleaf: each StockLadder purchase debits the chequing account and adds a
  `STOCKLADDER TRADE <ticker>` line to its history. The board re-prices every 10s (`tick`): RAMH
  climbs 10p → 30p (+100% → +500%, from Kevin's 5p quote) and ordinary shares drift down to a 30p
  floor.
- `apps/messenger/scripts.ts` — Jordan Reyes (`jordan`, the player's friend) gained a `stock` entry
  node: once the player has spent £200 or banked £250 in StockLadder, `story.noteTrade` starts it
  and he warns them about the app (with the option to ignore him). The base script is otherwise
  untouched.
- Zhuming's later beats live in `story.ts`: `noteTrade` (threshold alert), `emergency` (Kevin's
  "invest everything" message), `wipe` (drains both Copperleaf accounts via `bank.drainEverything`,
  goes all-in on RAMH in `market.allIn`, and charges 9× the total as `STOCKLADDER MARGIN CALL`), and
  `sendWifeMail` (Emma's mail, sent 20 s later, with a clickable link to
  `https://www.copperleafbank.com/accounts`; mail bodies already auto-link http URLs).
  `ZhumingService` sends Kevin's emergency 5 s after the player answers J-Reyes' warning, then wipes
  unconditionally 10 s later — the all-in no longer depends on the player agreeing or closing the
  app, and only uninstalling it in that window stops it. The ending is `endStockStory`, called after
  5 s on the Copperleaf accounts page (tracked from `site.visit` plus `bankSession.signedIn`, no
  longer gated on Emma's mail), which renders `StockEndGame`. `Stage` gained `wiped`, and `ZhumingState` gained `spent`, `earned`,
  `jordanAlerted`, `linkPosted`, `emergencyAt`, `wipedAt`, `wifeMailId`, `endingAt`. After any reply
  in Kevin's first conversation, `postInstallLink` pushes the `link` node once the pitch is over
  (thread at `waiting` or closed), so the download address arrives whether the player declined,
  stalled or agreed.
- `apps/antivirus/Antivirus.tsx` — "Remove threats" now removes every threat currently in
  `threatStore` instead of only the rows captured when the scan finished, and refreshes its list from
  the store. Before this, a threat installed while the results screen was up (the stock app going in
  next to Aaron's worm) was left running while PaneGuard reported the PC clean. Zhuming's `clean()`
  also now accepts the `wiped` stage, so the app can be uninstalled after the accounts have already
  been emptied instead of the request being silently ignored.
- `styles.css` — the `.db-kicker` / `.db-sponsored*` rules and the `.sl-*` / `.st-*` blocks only.

Flow: post → balloon → article (card) → add on PingMe (card) → chat → download page → install
(threat + app window + desktop icon, card) → PaneGuard removal (card + `story.complete`). As with the
PhotoWorm story, no warning is ever shown at the moment of the mistake — the lessons only appear in
Achievements.
