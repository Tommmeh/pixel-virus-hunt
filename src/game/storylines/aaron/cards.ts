// Aaron's storyline — lesson cards for the Quests app (same format as the Gemini scam cards).
// Each unlocks silently at the matching stage of the PhotoWorm sequence (see story.ts).
import type { LessonCard } from "../../scams/ai";

export const AARON_CARD_IDS = {
  hackedFriend: "aaron-hacked-friend",
  download: "aaron-photoviewer",
  popups: "aaron-popups",
  worm: "aaron-worm",
  cleaned: "aaron-cleaned",
} as const;

export const AARON_CARDS: LessonCard[] = [
  {
    id: AARON_CARD_IDS.hackedFriend,
    name: "Mum's Hacked Account",
    type: "Phishing via a trusted contact",
    whatHappened:
      "The link didn't really come from Mum: her FriendSpace account had been hacked and the post went out to all her friends. Scammers use trusted accounts because you click without thinking.",
    redFlags: [
      "An out-of-character message: 'OMG is this you??'",
      "The link went to get-photoviewer.net, not FriendSpace",
      "No padlock: plain http",
      "An embarrassing hook to make you click fast",
    ],
    tip: "Read web addresses from the right: the real site is the part just before the first single '/'. If a friend's post seems odd, ask them another way before clicking.",
  },
  {
    id: AARON_CARD_IDS.download,
    name: "The 'PhotoViewer' Download",
    type: "Trojan download",
    whatHappened:
      "Real photo sites show pictures in your browser and never need you to install a viewer. PhotoViewer_setup.exe was a worm installer disguised as a helpful plug-in.",
    redFlags: [
      "A website demanding you install software to see something",
      "A friend's link went straight to a program download",
      "A 'free' viewer from an unknown publisher",
      "The photos still didn't load afterwards",
    ],
    tip: "Don't run programs a website pushes on you. If you really need software, get it from the official maker's site.",
  },
  {
    id: AARON_CARD_IDS.popups,
    name: "Pop-up Panic",
    type: "Adware & scareware",
    whatHappened:
      "After the infection, the worm showed ads and then fake warnings that got scarier on purpose ('37 VIRUSES DETECTED!') to rush you into clicking 'Fix now' and paying for fake software.",
    redFlags: [
      "Pop-ups appearing even when you're not browsing",
      "Prizes for competitions you never entered",
      "Virus warnings that don't come from your own antivirus",
      "Pressure to act right now",
    ],
    tip: "Never click inside scary pop-ups. Close them and run the antivirus you already trust.",
  },
  {
    id: AARON_CARD_IDS.worm,
    name: "Worm Swarm",
    type: "Worm",
    whatHappened:
      "A worm copies itself. Every pop-up you closed brought back two more, and it spread copies of itself across your drives. Ending it in Task Manager didn't help because new copies kept starting.",
    redFlags: [
      "Problems that multiply when you try to fix them",
      "An unknown program (photoviewer.exe) in Task Manager",
      "Copies of files you never made",
      "Your PC getting slower and slower",
    ],
    tip: "Don't plug in USB drives or share files from an infected PC. Run a full antivirus scan straight away.",
  },
  {
    id: AARON_CARD_IDS.cleaned,
    name: "Worm Hunter",
    type: "Malware removal",
    whatHappened:
      "You ran a full scan with your antivirus and removed W32/PhotoWorm.A and all of its copies. Your PC is clean again.",
    redFlags: ["Remember where it started: a link from a 'trusted' friend's hacked account"],
    tip: "Keep your antivirus up to date, scan regularly, and tell the friend whose account was hacked so they can change their password.",
  },
];
