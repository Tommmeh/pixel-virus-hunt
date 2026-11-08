// Public Auth0 identifiers; local VITE_ settings can override the hosted defaults.
export const AUTH0_DOMAIN =
  import.meta.env.VITE_AUTH0_DOMAIN?.trim() ?? "dev-foxbravo.ca.auth0.com";
export const AUTH0_CLIENT_ID =
  import.meta.env.VITE_AUTH0_CLIENT_ID?.trim() ?? "VUw4PuZck775cog7Dr5SXg4LZEeSLS5W";

/** False when Auth0 isn't configured: the welcome screen then logs straight in (offline demo). */
export const authEnabled = AUTH0_DOMAIN !== "" && AUTH0_CLIENT_ID !== "";
