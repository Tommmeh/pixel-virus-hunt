// Aaron's storyline — "PhotoWorm".
// 1. Mum's (hacked) FriendSpace account posts a lookalike link   → stage "posted"
// 2. The player opens it and downloads the "PhotoViewer"          → "clicked" → "infected"
// 3. Pop-ups start, slowly at first, then faster and nastier       → "infected"
// 4. They pile up on top of each other; closing one spawns two      → "swarm"
// 5. PaneGuard Antivirus removes the worm                          → "cleaned"
// Never warn the player at the moment of the mistake: the lure stages show nothing suspicious.
import { playDing, playError } from "../../components/sound";
import { addPost } from "../../apps/webvoyager/sites/friendspace/store";
import { emit } from "../../system/events";
import { notify } from "../../system/notify";
import { createStore } from "../../system/store";
import { addThreat, removeThreat, threatStore, updateThreat } from "../../system/threats";
import { windowStore, wm } from "../../system/windows";

export const STORY = "aaron";
export type Stage = "idle" | "posted" | "clicked" | "infected" | "swarm" | "cleaned";

/** Brand name used as a subdomain of someone else's site, over plain http — a classic phishing link. */
export const PHISH_HOST = "friendspace.com.photo-album.net";
export const PHISH_URL = `http://${PHISH_HOST}/p/jamie_t`;
export const THREAT_ID = "aaron-photoworm";
export const POPUP_APP = "worm-popup";

export const POST_AFTER_MS = 45_000; // after logging in
export const FIRST_POPUP_MS = 20_000; // after the infection
export const SWARM_AT = 8; // pop-ups before they start piling up
export const SWARM_SPAWN_MS = 3_500;
export const MAX_POPUPS = 24; // keep the PC usable

export interface AaronState {
  stage: Stage;
  postedAt: number;
  infectedAt: number;
  /** Pop-ups spawned so far (drives the escalation). */
  popups: number;
}

export const INITIAL: AaronState = { stage: "idle", postedAt: 0, infectedAt: 0, popups: 0 };
export const aaronStore = createStore<AaronState>("vh-aaron", INITIAL);

const setStage = (stage: Stage, patch: Partial<AaronState> = {}) => {
  aaronStore.set((s) => ({ ...s, ...patch, stage }));
  emit({ type: "story.stage", story: STORY, stage });
};

// ---------------------------------------------------------------------------
// Escalation (pure)

const DELAYS = [20_000, 15_000, 10_000, 7_000, 5_000, 4_000];

/** Wait before the next pop-up, given how many have appeared: gets faster, never below 4s. */
export function popupDelay(level: number): number {
  return DELAYS[Math.min(Math.max(level, 0), DELAYS.length - 1)]!;
}

export interface PopupContent {
  tier: "ad" | "slow" | "virus" | "error";
  title: string;
  text: string;
  buttons: string[];
}

const TIERS: PopupContent[][] = [
  [
    {
      tier: "ad",
      title: "Special Offer!",
      text: "Congratulations! You've won a FREE MP3 player!\nClick to claim your prize.",
      buttons: ["Claim now!", "Close"],
    },
    {
      tier: "ad",
      title: "Hot Deal",
      text: "Smiley Pack 2004: 500 FREE emoticons for PingMe!",
      buttons: ["Download", "Close"],
    },
  ],
  [
    {
      tier: "slow",
      title: "PC Booster 2004",
      text: "Your PC is running SLOW!\nPC Booster can make it 300% faster.",
      buttons: ["Speed up", "Later"],
    },
    {
      tier: "slow",
      title: "Memory Low",
      text: "Your computer is low on memory.\nClose some programs or buy more RAM now!",
      buttons: ["Buy RAM", "OK"],
    },
  ],
  [
    {
      tier: "virus",
      title: "VIRUS ALERT!!!",
      text: "37 VIRUSES DETECTED on your computer!\nYour files are at risk!",
      buttons: ["Remove now", "Ignore"],
    },
    {
      tier: "virus",
      title: "Security Warning",
      text: "Spyware is stealing your passwords!\nAct immediately!",
      buttons: ["Protect me", "Close"],
    },
  ],
  [
    {
      tier: "error",
      title: "photoviewer.exe - Application Error",
      text: "PhotoWorm is copying itself...\nThe instruction at 0x0000PH0T referenced memory that could not be read.",
      buttons: ["OK"],
    },
    {
      tier: "error",
      title: "System Error",
      text: "Too many windows open.\nphotoviewer.exe has spread to E:\\",
      buttons: ["OK", "Cancel"],
    },
  ],
];

/** What pop-up number `level` says: ads → "PC is slow" → fake virus alerts → system errors. */
export function popupContent(level: number): PopupContent {
  const tier = TIERS[Math.min(Math.floor(Math.max(level, 0) / 2), TIERS.length - 1)]!;
  return tier[level % tier.length]!;
}

export const isSwarm = (popups: number) => popups >= SWARM_AT;

// ---------------------------------------------------------------------------
// Stage transitions

/** Step 1: Mum's account posts the lookalike link on FriendSpace. */
export function post(now = Date.now()) {
  if (aaronStore.get().stage !== "idle") return;
  addPost({
    id: "aaron-mum-photos",
    author: "mum",
    text: "OMG is this you?? 😂😂 look at these pics, I can't believe it",
    time: "Just now",
    likes: 0,
    link: PHISH_URL,
  });
  setStage("posted", { postedAt: now });
  notify({
    title: "FriendSpace",
    text: "Mum posted a new photo album.",
    icon: "social",
    open: { app: "webvoyager", args: { url: "http://www.friendspace.com/" } },
  });
}

/** Step 1b: the player opened the link. */
export function click() {
  const { stage } = aaronStore.get();
  if (stage === "idle" || stage === "posted") setStage("clicked");
}

/** Step 2: the player ran the "PhotoViewer" download. */
export function infect(now = Date.now()) {
  const { stage } = aaronStore.get();
  if (stage !== "idle" && stage !== "posted" && stage !== "clicked") return;
  setStage("infected", { infectedAt: now, popups: 0 });
  addThreat({
    id: THREAT_ID,
    name: "W32/PhotoWorm.A",
    kind: "Worm",
    location: "C:\\WINDOWS\\Temp\\PhotoViewer_setup.exe",
    copies: 0,
  });
}

let popupSeq = 0;
let stackPos = { x: 0, y: 0 };

/** Steps 3–4: open one worm pop-up. Returns false when the cap is reached. */
export function spawnPopup(vw = 1280, vh = 800): boolean {
  const s = aaronStore.get();
  if (s.stage !== "infected" && s.stage !== "swarm") return false;
  const open = openPopupKeys().length;
  if (open >= MAX_POPUPS) return false;

  const level = s.popups;
  const c = popupContent(level);
  const key = `worm:${++popupSeq}`;
  wm.open(POPUP_APP, { level: String(level) }, { key, title: c.title });

  const w = 300;
  const h = 200;
  if (s.stage === "swarm") {
    // Pile up on top of each other, cascading down-right and wrapping around.
    if (stackPos.x === 0 || stackPos.x + w > vw - 20 || stackPos.y + h > vh - 60) {
      stackPos = { x: 140 + Math.random() * 120, y: 20 + Math.random() * 60 };
    } else {
      stackPos = { x: stackPos.x + 26, y: stackPos.y + 22 };
    }
    wm.move(key, stackPos.x, stackPos.y);
  } else {
    wm.move(
      key,
      120 + Math.random() * Math.max(0, vw - w - 160),
      10 + Math.random() * Math.max(0, vh - h - 70),
    );
  }

  if (c.tier === "ad" || c.tier === "slow") playDing();
  else playError();

  const popups = level + 1;
  aaronStore.set((st) => ({ ...st, popups }));
  updateThreat(THREAT_ID, { copies: popups });
  if (s.stage === "infected" && isSwarm(popups)) setStage("swarm");
  return true;
}

/** Keys of the worm pop-up windows currently open. */
export const openPopupKeys = () =>
  windowStore
    .get()
    .wins.map((w) => w.key)
    .filter((k) => k.startsWith("worm:"));

/** Step 5: the antivirus removed the worm. Closes every pop-up and stops the spawning. */
export function clean() {
  const { stage } = aaronStore.get();
  if (stage !== "infected" && stage !== "swarm") return;
  setStage("cleaned");
  if (threatStore.get().threats.some((t) => t.id === THREAT_ID)) removeThreat(THREAT_ID);
  wm.closeApp(POPUP_APP);
  notify({
    title: "PaneGuard Antivirus",
    text: "PhotoWorm removed. Your PC is clean.",
    icon: "shield",
  });
  // TODO(achievements): unlock Aaron's achievement here once the team's Achievements app is merged.
  emit({ type: "story.complete", story: STORY });
}
