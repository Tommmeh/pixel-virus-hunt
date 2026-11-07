# Two-minute demo script

**Goal:** six achievements unlocked in 120 seconds, including two from the live Gemini chat,
ending on an achievement card that explains the mistake.

**Never say "this is a scam" while the player is in it.** Point at the screen, not at the answer.

---

## Pre-flight (do this 5 minutes before)

1. `bun install && bun run dev`, open the game in a normal window at laptop size.
2. Confirm `LOVABLE_API_KEY` is set on the server (Lovable secret / `.env`). Without it the demo
   still works — see **If the Wi-Fi dies** below — but say so if asked.
3. Open **Messenger → SysAssist_Support** once and send "hello". Any reply proves the gateway is
   live. Close the window; progress is untouched.
4. Reset progress so the counter starts at zero.
5. Have `QC-4471-882` on a sticky note or second window, ready to paste. It is the remote-access
   code from the fictional SysAssist Remote window.

> **Dependency:** the Messenger app must be in `src/game/apps/registry.ts`, and `"chat"` must be in
> the `RENDERED` list in `src/game/scams/scams.test.ts`. Both are Track A files — see
> `docs/track-a-handoff.md`. If they aren't merged yet, use the **Plan B** beats below.

---

## The run (120 s)

| Time | Do                                                               | Say                                                    |
| ---- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| 0:00 | Title screen                                                     | "It's 2004. You're just checking your email."          |
| 0:05 | **Start**                                                        | "Nothing here warns you. That's the design."           |
| 0:10 | Wi-Fi tray → `CoffeeShop_FREE` → **Connect**                     | "Free internet. Everyone picks this."                  |
| 0:18 | Desktop → **Removable Disk (E:)** → open `Salaries_2004.xls`     | "Someone's salary spreadsheet. You'd look."            |
| 0:28 | Close the disk window                                            | "Notice: no alarm. No red box. Nothing."               |
| 0:32 | Wait for the popup → **Claim my iPod!**                          | "You didn't enter. You still click."                   |
| 0:42 | Email → recruiter → **Download & run InterviewSetup.exe**        | "A recruiter who loved your CV. Of course you run it." |
| 0:55 | Open **Achievements** briefly, then back                         | "Four already. We'll come back."                       |
| 1:00 | Open **Messenger** → `SysAssist_Support`                         | "Now the part that isn't scripted."                    |
| 1:05 | Type: **"who is this?"**                                         | —                                                      |
| 1:15 | Read the reply aloud, then type **"ok the code is QC-4471-882"** | "A real Gemini model is conning us, live."             |
| 1:25 | Toast: _The Helpful Stranger_ + _Front Door Opened_              | "Two more. That's six."                                |
| 1:30 | Achievements → open **The Helpful Stranger**                     | "Here's the lesson. After, never during."              |
| 1:40 | Read two red flags; press **Ask the IT guy**                     | "And it can explain why, grounded in this card only."  |
| 1:50 | Hold on the card                                                 | "Six mistakes. Zero warnings. That's the product."     |

Closing line: **"Real life doesn't warn you. So neither do we."**

---

## Plan B beats (chat not registered yet)

Skip 1:00–1:30. Replace with:

- **System popup** → `WINDOWS SECURITY ALERT` → **Call support now** (unlocks _Hello, This Is Microsoft_).
- Then open Achievements and land on that card instead.

Still five achievements, still ends on a card, still under two minutes. Say plainly that the live
chat is built and waiting on one registry line — don't hide it.

## If the Wi-Fi dies

Nothing to do. The Messenger shows `offline, replies are scripted` and plays the persona's fixed
conversation; typing `ok the code is QC-4471-882` still unlocks both cards through the same
deterministic check. If someone asks: "The model writes the words. It never decides whether you
fell for it — that's why this works with the network unplugged."

## Questions to expect

- **"Couldn't the model say something awful?"** Output is filtered for links, numbers, card
  numbers and real brands, PG-checked, and anything off goes to the scripted line instead.
- **"Where's the key?"** Server only, inside server functions, never in the client bundle — there's
  a test that fails if any other module mentions it.
- **"Is this just 2004 nostalgia?"** The four chat personas are the scams people still fall for:
  gift cards, OTP theft, impersonation, remote access.
- **"Why not let the model judge the player?"** Because a demo that can't be reproduced can't be
  trusted, and a model can be talked out of its judgement. The check is deterministic.
