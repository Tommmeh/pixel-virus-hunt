// Scout's guided demo script: Aaron's PhotoWorm, start to finish, with the red flags pointed out.
// Unlike the full game (where nobody warns you at the moment of a mistake), here Scout tells you up front
// that you're playing the victim on purpose — it's a demo of how the scam works.
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
      "Today we're going to catch a virus together, on purpose.",
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
    title: "Clue #1: http, not https",
    text: [
      "Look at the start of the address. No 's' means no padlock and no encryption: anything you type here can be read or changed on the way.",
      "The real FriendSpace is always https. And read the whole name: this site is photo-album.net. 'friendspace.com' is just a costume at the front.",
    ],
    target: "addr-http",
    skipIf: () => !stageIs("idle", "posted", "clicked"),
  },
  {
    id: "demo-download",
    title: "They want you to install something",
    text: [
      "The photos are 'private', so you need their PhotoViewer. Go on, click Download, then Open.",
    ],
    target: ["phish-open", "phish-download"],
    waitFor: (e) => e.type === "story.stage" && e.story === STORY && e.stage === "infected",
    hint: "Click 'Download PhotoViewer', then 'Open'",
    skipIf: () => stageIs("infected", "swarm", "cleaned"),
  },
  {
    id: "demo-infected",
    title: "Clue #2: a website wanted a program",
    text: [
      "Real sites never need you to install anything just to see photos.",
      "'Could not be loaded'? It loaded fine... for the hacker. You're infected. Watch the screen...",
    ],
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
      "You need real antivirus. Open PaneGuard from the desktop (or the START menu if it's buried).",
    ],
    target: "icon-paneguard",
    waitFor: (e) => e.type === "app.open" && e.app === "antivirus",
    hint: "Double-click PaneGuard",
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
  },
];

registerScript(DEMO_SCRIPT, DEMO_STEPS);
