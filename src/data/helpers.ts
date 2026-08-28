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
  const cleanUrl = url.split('/revision/')[0];
  return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&output=webp&w=150`;
}

export function getObtainability(unit?: MasterUnit): "OBT" | "UNOB" {
  if (!unit) return "UNOB";
  
  const note = (unit.notice || "").toLowerCase();
  const name = (unit.name || "").toLowerCase();
  const subtitle = (unit.subtitle || "").toLowerCase();
  const id = (unit.id || "").toLowerCase();

  // 1. Gamepasses are always obtainable
  if (id.startsWith("gp-") || note.includes("gamepass")) {
    return "OBT";
  }

  // 2. Skins rule: All skins are unobtainable EXCEPT Easter capsule skins
  const isSkin = unit.subCategory?.toLowerCase().includes("skin") || subtitle.includes("skin") || note.includes("skin");
  if (isSkin) {
    if (note.includes("easter capsule")) return "OBT";
    return "UNOB";
  }

  // 3. Explicit Unobtainable Blacklist requested by you
  const unobList = [
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

  if (unobList.some(item => id.includes(item) || name.includes(item) || subtitle.includes(item))) {
    return "UNOB";
  }

  // 4. Tradeables obtained through evolving are ALWAYS considered unobtainable
  if (note.includes("evolv") || note.includes("evolution")) {
    return "UNOB";
  }

  // 5. Standard explicit flags
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

  // 6. General Permitted Obtainables (Capsules, Eggs, Lbs, PvP)
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