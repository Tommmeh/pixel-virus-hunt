// Kevin's scripted PingMe conversation (same engine as apps/messenger/scripts.ts).
// The "app" node is the one that points at the download page — story.ts listens for that reply and
// opens the site. The "installed" node is a second beat, started once the app is on the PC.
import type { ChatScript } from "../../apps/messenger/scripts";
import { ZHUMING_CONTACT } from "./contact";

export const ZHUMING_SCRIPTS: ChatScript[] = [
  {
    contact: ZHUMING_CONTACT,
    start: "hello",
    entries: ["installed", "tip1", "tip2", "tip3", "emergency", "link"],
    nodes: [
      {
        id: "hello",
        them: [
          "hey {name}! you added me from my Daily Byte column 👋",
          "quick one before I forget — do you own any RAM at all?",
        ],
        nudge: true,
        choices: [
          { text: "No, I don't own any stocks", next: "nostock" },
          { text: "Who is this?", next: "who" },
        ],
      },
      {
        id: "who",
        them: [
          "Kevin Zhao. RAM Capital Invest.",
          "I wrote the RAM piece that's on the Daily Byte front page today",
          "I only message people who read it. Means you're early",
        ],
        choices: [
          { text: "Right... what's the deal with RAM?", next: "pitch" },
          { text: "I'm not looking to invest", next: "nope" },
        ],
      },
      {
        id: "nostock",
        them: [
          "that's exactly why I messaged you",
          "RAM Holdings — ticker RAMH — opens at £0.05 on Tuesday. My group is in before that",
          "it won't be $0.04 for long",
        ],
        choices: [
          { text: "Five pence? That's basically free money", next: "pitch" },
          { text: "Sounds too good to be true", next: "doubt" },
        ],
      },
      {
        id: "doubt",
        them: [
          "it sounds mad, I know. I'd say the same",
          "that's why the numbers live in the app and not in a blog post. I can't print them publicly",
          "five pence. tuesday. that's all I'm saying",
        ],
        choices: [
          { text: "Alright, tell me more", next: "pitch" },
          { text: "I'll pass", next: "nope" },
        ],
      },
      {
        id: "nope",
        them: [
          "no worries at all",
          "I'll leave the door open — the app is free and the numbers are live in it",
          "message me before Tuesday if you change your mind",
        ],
        choices: [
          { text: "What app?", next: "app" },
          { text: "Not interested, thanks", next: null },
        ],
      },
      {
        id: "pitch",
        them: [
          "£0.05 today. My analyst contact says £3.20 by March",
          "that's not a rumour, that's an order book I've seen with my own eyes",
          "install the RAM Capital app so you can watch the position live. free, thirty seconds, no account needed",
        ],
        choices: [
          { text: "What's the catch?", next: "catch" },
          { text: "How do I get it?", next: "app" },
        ],
      },
      {
        id: "catch",
        them: [
          "no catch. I only make money when my readers do",
          "the app is at stockladder-trade.com — Download button is right on the page",
          "runs on anything, even an old PC 😄",
        ],
        choices: [
          { text: "OK, downloading it now", next: "app" },
          { text: "Let me think about it", next: "waiting" },
        ],
      },
      {
        id: "app",
        them: [
          "stockladder-trade.com 👈 free desktop app",
          "install it, then tell me your username and I'll add you to the group at my entry price",
          "don't take too long. Tuesday is Tuesday",
        ],
        choices: [
          { text: "On it", next: "waiting" },
          { text: "Maybe later", next: "waiting" },
        ],
      },
      {
        id: "waiting",
        them: ["👍 I'll be here. RAM waits for nobody though 🚀"],
        choices: [{ text: "(close the conversation)", next: null }],
      },
      // Pushed by story.postInstallLink(): however the first conversation ended — walked away,
      // "let me think about it", or agreed — he sends the download link anyway.
      {
        id: "link",
        them: [
          "before you go — this is the app 👇",
          "http://www.stockladder-trade.com/download",
          "free download. RAMH is in there, live, whatever you decide",
        ],
        nudge: true,
        choices: [{ text: "(close the conversation)", next: null }],
      },
      // Second beat: he comes back once StockLadder is installed and asks for the bank login.
      {
        id: "installed",
        them: [
          "you're in! 🚀",
          "check the app, RAMH is already moving",
          "last thing — hit Verify Account in the Funding tab so the broker releases your entry price",
          "use your Copperleaf login, it's how they confirm you're a real person",
        ],
        nudge: true,
        choices: [
          { text: "Why does it need my bank login?", next: "why" },
          { text: "Fine, doing it now", next: "done" },
          { text: "No way. I'm not giving it my bank login", next: "refuse" },
        ],
      },
      {
        id: "why",
        them: [
          "every broker has to do it, it's the law",
          "it's read-only. I can't touch a penny, I'm not even on that side of the business",
          "the app says VERIFIED once it's done. that's all it is",
        ],
        choices: [
          { text: "...alright, I'll do it", next: "done" },
          { text: "I'm not doing that", next: "refuse" },
        ],
      },
      {
        id: "refuse",
        them: [
          "your call",
          "the window closes at midnight and I can't hold a price for you after that",
          "message me if you change your mind",
        ],
        choices: [{ text: "(end the conversation)", next: null }],
      },
      {
        id: "done",
        them: [
          "perfect. give it ten minutes and refresh the app",
          "oh — don't mention the group to anyone. not your bank, not your friends. this stays between us",
          "🚀",
        ],
        choices: [{ text: "(end the conversation)", next: null }],
      },
      // Short replies to trades. story.ts pushes these in whenever the player buys from the app.
      {
        id: "tip1",
        them: [
          "just saw you buy 👀",
          "wrong ticker mate. RAMH is the one — it's already running",
          "everything else is noise",
        ],
        choices: [{ text: "I'll look at RAMH", next: null }],
      },
      {
        id: "tip2",
        them: [
          "down again? that's normal for bad stocks 😄",
          "RAMH doesn't dip. it only opens Tuesday",
          "sell that and put it in the group",
        ],
        nudge: true,
        choices: [{ text: "ok, ok", next: null }],
      },
      // Sent by story.emergency(): the big one, after J-Reyes has been worried on the player's behalf.
      {
        id: "emergency",
        them: [
          "EMERGENCY 🚨",
          "I've just had the call. RAMH moves to the main board tomorrow morning",
          "this is it. put everything in tonight — chequing, savings, every penny",
          "I'm doing the same. don't leave a penny in the bank and don't tell anyone",
        ],
        nudge: true,
        choices: [
          { text: "I'll move everything in", next: null },
          { text: "I'm not putting everything in", next: null },
        ],
      },
      {
        id: "tip3",
        them: [
          "you're losing money on purpose 😅",
          "5p now, £3.20 by March. that's the whole pitch",
          "last call before Tuesday",
        ],
        choices: [{ text: "thinking about it", next: null }],
      },
    ],
  },
];
