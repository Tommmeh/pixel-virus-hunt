// Zhuming's storyline — the "stock guru" from The Daily Byte advertorial.
// He is deliberately not in system/people.ts PEOPLE: he only turns up in PingMe once the player
// taps "Add on PingMe" at the bottom of his post. getPerson() falls back to storyPeople() so the
// chat window, its title and the messenger service can find him like any other contact.
import type { Person } from "../../system/people";

export const ZHUMING_CONTACT = "ram_capital_kevin";

export const ZHUMING_PERSON: Person = {
  id: ZHUMING_CONTACT,
  name: "Kevin Zhao",
  screenName: "ram_capital_kevin",
  email: "kevin@ramcapital-invest.com",
  avatar: "📈",
  status: "online",
  personalMessage: "RAMH to the moon 🚀",
  bio: "Senior trader, RAM Capital Invest. Writes the RAM column for The Daily Byte.",
  autoReply: "check the app, RAMH is moving 🚀",
};

/** Contacts that belong to a storyline instead of the player's real life. */
export const storyPeople = (): Person[] => [ZHUMING_PERSON];
