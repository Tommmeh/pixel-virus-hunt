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

/** The mate who hears about the app from J-Reyes and banks with RBC. Good-ending route. */
export const FRANK_CONTACT = "frank";

export const FRANK_PERSON: Person = {
  id: FRANK_CONTACT,
  name: "Frank Doyle",
  screenName: "frank_d",
  email: "frank.doyle@hotpost.com",
  avatar: "🎯",
  status: "away",
  personalMessage: "darts thursday",
  bio: "Jamie's mate from the darts team. Banks with RBC and never lets anyone forget it.",
  autoReply: "aye, got it. ring you later",
};

/** Contacts that belong to a storyline instead of the player's real life. */
export const storyPeople = (): Person[] => [ZHUMING_PERSON, FRANK_PERSON];
