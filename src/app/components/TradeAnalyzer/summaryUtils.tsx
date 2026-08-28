import React from "react";
import { TradeCard, MasterUnit } from "../../../types";

export const fmtK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${n}`;

// Helper: Generates a deterministic gradient for missing images
export const getAvatarStyle = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return { background: `linear-gradient(135deg, hsl(${h}, 60%, 50%), hsl(${(h + 40) % 360}, 60%, 30%))` };
};
export const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

export const avgStat = (items: TradeCard[], key: "rarity" | "supply" | "demand", ALL_UNITS: MasterUnit[]) => {
  if (items.length === 0) return "—";
  const fullUnits = items.map(c => ALL_UNITS.find(u => u.id === c.id)).filter(Boolean);
  if (fullUnits.length === 0) return "—";
  const sum = fullUnits.reduce((s, u) => s + ((u![key] as number) || 0), 0);
  return (sum / fullUnits.length).toFixed(1);
};

export const generateTextSummary = (giveItems: TradeCard[], getItems: TradeCard[], giveTotal: number, getTotal: number, ALL_UNITS: MasterUnit[]) => {
  if (giveItems.length === 0 && getItems.length === 0) return "Add units to compare values.";
  if (giveItems.length === 0) return "Add units to the 'I Give' side.";
  if (getItems.length === 0) return "Add units to the 'I Get' side.";

  const giveHasOC = giveItems.some(i => i.value === 0);
  const getHasOC = getItems.some(i => i.value === 0);
  if (giveHasOC || getHasOC) return "Trade contains Owner's Choice units. Value difference cannot be mathematically calculated.";

  const gains: string[] = [];
  const losses: string[] = [];
  const valDiff = getTotal - giveTotal;
  const percentDiff = giveTotal > 0 ? ((Math.abs(valDiff) / giveTotal) * 100).toFixed(1) : "0.0";

  if (valDiff > 0) gains.push(`**${valDiff.toLocaleString()}** (+${percentDiff}%) value`);
  else if (valDiff < 0) losses.push(`**${Math.abs(valDiff).toLocaleString()}** (-${percentDiff}%) value`);

  const aGR = avgStat(giveItems, "rarity", ALL_UNITS); const aTR = avgStat(getItems, "rarity", ALL_UNITS);
  if (aGR !== "—" && aTR !== "—") {
    if (parseFloat(aTR) > parseFloat(aGR)) gains.push("rarity");
    else if (parseFloat(aTR) < parseFloat(aGR)) losses.push("rarity");
  }

  const aGS = avgStat(giveItems, "supply", ALL_UNITS); const aTS = avgStat(getItems, "supply", ALL_UNITS);
  if (aGS !== "—" && aTS !== "—") {
    if (parseFloat(aTS) < parseFloat(aGS)) gains.push("supply");
    else if (parseFloat(aTS) > parseFloat(aGS)) losses.push("supply");
  }

  const aGD = avgStat(giveItems, "demand", ALL_UNITS); const aTD = avgStat(getItems, "demand", ALL_UNITS);
  if (aGD !== "—" && aTD !== "—") {
    if (parseFloat(aTD) > parseFloat(aGD)) gains.push("demand");
    else if (parseFloat(aTD) < parseFloat(aGD)) losses.push("demand");
  }

  const formatList = (arr: string[]) => {
    if (arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
    return `${arr.slice(0, -1).join(", ")}, and ${arr[arr.length - 1]}`;
  };

  if (valDiff !== 0) {
    if (gains.length > 0 && losses.length > 0) return `I gain ${formatList(gains)} but lose ${formatList(losses)}`;
    if (gains.length > 0) return `I gain ${formatList(gains)}`;
    if (losses.length > 0) return `I lose ${formatList(losses)}`;
  } else {
    if (gains.length > 0 && losses.length > 0) return `I break even in value, gain ${formatList(gains)} but lose ${formatList(losses)}`;
    if (gains.length > 0) return `I break even in value, but gain ${formatList(gains)}`;
    if (losses.length > 0) return `I break even in value, but lose ${formatList(losses)}`;
    return `The trade is perfectly balanced`;
  }
  return "";
};

export function DynamicSummary({ giveItems, getItems, giveTotal, getTotal, ALL_UNITS }: { giveItems: TradeCard[], getItems: TradeCard[], giveTotal: number, getTotal: number, ALL_UNITS: MasterUnit[] }) {
  if (giveItems.length === 0 && getItems.length === 0) return <>Add units to compare values.</>;
  if (giveItems.length === 0) return <>Add units to the <strong className="text-[#F2F3F5]">You Give</strong> side.</>;
  if (getItems.length === 0) return <>Add units to the <strong className="text-[#F2F3F5]">You Get</strong> side.</>;

  const giveHasOC = giveItems.some(i => i.value === 0);
  const getHasOC = getItems.some(i => i.value === 0);
  if (giveHasOC || getHasOC) return <span className="text-[#FAA61A]">Trade contains Owner's Choice units. Value difference cannot be mathematically calculated.</span>;

  const gains: React.ReactNode[] = [];
  const losses: React.ReactNode[] = [];
  const valDiff = getTotal - giveTotal;
  const percentDiff = giveTotal > 0 ? ((Math.abs(valDiff) / giveTotal) * 100).toFixed(1) : "0.0";

  if (valDiff > 0) gains.push(<span key="v-gain"><strong className="text-[#F2F3F5]">{valDiff.toLocaleString()} (+{percentDiff}%)</strong> value</span>);
  else if (valDiff < 0) losses.push(<span key="v-lose"><strong className="text-[#F2F3F5]">{Math.abs(valDiff).toLocaleString()} (-{percentDiff}%)</strong> value</span>);

  const aGR = avgStat(giveItems, "rarity", ALL_UNITS); const aTR = avgStat(getItems, "rarity", ALL_UNITS);
  if (aGR !== "—" && aTR !== "—") {
    if (parseFloat(aTR) > parseFloat(aGR)) gains.push(<span key="r-gain">rarity</span>);
    else if (parseFloat(aTR) < parseFloat(aGR)) losses.push(<span key="r-lose">rarity</span>);
  }

  const aGS = avgStat(giveItems, "supply", ALL_UNITS); const aTS = avgStat(getItems, "supply", ALL_UNITS);
  if (aGS !== "—" && aTS !== "—") {
    if (parseFloat(aTS) < parseFloat(aGS)) gains.push(<span key="s-gain">supply</span>);
    else if (parseFloat(aTS) > parseFloat(aGS)) losses.push(<span key="s-lose">supply</span>);
  }

  const aGD = avgStat(giveItems, "demand", ALL_UNITS); const aTD = avgStat(getItems, "demand", ALL_UNITS);
  if (aGD !== "—" && aTD !== "—") {
    if (parseFloat(aTD) > parseFloat(aGD)) gains.push(<span key="d-gain">demand</span>);
    else if (parseFloat(aTD) < parseFloat(aGD)) losses.push(<span key="d-lose">demand</span>);
  }

  const formatList = (arr: React.ReactNode[]) => {
    if (arr.length === 0) return null;
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return <>{arr[0]} and {arr[1]}</>;
    return <>{arr.map((item, i) => i === arr.length - 1 ? <span key={i}>and {item}</span> : <span key={i}>{item}, </span>)}</>;
  };

  if (valDiff !== 0) {
    if (gains.length > 0 && losses.length > 0) return <>You gain {formatList(gains)} but lose {formatList(losses)}.</>;
    if (gains.length > 0) return <>You gain {formatList(gains)}.</>;
    if (losses.length > 0) return <>You lose {formatList(losses)}.</>;
  } else {
    if (gains.length > 0 && losses.length > 0) return <>You break even in value, gain {formatList(gains)} but lose {formatList(losses)}.</>;
    if (gains.length > 0) return <>You break even in value, but gain {formatList(gains)}.</>;
    if (losses.length > 0) return <>You break even in value, but lose {formatList(losses)}.</>;
    return <>The trade is perfectly balanced.</>;
  }
}