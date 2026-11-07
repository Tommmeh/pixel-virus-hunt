// SHARED CONTRACT — owned by Track A. Changes must stay backwards compatible; tell the team first.

/** Where on the fake PC a scam's lure shows up. Each location has exactly one renderer. */
export type LureLocation = "email" | "browser" | "popup" | "desktop" | "tray" | "chat";

/** The bait the player encounters. It never warns — the lesson lives on the achievement card. */
export interface Lure {
  location: LureLocation;
  /** Email subject / page title / popup title / desktop icon label / Wi-Fi network name. */
  title: string;
  /** Email sender, e.g. "Tina <hr@megacorp-careers.biz>". */
  from?: string;
  /** Browser address (browser lures) or shown URL (anything else). */
  url?: string;
  body: string;
  /** Button text that falls for the scam → unlocks the achievement. */
  bait: string;
  /** Optional button that declines. No reward, no warning. */
  safe?: string;
}

export interface Scam {
  /** Unique id prefixed by the owning track: "sys-", "email-", "web-", "ai-". */
  id: string;
  /** Achievement name, hidden until unlocked. */
  name: string;
  /** Key into components/icons.ts (pixel art) or any emoji as a fallback. */
  icon: string;
  era: "retro" | "modern";
  /** Real-world category, e.g. "Phishing", "Remote Access Trojan". */
  type: string;
  /** Vague hint shown while locked. Don't give the answer away. */
  hint: string;
  whatHappened: string;
  redFlags: string[];
  tip: string;
  /** Optional link to a MALWARE entry (src/game/malware.ts) for future infection consequences. */
  malwareId?: string;
  lure: Lure;
}
