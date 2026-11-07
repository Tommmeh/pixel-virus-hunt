# Track A handoff — registering the Chat app

**Status: applied on `feature/zhuming-gemini`.** All three edits below are in place, so the Messenger
app is on the desktop and its eight cards are listed in Achievements. Kept as the record of what
changed and why.

Everything Track D owns is already written and tested: `src/game/scams/ai.ts`,
`src/game/apps/Chat.tsx`, `src/game/ai.functions.ts`, plus 29 tests.

---

## 1. Register the app — `src/game/apps/registry.ts`

```diff
 import { Browser } from "./Browser";
+import { Chat } from "./Chat";
 import { EmailApp } from "./Email";
```

```diff
 export const APPS: AppDef[] = [
+  {
+    id: "chat",
+    label: "Messenger",
+    icon: "💬",
+    title: "Messenger",
+    width: 620,
+    listed: true,
+    component: Chat,
+  },
```

`Chat` takes `{ args }` and reads `args.personaId` to open straight onto one persona
(e.g. `openApp("chat", { personaId: "ai-bank" })`). With no args it opens the first persona.

## 2. Let `"chat"` count as rendered — `src/game/scams/scams.test.ts`

```diff
-const RENDERED: LureLocation[] = ["email", "browser", "popup", "desktop", "tray"];
+const RENDERED: LureLocation[] = ["email", "browser", "popup", "desktop", "tray", "chat"];
```

## 3. Publish the achievements — `src/game/scams/ai.ts`

```diff
-export const AI_SCAMS: Scam[] = [];
+export const AI_SCAMS: Scam[] = CHAT_SCAMS;
```

Steps 2 and 3 must land in the same PR: `scams.test.ts` fails if a lure uses a location with no
renderer, and `AI_SCAMS` is kept empty on purpose to leave the branch green in the meantime.

`CHAT_SCAMS` holds eight `Scam` entries, all with `lure.location: "chat"` and ids prefixed `ai-`:

| id                   | Unlocked by                                   |
| -------------------- | --------------------------------------------- |
| `ai-techsupport`     | Falling for the fake SysAssist agent          |
| `ai-friend-abroad`   | Falling for the "Sarah in trouble" con        |
| `ai-romance`         | Falling for the romance con                   |
| `ai-bank`            | Falling for the fake HotPost fraud desk       |
| `ai-secret-password` | Typing the `passwords.txt` password into chat |
| `ai-secret-card`     | Typing the wallet-note card number into chat  |
| `ai-secret-otp`      | Reading out the one-time code                 |
| `ai-secret-remote`   | Giving away the remote-access code            |

The four `ai-secret-*` cards unlock from the leak detector rather than a lure button, so their
`lure` fields are placeholders. They are listed by `Achievements.tsx` like any other card.

## 4. Optional — the fake secrets need to exist in the world

The leak check matches on strings, so nothing breaks without this, but the player has no way to
_find_ the secrets until they're on the desktop. Track D defines them as data in
`src/game/scams/ai.ts → FAKE_SECRETS`:

| Prop                 | Should appear as                   | Value matched         |
| -------------------- | ---------------------------------- | --------------------- |
| `secret-passwords`   | `passwords.txt` on the Desktop     | `Spr1ngfield2004!`    |
| `secret-wallet-card` | `wallet.txt` in My Documents       | `4485 1234 5678 9010` |
| `secret-otp`         | a HotPost SMS / tray notice        | `841206`              |
| `secret-remote`      | the fake "SysAssist Remote" window | `QC-4471-882`         |

The remote-access code is the important one for the demo: a window the player can open _before_
chatting with `ai-techsupport`. A tray notice with the one-time code is enough for `ai-bank`.

## 5. Optional — "Ask the IT guy" on achievement cards

`AskItGuy` in `src/game/apps/Chat.tsx` is self-contained:

```tsx
import { AskItGuy } from "./Chat";

<AskItGuy card={scam} fallbackText={scam.tip} />;
```

`card` needs `name`, `type`, `whatHappened`, `redFlags` and `tip` — a `Scam` satisfies it. It
returns the card's own tip if the API is down, so it can't dead-end.

---

## What is deliberately not in Track D's PR

- No edits to `types.ts`, `state.tsx`, `LureCard.tsx`, `registry.ts`, `Desktop.tsx`, or any other
  track's scam files.
- No new dependencies — the gateway is called with `fetch`.
- No key, no `.env` file, no secret value in the repo.
