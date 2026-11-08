import { beforeEach, describe, expect, it } from "vitest";
import { chatStore, choose } from "../../apps/messenger/store";
import { getScript } from "../../apps/messenger/scripts";
import { bankStore } from "../../apps/webvoyager/sites/copperleaf/store";
import { scamStore } from "../../scams/store";
import { onEvent, type SystemEvent } from "../../system/events";
import { questStore, type QuestFlags } from "../../system/quests";
import { threatStore } from "../../system/threats";
import { initialWm, windowStore } from "../../system/windows";
import { bankTotal } from "./bank";
import { ZHUMING_CARD_IDS } from "./cards";
import { FRANK_CONTACT, ZHUMING_CONTACT } from "./contact";
import { RAM_TICKER } from "./market";
import {
  addContact,
  APP_ID,
  clean,
  frankTip,
  install,
  nudgeAfterBuy,
  post,
  postInstallLink,
  read,
  THREAT_ID,
  wipe,
  zhumingStore,
} from "./story";

beforeEach(() => {
  zhumingStore.reset();
  chatStore.reset();
  threatStore.reset();
  scamStore.reset();
  questStore.reset();
  bankStore.reset();
  windowStore.set(initialWm);
});

const unlocked = () => Object.keys(scamStore.get().unlocked).sort();
const appOpen = () => windowStore.get().wins.some((w) => w.app === APP_ID);

describe("Zhuming — the RAM Capital storyline", () => {
  it("publishes the advertorial once, and unlocks its lesson only when it's opened", () => {
    post();
    post();
    expect(zhumingStore.get().stage).toBe("posted");
    expect(unlocked()).toEqual([]); // seeing the headline is not a mistake yet
    read();
    expect(unlocked()).toEqual([ZHUMING_CARD_IDS.advertorial]);
  });

  it("adds Kevin to PingMe and starts his scripted conversation", () => {
    post();
    addContact();
    expect(zhumingStore.get().stage).toBe("added");
    const t = chatStore.get().threads[ZHUMING_CONTACT];
    expect(t?.started).toBe(true);
    expect(t?.node).toBe(getScript(ZHUMING_CONTACT)?.start);
    expect(unlocked()).toContain(ZHUMING_CARD_IDS.dm);
    addContact(); // tapping "add" again just reopens the window
    expect(Object.keys(chatStore.get().threads)).toEqual([ZHUMING_CONTACT]);
  });

  it("installs StockLadder as a threat and opens the app", () => {
    post();
    addContact();
    install();
    expect(zhumingStore.get().stage).toBe("installed");
    expect(threatStore.get().threats.map((t) => t.id)).toEqual([THREAT_ID]);
    expect(appOpen()).toBe(true);
    expect(unlocked()).toContain(ZHUMING_CARD_IDS.app);
    install(); // a second run doesn't install twice
    expect(threatStore.get().threats).toHaveLength(1);
  });

  it("lets RBC stop the all-in: nothing leaves and the good ending starts", () => {
    post();
    addContact();
    install();
    const before = bankTotal();
    expect(before).toBeGreaterThan(0);
    questStore.set((s: QuestFlags) => ({ ...s, rbcInstalled: true }));

    wipe();

    const s = zhumingStore.get();
    expect(s.stage).toBe("saved");
    expect(s.wipedAt).toBe(0); // no bad ending queued
    expect(bankTotal()).toBe(before); // not a penny moved, and no margin call on top
    expect(s.keptAmount).toBe(before);
    expect(appOpen()).toBe(false); // the app is shut down by the hold
    expect(unlocked()).toContain(ZHUMING_CARD_IDS.saved);
    expect(bankStore.get().tx.some((t) => t.desc.includes("MARGIN"))).toBe(false);
  });

  it("still empties everything when RBC is not installed", () => {
    post();
    addContact();
    install();
    wipe();
    expect(zhumingStore.get().stage).toBe("wiped");
    expect(bankTotal()).toBe(0); // savings gone, chequing left overdrawn
  });

  it("has Frank send the RBC link once, after J-Reyes has spoken", () => {
    post();
    addContact();
    install();
    frankTip();
    const t = chatStore.get().threads[FRANK_CONTACT];
    expect(t?.node).toBe("tip");
    expect(t?.msgs.map((m) => m.text).join(" ")).toContain("rbc.com/switch");
    // He posts the address; the browser doesn't open itself.
    expect(windowStore.get().wins.some((w) => w.app === "webvoyager")).toBe(false);
    const count = t?.msgs.length ?? 0;
    frankTip(); // once only
    expect(chatStore.get().threads[FRANK_CONTACT]?.msgs).toHaveLength(count);
  });

  it("ends the story when PaneGuard removes the app", () => {
    const events: SystemEvent[] = [];
    const off = onEvent((e) => events.push(e));
    post();
    read();
    addContact();
    install();
    clean();
    expect(zhumingStore.get().stage).toBe("cleaned");
    expect(threatStore.get().threats).toHaveLength(0);
    expect(appOpen()).toBe(false);
    // This path's cards only: the RBC ending card belongs to the other way out of the story.
    expect(unlocked()).toEqual(
      [
        ZHUMING_CARD_IDS.advertorial,
        ZHUMING_CARD_IDS.dm,
        ZHUMING_CARD_IDS.app,
        ZHUMING_CARD_IDS.cleaned,
      ].sort(),
    );
    expect(events.some((e) => e.type === "story.complete" && e.story === "zhuming")).toBe(true);
    off();
  });

  it("nags towards his own stock every third time the player buys something else", () => {
    post();
    addContact();
    install();
    const texts = () => chatStore.get().threads[ZHUMING_CONTACT]?.msgs.map((m) => m.text) ?? [];
    nudgeAfterBuy("KETL");
    expect(texts().join(" ")).toContain("wrong ticker mate");
    const spoken = texts().length;
    nudgeAfterBuy("KETL"); // second trade in a row: he keeps quiet
    nudgeAfterBuy("NORD"); // third: still quiet
    expect(texts()).toHaveLength(spoken);
    nudgeAfterBuy("KETL"); // fourth trade: he pipes up again
    expect(texts().join(" ")).toContain("RAMH doesn't dip");
    const before = texts().length;
    nudgeAfterBuy(RAM_TICKER);
    expect(texts()).toHaveLength(before); // his own stock isn't tradable yet
  });

  it("sends the download link after the first chat, even when the player declines", () => {
    post();
    addContact();
    const thread = () => chatStore.get().threads[ZHUMING_CONTACT];
    choose(ZHUMING_CONTACT, 0); // no stocks
    choose(ZHUMING_CONTACT, 1); // sounds too good to be true
    choose(ZHUMING_CONTACT, 1); // I'll pass
    choose(ZHUMING_CONTACT, 1); // not interested, thanks
    expect(thread()?.node).toBeNull();
    postInstallLink();
    expect(thread()?.node).toBe("link");
    expect(
      thread()
        ?.msgs.map((m) => m.text)
        .join(" "),
    ).toContain("stockladder-trade.com");
    const count = thread()?.msgs.length;
    postInstallLink(); // he doesn't paste it twice
    expect(thread()?.msgs).toHaveLength(count ?? 0);
  });

  it("sends the link after the player puts him on hold too", () => {
    post();
    addContact();
    choose(ZHUMING_CONTACT, 0); // no stocks
    choose(ZHUMING_CONTACT, 0); // five pence, basically free money
    choose(ZHUMING_CONTACT, 1); // how do I get it
    choose(ZHUMING_CONTACT, 1); // maybe later
    expect(chatStore.get().threads[ZHUMING_CONTACT]?.node).toBe("waiting");
    postInstallLink();
    expect(chatStore.get().threads[ZHUMING_CONTACT]?.node).toBe("link");
  });

  it("ignores steps out of order", () => {
    clean(); // nothing installed yet
    expect(zhumingStore.get().stage).toBe("idle");
    read(); // no article published
    expect(unlocked()).toEqual([]);
    addContact(); // nothing to add from
    expect(zhumingStore.get().stage).toBe("idle");
    // Someone who finds the download page on their own still installs — and still hears from him.
    install();
    expect(zhumingStore.get().stage).toBe("installed");
    expect(chatStore.get().threads[ZHUMING_CONTACT]?.started).toBe(true);
  });
});
