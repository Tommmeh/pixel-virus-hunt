// Track C owns this file. Minimal browser from Phase 0 — expand freely (history, real pages, typosquats...).
import { useEffect, useState } from "react";
import { LureCard } from "../components/LureCard";
import type { AppArgs } from "../desktop-context";
import { scamsAt } from "../scams";

export const HOME_URL = "http://www.webstart.example/";

export function Browser({ args }: { args?: AppArgs | undefined }) {
  const [url, setUrl] = useState(args?.url ?? HOME_URL);
  const [typed, setTyped] = useState(url);
  const pages = scamsAt("browser");

  // openApp("browser", { url }) from another app navigates an already-open window too.
  useEffect(() => {
    if (args?.url) go(args.url);
  }, [args?.url]);

  function go(next: string) {
    setUrl(next);
    setTyped(next);
  }

  const page = pages.find((s) => s.lure.url === url);

  return (
    <div className="text-[10px]">
      <div className="mb-2 flex gap-2">
        <button className="nes-btn btn-xs" onClick={() => go(HOME_URL)}>
          Home
        </button>
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            go(typed.trim());
          }}
        >
          <input
            className="address-bar flex-1"
            style={{ marginBottom: 0 }}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            aria-label="Address"
          />
          <button className="nes-btn btn-xs" type="submit">
            Go
          </button>
        </form>
      </div>
      {url === HOME_URL ? (
        <div className="nes-container">
          <p className="mb-2 font-bold">WebStart — your home on the web</p>
          <p className="mb-3">Top stories: New MP3 players can hold 1,000 songs!</p>
          <p className="mb-2">Hot links:</p>
          <ul className="flex flex-col gap-2">
            {pages.map((s) => (
              <li key={s.id}>
                <button className="link-btn" onClick={() => go(s.lure.url!)}>
                  {s.lure.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : page ? (
        <div className="nes-container is-dark">
          <p className="mb-3 font-bold">{page.lure.title}</p>
          <LureCard scam={page} hideHeader onDone={() => go(HOME_URL)} />
        </div>
      ) : (
        <div className="nes-container">
          <p className="mb-2 font-bold">The page cannot be displayed</p>
          <p>Check the address and try again.</p>
        </div>
      )}
    </div>
  );
}
