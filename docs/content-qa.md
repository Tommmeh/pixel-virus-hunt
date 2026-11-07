# Content QA — every scam in the game

Read-only review of all scam and malware content on this branch (`src/game/scams/*.ts`,
`src/game/malware.ts`, `src/game/types.ts`). Nothing here was changed by Track D; each item ends
with a paste-ready PR comment for the owning track.

**Verdict:** the content is in good shape. Ten flags, one of which is an actual factual error worth
fixing before judging, and the rest are currency or consistency issues.

---

## Summary

| #   | Where                              | Issue                                                       | Severity        | Owner   |
| --- | ---------------------------------- | ----------------------------------------------------------- | --------------- | ------- |
| A   | `malware.ts` → `account`           | "Credential stuffing" mislabels password guessing           | **Factual**     | Track A |
| B   | `sys-techsupport`, `sys-scareware` | `malwareId` points at malware describing a different attack | Medium (latent) | Track A |
| C   | `sys-winupdate`                    | Describes a stealer infection but links no malware          | Low             | Track A |
| D   | `sys-usb`                          | AutoRun advice is accurate but the exploit is now rare      | Low (currency)  | Track A |
| E   | `sys-wifi` / `mitm`                | "Check for HTTPS" is dated advice                           | Low (currency)  | Track A |
| F   | `email-recruiter`                  | Missing the modern interview-app lures                      | Low (currency)  | Track B |
| G   | `web-crack`                        | Cracks now mostly deliver infostealers, not adware          | Low (currency)  | Track C |
| H   | `sys-prize`                        | Real brand ("iPod") in player-visible copy                  | Low (policy)    | Track A |
| I   | `sys-techsupport`                  | `0800-555-0199` mixes UK and US fictional numbering         | Nit             | Track A |
| J   | `email-password`                   | "No two-factor authentication" is era-inconsistent          | Nit             | Track B |

### What's right, and worth keeping

- `.example` is used for every URL and email domain — correct reserved-domain practice.
- `Salaries_2004.xls.exe` is a textbook double-extension, and the USB lure shows it in the file list
  rather than in prose, so the player can spot it.
- "A web popup claims to have 'scanned' your PC (websites can't do that)" is precise and current.
- "You can't win a competition you never entered" and "'Just pay shipping' to get a free prize" are
  exactly the right red flags for prize scams.
- `email-password` correctly avoids the "credential stuffing" mislabel that `malware.ts` still has.

---

## A. `malware.ts` → `account`: wrong attack name

```
realName: "Credential stuffing / account takeover",
whatHappened: "'password123' is in every leaked password list. An attacker guessed it within hours and logged in."
```

Credential stuffing is replaying username/password pairs stolen from _another_ breach. Someone
guessing `password123` is **password guessing / brute force against a weak password**. The copy
describes guessing, so the label is wrong — and it contradicts the scam card in `email.ts`, which
correctly says "Weak password / account takeover".

**Suggested copy:** `realName: "Weak password → password guessing (account takeover)"`, and
`"'password123' sits near the top of every list of commonly used passwords. An attacker tries the
obvious ones within hours and gets in."`

## B. `malwareId` reuse across attacks

`sys-techsupport` → `rat`, but `rat.whatHappened` is about the **fake recruiter's interview
software**. `sys-scareware` → `dropper`, whose copy is about the **game crack**. Both are dormant
today (the header of `malware.ts` says nothing infects the PC yet), so no player sees a
contradiction — but the moment consequences are switched back on, the debrief will describe the
wrong attack for these two cards.

**Fix:** either give each attack its own `MALWARE` entry, or make `whatHappened` generic enough to
serve both ("a remote-access trojan...").

## C. `sys-winupdate` has no `malwareId`

Its `whatHappened` says the update installed a password stealer, while sibling scams that describe
an infection all link a `malwareId`. Add a stealer entry (worth having anyway: infostealers are the
most common modern payload) and link it.

## D. `sys-usb` — still true, but context has moved

"Practically: keep AutoRun switched off" is correct advice. But Windows has disabled AutoRun for USB
drives by default since Windows 7, so "ran the moment you opened it" is now the exception. The risk
that replaced it is **BadUSB**: a malicious device that presents itself as a keyboard.

**Suggested added tip sentence:** "Even with AutoRun off, a planted device can pretend to be a
keyboard and type commands — never plug in a drive you found."

## E. `sys-wifi` / `mitm` — the padlock

`mitm.tip` ends with "check for HTTPS". Content-integrity via TLS is real, but a padlock no longer
distinguishes a legitimate site from a phishing one — nearly every phishing site has valid TLS.

**Suggested:** "Avoid open Wi-Fi for anything sensitive. Use your phone's hotspot or a VPN, and ask
staff for the real network name. HTTPS protects what you send, but it does not tell you who owns the
network."

## F. `email-recruiter` — modernise the mechanics

The existing red flags (domain mismatch, `.exe` before an interview, flattery plus urgency) are
correct and still the core of the attack. What's missing is how it shows up in 2026:

- Fake "meeting app" installs: "update this to join the call".
- AI-written recruiter profiles and messages on real job platforms, so the writing quality is no
  longer a tell.
- Display-name spoofing, where the shown name is right and the address is not.

**Suggested extra red flag:** "The 'interview update' is a download, not a meeting link."

## G. `web-crack` — payload has moved from adware to stealers

Adware-in-a-crack was the 2004 story and it still happens, but cracks and keygens are now a primary
distribution channel for infostealers that lift saved passwords, session cookies and crypto wallets.
Naming that raises the stakes without changing the mechanic.

**Suggested line for `whatHappened`:** "...installed adware and a stealer that copied saved
passwords and browser sessions."

## H. `sys-prize` — brand in player-visible copy

`"Claim your FREE iPod now"` and the achievement name "Lucky Visitor" are fine, but the iPod is a
real Apple product. If the no-real-brand rule is meant to cover all player-visible content (it
currently only binds the AI output), swap to "FREE MP3 player" — which is period-accurate for 2004
and does not name a company.

## I. `sys-techsupport` — fictional phone number format

`0800-555-0199` mixes a UK freephone prefix with the US `555` reserved fictional range. It is
obviously fake, so this is cosmetic; if the number policy is enforced everywhere, use a clearly
in-world short code instead.

## J. `email-password` — 2FA in 2004

"No two-factor authentication" is excellent modern advice attached to a retro card. Two-factor for
consumer webmail was essentially unheard of in 2004, so a sharp judge may query it. Either keep it as
the "here's what you should do now" line (it reads that way already) or mark the card `era: "modern"`.

---

## Track D self-check

The chat content was reviewed with the same rules and is covered by tests
(`src/game/scams/ai.test.ts`):

- No real URLs, phone numbers, card numbers or brand names in any persona brief, script or card.
- All eight `ai-` cards carry at least three red flags, a `whatHappened` and a tip.
- Card claims were checked against current guidance: real banks never ask for a one-time code or
  move money to a "safe account"; gift cards are untraceable and unrefundable; genuine support never
  calls first about errors it detected; no emergency is verified by refusing a phone call.

---

## PR comments (paste as-is)

### For Track A — `src/game/malware.ts`

> **Fix: `account` is labelled the wrong attack**
>
> `realName: "Credential stuffing / account takeover"` doesn't match the copy under it. Credential
> stuffing means replaying pairs leaked from a _different_ breach; "an attacker guessed it within
> hours" is password guessing against a weak password, which is what `email-password` already says
> in its card type. It's also contradictory to have the card say "weak password" and the malware say
> "stuffing" for the same event.
>
> Suggest: `realName: "Weak password → password guessing (account takeover)"`.
>
> While here: `sys-techsupport` maps to `malwareId: "rat"` and `sys-scareware` to
> `"dropper"`, but both entries describe different attacks (fake recruiter, game crack), so the
> debrief will read wrong once infections are re-enabled. `sys-winupdate` describes a stealer but
> links no malware at all.

### For Track B — `src/game/scams/email.ts`

> **Content nit: the recruiter scam is missing its modern mechanics**
>
> The three red flags are correct, but the "run this before the interview" lure now usually arrives
> as a fake meeting-app update ("install this to join the call") or through an AI-written profile on
> a real job platform, so writing quality is no longer a tell. Worth one extra flag:
> "The 'interview update' is a download, not a meeting link."
>
> Minor: the password card flags "no two-factor authentication", which is great modern advice but
> anachronistic for 2004 — consider `era: "modern"` so the filter is honest.

### For Track C — `src/game/scams/web.ts`

> **Content nit: the crack payload is dated**
>
> Adware-flooded popups is the 2004 story, but cracks and keygens are now a top distribution channel
> for infostealers that take saved passwords, session cookies and wallets. Naming that in
> `whatHappened` raises the stakes without changing the mechanic — the "turn off your antivirus
> first" flag is already perfect and should stay.
