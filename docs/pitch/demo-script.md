# Demo script — 2 minutes

Target: **two lessons unlocked live, plus the honesty of the offline path.**
Runs on the PaneOS desktop (`npm run dev`, http://localhost:8080).

## Before you start (30 seconds, off camera)

- `npm run dev` is already running and the page is loaded.
- Fresh profile recommended: **Control Panel → Reset** so Achievements is empty and nothing spoils.
- Say the line up front: _"Nothing on this desktop will warn you. That is the whole point."_

## The run (120 seconds)

**0:00 — Boot.** Click through the PaneOS welcome screen. Let them see the desktop: My Computer,
WebVoyager, PingMe Messenger, Mines, Recycle Bin.

**0:10 — Open the Messenger.** Double-click `PingMe Messenger` on the desktop. Point out the buddy
list is normal contacts — Alex, Priya, Mum — and then the **Unknown** group at the bottom:
_"nobody you added, all online"_.

**0:25 — The tech-support scam.** Double-click `SysAssist_Support`.

> "Hi, this is the SysAssist support team. We detected 14 viruses on your computer."

Let it land. Do not narrate the scam as a scam yet.

**0:40 — Play it as a worried person.** Type: `oh no, what do I do?`
The reply asks you to install their remote tool and read back a support code.

**0:55 — The mistake.** Type exactly:

```
ok the code is QC-4471-882
```

Nothing happens. No pop-up, no alarm, no warning. Wait two full seconds and say nothing. Then:

> "That silence is on purpose. A real game would have told me off right there. This one doesn't."

**1:05 — The second scam, fast.** Close the window, open `HotPost_Security` in the same Unknown
group. Type `sure, the code is 774-219`. Same silence.

**1:20 — Collect the lesson.** Start menu → **Achievements**. Two cards: _The Helpful Stranger_ and
_Front Door Key_. Read the red flags out loud:

- contacted you first, unexpectedly
- counted the viruses to sound precise
- urgency and a deadline
- wanted remote access
- asked you to read a support code back

**1:45 — Ask the IT guy.** Press the button on a card. The explanation is plain English and blames
the scam, never the player.

**1:55 — Close.** _"Four scams, four cards, no lectures in the moment. The lesson is waiting for you
afterwards — which is exactly when people are ready to learn it."_

## Plan B — if the network or the key fails

Nothing to do: the same chat keeps answering, and it prints **"Connection lost - replies are
scripted from here."** under the transcript so you can call it out as a feature. The same card
unlocks, because the fall-for-it check is deterministic and never needed the model.

If the whole dev server is down, fall back to the screenshots in `docs/pitch/` and talk through
slide 3.

## Lines that land

- "It never told me I was being scammed. It waited."
- "The model writes the scam. The game decides whether I fell for it."
- "Delete the key and the lesson still works."

## Do not

- Do not explain a red flag while the scam is running — it is the one rule the design depends on.
- Do not type a real password, card number or link, even as a joke: it goes to a real model.
