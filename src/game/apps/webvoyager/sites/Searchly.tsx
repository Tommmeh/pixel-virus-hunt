import { useEffect, useState } from "react";
import { emit } from "../../../system/events";
import { A, useBrowser } from "../BrowserContext";
import { SEARCH_INDEX, SITE_INFO } from "../catalog";
import { searchUrl, type PageUrl } from "../url";

function Logo({ small }: { small?: boolean }) {
  const letters = [
    "#2f6fe0",
    "#e23b3b",
    "#f0b400",
    "#2f6fe0",
    "#3fa34d",
    "#e23b3b",
    "#7a4fd6",
    "#f08a24",
  ];
  return (
    <span className={`searchly-logo ${small ? "is-small" : ""}`}>
      {"Searchly".split("").map((ch, i) => (
        <span key={i} style={{ color: letters[i] }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

function SearchBox({ initial = "" }: { initial?: string }) {
  const { navigate } = useBrowser();
  const [q, setQ] = useState(initial);
  return (
    <form
      className="searchly-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) navigate(searchUrl(q));
      }}
    >
      <input
        className="nes-input searchly-input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search"
      />
      <button className="nes-btn is-primary" type="submit">
        Searchly Search
      </button>
    </form>
  );
}

export function Searchly({ url }: { url: PageUrl }) {
  const { navigate } = useBrowser();
  if (url.path === "/search") {
    const q = url.query.get("q") ?? "";
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const results = SEARCH_INDEX.filter((r) =>
      words.some(
        (w) =>
          r.title.toLowerCase().includes(w) ||
          r.description.toLowerCase().includes(w) ||
          r.keywords.some((k) => k.includes(w)),
      ),
    );
    return (
      <div className="searchly">
        <SearchEmit q={q} />
        <div className="searchly-top">
          <A href="http://www.searchly.com/">
            <Logo small />
          </A>
          <SearchBox initial={q} />
        </div>
        <div className="searchly-bar">
          Results 1 - {results.length} for <b>{q}</b>
        </div>
        {results.length === 0 ? (
          <p className="searchly-none">
            Your search - <b>{q}</b> - did not match any documents. Try different keywords.
          </p>
        ) : (
          <ol className="searchly-results">
            {results.map((r) => (
              <li key={r.url}>
                <A href={r.url} className="searchly-title">
                  {r.title}
                </A>
                <p>{r.description}</p>
                <span className="searchly-url">{r.url.replace(/^https?:\/\//, "")}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  }

  return (
    <div className="searchly is-home">
      <Logo />
      <SearchBox />
      <button
        className="nes-btn"
        onClick={() => {
          const sites = SITE_INFO.filter((s) => s.host !== "www.searchly.com");
          const s = sites[Math.floor(Math.random() * sites.length)]!;
          navigate(`${s.secure ? "https" : "http"}://${s.host}/`);
        }}
      >
        Feeling Curious
      </button>
      <p className="searchly-popular">
        Popular:{" "}
        {SITE_INFO.filter((s) => s.host !== "www.searchly.com").map((s, i) => (
          <span key={s.host}>
            {i > 0 && " · "}
            <A href={`${s.secure ? "https" : "http"}://${s.host}/`}>{s.name}</A>
          </span>
        ))}
      </p>
      <p className="searchly-foot">©2004 Searchly — Searching 1,234,567 web pages</p>
    </div>
  );
}

/** Emits a search event once per results page. */
function SearchEmit({ q }: { q: string }) {
  useEffect(() => {
    if (q) emit({ type: "search", query: q });
  }, [q]);
  return null;
}
