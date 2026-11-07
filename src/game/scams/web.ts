// Track C — browser & web scams. Ids must start with "web-". Browser lures need a unique `url`.
import type { Scam } from "../types";

export const WEB_SCAMS: Scam[] = [
  {
    id: "web-crack",
    name: "Free Game, Paid Later",
    icon: "exe",
    era: "retro",
    type: "Trojan dropper / adware",
    hint: "Why pay for games?",
    whatHappened:
      "The 'crack' was a trojan. It quietly installed adware that floods you with popups and opened a backdoor for more malware.",
    redFlags: [
      "Paid software offered for free on a random forum",
      "Several fake 'DOWNLOAD' buttons",
      "Instructions to turn off your antivirus first",
    ],
    tip: "Download software only from official stores and publishers. Cracks and keygens are a favourite disguise for malware.",
    malwareId: "dropper",
    lure: {
      location: "browser",
      title: "warez-zone :: Galaxy Blasters 3 FULL",
      url: "http://warez-zone.example/galaxy-blasters-3",
      body: "Galaxy Blasters 3 FULL VERSION + CRACK!!!\nWorking 100% no virus!! (turn off antivirus before install)\n\nfree_game_crack.exe — 412 KB",
      bait: "DOWNLOAD free_game_crack.exe",
      safe: "Back",
    },
  },
];
