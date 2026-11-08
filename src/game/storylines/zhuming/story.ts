// Zhuming's storyline — "RAM Capital".
// 1. A sponsored post lands on The Daily Byte front page        → stage "posted"
// 2. The player adds the author on PingMe from the article      → "added"
// 3. He talks them into installing StockLadder from his link    → "installed"
// 4. PaneGuard finds the app; removing it ends the story        → "cleaned"
// 5. Or: big trades wake J-Reyes, Kevin panics, and the app empties both accounts → "wiped"
// Never warn the player at the moment of the mistake: the ad reads like a column and the app looks
// like every other trading app. The lessons unlock silently in Achievements.
import {
  chatKey,
  chatStore,
  chatTitle,
  continueConversation,
  startConversation,
} from "../../apps/messenger/store";
import { receiveMail } from "../../apps/webvoyager/sites/hotpost/store";
import { formatMoney } from "../../components/ui";
import { unlockScam } from "../../scams/store";
import { emit } from "../../system/events";
import { notify } from "../../system/notify";
import { createStore } from "../../system/store";
import { addThreat, removeThreat, threatStore } from "../../system/threats";
import { wm } from "../../system/windows";
import { ZHUMING_ARTICLE } from "./article";
import { chargeChequing, chequingBalance, drainEverything } from "./bank";
import { ZHUMING_CARD_IDS } from "./cards";
import { ZHUMING_CONTACT, ZHUMING_PERSON } from "./contact";
import { allIn, crash, RAM_TICKER } from "./market";
import { marketStore } from "./store";

export const STORY = "zhuming";
export type Stage = "idle" | "posted" | "added" | "installed" | "cleaned" | "wiped";

/** J-Reyes, the friend who hears about the app once the player starts moving real money. */
export const JORDAN_CONTACT = "jordan";

/** The "free trading app" download page. Plain http, not a favourite, not in the search index. */
export const SITE_HOST = "www.stockladder-trade.com";
export const SITE_URL = `http://${SITE_HOST}/download`;
export const ARTICLE_ID = ZHUMING_ARTICLE.id;
export const ARTICLE_URL = `http://www.dailybyte.com/article/${ARTICLE_ID}`;
export const BANK_HOST = "www.copperleafbank.com";
export const BANK_URL = `https://${BANK_HOST}/accounts`;
export const THREAT_ID = "zhuming-stockapp";
export const APP_ID = "stockladder";

export const POST_AFTER_MS = 60_000; // after logging in
/** How long after the install he comes back asking for the bank login. */
export const FOLLOW_UP_MS = 20_000;
/** How long after his first conversation ends before he sends the download link anyway. */
export const LINK_AFTER_MS = 6_000;
/** Trading this much — or banking this much — is enough for a friend to notice. */
export const ALERT_SPEND = 200;
export const ALERT_EARN = 250;
/** Kevin's emergency lands this long after the player has answered J-Reyes. */
export const EMERGENCY_AFTER_MS = 5_000;
/** Emma's email arrives this long after the app has emptied the accounts. */
export const WIFE_MAIL_AFTER_MS = 20_000;
/** Seconds spent looking at the overdrawn account before the ending lands. */
export const BANK_CHECK_MS = 5_000;
/** Seconds after Kevin's emergency before the app spends everything, whatever the player chose. */
export const WIPE_AFTER_MS = 10_000;
/** What the app claims you owe after its leveraged all-in collapses. */
export const MARGIN_MULTIPLE = 9;

export interface ZhumingState {
  stage: Stage;
  postedAt: number;
  installedAt: number;
  /** Trades in anything but his stock. Rotates his nagging replies. */
  nudges: number;
  /** Money put in and taken out through the app, in £. */
  spent: number;
  earned: number;
  /** J-Reyes has warned the player. One shot. */
  jordanAlerted: boolean;
  /** He has sent the download link after the first conversation. One shot. */
  linkPosted: boolean;
  /** When Kevin's "emergency" arrived. 0 until it does. */
  emergencyAt: number;
  /** When the app emptied both accounts. 0 until it does. */
  wipedAt: number;
  /** Emma's "why is the account overdrawn" mail. Null until it has been sent. */
  wifeMailId: string | null;
  /** When the ending screen took over. 0 until the player has seen the account. */
  endingAt: number;
}

export const INITIAL: ZhumingState = {
  stage: "idle",
  postedAt: 0,
  installedAt: 0,
  nudges: 0,
  spent: 0,
  earned: 0,
  jordanAlerted: false,
  linkPosted: false,
  emergencyAt: 0,
  wipedAt: 0,
  wifeMailId: null,
  endingAt: 0,
};
export const zhumingStore = createStore<ZhumingState>("vh-zhuming", INITIAL);
export const useZhuming = zhumingStore.use;

const setStage = (stage: Stage, patch: Partial<ZhumingState> = {}) => {
  zhumingStore.set((s) => ({ ...s, ...patch, stage }));
  emit({ type: "story.stage", story: STORY, stage });
};

/** The post only exists on the site once it has been "published" (see post()). */
export const articleLive = () => zhumingStore.get().stage !== "idle";
/** He only appears in the PingMe buddy list after the player adds him from the article. */
export const contactAdded = () => {
  const { stage } = zhumingStore.get();
  return stage === "added" || stage === "installed" || stage === "cleaned" || stage === "wiped";
};

const openThread = () => {
  wm.open(
    "chat",
    { contact: ZHUMING_CONTACT },
    { key: chatKey(ZHUMING_CONTACT), title: chatTitle(ZHUMING_CONTACT) },
  );
};

const round2 = (n: number) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// Stage transitions

/** Step 1: the advertorial appears on The Daily Byte's front page. */
export function post(now = Date.now()) {
  if (zhumingStore.get().stage !== "idle") return;
  setStage("posted", { postedAt: now });
  notify({
    title: "The Daily Byte",
    text: `New post: ${ZHUMING_ARTICLE.headline}`,
    icon: "news",
    open: { app: "webvoyager", args: { url: ARTICLE_URL } },
  });
}

/** Step 1b: the player opened the article. Silent — they only find the lesson later. */
export function read() {
  if (!articleLive()) return;
  unlockScam(ZHUMING_CARD_IDS.advertorial);
}

/** Step 2: "Add ram_capital_kevin on PingMe" at the bottom of the article. */
export function addContact() {
  const { stage } = zhumingStore.get();
  if (stage === "idle" || stage === "installed" || stage === "cleaned" || stage === "wiped") return;
  if (stage === "added") {
    openThread();
    return;
  }
  setStage("added");
  startConversation(ZHUMING_CONTACT);
  unlockScam(ZHUMING_CARD_IDS.dm);
  openThread();
  notify({
    title: "PingMe Messenger",
    text: `${ZHUMING_PERSON.screenName} has been added to your contact list.`,
    icon: "buddy",
  });
}

/** Step 3: the player ran StockLadder_Setup.exe from the download page. */
export function install(now = Date.now()) {
  const { stage } = zhumingStore.get();
  if (stage === "installed" || stage === "cleaned" || stage === "wiped") return;
  // Someone who found the download page on their own still hears from him afterwards.
  if (stage !== "added") startConversation(ZHUMING_CONTACT);
  setStage("installed", { installedAt: now });
  addThreat({
    id: THREAT_ID,
    name: "StockLadder.Trade",
    kind: "Riskware",
    location: "C:\\Program Files\\StockLadder\\stockladder.exe",
  });
  unlockScam(ZHUMING_CARD_IDS.app);
  wm.open(APP_ID);
  notify({
    title: "StockLadder Trade",
    text: "Installation complete. StockLadder is on your desktop.",
    icon: "trophy",
  });
}

/** Step 4: PaneGuard removed the app. */
export function clean() {
  const { stage } = zhumingStore.get();
  // Still installed after a wipe too: the app can always be uninstalled, and once it is, there is
  // nothing left on the PC to drain the accounts again.
  if (stage !== "installed" && stage !== "wiped") return;
  setStage("cleaned");
  wm.closeApp(APP_ID);
  if (threatStore.get().threats.some((t) => t.id === THREAT_ID)) removeThreat(THREAT_ID);
  unlockScam(ZHUMING_CARD_IDS.cleaned);
  notify({
    title: "PaneGuard Antivirus",
    text: "StockLadder.Trade removed. Your PC is clean. New lessons are waiting in Achievements.",
    icon: "shield",
    open: { app: "achievements" },
  });
  emit({ type: "story.complete", story: STORY });
}

/** Second beat with Kevin, after the install. Called by ZhumingService. */
export const followUp = () => continueConversation(ZHUMING_CONTACT, "installed");

/**
 * He does not take no for an answer: once his first conversation has played out — declined, put on
 * hold, or agreed to — the download link arrives anyway. Called by ZhumingService after a reply.
 */
export function postInstallLink() {
  const s = zhumingStore.get();
  if (s.stage !== "added" || s.linkPosted) return;
  // Only once the pitch has finished: "waiting" is his last word, null means the player closed it.
  const node = chatStore.get().threads[ZHUMING_CONTACT]?.node;
  if (node !== null && node !== "waiting") return;
  zhumingStore.set((x) => ({ ...x, linkPosted: true }));
  continueConversation(ZHUMING_CONTACT, "link");
}

/** His replies to a purchase, cycled so a buying streak hears something new each time. */
const NUDGE_NODES = ["tip1", "tip2", "tip3"] as const;

/** Step 3b: the player traded from the app. He always has an opinion about it. */
export function nudgeAfterBuy(ticker: string) {
  const { stage, nudges } = zhumingStore.get();
  // Buying his own stock needs no comment from him.
  if (stage !== "installed" || ticker === RAM_TICKER) return;
  zhumingStore.set((s) => ({ ...s, nudges: s.nudges + 1 }));
  // He doesn't pipe up after every single trade: every third one is plenty.
  if (nudges % 3 !== 0) return;
  const node = NUDGE_NODES[Math.floor(nudges / 3) % NUDGE_NODES.length] ?? "tip1";
  continueConversation(ZHUMING_CONTACT, node);
}

/** Step 3c: record a trade and, once it is big enough, let J-Reyes hear about the app. */
export function noteTrade(kind: "buy" | "sell", amount: number) {
  const s = zhumingStore.get();
  if (s.stage !== "installed") return;
  const amt = round2(amount);
  const spent = kind === "buy" ? round2(s.spent + amt) : s.spent;
  const earned = kind === "sell" ? round2(s.earned + amt) : s.earned;
  zhumingStore.set((x) => ({ ...x, spent, earned }));
  if (s.jordanAlerted) return;
  if (spent >= ALERT_SPEND || earned >= ALERT_EARN) alertJordan();
}

/** His mate has been dabbling too, and he does not like what he sees. */
function alertJordan() {
  zhumingStore.set((s) => ({ ...s, jordanAlerted: true }));
  continueConversation(JORDAN_CONTACT, "stock");
}

/** Step 3d: once the player has answered J-Reyes, Kevin needs everything in by tonight. */
export function emergency() {
  const s = zhumingStore.get();
  if (s.stage !== "installed" || s.emergencyAt) return;
  zhumingStore.set((x) => ({ ...x, emergencyAt: Date.now() }));
  continueConversation(ZHUMING_CONTACT, "emergency");
}

/**
 * Step 3e: the app emptied every Copperleaf account into RAMH, leveraged nine times over, and the
 * price collapsed. Emma hears about it a little later — see sendWifeMail().
 */
export function wipe() {
  const s = zhumingStore.get();
  if (s.stage !== "installed" || s.wipedAt) return;
  const total = drainEverything(`STOCKLADDER TRADE ${RAM_TICKER}`);
  marketStore.set((m) => crash(allIn(m, total)));
  const owed = round2(total * MARGIN_MULTIPLE);
  chargeChequing(owed, "STOCKLADDER MARGIN CALL");
  setStage("wiped", { wipedAt: Date.now() });
}

/** Step 3f: Emma writes once the statement settles, and points him at the bank. */
export function sendWifeMail() {
  const { wipedAt, wifeMailId } = zhumingStore.get();
  if (!wipedAt || wifeMailId) return;
  const balance = formatMoney(Math.abs(chequingBalance()));
  const mail = receiveMail({
    fromName: "Emma Taylor",
    from: "emma.taylor@hotpost.com",
    subject: `Why is our current account ${balance} overdrawn?`,
    body:
      "Jamie.\n\n" +
      `Copperleaf rang me at work. Our everyday account is overdrawn by ${balance}. Not by a few pounds — by more than we earn in a year.\n\n` +
      "I went through the statement on my lunch break. There are two payments I have never seen in my life:\n\n" +
      "    STOCKLADDER TRADE RAMH      (everything that was in the account)\n" +
      "    STOCKLADDER MARGIN CALL     (money neither of us has ever had)\n\n" +
      "And the savings account is empty. Five thousand two hundred pounds, Jamie. The money for the boiler, the money for Christmas, gone to something called StockLadder.\n\n" +
      "You can see it yourself. Sign in and look at the statement:\n\n" +
      `${BANK_URL}\n\n` +
      "You told me the computer was just a hobby. You told me you were handling it.\n\n" +
      "I am not asking what happened this time. I already know, because the bank sent me the whole statement and I have read every line of it twice.\n\n" +
      "I have taken my name off the joint account. The house is in my mum's name anyway. You should ring the bank yourself and tell them everything, because whatever this was is still running.\n\n" +
      "Don't ring me tonight. Don't come to the hospital.\n\n" +
      "Emma",
  });
  zhumingStore.set((x) => ({ ...x, wifeMailId: mail.id }));
}

/** Step 3g: five seconds staring at the overdrawn account is the last beat of the storyline. */
export function endStockStory() {
  const { wipedAt, endingAt } = zhumingStore.get();
  if (!wipedAt || endingAt) return;
  zhumingStore.set((s) => ({ ...s, endingAt: Date.now() }));
}
