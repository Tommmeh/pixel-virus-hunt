// host → page component. Metadata (name, icon, https, search index) lives in ../catalog.ts.
import type { ComponentType } from "react";
import type { PageUrl } from "../url";
import { Copperleaf } from "./copperleaf/Copperleaf";
import { DailyByte } from "./DailyByte";
import { FriendSpace } from "./friendspace/FriendSpace";
import { HotPost } from "./hotpost/HotPost";
import { Searchly } from "./Searchly";
import { PhishingSite } from "../../../storylines/aaron/PhishingSite";

export const SITE_COMPONENTS: Record<string, ComponentType<{ url: PageUrl }>> = {
  "www.searchly.com": Searchly,
  "mail.hotpost.com": HotPost,
  "www.copperleafbank.com": Copperleaf,
  "www.friendspace.com": FriendSpace,
  "www.dailybyte.com": DailyByte,
  "friendspace.com.photo-album.net": PhishingSite,
};
