import { describe, expect, it } from "vitest";
import { findSiteInfo, SEARCH_INDEX, SITE_INFO } from "./catalog";
import { SITE_COMPONENTS } from "./sites/registry";
import { parseUrl, resolveInput, searchUrl } from "./url";

describe("WebVoyager sites", () => {
  it("every site has a page component and unique hosts/aliases", () => {
    const hosts = SITE_INFO.flatMap((s) => [s.host, ...(s.aliases ?? [])]);
    expect(new Set(hosts).size).toBe(hosts.length);
    for (const s of SITE_INFO) expect(SITE_COMPONENTS[s.host], s.host).toBeDefined();
    expect(Object.keys(SITE_COMPONENTS).sort()).toEqual(SITE_INFO.map((s) => s.host).sort());
  });

  it("every search result points at a real site", () => {
    for (const r of SEARCH_INDEX) {
      const u = parseUrl(r.url);
      expect(u && findSiteInfo(u.host), r.url).toBeTruthy();
    }
  });

  it("includes a bank, a social site and email", () => {
    const names = SITE_INFO.map((s) => s.name).join(" ");
    expect(names).toMatch(/Bank/);
    expect(names).toMatch(/FriendSpace/);
    expect(names).toMatch(/Mail/);
  });

  it("turns typed text into URLs or searches", () => {
    expect(resolveInput("www.friendspace.com")).toBe("http://www.friendspace.com");
    expect(resolveInput("https://mail.hotpost.com/")).toBe("https://mail.hotpost.com/");
    expect(resolveInput("cheap games")).toBe(searchUrl("cheap games"));
    expect(parseUrl("https://www.copperleafbank.com/transfer/")?.path).toBe("/transfer");
    expect(parseUrl("ftp://x")).toBeNull();
  });
});
