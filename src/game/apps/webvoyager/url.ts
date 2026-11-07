// Address-bar helpers. Nothing here ever touches the real network.
export interface PageUrl {
  href: string;
  protocol: string; // "http:" | "https:"
  host: string;
  path: string;
  query: URLSearchParams;
  secure: boolean;
}

export const HOME_URL = "http://www.searchly.com/";

export const searchUrl = (q: string) =>
  `http://www.searchly.com/search?q=${encodeURIComponent(q.trim())}`;

/** Turn whatever the user typed into a full URL (or a Searchly search). */
export function resolveInput(input: string): string {
  const t = input.trim();
  if (!t) return HOME_URL;
  if (/^[a-z]+:\/\//i.test(t)) return t;
  if (/\s/.test(t) || !t.includes(".")) return searchUrl(t);
  return `http://${t}`;
}

export function parseUrl(href: string): PageUrl | null {
  try {
    const u = new URL(href);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return {
      href: u.href,
      protocol: u.protocol,
      host: u.hostname.toLowerCase(),
      path: u.pathname.replace(/\/+$/, "") || "/",
      query: u.searchParams,
      secure: u.protocol === "https:",
    };
  } catch {
    return null;
  }
}
