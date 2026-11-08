import { beforeEach, describe, expect, it } from "vitest";
import { socialStore } from "../../apps/webvoyager/sites/friendspace/store";
import { onEvent, type SystemEvent } from "../../system/events";
import { threatStore } from "../../system/threats";
import { initialWm, windowStore, wm } from "../../system/windows";
import {
  aaronStore,
  clean,
  click,
  infect,
  isSwarm,
  openPopupKeys,
  PHISH_HOST,
  PHISH_URL,
  popupContent,
  popupDelay,
  post,
  spawnPopup,
  SWARM_AT,
  MAX_POPUPS,
  THREAT_ID,
} from "./story";

beforeEach(() => {
  aaronStore.reset();
  socialStore.reset();
  threatStore.reset();
  windowStore.set(initialWm);
});

describe("Aaron — PhotoWorm escalation", () => {
  it("pop-ups get faster but never faster than 4s", () => {
    const delays = Array.from({ length: 10 }, (_, i) => popupDelay(i));
    for (let i = 1; i < delays.length; i++) expect(delays[i]).toBeLessThanOrEqual(delays[i - 1]!);
    expect(delays[0]).toBe(20_000);
    expect(Math.min(...delays)).toBe(4_000);
  });

  it("pop-ups escalate from ads to fake system errors", () => {
    expect(popupContent(0).tier).toBe("ad");
    expect(popupContent(2).tier).toBe("slow");
    expect(popupContent(4).tier).toBe("virus");
    expect(popupContent(6).tier).toBe("error");
    expect(popupContent(50).tier).toBe("error");
    expect(isSwarm(SWARM_AT - 1)).toBe(false);
    expect(isSwarm(SWARM_AT)).toBe(true);
  });

  it("uses a classic phishing link: brand as a subdomain, plain http", () => {
    expect(PHISH_HOST.startsWith("friendspace.com.")).toBe(true);
    expect(PHISH_URL.startsWith("http://")).toBe(true);
  });
});

describe("Aaron — the sequence", () => {
  it("runs post → click → infect → pop-ups → swarm → clean", () => {
    const events: SystemEvent[] = [];
    const off = onEvent((e) => events.push(e));

    post();
    expect(aaronStore.get().stage).toBe("posted");
    const mumPost = socialStore.get().posts.find((p) => p.author === "mum");
    expect(mumPost?.link).toBe(PHISH_URL);

    click();
    expect(aaronStore.get().stage).toBe("clicked");

    infect();
    expect(aaronStore.get().stage).toBe("infected");
    expect(threatStore.get().threats.map((t) => t.id)).toEqual([THREAT_ID]);

    for (let i = 0; i < SWARM_AT; i++) expect(spawnPopup()).toBe(true);
    expect(openPopupKeys()).toHaveLength(SWARM_AT);
    expect(aaronStore.get().stage).toBe("swarm");
    expect(threatStore.get().threats[0]!.copies).toBe(SWARM_AT);

    clean();
    expect(aaronStore.get().stage).toBe("cleaned");
    expect(openPopupKeys()).toHaveLength(0);
    expect(threatStore.get().threats).toHaveLength(0);
    expect(spawnPopup()).toBe(false); // no more pop-ups once cleaned
    expect(events.some((e) => e.type === "story.complete" && e.story === "aaron")).toBe(true);
    off();
  });

  it("caps the number of open pop-ups", () => {
    infect();
    let opened = 0;
    for (let i = 0; i < MAX_POPUPS + 10; i++) if (spawnPopup()) opened++;
    expect(opened).toBe(MAX_POPUPS);
    wm.close(openPopupKeys()[0]!);
    expect(spawnPopup()).toBe(true);
  });

  it("only posts once and ignores steps out of order", () => {
    clean(); // nothing to clean yet
    expect(aaronStore.get().stage).toBe("idle");
    post();
    post();
    expect(socialStore.get().posts.filter((p) => p.author === "mum")).toHaveLength(1);
    infect();
    infect();
    expect(aaronStore.get().stage).toBe("infected");
    click(); // too late to "click" — stays infected
    expect(aaronStore.get().stage).toBe("infected");
  });
});
