// Scout's tutorial script. Edit the wording freely — it's just data.
// `target`  = the element to spotlight (a `data-tour="..."` attribute somewhere in the UI).
// `waitFor` = the step finishes when the player does this (otherwise Scout shows a Next button).
// Scout leaves before the player meets any scam: he never warns at the moment of a mistake.
import { openPath } from "../apps/explorer/open";
import { mailStore } from "../apps/webvoyager/sites/hotpost/store";
import type { SystemEvent } from "../system/events";
import { MY_DOCUMENTS } from "../system/fs";
import { wm } from "../system/windows";

/** Open notes.txt in a small Notepad in the top-right corner, clear of the sign-in form. */
function showNotes() {
  const path = `${MY_DOCUMENTS}\\notes.txt`;
  openPath(path);
  const key = `notepad:${path.toLowerCase()}`;
  const vw = typeof window === "undefined" ? 1280 : window.innerWidth;
  wm.resize(key, 440, 250);
  wm.move(key, Math.max(0, vw - 460), 12);
}

/** Every `data-tour` id the tutorial points at. Add the attribute in the UI when adding one here. */
export const TOUR_TARGETS = [
  "desktop-icons",
  "start",
  "taskbar",
  "tray",
  "icon-achievements",
  "icon-paneguard",
  "icon-webvoyager",
  "fav-mail.hotpost.com",
  "mail-password",
] as const;
export type TourTarget = (typeof TOUR_TARGETS)[number];

export interface TutorialStep {
  id: string;
  title: string;
  text: string[];
  target?: TourTarget;
  /** Finish the step when this event happens (the player has to do it themselves). */
  waitFor?: (e: SystemEvent) => boolean;
  /** Shown while waiting, e.g. "Double-click the WebVoyager icon". Required with waitFor. */
  hint?: string;
  /** Skip this step if it's already done (e.g. the browser is already open). */
  skipIf?: () => boolean;
  /** Optional helper button. */
  action?: { label: string; run: () => void };
}

export const STEPS: TutorialStep[] = [
  {
    id: "hello",
    title: "Hi, I'm Scout!",
    text: [
      "Welcome to VirusHuntOS: a pretend computer straight out of 2004.",
      "I'll show you around. It only takes a minute!",
    ],
  },
  {
    id: "pretend",
    title: "It's all pretend",
    text: [
      "Everything on this PC is fake: the emails, the websites, even the money in the bank.",
      "It's a safe place to learn how scams and viruses trick people, so they don't trick YOU on your real computer.",
    ],
  },
  {
    id: "mission",
    title: "Your mission: hunt viruses!",
    text: [
      "Use this PC like normal: read emails, browse the web, chat with friends.",
      "If something feels off, investigate! Every scam you uncover becomes a lesson in your Achievements.",
    ],
  },
  {
    id: "desktop",
    title: "Your desktop",
    text: ["These are your programs. Double-click an icon to open it."],
    target: "desktop-icons",
  },
  {
    id: "start",
    title: "The START button",
    text: ["Every program lives in here too, plus Log Off and Turn Off Computer."],
    target: "start",
  },
  {
    id: "taskbar",
    title: "The taskbar",
    text: ["Each open window gets a button down here. Click it to hide a window or bring it back."],
    target: "taskbar",
  },
  {
    id: "tray",
    title: "The tray",
    text: [
      "Wi-Fi, sound, settings and the clock.",
      "The cog opens Settings, where you can change the colour theme.",
    ],
    target: "tray",
  },
  {
    id: "achievements",
    title: "Achievements",
    text: ["Every lesson you learn is saved here. Try to collect them all!"],
    target: "icon-achievements",
  },
  {
    id: "paneguard",
    title: "PaneGuard Antivirus",
    text: [
      "This is your antivirus. If your PC ever starts acting strange... remember where it is!",
    ],
    target: "icon-paneguard",
  },
  {
    id: "open-browser",
    title: "Let's check your email",
    text: ["Your email lives on the web. Double-click WebVoyager to open the web browser."],
    target: "icon-webvoyager",
    waitFor: (e) => e.type === "app.open" && e.app === "webvoyager",
    hint: "Double-click the WebVoyager icon",
    skipIf: () => wm.isOpen("webvoyager"),
  },
  {
    id: "open-mail",
    title: "This is WebVoyager",
    text: ["It's your web browser. Click HotPost Mail in the Favorites bar."],
    target: "fav-mail.hotpost.com",
    waitFor: (e) => e.type === "site.visit" && e.host === "mail.hotpost.com",
    hint: "Click 'HotPost Mail' under Favorites",
  },
  {
    id: "sign-in",
    title: "Sign in to your email",
    text: [
      "Your email address is already filled in.",
      "Forgot the password? {name}, you wrote it down in My Documents → notes.txt. (Is that a good idea? Hmm...)",
    ],
    target: "mail-password",
    waitFor: (e) => e.type === "mail.signin" && e.ok,
    hint: "Type the password and click Sign In",
    skipIf: () => mailStore.get().signedIn,
    action: { label: "Show me", run: showNotes },
  },
  {
    id: "done",
    title: "You've got mail!",
    text: [
      "Have a look around your inbox, and keep your eyes open.",
      "Happy hunting! You can find me again in the START menu.",
    ],
  },
];
