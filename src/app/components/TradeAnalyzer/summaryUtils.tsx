import React from "react";
import { TradeCard, MasterUnit } from "../../../types";

export const fmtK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${n}`;

export const getAvatarStyle = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return { background: `linear-gradient(135deg, hsl(${h}, 60%, 50%), hsl(${(h + 40) % 360}, 60%, 30%))` };
};
export const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

// VALUE-WEIGHTED STAT CALCULATION: Ensures high-value units dictate stats over low-value filler items
const getItemWeight = (c: TradeCard, master: MasterUnit | undefined) => {
  if (!master) return 1 * c.qty;
  let val = 1;
  if (typeof master.value === "number") val = master.value;
  else if (master.value === "range" && typeof master.valueMin === "number") val = master.valueMin;
  else if (master.value === "owner" || master.valueDisplay === "Owner's Choice") val = 10000;
  return Math.max(1, val) * c.qty;
};

export const avgStat = (items: TradeCard[], key: "rarity" | "supply" | "demand", ALL_UNITS: MasterUnit[]) => {
  if (items.length === 0) return "—";
  let weightedSum = 0;
  let totalWeight = 0;

  items.forEach(c => {
    const master = ALL_UNITS.find(u => u.id === c.id);
    if (master && typeof master[key] === "number") {
      const weight = getItemWeight(c, master);
      weightedSum += (master[key] as number) * weight;
      totalWeight += weight;
    }
  });

  if (totalWeight === 0) return "—";
  return (weightedSum / totalWeight).toFixed(1);
};

// SHARED LOGIC FOR DYNAMIC SENTENCE GENERATION
const buildSummaryText = (giveItems: TradeCard[], getItems: TradeCard[], giveTotal: number, getTotal: number, ALL_UNITS: MasterUnit[], isHtml: boolean) => {
  if (giveItems.length === 0 && getItems.length === 0) return isHtml ? <>Add units to compare values.</> : "Add units to compare values.";
  if (giveItems.length === 0) return isHtml ? <>Add units to the <strong className="text-[#F2F3F5]">You Give</strong> side.</> : "Add units to the 'I Give' side.";
  if (getItems.length === 0) return isHtml ? <>Add units to the <strong className="text-[#F2F3F5]">You Get</strong> side.</> : "Add units to the 'I Get' side.";

  const isOC = (id: string) => {
    const u = ALL_UNITS.find(unit => unit.id === id);
    return u?.value === "owner" || u?.valueDisplay === "Owner's Choice";
  };

  const giveHasOC = giveItems.some(i => isOC(i.id));
  const getHasOC = getItems.some(i => isOC(i.id));
  if (giveHasOC || getHasOC) {
    const msg = "Trade contains Owner's Choice units. Value difference cannot be mathematically calculated.";
    return isHtml ? <span className="text-[#FAA61A]">{msg}</span> : msg;
  }

  const statGains: string[] = [];
  const statLosses: string[] = [];
  const statGainsHtml: React.ReactNode[] = [];
  const statLossesHtml: React.ReactNode[] = [];

  const aGR = avgStat(giveItems, "rarity", ALL_UNITS); const aTR = avgStat(getItems, "rarity", ALL_UNITS);
  if (aGR !== "—" && aTR !== "—") {
    if (parseFloat(aTR) > parseFloat(aGR)) { statGains.push("rarity"); statGainsHtml.push(<span key="r-gain">rarity</span>); }
    else if (parseFloat(aTR) < parseFloat(aGR)) { statLosses.push("rarity"); statLossesHtml.push(<span key="r-lose">rarity</span>); }
  }

  const aGS = avgStat(giveItems, "supply", ALL_UNITS); const aTS = avgStat(getItems, "supply", ALL_UNITS);
  if (aGS !== "—" && aTS !== "—") {
    if (parseFloat(aTS) < parseFloat(aGS)) { statGains.push("supply"); statGainsHtml.push(<span key="s-gain">supply</span>); }
    else if (parseFloat(aTS) > parseFloat(aGS)) { statLosses.push("supply"); statLossesHtml.push(<span key="s-lose">supply</span>); }
  }

  const aGD = avgStat(giveItems, "demand", ALL_UNITS); const aTD = avgStat(getItems, "demand", ALL_UNITS);
  if (aGD !== "—" && aTD !== "—") {
    if (parseFloat(aTD) > parseFloat(aGD)) { statGains.push("demand"); statGainsHtml.push(<span key="d-gain">demand</span>); }
    else if (parseFloat(aTD) < parseFloat(aGD)) { statLosses.push("demand"); statLossesHtml.push(<span key="d-lose">demand</span>); }
  }

  const valDiff = getTotal - giveTotal;
  const percentDiff = giveTotal > 0 ? ((Math.abs(valDiff) / giveTotal) * 100).toFixed(1) : "0.0";
  const numPercent = parseFloat(percentDiff);
  const formattedVal = Math.abs(valDiff).toLocaleString();

  let valueText = "";
  if (valDiff > 0) {
    if (numPercent > 15) valueText = `Gains significant value (+${formattedVal} / +${percentDiff}%)`;
    else if (numPercent > 5) valueText = `Gains value (+${formattedVal} / +${percentDiff}%)`;
    else valueText = `Slightly gains value (+${formattedVal} / +${percentDiff}%)`;
  } else if (valDiff < 0) {
    if (numPercent > 15) valueText = `Loses significant value (-${formattedVal} / -${percentDiff}%)`;
    else if (numPercent > 5) valueText = `Loses value (-${formattedVal} / -${percentDiff}%)`;
    else valueText = `Slightly loses value (-${formattedVal} / -${percentDiff}%)`;
  } else {
    valueText = "Breaks even in value";
  }

  const formatListStr = (arr: string[]) => {
    if (arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
    return `${arr.slice(0, -1).join(", ")}, and ${arr[arr.length - 1]}`;
  };

  const formatListHtml = (arr: React.ReactNode[]) => {
    if (arr.length === 0) return null;
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return <>{arr[0]} and {arr[1]}</>;
    return <>{arr.map((item, i) => i === arr.length - 1 ? <span key={i}>and {item}</span> : <span key={i}>{item}, </span>)}</>;
  };

  const gainsList = isHtml ? formatListHtml(statGainsHtml) : formatListStr(statGains);
  const lossesList = isHtml ? formatListHtml(statLossesHtml) : formatListStr(statLosses);

  // Constructing final sentences cleanly
  if (valDiff > 0) {
    if (statGains.length > 0 && statLosses.length === 0) {
      return isHtml ? <>{valueText}, while gaining in {gainsList}.</> : `${valueText}, while gaining in ${gainsList}.`;
    }
    if (statGains.length === 0 && statLosses.length > 0) {
      return isHtml ? <>{valueText}, but trading down in {lossesList}.</> : `${valueText}, but trading down in ${lossesList}.`;
    }
    if (statGains.length > 0 && statLosses.length > 0) {
      return isHtml ? <>{valueText}, gaining in {gainsList} but trading down in {lossesList}.</> : `${valueText}, gaining in ${gainsList} but trading down in ${lossesList}.`;
    }
    return isHtml ? <>{valueText}.</> : `${valueText}.`;
  } else if (valDiff < 0) {
    if (statGains.length > 0 && statLosses.length === 0) {
      return isHtml ? <>{valueText}, though you gain a significant boost in {gainsList}.</> : `${valueText}, though you gain a significant boost in ${gainsList}.`;
    }
    if (statGains.length === 0 && statLosses.length > 0) {
      return isHtml ? <>{valueText}, and trading down in {lossesList}.</> : `${valueText}, and trading down in ${lossesList}.`;
    }
    if (statGains.length > 0 && statLosses.length > 0) {
      return isHtml ? <>{valueText}, though you gain {gainsList} while trading down in {lossesList}.</> : `${valueText}, though you gain ${gainsList} while trading down in ${lossesList}.`;
    }
    return isHtml ? <>{valueText}.</> : `${valueText}.`;
  } else {
    if (statGains.length > 0 && statLosses.length === 0) {
      return isHtml ? <>Breaks even in value, while gaining in {gainsList}.</> : `Breaks even in value, while gaining in ${gainsList}.`;
    }
    if (statGains.length === 0 && statLosses.length > 0) {
      return isHtml ? <>Breaks even in value, but trading down in {lossesList}.</> : `Breaks even in value, but trading down in ${lossesList}.`;
    }
    if (statGains.length > 0 && statLosses.length > 0) {
      return isHtml ? <>Breaks even in value, gaining in {gainsList} but trading down in {lossesList}.</> : `Breaks even in value, gaining in ${gainsList} but trading down in ${lossesList}.`;
    }
    return isHtml ? <>The trade is perfectly balanced.</> : "The trade is perfectly balanced.";
  }
};

export const generateTextSummary = (giveItems: TradeCard[], getItems: TradeCard[], giveTotal: number, getTotal: number, ALL_UNITS: MasterUnit[]) => {
  return buildSummaryText(giveItems, getItems, giveTotal, getTotal, ALL_UNITS, false);
};

export function DynamicSummary({ giveItems, getItems, giveTotal, getTotal, ALL_UNITS }: { giveItems: TradeCard[], getItems: TradeCard[], giveTotal: number, getTotal: number, ALL_UNITS: MasterUnit[] }) {
  return buildSummaryText(giveItems, getItems, giveTotal, getTotal, ALL_UNITS, true) as React.ReactElement;
}