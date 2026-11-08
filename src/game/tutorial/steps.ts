// Scout's tutorial script. Edit the wording freely — it's just data.
// `target`  = the element to spotlight (a `data-tour="..."` attribute somewhere in the UI).
// `waitFor` = the step finishes when the player does this (otherwise Scout shows a Next button).
// Scout leaves before the player meets any scam: he never warns at the moment of a mistake.
import { openPath } from "../apps/explorer/open";
import { mailStore } from "../apps/webvoyager/sites/hotpost/store";
import type { SystemEvent } from "../system/events";
import { MY_DOCUMENTS } from "../system/fs";
import { windowStore, wm } from "../system/windows";
import type { Corner } from "./placement";

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
  "taskbar",
  "icon-achievements",
  "icon-paneguard",
  "icon-webvoyager",
  "fav-mail.hotpost.com",
  "mail-password",
  // Guided demo (game/demo/steps.ts)
  "fav-www.friendspace.com",
  "fs-phish-link",
  "addr-http",
  "phish-download",
  "phish-open",
  "pg-scan",
  "pg-remove",
] as const;
export type TourTarget = (typeof TOUR_TARGETS)[number];

export interface TutorialStep {
  id: string;
  title: string;
  text: string[];
  /** One target, or several: the first one on screen (and not yet clicked) gets the spotlight. */
  target?: TourTarget | TourTarget[];
  /** Finish the step when this event happens (the player has to do it themselves). */
  waitFor?: (e: SystemEvent) => boolean;
  /** Shown while waiting, e.g. "Double-click the WebVoyager icon". Required with waitFor. */
  hint?: string;
  /** Skip this step if it's already done (e.g. the browser is already open). */
  skipIf?: () => boolean;
  /** Runs when the step becomes the current one (e.g. make something happen in the story). */
  onEnter?: () => void;
  /** Optional helper button. */
  action?: { label: string; run: () => void };
  /**
   * For a hands-on step: what Scout says once the player has done it (with a "Let's go!" button),
   * instead of moving on straight away. Lets a final step double as the send-off.
   */
  after?: { title: string; text: string[] };
  /** The hands-on part is already done (e.g. already signed in): go straight to `after`. */
  doneIf?: () => boolean;
  /**
   * What this step relies on has gone (e.g. the browser was closed, or the player browsed away from the
   * sign-in page): Scout steps back to the step that sets it up, instead of pointing at nothing.
   */
  undoIf?: () => boolean;
  /** Pin Scout to a corner for this step (normally he picks one himself; see placement.ts). */
  placement?: Corner;
}

export const STEPS: TutorialStep[] = [
  {
    id: "hello",
    title: "Hi, I'm Scout!",
    text: [
      "Welcome to VirusHuntOS: a pretend computer from 2004. Everything here is fake, so it's a safe place to learn how scams and viruses trick people.",
      "Your mission: use this PC like normal and hunt down the scams and viruses hiding in it.",
    ],
  },
  {
    id: "achievements",
    title: "Your trophies",
    text: [
      "Every scam or virus you uncover becomes a trophy in here, with the lesson behind it. Try to collect them all!",
    ],
    target: "icon-achievements",
  },
  {
    id: "paneguard",
    title: "Your antivirus",
    text: ["This is PaneGuard. If your PC ever starts acting strange... remember where it is!"],
    target: "icon-paneguard",
  },
  {
    id: "taskbar",
    title: "The taskbar",
    text: [
      "START has every program, plus Log Off. Open windows get a button down here, and on the right are Wi-Fi, sound, settings and the clock.",
    ],
    target: "taskbar",
  },
  {
    id: "open-browser",
    title: "Let's check your email",
    text: [
      "Double-click any desktop icon to open it. Your email lives on the web, so open WebVoyager, the web browser.",
    ],
    target: "icon-webvoyager",
    waitFor: (e) => e.type === "app.open" && e.app === "webvoyager",
    hint: "Double-click the WebVoyager icon",
    skipIf: () => wm.isOpen("webvoyager"),
  },
  {
    id: "open-mail",
    title: "This is WebVoyager",
    text: ["Click E-mail in the Favorites bar."],
    target: "fav-mail.hotpost.com",
    waitFor: (e) => e.type === "site.visit" && e.host === "mail.hotpost.com",
    hint: "Click 'E-mail' under Favorites",
    undoIf: () => !wm.isOpen("webvoyager"),
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
    doneIf: () => mailStore.get().signedIn,
    undoIf: () => {
      const browser = windowStore.get().wins.find((w) => w.key === "webvoyager");
      if (!browser) return true; // browser closed
      if (browser.min || typeof document === "undefined") return false; // just tucked away
      return !document.querySelector('[data-tour="mail-password"]'); // browsed away from the sign-in page
    },
    action: { label: "Show me", run: showNotes },
    after: {
      title: "You've got mail!",
      text: [
        "Have a look around your inbox, and keep your eyes open.",
        "Happy hunting! You can find me again in the START menu.",
      ],
    },
  },
];
