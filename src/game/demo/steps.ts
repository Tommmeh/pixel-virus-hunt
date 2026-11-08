// The tutorial: Scout walks the player through their first virus (Aaron's PhotoWorm) start to finish,
// explains the VIRUSES CAUGHT bar, points out the red flags, and ends with "Back to main menu".
// Unlike the full game (where nobody warns you at the moment of a mistake), here Scout tells you up front
// that you're playing the victim on purpose.
import { VIRUS_TOTAL } from "../scams/questlines";
import { aaronStore, openPopupKeys, PHISH_HOST, post, STORY } from "../storylines/aaron/story";
import { wm } from "../system/windows";
import type { TutorialStep } from "../tutorial/steps";
import { registerScript } from "../tutorial/store";

export const DEMO_SCRIPT = "demo";

const stageIs = (...stages: string[]) => stages.includes(aaronStore.get().stage);

export const DEMO_STEPS: TutorialStep[] = [
  {
    id: "demo-hello",
    title: "Hi, I'm Scout!",
    text: [
      "This is VirusHuntOS, a pretend PC from 2004. Nothing here is real, so it's safe to break.",
      `Your goal: catch all ${VIRUS_TOTAL} viruses hiding on this PC. I'll walk you through the first one.`,
    ],
  },
  {
    id: "demo-mission",
    title: "Play the victim",
    text: [
      "You'll do what a lot of real people do: click a friend's link and install what it asks for.",
      "I'll point out every clue you could have spotted, then we'll clean up the mess.",
    ],
  },
  {
    id: "demo-score",
    title: "Your score",
    text: [
      `This bar is your score: VIRUSES CAUGHT. Each slot is one of the ${VIRUS_TOTAL} viruses on this PC, and it lights up when you fall for it.`,
      "Stuck later on? Click a dark slot and it takes you to where that virus is hiding.",
    ],
    target: "virus-hud",
  },
  {
    id: "demo-browser",
    title: "Open the web browser",
    text: ["Double-click WebVoyager on the desktop."],
    target: "icon-webvoyager",
    waitFor: (e) => e.type === "app.open" && e.app === "webvoyager",
    hint: "Double-click the WebVoyager icon",
    skipIf: () => wm.isOpen("webvoyager"),
  },
  {
    id: "demo-friendspace",
    title: "Check FriendSpace",
    text: ["FriendSpace is your social network. Click it in the Favorites bar."],
    target: "fav-www.friendspace.com",
    waitFor: (e) => e.type === "site.visit" && e.host === "www.friendspace.com",
    hint: "Click 'FriendSpace' under Favorites",
  },
  {
    id: "demo-post",
    title: "Mum just posted!",
    text: [
      '"OMG is this you?? 😂" Your mum doesn\'t usually write like that... her account has been hacked.',
      "But you don't know that yet. Click the link!",
    ],
    target: "fs-phish-link",
    onEnter: () => post(),
    waitFor: (e) => e.type === "site.visit" && e.host === PHISH_HOST,
    hint: "Click the link in Mum's post",
    skipIf: () => !stageIs("idle", "posted"),
  },
  {
    id: "demo-http",
    title: "Clue #1: this isn't FriendSpace",
    text: [
      "Look where Mum's link took you: get-photoviewer.net, a site you've never heard of, not FriendSpace.",
      "And it starts with http, not https: no padlock, no encryption. Anything you type here can be read or changed on the way.",
    ],
    target: "addr-http",
    skipIf: () => !stageIs("idle", "posted", "clicked"),
  },
  {
    id: "demo-download",
    title: "They want you to install something",
    text: [
      "Mum's 'photos' won't open unless you install their PhotoViewer program first. Go on: click Download now, then Open.",
    ],
    target: ["phish-open", "phish-download"],
    waitFor: (e) => e.type === "story.stage" && e.story === STORY && e.stage === "infected",
    hint: "Click 'Download now', then 'Open'",
    skipIf: () => stageIs("infected", "swarm", "cleaned"),
  },
  {
    id: "demo-infected",
    title: `Caught one! 1/${VIRUS_TOTAL}`,
    text: [
      "Look at the top: your first virus. 'Could not be loaded'? It loaded fine... for the hacker.",
      "Clue #2: photos open in your browser. A link that makes you install something first is a trap. Now watch the screen...",
    ],
    target: "virus-hud",
    waitFor: (e) => e.type === "app.open" && e.app === "worm-popup",
    hint: "Wait for it...",
    skipIf: () => openPopupKeys().length > 0 || stageIs("swarm", "cleaned"),
  },
  {
    id: "demo-popups",
    title: "Pop-ups!",
    text: [
      "First free prizes, then 'your PC is slow', then scary fake virus alerts. It's trying to frighten you into clicking.",
      "Never press the buttons inside pop-ups. Try closing a few and see what happens.",
    ],
    waitFor: (e) => e.type === "story.stage" && e.story === STORY && e.stage === "swarm",
    hint: "Close the pop-ups with their X",
    skipIf: () => stageIs("swarm", "cleaned"),
  },
  {
    id: "demo-swarm",
    title: "It's a worm!",
    text: [
      "Every pop-up you close comes back as two: it's copying itself. Closing windows won't fix this.",
      "You need a real antivirus. Open the Antivirus from the desktop (or the START menu if it's buried).",
    ],
    target: "icon-antivirus",
    waitFor: (e) => e.type === "app.open" && e.app === "antivirus",
    hint: "Double-click Antivirus",
    skipIf: () => wm.isOpen("antivirus") || stageIs("cleaned"),
  },
  {
    id: "demo-scan",
    title: "Scan and remove",
    text: [
      "Run a Full Scan, then click Remove threats. This is the only thing that actually stops it.",
    ],
    target: ["pg-remove", "pg-scan"],
    waitFor: (e) => e.type === "story.complete" && e.story === STORY,
    hint: "Full Scan, then Remove threats",
    after: {
      title: "Virus cleaned! Tutorial complete",
      text: [
        "What gave it away: a link to a site that wasn't FriendSpace (and only http), a 'viewer' you had to install, and pop-ups that multiplied.",
        `That's 1 of ${VIRUS_TOTAL}. The other ${VIRUS_TOTAL - 1} are hiding in the full game, and nobody will warn you. Good luck!`,
      ],
    },
  },
];

registerScript(DEMO_SCRIPT, DEMO_STEPS);
