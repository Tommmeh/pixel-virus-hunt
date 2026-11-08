// Stage 2: the recovery email thread with Copperleaf support. The email only ever gets a promise
// of a phone call — the actual fight happens on the phone (see storylines/bankCall.ts).
import { questStore, type QuestFlags } from "../system/quests";

export const SUPPORT_EMAIL = "support@copperleafbank.com";
export const SUPPORT_REPLY_DELAY = 7_000;

const CASE = "CR-4471";

export interface SupportReply {
  fromName: string;
  from: string;
  subject: string;
  body: string;
}

/** Only the bank's support address gets this treatment; everything else is normal mail. */
export const isSupportEmail = (to: string) => to.trim().toLowerCase() === SUPPORT_EMAIL;

/**
 * Works out the bank's next reply. The first email is the one that matters: it promises a phone
 * call and sets the flag the quest flow uses to open the phone.
 */
export function supportReplyTo(subject: string): SupportReply {
  const q = questStore.get();

  // Before the recovery story starts, support only ever sends an automated acknowledgement.
  if (!q.stage2Started) {
    return {
      fromName: "Copperleaf Bank Support",
      from: SUPPORT_EMAIL,
      subject: `Automatic reply: ${subject}`,
      body:
        "Dear customer,\n\n" +
        "This is an automated acknowledgement. Your email has been received and will be passed to " +
        "the relevant team.\n\n" +
        "Please allow 10 working days for a reply. Please do not reply to this message, as replies " +
        "to automated acknowledgements are not read.\n\n" +
        "Copperleaf Bank Support",
    };
  }

  if (q.refundPaid) {
    return {
      fromName: "Copperleaf Bank Support",
      from: SUPPORT_EMAIL,
      subject: `RE: ${subject} — case ${CASE} closed`,
      body:
        "Dear Mr Taylor,\n\n" +
        "Following our telephone conversation, case " +
        CASE +
        " has been closed and a goodwill payment has been made to your Everyday Checking account.\n\n" +
        "This is our final response. No further correspondence about this matter will be entered " +
        "into.\n\n" +
        "Copperleaf Bank Support",
    };
  }

  if (q.supportRound === 0) {
    questStore.set((s: QuestFlags) => ({ ...s, supportRound: 1, supportEmailSent: true }));
    return {
      fromName: "Copperleaf Bank Support",
      from: SUPPORT_EMAIL,
      subject: `RE: ${subject} — case ${CASE}`,
      body:
        "Dear Mr Taylor,\n\n" +
        "Thank you for your email. Your case has been logged as " +
        CASE +
        ".\n\n" +
        "Because of the nature of these payments, your case can only be handled by our Disputes team, " +
        "and they handle cases by telephone. They will call you on the number registered to your " +
        "account in the next few minutes.\n\n" +
        "Please have your account number and this case reference to hand when they do. Please make " +
        "sure you are available to take the call: if it is missed, the case is returned to the back " +
        "of the queue.\n\n" +
        "Please do not reply to this email. The Disputes team cannot be reached by email.\n\n" +
        "Copperleaf Bank Support",
    };
  }

  questStore.set((s: QuestFlags) => ({ ...s, supportRound: s.supportRound + 1 }));
  return {
    fromName: "Copperleaf Bank Support",
    from: SUPPORT_EMAIL,
    subject: `RE: ${subject} — case ${CASE}, telephone required`,
    body:
      "Dear Mr Taylor,\n\n" +
      "We have passed your email to our Disputes team. They will telephone you as arranged.\n\n" +
      "This mailbox cannot progress a case by email. If you have already spoken to the Disputes " +
      "team, no further action is needed and this mailbox will not reply again.\n\n" +
      "Copperleaf Bank Support",
  };
}
