// Popup advert content. Fictional brands and domains only — nothing ever leaves the game.
export interface ScamAd {
  title: string;
  heading: string;
  body: string;
  cta: string;
  url: string;
}

export const SCAM_ADS: ScamAd[] = [
  {
    title: "Congratulations!",
    heading: "★ YOU ARE OUR 1,000,000th VISITOR ★",
    body: "You have won a FREE MP3 player! Claim it now — just pay £4.95 postage and packing.",
    cta: "Claim my prize",
    url: "http://www.prizecentral.biz/claim",
  },
  {
    title: "System Warning",
    heading: "⚠ YOUR COMPUTER MAY BE INFECTED ⚠",
    body: "PaneScan has detected 47 viruses, 12 spyware programs and 3 tracking cookies on your PC. Scan now before your files are deleted.",
    cta: "Scan my PC free",
    url: "http://www.panescan-security.com/scan",
  },
  {
    title: "Loan Approved!",
    heading: "£500 IN YOUR ACCOUNT TODAY",
    body: "Bad credit? No credit? No problem. Instant decision, no paperwork, no credit checks.",
    cta: "Get my £500",
    url: "http://www.quickcash-loans.biz/apply",
  },
  {
    title: "VideoVault",
    heading: "YOUR SUBSCRIPTION HAS EXPIRED",
    body: "We could not take this month's payment. Update your bank details within 24 hours to keep your Player Pro trial active.",
    cta: "Update my details",
    url: "https://www.videovault-tv.com/login",
  },
  {
    title: "Work From Home",
    heading: "EARN £300 A DAY FROM YOUR OWN PC",
    body: "No experience needed. Thousands of people are already packing envelopes from home. Spots limited!",
    cta: "Start earning",
    url: "http://www.homebiz-opportunity.biz/join",
  },
  {
    title: "Local Singles",
    heading: "HOT SINGLES IN YOUR AREA",
    body: "Meet people near you tonight! 100% free to join — just enter your details to see who is online.",
    cta: "See who's online",
    url: "http://www.meetlocal.biz/",
  },
];
