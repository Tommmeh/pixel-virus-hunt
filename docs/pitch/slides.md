# Virus Hunt — pitch slides

Six slides, roughly 20 seconds each. Speaker notes in italics.

---

## 1. The problem

**People learn about scams by getting scammed.**

- Phishing, fake support, romance and "friend in need" scams all work the same way: they rush you.
- You cannot practise a scam on your real computer — the first attempt is the expensive one.
- Safety advice is a poster on a wall: "never share your code". Nobody remembers a poster.

_Ask the room: who has had a "your account is locked" text in the last month? Half the hands go up._

---

## 2. The concept

**A 2004 computer you are allowed to break.**

- PaneOS: a fake Windows-style desktop in the browser — files, mail, bank, browser, Messenger.
- Scams arrive where they really arrive: in chat, in email, on a website.
- **The rule that makes it work:** nothing warns you while it is happening. The lesson unlocks
  afterwards, on an achievement card, when the damage is already done.

_The silence is the product. A warning in the moment trains you to obey a pop-up; a lesson afterwards trains you to notice._

---

## 3. The demo (60 seconds)

1. `PingMe Messenger` → **Unknown** → `SysAssist_Support`: _"we detected 14 viruses"_.
2. They ask for remote access and read out a support code: `QC-4471-882`.
3. Type it back. Nothing happens — no alarm, no red banner, no telling-off.
4. Open **Achievements**: _"The Helpful Stranger"_ is now unlocked, with the five red flags the
   player just walked past.
5. Press **Ask the IT guy** on the card for a plain-English explanation.

_If the network dies mid-demo, the chat keeps answering from its scripted lines and the same card unlocks. That is deliberate._

---

## 4. How Gemini is used

- Scammer personas are **data**, not prompt spaghetti: `src/game/scams/ai.ts`.
- The reply comes from a **TanStack Start server function** calling Lovable's AI gateway
  (OpenAI-compatible, `google/gemini-3.7-flash`), with `LOVABLE_API_KEY` read on the server only.
- **The model never decides whether you fell for it.** A deterministic check on your own message
  (leaked secret, or agreeing to install/send) makes that call, behind a refusal guard —
  so "no, I'm not doing that" is never counted against you.
- Guardrails on the way out: links, long numbers and real brand names are stripped; history and
  tokens are capped; every persona has scripted lines for when the model is unavailable.

_The interesting engineering is not the prompt. It is making an unreliable narrator safe to ship._

---

## 5. Impact

- Teaches **transferable judgement**, not trivia: every card names the red flags in general terms.
- Fictional brands only, nothing ever fetched, no real links, no real phone numbers — safe to run
  in a classroom, on a school laptop, with no account and no install.
- Works **offline**: the scripted fallback keeps the whole lesson intact without a key.
- Extends to whatever the team writes next: the personas are data, and the lesson cards are data.

_One card per scam. Four in this prototype, and a shape anyone on the team can add to._

---

## 6. Next steps

- Port the achievements layer into the Stage 2 quest engine so chat lessons sit beside email,
  website and USB-file lessons (Track A owns that merge).
- Score the player: "caught 3 of 4" instead of a pass/fail.
- More personas: delivery-parcel text, fake job offer, account-recovery scam.
- Playtest with a class and tune the personas — the ones that hook people are the ones worth teaching.

_Ask us about the deterministic fall-for-it check: it is the part we are proudest of._
