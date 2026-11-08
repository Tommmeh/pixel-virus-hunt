import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PixelIcon } from "../../components/PixelIcon";
import { emit } from "../../system/events";
import { wm, type Win } from "../../system/windows";
import { BrowserContext } from "./BrowserContext";
import { findSiteInfo, SITE_INFO } from "./catalog";
import { NotFound } from "./sites/NotFound";
import { SITE_COMPONENTS } from "./sites/registry";
import { HOME_URL, parseUrl, resolveInput } from "./url";

/** Resolve typed input to a final href, upgrading http → https for secure sites. */
function finalHref(input: string) {
  const href = resolveInput(input);
  const u = parseUrl(href);
  const info = u && findSiteInfo(u.host);
  if (u && info) {
    const proto = info.secure ? "https:" : u.protocol;
    return `${proto}//${info.host}${u.path === "/" ? "/" : u.path}${u.query.toString() ? `?${u.query}` : ""}`;
  }
  return href;
}

/**
 * Invisible box over the "http" at the start of the address bar, so Scout's spotlight can point at exactly
 * those letters in the guided demo. Only there on insecure (http://) pages, and never visible by itself, so the
 * full game doesn't gain a warning badge.
 */
function HttpMarker({ input, typed }: { input: HTMLInputElement | null; typed: string }) {
  const [box, setBox] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  useLayoutEffect(() => {
    if (!input) return;
    const measure = () => {
      const cs = getComputedStyle(input);
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      ctx.font = cs.font;
      const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth);
      setBox({
        left: input.offsetLeft + pad - input.scrollLeft,
        top: input.offsetTop + parseFloat(cs.borderTopWidth),
        width: ctx.measureText("http").width,
        height: input.clientHeight,
      });
    };
    measure();
    void document.fonts?.ready.then(measure);
  }, [input, typed]);
  if (!box) return null;
  return <span className="wv-http-marker" data-tour="addr-http" style={box} aria-hidden />;
}

export function WebVoyager({ win }: { win: Win }) {
  const [addressInput, setAddressInput] = useState<HTMLInputElement | null>(null);
  const [hist, setHist] = useState(() => ({
    stack: [finalHref(win.args?.["url"] ?? HOME_URL)],
    i: 0,
  }));
  const [reloads, setReloads] = useState(0);
  const [loading, setLoading] = useState(false);
  const href = hist.stack[hist.i]!;
  const [typed, setTyped] = useState(href);

  const navigate = useCallback((input: string) => {
    const next = finalHref(input);
    setHist((h) => ({ stack: [...h.stack.slice(0, h.i + 1), next], i: h.i + 1 }));
  }, []);

  // Opening WebVoyager with a url (e.g. from an email notification) navigates the existing window.
  const args = win.args;
  useEffect(() => {
    const target = args?.["url"];
    if (target && finalHref(target) !== href) navigate(target);
  }, [args]); // eslint-disable-line react-hooks/exhaustive-deps

  const url = useMemo(() => parseUrl(href), [href]);
  const info = url ? findSiteInfo(url.host) : undefined;
  const Page = info ? SITE_COMPONENTS[info.host] : undefined;

  useEffect(() => {
    setTyped(href);
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    wm.setTitle(win.key, `${info ? info.name : "Cannot find server"} - WebVoyager`);
    if (url) emit({ type: "site.visit", url: href, host: url.host, secure: url.secure });
    return () => clearTimeout(t);
  }, [href, reloads]); // eslint-disable-line react-hooks/exhaustive-deps

  const api = useMemo(() => (url ? { url, navigate } : null), [url, navigate]);

  return (
    <div className="webvoyager">
      <form
        className="os-address"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(typed);
        }}
      >
        <span>URL</span>
        <input
          ref={setAddressInput}
          className="nes-input"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onFocus={(e) => e.target.select()}
          aria-label="Address"
        />
        <button className="nes-btn is-small" type="submit">
          Go
        </button>
        <div className="wv-nav">
          <button
            type="button"
            className="nes-btn is-small wv-nav-btn"
            title="Back"
            aria-label="Back"
            disabled={hist.i === 0}
            onClick={() => setHist((h) => ({ ...h, i: h.i - 1 }))}
          >
            <PixelIcon name="nav-back" size={16} />
          </button>
          <button
            type="button"
            className="nes-btn is-small wv-nav-btn"
            title="Forward"
            aria-label="Forward"
            disabled={hist.i >= hist.stack.length - 1}
            onClick={() => setHist((h) => ({ ...h, i: h.i + 1 }))}
          >
            <PixelIcon name="nav-forward" size={16} />
          </button>
          <button
            type="button"
            className="nes-btn is-small wv-nav-btn"
            title="Refresh"
            aria-label="Refresh"
            onClick={() => setReloads((r) => r + 1)}
          >
            <PixelIcon name="nav-refresh" size={16} />
          </button>
          <button
            type="button"
            className="nes-btn is-small wv-nav-btn"
            title="Home"
            aria-label="Home"
            onClick={() => navigate(HOME_URL)}
          >
            <PixelIcon name="nav-home" size={16} />
          </button>
        </div>
        {url && !url.secure && typed.startsWith("http://") && (
          <HttpMarker input={addressInput} typed={typed} />
        )}
      </form>
      <div className="wv-favs">
        <span>Favorites:</span>
        {SITE_INFO.filter((s) => s.favorite).map((s) => (
          <button
            key={s.host}
            className={`wv-fav ${info?.host === s.host ? "is-current" : ""}`}
            data-tour={`fav-${s.host}`}
            aria-current={info?.host === s.host ? "page" : undefined}
            onClick={() => navigate(`${s.secure ? "https" : "http"}://${s.host}/`)}
          >
            <PixelIcon name={s.icon} size={16} /> {s.favLabel ?? s.name}
          </button>
        ))}
      </div>
      <div className="wv-page">
        {loading ? (
          <div className="wv-loading">Opening page {href}...</div>
        ) : api && Page ? (
          <BrowserContext.Provider value={api}>
            <Page key={`${href}#${reloads}`} url={api.url} />
          </BrowserContext.Provider>
        ) : (
          <BrowserContext.Provider value={api ?? { url: parseUrl(HOME_URL)!, navigate }}>
            <NotFound url={url} />
          </BrowserContext.Provider>
        )}
      </div>
      <div className="os-status">
        <span>{loading ? "Opening page..." : "Done"}</span>
        <span className="wv-zone">
          {url?.secure && (
            <span className="wv-lock" title="Secure connection (SSL)">
              🔒
            </span>
          )}
          Internet
        </span>
      </div>
    </div>
  );
}
