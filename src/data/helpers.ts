import { MasterUnit } from "../types";
import { RARITY_SCALE } from "./config";

export function getTier(u: MasterUnit): "S" | "A" | "B" | "C" | "Pure" | "Oddities" | "Untiered" {
  return (u.tier as "S" | "A" | "B" | "C" | "Pure" | "Oddities" | "Untiered") || "S";
}

export function sortVal(u: MasterUnit): number {
  if (u.value === "owner") return 2_000_000_000;
  if (u.value === "range") return u.valueMin ?? 400_000;
  return u.value as number;
}

export function getRarityLabel(v: number) {
  const entry = RARITY_SCALE.find((r) => v >= r.min && v <= r.max);
  return entry ? entry.label : "Unknown";
}

export function getProxyImage(url?: string) {
  if (!url || url === "PLACEHOLDER_URL") return null;

  // Imgur blocks most proxies – serve directly
  if (url.includes("imgur.com")) return url;

  const cleanUrl = url.split("/revision/")[0];
  return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&output=webp&w=150&fit=cover`;
}

// PERFORMANCE FIX: Hoisted outside the function so it's only created in memory once,
// not 300+ times every render cycle.
const UNOB_BLACKLIST = [
  "water-goddess", "aqua",
  "kageni", "cid",
  "challenger-flaming-tiger", "rengoku",
  "tuca-donka", "hakari", "kinji",
  "sound-o-sonic-demon", "tengen",
  "mercury-guardian", "sailor mercury",
  "garnet-spear", "violet", "evergarden",
  "veldora", "storm dragon",
  "gremmy", "visionary",
  "thragg", "freddie mercury",
  "water-boy", "suigetsu",
  "excellent-leader", "frost",
  "red-head", "shanks",
  "water-kakazu", "wind-kakazu", "fire-kakazu", "lightning-kakazu", "kakuzu",
  "second-hand", "doppio",
  "water-mage-c", "juvia",
  "smoker", "asuma",
  "afro-samurai",
  "guardian-of-aba", "pui pui",
  "zaruto-grr-iii", "grr iii"
];

export function getObtainability(unit?: MasterUnit): "OBT" | "UNOB" {
  if (!unit) return "UNOB";
  
  const note = (unit.notice || "").toLowerCase();
  const name = (unit.name || "").toLowerCase();
  const subtitle = (unit.subtitle || "").toLowerCase();
  const id = (unit.id || "").toLowerCase();

  // 1. EXPLICIT SPREADSHEET OVERRIDES
  // If the spreadsheet explicitly tags it as obtainable, respect it immediately.
  // This safely catches exactly "(obtainable)" and "(obtainable from...)"
  if (note.includes("(obtainable)") || note.includes("(obtainable from")) {
    return "OBT";
  }

  // 2. GAMEPASSES
  // Account for live-synced names that don't have the "gp-" prefix
  if (
    id.startsWith("gp-") || 
    name.includes("gamepass") || 
    name.includes("star pass") || 
    name.includes("unit mount") ||
    note.includes("gamepass")
  ) {
    return "OBT";
  }

  // 3. SKINS RULE
  const isSkin = unit.subCategory?.toLowerCase().includes("skin") || subtitle.includes("skin") || note.includes("skin");
  if (isSkin) {
    if (note.includes("easter capsule")) return "OBT";
    return "UNOB";
  }

  // 4. EXPLICIT UNOBTAINABLE BLACKLIST
  if (UNOB_BLACKLIST.some(item => id.includes(item) || name.includes(item) || subtitle.includes(item))) {
    return "UNOB";
  }

  // 5. EVOLUTION RESTRICTION
  if (note.includes("evolv") || note.includes("evolution")) {
    return "UNOB";
  }

  // 6. EXPLICIT UNOBTAINABLE TAGS
  if (
    note.includes("unobtainable") || 
    note.includes("unob") || 
    note.includes("retired") || 
    note.includes("code") || 
    note.includes("dungeon") ||
    note.includes("raid") ||
    note.includes("event")
  ) {
    return "UNOB";
  }

  // 7. PERMITTED OBTAINABLES
  if (
    note.includes("capsule") || 
    note.includes("egg") || 
    note.includes("firework") || 
    note.includes("leaderboard") || 
    note.includes("tournament") ||
    note.includes("pvp set")
  ) {
    return "OBT";
  }

  return "UNOB";
}