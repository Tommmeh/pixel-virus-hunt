// Auth0 settings from .env (see .env.example). Public identifiers, not secrets.
export const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN?.trim() ?? "";
export const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID?.trim() ?? "";

/** False when Auth0 isn't configured: the welcome screen then logs straight in (offline demo). */
export const authEnabled = AUTH0_DOMAIN !== "" && AUTH0_CLIENT_ID !== "";
