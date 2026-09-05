export type UnitStatus =
  | "stable" | "unstable" | "rising" | "dropping"
  | "inflated" | "deflated" | "varies" | "maximum"
  | "hyped" | "gatekept" | "black-marketed";

export type FilterKey = "All" | "S" | "A" | "B" | "C" | "Pure" | "Oddities" | "Untiered";

export interface MasterUnit {
  id: string;
  name: string;
  subtitle: string;
  value: number | "owner" | "range";
  valueDisplay?: string;
  valueMin?: number;        
  rarity: number;
  supply: number;
  aliases?: string[];
  demand: number;
  status?: UnitStatus;
  secondaryTags?: string[]; // <-- ADDED THIS LINE to catch the (Hyped), (Gatekept) tags
  isNew?: boolean;
  notice?: string;
  imageUrl?: string;
  tier?: string; 
  subCategory?: string;      
  subCategoryRange?: string; 
  obtainability?: "OBT" | "UNOB"; 
}

export type Unit = MasterUnit;
export type GridUnit = MasterUnit;

export interface PopupUnit {
  id: string;
  name: string;
  subtitle: string;
  value: number;
  demand: number;
}

export interface PopupState {
  unit: PopupUnit;
  x: number;
  y: number;
}

export interface TierConfig {
  label: string;
  units: MasterUnit[];
  badgeChar: string;
  badgeColor: string;
  badgeShadow: string;
  subtitle: string;
}

export interface TradeCard {
  id: string;
  name: string;
  subtitle: string;
  value: number;
  demand: number;
  qty: number;
}