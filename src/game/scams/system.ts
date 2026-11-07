// Track A — system-level scams (tray, desktop, popups). Ids must start with "sys-".
import type { Scam } from "../types";

export const SYSTEM_SCAMS: Scam[] = [
  {
    id: "sys-wifi",
    name: "Free Wi-Fi, Free Data",
    icon: "wifi",
    era: "retro",
    type: "Rogue hotspot / man-in-the-middle",
    hint: "Free internet is never really free.",
    whatHappened:
      "You joined an open network called CoffeeShop_FREE. The attacker running it could read and redirect everything you sent, including logins.",
    redFlags: [
      "No password and no encryption (open network)",
      "A generic 'FREE' name anyone could have created",
      "The real café network was never confirmed with staff",
    ],
    tip: "Avoid open Wi-Fi for anything sensitive. Use your phone's hotspot or a VPN, and ask staff for the real network name.",
    malwareId: "mitm",
    lure: {
      location: "tray",
      title: "CoffeeShop_FREE",
      body: "Open network · Signal: Excellent · No password required.",
      bait: "Connect",
    },
  },
  {
    id: "sys-usb",
    name: "Finders Keepers",
    icon: "usb",
    era: "retro",
    type: "Autorun USB worm",
    hint: "Somebody lost something in the car park...",
    whatHappened:
      "The USB stick you 'found' ran an autorun worm the moment you opened it. It copied itself onto your PC and tries to spread to every drive you plug in.",
    redFlags: [
      "A random USB stick left where people would find it",
      "A tempting label ('Salaries 2004') designed to make you curious",
      "The 'spreadsheet' is actually a program: Salaries_2004.xls.exe",
    ],
    tip: "Never plug in USB drives you found. Hand them to IT, and keep AutoRun switched off.",
    malwareId: "worm",
    lure: {
      location: "desktop",
      title: "Removable Disk (E:)",
      body: "Removable Disk (E:) — label: SALARIES 2004\n\nSalaries_2004.xls.exe   88 KB\nautorun.inf             1 KB",
      bait: "Open Salaries_2004.xls",
      safe: "Eject",
    },
  },
  {
    id: "sys-techsupport",
    name: "Hello, This Is Microsoft",
    icon: "phone",
    era: "modern",
    type: "Tech support scam",
    hint: "When your screen begs you to call someone...",
    whatHappened:
      "You called the number on a fake 'virus alert'. The 'technician' talked you into installing remote-control software and charged you £299 to 'fix' a problem that never existed.",
    redFlags: [
      "Real virus warnings never include a phone number",
      "Panic language and countdown timers",
      "Asking you to install remote access software or pay by gift card",
    ],
    tip: "Close the page (or restart the PC) instead of calling. Genuine companies never cold-alert you with a phone number.",
    malwareId: "rat",
    lure: {
      location: "popup",
      title: "WINDOWS SECURITY ALERT",
      body: "!! VIRUS DETECTED: Trojan.Zeus.x34 !!\nYour files and banking details are at risk.\nDo NOT shut down your computer.\nCall Certified Support NOW: 0800-555-0199",
      bait: "Call support now",
      safe: "Close",
    },
  },
  {
    id: "sys-scareware",
    name: "Speed Demon",
    icon: "warning",
    era: "retro",
    type: "Scareware / fake optimiser",
    hint: "Is your PC slow? Something wants to help...",
    whatHappened:
      "'SpeedBoost 2004' was scareware: fake scan results that scare you into installing it. The 'optimiser' was adware that made the PC slower and sold your browsing data.",
    redFlags: [
      "A web popup claims to have 'scanned' your PC (websites can't do that)",
      "Huge, oddly exact error counts",
      "Urgency: 'fix NOW' with a flashing button",
    ],
    tip: "Only trust security results from software you installed yourself. Ignore popups that claim to have scanned your PC.",
    malwareId: "dropper",
    lure: {
      location: "popup",
      title: "Your PC is SLOW!",
      body: "SpeedBoost 2004 found 1,337 errors slowing down your PC!\nYour system will crash in 5 minutes.",
      bait: "Fix all errors now",
      safe: "Close",
    },
  },
  {
    id: "sys-prize",
    name: "Lucky Visitor",
    icon: "trophy",
    era: "retro",
    type: "Fake prize / card harvesting",
    hint: "Congratulations! You definitely won something.",
    whatHappened:
      "There was no iPod. The 'small delivery fee' form just harvested your card details, which were sold and used for fraud.",
    redFlags: [
      "You can't win a competition you never entered",
      "'Just pay shipping' to get a free prize",
      "A countdown pushing you to act before you think",
    ],
    tip: "If you didn't enter, you didn't win. Never give card details to claim a prize.",
    lure: {
      location: "popup",
      title: "CONGRATULATIONS!!!",
      body: "You are our 1,000,000th visitor!\nClaim your FREE iPod now — just pay £1.99 delivery.\nOffer expires in 00:59!",
      bait: "Claim my iPod!",
      safe: "Close",
    },
  },
  {
    id: "sys-winupdate",
    name: "Critical Update Required",
    icon: "download",
    era: "modern",
    type: "Fake software update",
    hint: "Not every update comes from where it says it does.",
    whatHappened:
      "The 'update' popup came from a website, not your system. 'Critical_Update.exe' was a trojan that installed a password stealer.",
    redFlags: [
      "System updates never come from a website popup",
      "The file is a random .exe downloaded from the internet",
      "Urgent wording about being 'unprotected'",
    ],
    tip: "Only install updates through your system's own update settings or the official app store.",
    lure: {
      location: "popup",
      title: "Windows Update",
      body: "A CRITICAL security update is required.\nYour PC is unprotected until you install Critical_Update.exe.",
      bait: "Install update",
      safe: "Remind me later",
    },
  },
];
