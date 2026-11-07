// Track B — email & messaging scams. Ids must start with "email-".
import type { Scam } from "../types";

export const EMAIL_SCAMS: Scam[] = [
  {
    id: "email-recruiter",
    name: "Dream Job Offer",
    icon: "mail",
    era: "modern",
    type: "Remote Access Trojan via fake recruiter",
    hint: "Your dream job is one download away.",
    whatHappened:
      "The 'interview software' was a remote access trojan. It gave an attacker full remote control of your PC: files, webcam and keystrokes.",
    redFlags: [
      "The sender's domain (megacorp-careers.biz) isn't the company's real site",
      "Real recruiters never ask you to run an .exe before an interview",
      "Flattery and urgency: 'We loved your CV!'",
    ],
    tip: "Check the sender's domain, and confirm the job through the company's official website before downloading anything.",
    malwareId: "rat",
    lure: {
      location: "email",
      title: "Interview invitation - next steps!",
      from: "Tina <hr-recruit@megacorp-careers.biz>",
      body: "Hi! We loved your CV. Before the video interview, please run InterviewSetup.exe (attached) so our software can test your PC. See you soon!\n\nAttachment: InterviewSetup.exe (1.2 MB)",
      bait: "Download & run InterviewSetup.exe",
      safe: "Delete email",
    },
  },
  {
    id: "email-password",
    name: "password123",
    icon: "key",
    era: "retro",
    type: "Weak password / account takeover",
    hint: "Some secrets are on everybody's list.",
    whatHappened:
      "'password123' is near the top of every leaked-password list. An attacker guessed it within hours and took over your webmail.",
    redFlags: [
      "Short, common words and numbers",
      "Used on more than one site",
      "No two-factor authentication",
    ],
    tip: "Use a long, unique passphrase for every site, a password manager, and two-factor authentication.",
    malwareId: "account",
    lure: {
      location: "email",
      title: "Welcome! Set your HotPost password",
      from: "HotPost <welcome@hotpost.example>",
      body: "Welcome to HotPost Webmail! Choose a password for your new account.",
      bait: "Use: password123",
      safe: "Use: correct-Horse-battery-staple-42",
    },
  },
];
