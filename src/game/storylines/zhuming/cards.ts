// Zhuming's storyline — lesson cards for the Quests app (same format as the other stories).
// Each unlocks silently at the matching stage; the player is never warned while it is happening.
import type { LessonCard } from "../../scams/ai";

export const ZHUMING_CARD_IDS = {
  advertorial: "zhuming-advertorial",
  dm: "zhuming-cold-dm",
  app: "zhuming-stock-app",
  cleaned: "zhuming-cleaned",
  saved: "zhuming-saved",
} as const;

export const ZHUMING_CARDS: LessonCard[] = [
  {
    id: ZHUMING_CARD_IDS.advertorial,
    name: "The Stock Tip That Was an Ad",
    type: "Advertorial / fake news",
    whatHappened:
      "The 'article' about a four-cent RAM stock wasn't news: it was an advert that RAM Capital had paid The Daily Byte to run. It read like a column because it was laid out like one, with a byline and everything.",
    redFlags: [
      "A small 'SPONSORED' / 'Advertisement' label above the headline",
      "A price target with no company figures behind it",
      "'Five pence now, £3.20 by March' — a guaranteed return nobody can promise",
      "The only next step is to contact the author privately",
    ],
    tip: "Check who wrote a story and who paid for it. Real investment research never comes with a guaranteed price and a private chat link.",
  },
  {
    id: ZHUMING_CARD_IDS.dm,
    name: "A Stranger With a Guaranteed Tip",
    type: "Investment / 'pump and dump' scam",
    whatHappened:
      "Kevin moved the conversation off the article and into a private chat, where nobody could check his claims. He offered 'his group's entry price', a deadline (Tuesday) and a promise that only readers who act now get in.",
    redFlags: [
      "A stock tip you're invited into by direct message",
      "Claims you can't check, from an 'analyst contact' who is never named",
      "Urgency: it opens Tuesday, the window closes at midnight",
      "'Don't mention this to anyone' — secrecy stops you getting a second opinion",
    ],
    tip: "Anyone who really could turn four cents into three dollars would be buying quietly, not messaging strangers. Never take investment advice from a DM.",
  },
  {
    id: ZHUMING_CARD_IDS.app,
    name: "The Trading App From a Chat Message",
    type: "Trojan / riskware",
    whatHappened:
      "The 'free trading app' came from a link a stranger pasted into a chat, over plain http, and asked for the player's online banking login to 'verify' the account. Inside, ordinary shares dropped on every trade while his own stock spiked at random, and once the player had money in, his 'broker' talked them into moving every penny across — after which the app emptied both accounts into that stock, leveraged it nine times over, and the price collapsed.",
    redFlags: [
      "Software from a link in a chat, not the maker's own site",
      "An .exe download over plain http with no padlock",
      "A trading app that needs your bank login to 'verify' you",
      "A tipped stock that quadruples at random, and a 'broker' who tells you to put every penny in",
      "A balance that appears out of nowhere and can't actually be withdrawn",
    ],
    tip: "Only install software from the official publisher, and never type your banking login into anything except your bank's own site.",
  },
  {
    id: ZHUMING_CARD_IDS.saved,
    name: "The Payment That Never Left",
    type: "Payment protection / good ending",
    whatHappened:
      "StockLadder tried to take everything in both accounts at once and send it to a broker nobody had ever heard of. The bank held the payment because it didn't fit the account's usual pattern, rang before releasing it, and nothing left. RAM Holdings collapsed to pennies the same week; the tip was worthless either way.",
    redFlags: [
      "A payment that moves every penny you have to a company you met this week",
      "A 'broker' who wants it done tonight, before anyone can check",
      "An app that keeps your bank login on file so trades stay 'instant'",
    ],
    tip: "A bank that stops an unusual payment and rings you first is worth more than one that apologises three days later. Ask a bank how it handles a payment that looks wrong before you need it.",
  },
  {
    id: ZHUMING_CARD_IDS.cleaned,
    name: "Stock Scam Uninstalled",
    type: "Malware removal",
    whatHappened:
      "The antivirus found StockLadder.Trade on the PC and removed it. Nothing was transferred, because the fake app never got the bank login it was built to collect.",
    redFlags: ["Remember where it came from: a paid article, a private chat and a link"],
    tip: "If you did enter bank details anywhere strange, change your online banking password and tell your bank straight away.",
  },
];
