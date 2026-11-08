// USB storyline — lesson cards for the Quests app (same format as every other storyline).
// They unlock silently at each step: the player is never told off while it is happening.
import type { LessonCard } from "../../scams/ai";

export const USB_CARD_IDS = {
  doubleExtension: "usb-double-extension",
  crash: "usb-crash",
  cleaned: "usb-cleaned",
} as const;

export const USB_CARDS: LessonCard[] = [
  {
    id: USB_CARD_IDS.doubleExtension,
    name: "The Photo That Was a Program",
    type: "Malware on removable media",
    whatHappened:
      "The file was not a photo. It was called holiday_03.jpg.exe: the name ended in .jpg so it looked like the pictures next to it, but the real extension was .exe, so double-clicking it started a program.",
    redFlags: [
      "A file name with two extensions: holiday_03.jpg.exe",
      "An application icon sitting between your photos",
      "Windows hides known extensions, so 'holiday_03.jpg' can really be 'holiday_03.jpg.exe'",
      "A file you don't remember saving, on a stick that has been borrowed or lent",
    ],
    tip: "Turn on 'show file extensions' so you can see what a file really is. Never run a program you weren't expecting, even from your own USB stick — pictures never need .exe.",
  },
  {
    id: USB_CARD_IDS.crash,
    name: "The Blue Screen Is Not a Cure",
    type: "Driver malware / system crash",
    whatHappened:
      "The program installed a driver that runs with the operating system. It crashed the PC with a blue Stop error, and when the PC started again the malware was already loading itself in the background — that is why everything was slow, froze and barely opened.",
    redFlags: [
      "A blue screen full of STOP codes straight after you ran a file",
      "A driver name (usbphoto.sys) you never installed",
      "The PC still wrong after the restart: slow start-up, windows that stop responding",
      "Programs taking seconds to open when they used to be instant",
    ],
    tip: "A crash only stops what is running right now; it does not remove what is installed. After a crash, run a full antivirus scan before signing in to email or the bank.",
  },
  {
    id: USB_CARD_IDS.cleaned,
    name: "USB Clean-Up",
    type: "Malware removal",
    whatHappened:
      "PaneGuard scanned every drive, found the backdoor on the USB stick with its copies, and removed it. Start-up, dragging windows and opening programs went back to normal.",
    redFlags: [
      "The antivirus found the threat at the exact path you launched",
      "The same file had made copies across the drive",
    ],
    tip: "Scan removable drives before you open anything on them. If a stick is not yours, don't plug it in — and if you must, scan first and never run its .exe files.",
  },
];
