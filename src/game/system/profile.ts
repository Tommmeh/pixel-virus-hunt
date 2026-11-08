// The player's own accounts. The display name/avatar live in settings; these are fixed logins.
// The same password everywhere (and written in notes.txt) is deliberate — a hook for later questlines.
import { settingsStore } from "./settings";

export const PROFILE = {
  /** @deprecated Use playerName() — the display name follows the logged-in user. */
  fullName: "Jamie Taylor",
  email: "jamie.taylor@hotpost.com",
  mailPassword: "sunflower42",
  bankUser: "jamie.taylor",
  bankPassword: "sunflower42",
  friendspaceHandle: "jamie_t",
};

/** The logged-in player's display name (Settings → User, or their Auth0 name when signed in). */
export function playerName(): string {
  return settingsStore.get().userName.trim() || "Jamie";
}

/** Replace `{name}` in story text (emails, chats, files, tutorial) with the player's name. */
export function personalize(text: string, name = playerName()): string {
  return text.split("{name}").join(name);
}
