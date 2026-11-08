// Website metadata (no components) — used by the browser, favorites bar and Searchly's search index.
// All brands and domains are fictional. To add a site: add an entry here + a component in sites/registry.ts.
export interface SiteInfo {
  host: string;
  /** Other hostnames that load this site (e.g. without "www."). */
  aliases?: string[];
  name: string;
  icon: string;
  /** Served over https (the browser upgrades http:// automatically and shows a padlock). */
  secure: boolean;
  favorite?: boolean;
}

export interface IndexEntry {
  title: string;
  url: string;
  description: string;
  keywords: string[];
}

export const SITE_INFO: SiteInfo[] = [
  {
    host: "www.adrewards.com",
    aliases: ["adrewards.com"],
    name: "AdRewards",
    icon: "mail",
    secure: false,
  },
  {
    host: "www.searchly.com",
    aliases: ["searchly.com"],
    name: "Searchly",
    icon: "search",
    secure: false,
    favorite: true,
  },
  {
    host: "mail.hotpost.com",
    aliases: ["hotpost.com", "www.hotpost.com"],
    name: "HotPost Mail",
    icon: "mail",
    secure: true,
    favorite: true,
  },
  {
    host: "www.copperleafbank.com",
    aliases: ["copperleafbank.com"],
    name: "Copperleaf Bank",
    icon: "bank",
    secure: true,
    favorite: true,
  },
  {
    host: "www.friendspace.com",
    aliases: ["friendspace.com"],
    name: "FriendSpace",
    icon: "social",
    secure: false,
    favorite: true,
  },
  {
    host: "www.dailybyte.com",
    aliases: ["dailybyte.com"],
    name: "The Daily Byte",
    icon: "news",
    secure: false,
    favorite: true,
  },
  {
    host: "www.videovault-tv.com",
    aliases: ["videovault-tv.com"],
    name: "VideoVault",
    icon: "news",
    secure: true,
  },
];

export const findSiteInfo = (host: string) =>
  SITE_INFO.find((s) => s.host === host || s.aliases?.includes(host));

export const SEARCH_INDEX: IndexEntry[] = [
  {
    title: "HotPost Mail - Free web-based email",
    url: "https://mail.hotpost.com/",
    description:
      "Sign in to HotPost Mail. Free email with 25 MB of storage, accessible from anywhere.",
    keywords: ["email", "mail", "hotpost", "inbox", "webmail", "sign in"],
  },
  {
    title: "Copperleaf Bank - Personal Banking",
    url: "https://www.copperleafbank.com/",
    description:
      "Online banking from Copperleaf Bank. Check your balance, view statements and transfer money.",
    keywords: ["bank", "banking", "copperleaf", "money", "account", "savings", "transfer"],
  },
  {
    title: "FriendSpace - a place for friends",
    url: "http://www.friendspace.com/",
    description: "Share photos, post updates and keep up with your friends on FriendSpace.",
    keywords: ["social", "friends", "friendspace", "profile", "photos", "status"],
  },
  {
    title: "The Daily Byte - Technology news",
    url: "http://www.dailybyte.com/",
    description: "Tech news, gadget reviews and tips for your home PC.",
    keywords: ["news", "tech", "technology", "daily byte", "gadgets", "mp3"],
  },
  {
    title: "Searchly - Search the web",
    url: "http://www.searchly.com/",
    description: "Find what you're looking for on the web.",
    keywords: ["search", "searchly", "web"],
  },
];
