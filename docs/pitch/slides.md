# Virus Hunt — pitch (six slides)

Two minutes of speaking. Each slide has the line to say, not a script to read.

---

## 1. The problem

**Security training is a poster nobody reads.**

- Awareness training is a warning you click past: "don't click suspicious links."
- It's abstract. It arrives before the mistake, so it isn't remembered.
- The people who most need it — the ones who _would_ fall for it — learn least from being lectured.

**Say:** "Every security awareness course opens with a warning. And every one of us has clicked past it. We built the opposite."

---

## 2. The concept

**Play. Get Infected. Stay Safe.**

- A fake 2004 Windows PC: taskbar, inbox, Wi-Fi tray, browser. Nothing looks like a lesson.
- Scams arrive exactly as they did in 2004 — a found USB labelled _Salaries 2004_, a recruiter who loved your CV, a free iPod counting down.
- **You are never warned.** You click, the scam resolves, and life goes on.
- The lesson lands later, on the achievement card: what happened, the red flags you missed, one thing to do differently.

**Say:** "Real life doesn't warn you at the moment of the mistake. So neither do we. The teaching is on the card you unlock _after_ you've been had — and that's the card you remember."

---

## 3. The demo

_(See `demo-script.md` for the beat-by-beat version.)_

- Wi-Fi tray → join `CoffeeShop_FREE`. No warning.
- Desktop → open `Salaries_2004.xls` from a found USB. No warning.
- Popup → claim the free iPod. No warning.
- Email → run `InterviewSetup.exe` because the recruiter asked. No warning.
- **Messenger → a live conversation with a scammer who is not scripted.**
- Achievements tab → six cards, each with the red flags you actually missed.

**Say:** "Six scams, zero warnings. Watch the counter in the corner."

---

## 4. How Gemini is used

**The chat is real; the judgement is deterministic.**

- Four scammer personas (tech support, friend abroad, romance, bank fraud) role-play live via **Gemini on Lovable's AI gateway**. Same scam, different words every run — so it can't be memorised.
- The model never decides whether you fell for it. A server-side deterministic check does:
  - **Leaked secrets** — the PC hands you `passwords.txt`, a card note, a one-time code, a remote code. Type one into chat and it counts, in any casing or spacing.
  - **Going along with it** — per-persona compliance phrasing, guarded by a refusal check.
- **Every persona has a full scripted fallback.** No key, no network, no rate limit — the demo still runs and still unlocks cards.
- Guardrails: key server-side only, capped history and tokens, output filtered for links, phone numbers, card numbers and real brands, PG-checked, and the prompt forbids ever warning the player.

**Say:** "Gemini writes the con, but it never grades the player and it never gets the last word. That's what makes it reproducible enough to demo and safe enough to ship."

---

## 5. Impact

- **It's the whole lesson, playable.** Red flags are shown _after_ the fact, attached to the mistake you personally made.
- **It scales as content, not code.** Scams are data files; four people added dozens without touching a component.
- **It's honest about modern attacks.** Not just 2004 viruses: gift-card scams, OTP theft, impersonation, remote-access cons — the ones that still work today.
- **Cheap to run.** One keyed gateway, no per-user account, no backend of its own.

**Say:** "The thing people remember isn't the popup. It's the card that tells them what they missed — because they earned it."

---

## 6. Next steps

- **Ship the chat in-game.** Three one-line changes register the Messenger app (see `track-a-handoff.md`).
- **Fresh phishing variants.** Have Gemini generate new email lures each run, using the existing `Scam` data shape.
- **Consequences back on.** The infection model already exists; wire each scam's `malwareId` so falling for a scam actually infects the PC, then hunt it down.
- **Classroom mode.** A projector-friendly debrief: the room votes, then sees the red flags.
- **Measure it.** Before/after phishing-spotting score, so the impact claim is a number, not a vibe.

**Say:** "It's a game today. It's a measurement tomorrow — and that's when it stops being a demo and starts being training."
