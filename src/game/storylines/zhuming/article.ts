// The sponsored "story" that runs on The Daily Byte's front page for Zhuming's storyline.
// Pure data: DailyByte.tsx renders it, story.ts notifies about it. Everything is fictional.
export interface SponsoredArticle {
  id: string;
  kicker: string;
  headline: string;
  blurb: string;
  byline: string;
  body: string[];
  /** Fine print at the bottom of the page. */
  smallPrint: string;
}

export const ZHUMING_ARTICLE: SponsoredArticle = {
  id: "ram-stock",
  kicker: "SPONSORED",
  headline: "Great RAM stock now open — and nobody is talking about it",
  blurb:
    "A sponsored look at RAM Holdings, the five-pence chip stock our money man can't stop talking about.",
  byline: "By Kevin Zhao, RAM Capital Invest",
  body: [
    "In 1999 I told my readers to buy memory. They laughed. In 2001 the same people were queuing outside computer shops for a stick of it. This is the third time in my career that memory has been this cheap, and I am not going to stay quiet about it again.",
    "RAM Holdings (ticker: RAMH) opens on Tuesday at £0.05 a share. That is not a typo. Five pence. The company makes the modules inside every budget PC in the country, and the market still hasn't noticed.",
    "My analyst contact has seen the order book. He says the shares will be changing hands above £3.20 by March. I can't put his name in a newspaper, and I can't put the figures in one either — but I can show you the position, live, in the app my group uses.",
    "It's free, it takes about thirty seconds to install, and it runs on anything. Then message me on PingMe and I'll add you to the group at my own entry price before Tuesday.",
    "Five pence. Tuesday. That's all I'm saying.",
  ],
  smallPrint: "Advertisement — paid for by RAM Capital Invest. Not investment advice.",
};
