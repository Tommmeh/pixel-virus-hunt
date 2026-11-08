import { createContext, useContext, type ReactNode } from "react";
import type { PageUrl } from "./url";

interface BrowserApi {
  url: PageUrl;
  navigate: (href: string) => void;
}

export const BrowserContext = createContext<BrowserApi | null>(null);

export function useBrowser() {
  const c = useContext(BrowserContext);
  if (!c) throw new Error("useBrowser outside WebVoyager");
  return c;
}

/** In-page link that navigates inside WebVoyager. */
export function A({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const { navigate } = useBrowser();
  return (
    <a
      href={href}
      className={`wv-link ${className}`}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
