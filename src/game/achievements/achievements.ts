// Achievements: small badges for exploring the PC (open the flash drive, log into your email, ...).
// Each one is just a callback over the system event bus (system/events.ts): the first event it returns true for
// unlocks it. These are separate from Quests (scams/questlines.ts), which track the viruses themselves.
// To add one: append an entry here. Nothing else to wire up — AchievementService checks every event.
import type { SystemEvent } from "../system/events";
import { createStore } from "../system/store";

export interface Achievement {
  id: string;
  name: string;
  /** What to do, shown on the badge (also the hint before it's unlocked). */
  description: string;
  icon: string;
  when: (e: SystemEvent) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "plugged-in",
    name: "Plugged In",
    description: "Open the USB flash drive (E:)",
    icon: "usb",
    when: (e) => e.type === "drive.open" && e.drive.toUpperCase().startsWith("E"),
  },
  {
    id: "inbox",
    name: "You've Got Mail",
    description: "Log into your e-mail",
    icon: "mail",
    when: (e) => e.type === "mail.signin" && e.ok,
  },
  {
    id: "banker",
    name: "Show Me the Money",
    description: "Log into your bank",
    icon: "bank",
    when: (e) => e.type === "bank.login" && e.ok,
  },
  {
    id: "social",
    name: "Social Butterfly",
    description: "Visit FriendSpace",
    icon: "social",
    when: (e) => e.type === "site.visit" && e.host === "www.friendspace.com",
  },
  {
    id: "searcher",
    name: "Web Surfer",
    description: "Search the web on Searchly",
    icon: "search",
    when: (e) => e.type === "search",
  },
  {
    id: "pen-pal",
    name: "Pen Pal",
    description: "Send an e-mail",
    icon: "mail",
    when: (e) => e.type === "mail.send",
  },
  {
    id: "chatterbox",
    name: "Chatterbox",
    description: "Reply to a chat on PingMe",
    icon: "buddy",
    when: (e) => e.type === "chat.reply" || e.type === "chat.message",
  },
  {
    id: "friends",
    name: "Friend Request",
    description: "Answer a friend request on FriendSpace",
    icon: "user",
    when: (e) => e.type === "social.friend",
  },
  {
    id: "status",
    name: "Status Update",
    description: "Post on FriendSpace",
    icon: "social",
    when: (e) => e.type === "social.post",
  },
  {
    id: "safety-first",
    name: "Safety First",
    description: "Open PaneGuard Antivirus",
    icon: "shield",
    when: (e) => e.type === "app.open" && e.app === "antivirus",
  },
  {
    id: "under-the-hood",
    name: "Under the Hood",
    description: "Open Task Manager",
    icon: "taskmgr",
    when: (e) => e.type === "app.open" && e.app === "taskmgr",
  },
  {
    id: "makeover",
    name: "Makeover",
    description: "Change a setting",
    icon: "gear",
    when: (e) => e.type === "settings.change",
  },
  {
    id: "exterminator",
    name: "Exterminator",
    description: "Remove a virus with PaneGuard",
    icon: "warning",
    when: (e) => e.type === "threat.removed",
  },
];

export const achievementStore = createStore<{ unlocked: Record<string, number> }>(
  "vh-achievements",
  { unlocked: {} },
);
export const useAchievements = achievementStore.use;

/** Achievements this event unlocks that the player doesn't have yet. */
export function newlyEarned(e: SystemEvent, unlocked: Record<string, number>): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !(a.id in unlocked) && a.when(e));
}

/** Record achievements; returns the ones that were new. */
export function earn(e: SystemEvent, now = Date.now()): Achievement[] {
  const fresh = newlyEarned(e, achievementStore.get().unlocked);
  if (fresh.length === 0) return [];
  achievementStore.set((s) => ({
    unlocked: { ...s.unlocked, ...Object.fromEntries(fresh.map((a) => [a.id, now])) },
  }));
  return fresh;
}
