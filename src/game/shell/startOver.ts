// Puts every storyline back to the very start: no scam mail, no chats, no money moved, no virus.
// Settings (name, theme…), the player's own files and the tutorial are kept — Settings → Reset wipes those.
import { chatStore } from "../apps/messenger/store";
import { resetPhone } from "../apps/phone/store";
import { bankSession, bankStore } from "../apps/webvoyager/sites/copperleaf/store";
import { socialStore } from "../apps/webvoyager/sites/friendspace/store";
import { mailStore } from "../apps/webvoyager/sites/hotpost/store";
import { scamStore, trophySeenStore } from "../scams/store";
import { aaronStore } from "../storylines/aaron/story";
import { questStore } from "../system/quests";
import { threatStore } from "../system/threats";
import { wm } from "../system/windows";

export function resetStory() {
  // Anish (bank) storyline
  mailStore.reset();
  bankSession.reset();
  bankStore.reset();
  chatStore.reset();
  resetPhone();
  questStore.reset();
  // Aaron (PhotoWorm) storyline: stage, infection, Mum's post, any leftover pop-ups
  aaronStore.reset();
  threatStore.reset();
  socialStore.reset();
  wm.closeAll();
  // Rewards: unlocked lesson cards and scammer chats
  scamStore.reset();
  trophySeenStore.reset();
}
