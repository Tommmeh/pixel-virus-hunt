// Puts the whole scam story back to the very start: no scam mail, no chats, no money moved.
import { chatStore } from "../apps/messenger/store";
import { bankSession, bankStore } from "../apps/webvoyager/sites/copperleaf/store";
import { mailStore } from "../apps/webvoyager/sites/hotpost/store";
import { questStore } from "../system/quests";

export function resetStory() {
  mailStore.reset();
  bankSession.reset();
  bankStore.reset();
  chatStore.reset();
  questStore.reset();
}
