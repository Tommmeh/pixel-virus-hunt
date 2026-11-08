// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Antivirus } from "../../apps/antivirus/Antivirus";
import { chatStore } from "../../apps/messenger/store";
import { bankStore } from "../../apps/webvoyager/sites/copperleaf/store";
import { mailStore } from "../../apps/webvoyager/sites/hotpost/store";
import { scamStore } from "../../scams/store";
import { addThreat, removeThreat, threatStore } from "../../system/threats";
import { initialWm, windowStore } from "../../system/windows";
import { marketStore } from "./store";
import { addContact, emergency, install, post, zhumingStore } from "./story";
import { ZhumingService } from "./ZhumingService";

const WORM = {
  id: "aaron-photoworm",
  name: "W32/PhotoWorm.A",
  kind: "Worm",
  location: "C:\\WINDOWS\\photoviewer.exe",
  copies: 3,
};

const reset = () => {
  zhumingStore.reset();
  chatStore.reset();
  threatStore.reset();
  scamStore.reset();
  windowStore.set(initialWm);
  bankStore.reset();
  mailStore.reset();
  marketStore.reset();
};

beforeEach(reset);

const stockWindowOpen = () => windowStore.get().wins.some((w) => w.app === "stockladder");

describe("PaneGuard and the stock app", () => {
  it("goes all-in after the emergency even with the app still open", () => {
    vi.useFakeTimers();
    render(<ZhumingService />);
    post();
    addContact();
    install();
    act(() => {
      emergency();
    });
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    vi.useRealTimers();

    expect(zhumingStore.get().stage).toBe("wiped");
    expect(bankStore.get().accounts.find((a) => a.id === "sav")?.balance).toBe(0);
    expect(stockWindowOpen()).toBe(true); // the window stays open on the crashed board
  });

  it("removes the stock app when another threat is on the PC too", () => {
    render(<ZhumingService />);
    addThreat(WORM);
    post();
    addContact();
    install();
    expect(zhumingStore.get().stage).toBe("installed");
    expect(stockWindowOpen()).toBe(true);

    act(() => {
      for (const t of threatStore.get().threats) removeThreat(t.id);
    });

    expect(threatStore.get().threats).toEqual([]);
    expect(zhumingStore.get().stage).toBe("cleaned");
    expect(stockWindowOpen()).toBe(false);
  });

  it("clears a threat that arrived after the scan finished", () => {
    vi.useFakeTimers();
    render(
      <>
        <ZhumingService />
        <Antivirus />
      </>,
    );
    addThreat(WORM);
    fireEvent.click(screen.getByRole("button", { name: /full scan/i }));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // The stock app lands after the scan: the old results list only knows about the worm.
    post();
    addContact();
    install();
    fireEvent.click(screen.getByRole("button", { name: /remove threats/i }));
    vi.useRealTimers();

    expect(threatStore.get().threats).toEqual([]);
    expect(zhumingStore.get().stage).toBe("cleaned");
    expect(stockWindowOpen()).toBe(false);
  });

  it("clears both threats from the PaneGuard results screen", () => {
    vi.useFakeTimers();
    render(
      <>
        <ZhumingService />
        <Antivirus />
      </>,
    );
    addThreat(WORM);
    post();
    addContact();
    install();

    fireEvent.click(screen.getByRole("button", { name: /full scan/i }));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(/2 threats found/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /remove threats/i }));
    act(() => {
      vi.advanceTimersByTime(0);
    });
    vi.useRealTimers();

    expect(threatStore.get().threats).toEqual([]);
    expect(zhumingStore.get().stage).toBe("cleaned");
    expect(stockWindowOpen()).toBe(false);
  });
});
