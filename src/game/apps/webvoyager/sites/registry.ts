// host → page component. Metadata (name, icon, https, search index) lives in ../catalog.ts.
import type { ComponentType } from "react";
import type { PageUrl } from "../url";
import { AdRewards } from "./AdRewards";
import { Copperleaf } from "./copperleaf/Copperleaf";
import { DailyByte } from "./DailyByte";
import { FriendSpace } from "./friendspace/FriendSpace";
import { HotPost } from "./hotpost/HotPost";
import { Searchly } from "./Searchly";
import { RBC } from "./RBC";
import { VideoVault } from "./VideoVault";
import { StockSite } from "../../../storylines/zhuming/StockSite";
import { DownloadSite } from "../../../storylines/aaron/DownloadSite";

export const SITE_COMPONENTS: Record<string, ComponentType<{ url: PageUrl }>> = {
  "www.adrewards.com": AdRewards,
  "www.searchly.com": Searchly,
  "mail.hotpost.com": HotPost,
  "www.copperleafbank.com": Copperleaf,
  "www.friendspace.com": FriendSpace,
  "www.dailybyte.com": DailyByte,
  "www.videovault-tv.com": VideoVault,
  "www.stockladder-trade.com": StockSite,
  "www.rbc.com": RBC,
  "get-photoviewer.net": DownloadSite,
};
