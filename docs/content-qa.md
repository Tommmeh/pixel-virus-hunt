# Content QA — Track D (read-only review)

Scope: the four Gemini scammer personas in `src/game/scams/ai.ts`. Everything here is a suggestion
for the owner of that file; nothing outside Track D was edited.

PaneOS is Stage 1, so the only scam content that exists right now is Track D's four chats. When the
email, website and USB-file scams land in Stage 2 they should get the same pass.

## What was checked

1. Every claim in `whatHappened`, `redFlags` and `tip` is accurate for the real-world scam.
2. No advice contradicts itself between cards.
3. No real companies, brands, phone numbers, links or people.
4. Tone: never blames the player, never scary, PG for a school audience.
5. Each card names **general** red flags, so the lesson transfers to a different scam.
6. The fake secrets are fake and cannot be confused with anything real.

## Findings

| #   | Card                 | Finding                                                                                                                         | Suggestion                                                                                                          |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | The Helpful Stranger | `tip` says "contact the company using a number you look up yourself" — good, but it does not say how to look it up safely.      | Add: "type the company's address in yourself rather than using a number or link in a message."                      |
| 2   | Stranded Abroad      | Red flag list mentions "sudden new account" but the persona reuses a normal contact name, so that flag never fires in the demo. | Keep the flag (it is the common variant) but order the list so the ones this persona actually shows come first.     |
| 3   | Stranded Abroad      | "No real emergency is ever solved with gift card codes" is absolute. Slightly overstated.                                       | Reword: "No genuine emergency is paid for with gift cards."                                                         |
| 4   | Love at First Chat   | The strongest predictor (never video-calls) is listed third.                                                                    | Move it to the top of `redFlags`.                                                                                   |
| 5   | Love at First Chat   | `tip` says "tell a real person you trust" — good practice, but the card does not explain why.                                   | Add a clause: "scammers rely on you keeping it secret."                                                             |
| 6   | Front Door Key       | Card name is metaphor; a 12-year-old may not connect it to one-time codes.                                                      | Keep the name for flavour, but make the first line of `whatHappened` name the code explicitly.                      |
| 7   | Front Door Key       | "Nobody legitimate ever asks you to read one back" is correct and important — it is buried in the tip.                          | Promote it to the top red flag.                                                                                     |
| 8   | All four             | `compliance` regexes are word-based and can misfire on innocents ("ok" inside a longer friendly message counts).                | Acceptable for a game, but a follow-up could require two signals (e.g. agreement **and** a secret or a money word). |
| 9   | All four             | `refusal` wins over `compliance`, which is right, but "no" inside "not sure, ok maybe" flips it to a refusal.                   | Fine for now — it errs on the kind side, which is the correct direction to err.                                     |
| 10  | All four             | Scripted lines are similar in register to the model's, so the offline path is not obviously different.                          | Good — that is the goal. Keep them in sync when either changes.                                                     |

## Invariants worth keeping

- Every persona: at least three scripted lines, at least three red flags, one card with a matching id.
- `resolveChatTurn` is the only place that decides `playerFellForIt`. Never let the model do it.
- `sanitizeReply` must keep the fake codes (they are the mechanic) while stripping links, long
  numbers and real brands — there is a test for both halves.
- `LOVABLE_API_KEY` must appear in exactly one non-test source file. There is a test that fails
  otherwise, so a careless copy-paste cannot ship the key to the browser.

## Paste-ready comment for other tracks (Stage 2, when scam content lands)

> Content QA pass (Track D, read-only): the red flags on your card are accurate, but they are
> ordered from least to most obvious — the player has to read all five before the one that would
> actually have stopped them. Suggest leading with the single most recognisable signal (the
> unexpected first contact, or the demand for urgency) and keeping the rest as supporting detail.
> Also: the tip tells the player what to do, but not how to do it safely — one concrete action
> ("open the app yourself and check the account there") teaches more than "be careful".
