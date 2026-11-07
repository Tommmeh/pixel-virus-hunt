// All scams in one list. Each track appends to its own file — never edit another track's file.
import type { LureLocation, Scam } from "../types";
import { AI_SCAMS } from "./ai";
import { EMAIL_SCAMS } from "./email";
import { SYSTEM_SCAMS } from "./system";
import { WEB_SCAMS } from "./web";

export const SCAM_GROUPS = {
  sys: SYSTEM_SCAMS,
  email: EMAIL_SCAMS,
  web: WEB_SCAMS,
  ai: AI_SCAMS,
} as const;

export const SCAMS: Scam[] = [...SYSTEM_SCAMS, ...EMAIL_SCAMS, ...WEB_SCAMS, ...AI_SCAMS];

export const scamsAt = (location: LureLocation) =>
  SCAMS.filter((s) => s.lure.location === location);

export const getScam = (id: string) => SCAMS.find((s) => s.id === id);
