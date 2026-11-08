// HackCamp 2026 sponsors (hackcamp.nwplus.io) plus the tools we built with, for the home-screen easter egg:
// click the egg in the top-left and the background cycles through NES-style sponsor backgrounds.
// Sponsors appear as pixel wordmarks (their name in the NES font) on chunky pixel patterns in brand-ish colours —
// never copies of their real logos.
import { createStore } from "../system/store";

export type Pattern = "stripes" | "checker" | "dots" | "diagonal" | "grid" | "stars";

export interface Sponsor {
  id: string;
  name: string;
  /** a/b = the two pattern colours, ink = the wordmark colour. */
  colors: { a: string; b: string; ink: string };
  pattern: Pattern;
}

export const SPONSORS: Sponsor[] = [
  {
    id: "rbc",
    name: "RBC",
    colors: { a: "#005daa", b: "#0a4f8f", ink: "#ffd200" },
    pattern: "stripes",
  },
  {
    id: "lovable",
    name: "Lovable",
    colors: { a: "#ff5fa2", b: "#ff8a3d", ink: "#fff4e8" },
    pattern: "checker",
  },
  {
    id: "auth0",
    name: "Auth0",
    colors: { a: "#1b1b1f", b: "#2b2b31", ink: "#eb5424" },
    pattern: "grid",
  },
  {
    id: "n8n",
    name: "n8n",
    colors: { a: "#ea4b71", b: "#c93a5d", ink: "#fff1f4" },
    pattern: "diagonal",
  },
  {
    id: "freebuff",
    name: "Freebuff",
    colors: { a: "#2fbf71", b: "#22995a", ink: "#f2fff6" },
    pattern: "dots",
  },
  {
    id: "databricks",
    name: "Databricks",
    colors: { a: "#ff3621", b: "#d92b18", ink: "#fff3ef" },
    pattern: "stripes",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    colors: { a: "#111111", b: "#262626", ink: "#f5f5f5" },
    pattern: "diagonal",
  },
  {
    id: "tailscale",
    name: "Tailscale",
    colors: { a: "#242424", b: "#3a3a3a", ink: "#ffffff" },
    pattern: "dots",
  },
  {
    id: "figma",
    name: "Figma@UBC",
    colors: { a: "#a259ff", b: "#1abcfe", ink: "#ffffff" },
    pattern: "checker",
  },
  {
    id: "deepspace",
    name: "DeepSpace",
    colors: { a: "#0b1030", b: "#1a2350", ink: "#9fd6ff" },
    pattern: "stars",
  },
  {
    id: "featherless",
    name: "Featherless",
    colors: { a: "#f4d35e", b: "#e9bf3a", ink: "#3a2c00" },
    pattern: "grid",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    colors: { a: "#4f6bed", b: "#8a5cf6", ink: "#ffffff" },
    pattern: "dots",
  },
];

/** A chunky, NES-style CSS background for a sponsor (layered repeating gradients, 8–16px pixel blocks). */
export function sponsorBackground({ colors: { a, b, ink }, pattern }: Sponsor): string {
  switch (pattern) {
    case "stripes":
      return `repeating-linear-gradient(0deg, ${a} 0 16px, ${b} 16px 32px)`;
    case "checker":
      return `repeating-conic-gradient(${a} 0 25%, ${b} 0 50%) 0 0 / 32px 32px`;
    case "diagonal":
      return `repeating-linear-gradient(45deg, ${a} 0 16px, ${b} 16px 32px)`;
    case "grid":
      return `linear-gradient(${b} 0 4px, transparent 4px) 0 0 / 32px 32px, linear-gradient(90deg, ${b} 0 4px, transparent 4px) 0 0 / 32px 32px, ${a}`;
    case "dots":
      return `radial-gradient(${b} 0 5px, transparent 6px) 0 0 / 24px 24px, ${a}`;
    case "stars":
      return `radial-gradient(${ink} 0 1.5px, transparent 2px) 0 0 / 48px 48px, radial-gradient(${ink} 0 1px, transparent 1.5px) 24px 30px / 64px 64px, linear-gradient(${a}, ${b})`;
  }
}

/** -1 = the default blue; 0..n-1 = a sponsor. Saved per viewer. */
export const sponsorBgStore = createStore<{ index: number }>("vh-sponsor-bg", { index: -1 });

/** Next in the cycle: default → each sponsor → back to default. */
export const nextSponsorIndex = (index: number, count = SPONSORS.length) =>
  index + 1 >= count ? -1 : index + 1;

export const sponsorAt = (index: number): Sponsor | undefined => SPONSORS[index];
