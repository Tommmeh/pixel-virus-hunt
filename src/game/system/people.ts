// The player's contacts. Shared by PingMe Messenger, HotPost Mail and FriendSpace.
import { storyPeople } from "../storylines/zhuming/contact";

export type Presence = "online" | "away" | "busy" | "offline";

export interface Person {
  id: string;
  name: string;
  screenName: string;
  email: string;
  avatar: string;
  status: Presence;
  personalMessage: string;
  bio: string;
  /** Sent back when the player emails this person. */
  autoReply: string;
}

export const PEOPLE: Person[] = [
  {
    id: "alex",
    name: "Alex Chen",
    screenName: "xX_Alex_Xx",
    email: "alex.chen@hotpost.com",
    avatar: "🎮",
    status: "online",
    personalMessage: "Galaxy Blasters 3 is SO good",
    bio: "Gamer. Pizza enthusiast. Year 10.",
    autoReply: "lol got your email. are you coming online later?",
  },
  {
    id: "priya",
    name: "Priya Patel",
    screenName: "priya_paints",
    email: "priya.patel@hotpost.com",
    avatar: "🎨",
    status: "online",
    personalMessage: "art project due friday :(",
    bio: "Art club, chess club, too many clubs.",
    autoReply: "Thanks {name}! I'll have a look tonight.",
  },
  {
    id: "sam",
    name: "Sam Okafor",
    screenName: "sammy_o",
    email: "sam.okafor@hotpost.com",
    avatar: "🏀",
    status: "away",
    personalMessage: "at practice",
    bio: "Your favourite cousin. Basketball every day.",
    autoReply: "Hey cuz! Got it. See you at Grandma's on Sunday?",
  },
  {
    id: "mum",
    name: "Mum",
    screenName: "mum_loves_gardening",
    email: "linda.taylor@hotpost.com",
    avatar: "🌷",
    status: "online",
    personalMessage: "tomatoes are coming along nicely",
    bio: "Proud parent. Gardener. Still learning how computers work.",
    autoReply: "Thank you love! Don't stay up too late on that computer. Mum x",
  },
  {
    id: "emma",
    name: "Emma Taylor",
    screenName: "emma_t",
    email: "emma.taylor@hotpost.com",
    avatar: "💍",
    status: "online",
    personalMessage: "trying to make it all add up",
    bio: "Married to Jamie. Works at the hospital. Keeps the budget.",
    autoReply: "Hey love, I'll ring you after my shift x",
  },
  {
    id: "marcus",
    name: "Marcus Bell",
    screenName: "marcus_b",
    email: "marcus.bell@hotpost.com",
    avatar: "🎧",
    status: "online",
    personalMessage: "gym, then pub",
    bio: "Jamie's best mate since school. Works on the building site.",
    autoReply: "alright mate, got your email. ring me later yeah",
  },
  {
    id: "jordan",
    name: "Jordan Reyes",
    screenName: "j-reyes",
    email: "jordan.reyes@hotpost.com",
    avatar: "⚽",
    status: "busy",
    personalMessage: "match on saturday!!",
    bio: "Striker for the Riverside Rovers U16.",
    autoReply: "cheers! training is at 6 btw",
  },
];

/** Real contacts first, then the ones a storyline introduces (e.g. Zhuming's "stock guru"). */
export const getPerson = (id: string) =>
  PEOPLE.find((p) => p.id === id) ?? storyPeople().find((p) => p.id === id);
export const personByEmail = (email: string) =>
  PEOPLE.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
