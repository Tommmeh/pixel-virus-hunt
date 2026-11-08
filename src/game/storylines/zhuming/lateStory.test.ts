import { beforeEach, describe, expect, it } from "vitest";
import { chatStore } from "../../apps/messenger/store";
import { bankStore } from "../../apps/webvoyager/sites/copperleaf/store";
import { mailStore } from "../../apps/webvoyager/sites/hotpost/store";
import { scamStore } from "../../scams/store";
import { threatStore } from "../../system/threats";
import { windowStore } from "../../system/windows";
import { chequingBalance } from "./bank";
import { priceOf, RAMH_FLOOR, RAM_TICKER } from "./market";
import { marketStore } from "./store";
import {
  addContact,
  APP_ID,
  BANK_URL,
  clean,
  emergency,
  endStockStory,
  install,
  noteTrade,
  post,
  sendWifeMail,
  THREAT_ID,
  wipe,
  zhumingStore,
} from "./story";

const setup = () => {
  post();
  addContact();
  install();
};

beforeEach(() => {
  zhumingStore.reset();
  chatStore.reset();
  threatStore.reset();
  scamStore.reset();
  windowStore.reset();
  bankStore.reset();
  mailStore.reset();
  marketStore.reset();
});

describe("the end of the stock story", () => {
  it("lets J-Reyes in once the player has moved serious money", () => {
    setup();
    noteTrade("buy", 150);
    expect(chatStore.get().threads["jordan"]).toBeUndefined();
    noteTrade("buy", 60);
    expect(chatStore.get().threads["jordan"]?.node).toBe("stock");
  });

  it("has Kevin panic about the move to the main board", () => {
    setup();
    emergency();
    expect(chatStore.get().threads["ram_capital_kevin"]?.node).toBe("emergency");
  });

  it("lets PaneGuard remove the app even after the wipe", () => {
    setup();
    wipe();
    expect(zhumingStore.get().stage).toBe("wiped");
    // The program is still on the PC, so it is still something PaneGuard can remove.
    expect(threatStore.get().threats.map((t) => t.id)).toContain(THREAT_ID);
    clean();
    expect(zhumingStore.get().stage).toBe("cleaned");
    expect(threatStore.get().threats.some((t) => t.id === THREAT_ID)).toBe(false);
    expect(windowStore.get().wins.some((w) => w.app === APP_ID)).toBe(false);
  });

  it("empties both accounts into the stock and leaves the debt behind", () => {
    setup();
    const before = chequingBalance();
    expect(before).toBeGreaterThan(0);
    wipe();
    expect(zhumingStore.get().stage).toBe("wiped");
    expect(chequingBalance()).toBeLessThan(-5000);
    expect(bankStore.get().accounts.find((a) => a.id === "sav")?.balance).toBe(0);
    expect(priceOf(marketStore.get(), RAM_TICKER)).toBe(RAMH_FLOOR);
    // Emma writes a little later, once the statement settles.
    expect(zhumingStore.get().wifeMailId).toBeNull();
    sendWifeMail();
    expect(mailStore.get().inbox[0]?.fromName).toBe("Emma Taylor");
    expect(mailStore.get().inbox[0]?.body).toContain(BANK_URL);
    expect(zhumingStore.get().wifeMailId).toBe(mailStore.get().inbox[0]?.id);
    // Reading the account is what ends it.
    endStockStory();
    expect(zhumingStore.get().endingAt).toBeGreaterThan(0);
  });
});
