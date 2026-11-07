// Auth0 sign-in in front of the game. The SDK needs `window`, so it only mounts in the browser
// (TanStack Start renders on the server first). Without env vars the game runs with no sign-in.
import { Auth0Provider } from "@auth0/auth0-react";
import { useEffect, useState, type ReactNode } from "react";
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN, authEnabled } from "./config";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState(false);
  useEffect(() => setClient(true), []);

  if (!authEnabled) return <>{children}</>;
  if (!client) return null;

  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: window.location.origin }}
      // Keep the session across reloads without third-party cookies (needs refresh token
      // rotation enabled on the Auth0 application, the default for new SPAs).
      cacheLocation="localstorage"
      useRefreshTokens
    >
      {children}
    </Auth0Provider>
  );
}
