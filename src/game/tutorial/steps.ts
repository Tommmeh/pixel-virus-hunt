// Scout's tutorial script. Edit the wording freely — it's just data.
// `target`  = the element to spotlight (a `data-tour="..."` attribute somewhere in the UI).
// `waitFor` = the step finishes when the player does this (otherwise Scout shows a Next button).
// Scout leaves before the player meets any scam: he never warns at the moment of a mistake.
import { mailStore } from "../apps/webvoyager/sites/hotpost/store";
import type { SystemEvent } from "../system/events";
import { windowStore, wm } from "../system/windows";
import type { Corner } from "./placement";

/** Every `data-tour` id the tutorial points at. Add the attribute in the UI when adding one here. */
export const TOUR_TARGETS = [
  "taskbar",
  "virus-hud",
  "icon-antivirus",
  "icon-webvoyager",
  "fav-mail.hotpost.com",
  "mail-password",
  "mail-signin",
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
      "Welcome to VirusHuntOS: a pretend computer from 2004. Everything here is fake, so it's safe to break.",
      "Your goal: CATCH ALL 8 VIRUSES hiding on this PC. Use it like normal, and when something looks too good to be true... fall for it!",
    ],
  },
  {
    id: "goal",
    title: "Your score",
    text: [
      "This is how many viruses you've caught. Each slot lights up when you fall for one.",
      "Stuck? Click a dark slot to go where that virus is hiding. Click a lit one to see what it taught you.",
    ],
    target: "virus-hud",
  },
  {
    id: "antivirus",
    title: "Your antivirus",
    text: [
      "This is your Antivirus. If your PC ever starts acting strange... remember where it is!",
    ],
    target: "icon-antivirus",
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
      "Your e-mail and password are already saved on this PC. Just click Sign In.",
      "(Your passwords are also in passwords.txt on the desktop, {name}. Is that a good idea? Hmm...)",
    ],
    target: "mail-signin",
    waitFor: (e) => e.type === "mail.signin" && e.ok,
    hint: "Click Sign In",
    doneIf: () => mailStore.get().signedIn,
    undoIf: () => {
      const browser = windowStore.get().wins.find((w) => w.key === "webvoyager");
      if (!browser) return true; // browser closed
      if (browser.min || typeof document === "undefined") return false; // just tucked away
      return !document.querySelector('[data-tour="mail-password"]'); // browsed away from the sign-in page
    },
    after: {
      title: "You've got mail!",
      text: [
        "Have a look around your inbox, and keep your eyes open.",
        "Happy hunting! You can find me again in the START menu.",
      ],
    },
  },
];
