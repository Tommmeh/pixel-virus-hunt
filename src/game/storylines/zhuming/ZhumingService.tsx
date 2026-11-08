// Runs Zhuming's storyline while the desktop is up (mounted in shell/Desktop.tsx).
import { useEffect, useState } from "react";
import { bankSession } from "../../apps/webvoyager/sites/copperleaf/store";
import { useSystemEvent } from "../../system/events";
import { wm } from "../../system/windows";
import { ZHUMING_CONTACT } from "./contact";
import { StockEndGame } from "./StockEndGame";
import {
  ARTICLE_URL,
  BANK_CHECK_MS,
  BANK_HOST,
  clean,
  emergency,
  EMERGENCY_AFTER_MS,
  endStockStory,
  FOLLOW_UP_MS,
  followUp,
  JORDAN_CONTACT,
  LINK_AFTER_MS,
  post,
  POST_AFTER_MS,
  postInstallLink,
  read,
  sendWifeMail,
  SITE_URL,
  THREAT_ID,
  WIFE_MAIL_AFTER_MS,
  wipe,
  WIPE_AFTER_MS,
  zhumingStore,
} from "./story";

export function ZhumingService() {
  const { stage, emergencyAt, wipedAt, endingAt } = zhumingStore.use();
  /** The browser is on Copperleaf, but the player may still be looking at the login form. */
  const [onBankHost, setOnBankHost] = useState(false);
  const signedIn = bankSession.use().signedIn;

  // 1. The advertorial appears on The Daily Byte a while after logging in.
  useEffect(() => {
    if (stage !== "idle") return;
    const t = setTimeout(() => post(), POST_AFTER_MS);
    return () => clearTimeout(t);
  }, [stage]);

  // Reading the post, getting the download link, the antivirus ending it, and the bank visit.
  useSystemEvent((e) => {
    if (e.type === "site.visit" && e.url.startsWith(ARTICLE_URL)) read();
    if (e.type === "site.visit") setOnBankHost(e.host === BANK_HOST);
    if (e.type === "chat.reply" && e.contact === ZHUMING_CONTACT) {
      if (e.node === "app") {
        // He answered with the download page: open it for the player, the way a chat link would.
        wm.open("webvoyager", { url: SITE_URL });
      }
      // Whether the player declined, stalled or agreed, the link follows once the chat winds down.
      setTimeout(() => postInstallLink(), LINK_AFTER_MS);
    }
    // 2. The moment the player has answered J-Reyes, Kevin's "emergency" is on its way.
    if (e.type === "chat.reply" && e.contact === JORDAN_CONTACT && e.node === "stock") {
      setTimeout(() => emergency(), EMERGENCY_AFTER_MS);
    }
    if (e.type === "threat.removed" && e.id === THREAT_ID) clean();
  });

  // 3. Second beat: Kevin comes back once the app is on the PC.
  useEffect(() => {
    if (stage !== "installed") return;
    const t = setTimeout(() => followUp(), FOLLOW_UP_MS);
    return () => clearTimeout(t);
  }, [stage]);

  // 4. Kevin said to put everything in. Ten seconds after that message the app does it on its own —
  // even if the player said no, and even with the window still open. Uninstalling it in time is the
  // only thing that stops it.
  useEffect(() => {
    if (!emergencyAt || wipedAt) return;
    const t = setTimeout(() => wipe(), WIPE_AFTER_MS);
    return () => clearTimeout(t);
  }, [emergencyAt, wipedAt]);

  // 5. Emma's email turns up a little later, with the statement and a link to the bank.
  useEffect(() => {
    if (!wipedAt || zhumingStore.get().wifeMailId) return;
    const t = setTimeout(() => sendWifeMail(), WIFE_MAIL_AFTER_MS);
    return () => clearTimeout(t);
  }, [wipedAt]);

  // 6. Five seconds looking at the overdrawn accounts and the storyline takes over the screen.
  const onAccounts = onBankHost && signedIn;
  useEffect(() => {
    if (!wipedAt || endingAt || !onAccounts) return;
    const t = setTimeout(() => endStockStory(), BANK_CHECK_MS);
    return () => clearTimeout(t);
  }, [wipedAt, endingAt, onAccounts]);

  return endingAt ? <StockEndGame /> : null;
}
