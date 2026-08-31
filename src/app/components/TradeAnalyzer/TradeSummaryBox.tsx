import { avgStat, DynamicSummary } from "./summaryUtils";
import { TradeCard, MasterUnit } from "../../../types";

interface TradeSummaryBoxProps {
  isMainStep4: boolean;
  giveTotal: number;
  getTotal: number;
  givePercent: number;
  getPercent: number;
  giveItems: TradeCard[];
  getItems: TradeCard[];
  ALL_UNITS: MasterUnit[];
}

export function TradeSummaryBox({
  isMainStep4, giveTotal, getTotal, givePercent, getPercent, giveItems, getItems, ALL_UNITS
}: TradeSummaryBoxProps) {
  return (
    <div className={`flex-shrink-0 mx-3 md:mx-4 mt-4 rounded-[8px] px-4 py-3 md:px-5 md:py-4 relative overflow-hidden bg-[#1E1F22] border transition-all duration-300 ${isMainStep4 ? 'border-[#5865F2] shadow-[0_0_20px_rgba(88,101,242,0.4)] ring-4 ring-[#5865F2]/30' : 'border-[rgba(255,255,255,0.04)]'}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#949BA4] mb-1">Total Give</p>
            <p className="text-[16px] md:text-[18px] font-bold text-[#F2F3F5] font-mono transition-all duration-300 truncate" title={giveTotal.toLocaleString()}>{giveTotal.toLocaleString()}</p>
          </div>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#949BA4] mb-1">Total Get</p>
            <p className="text-[16px] md:text-[18px] font-bold text-[#F2F3F5] font-mono transition-all duration-300 truncate" title={getTotal.toLocaleString()}>{getTotal.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex w-full h-[6px] gap-1 mb-2">
          {giveTotal > 0 && <div className="rounded-full bg-[#80848E]" style={{ width: `${givePercent}%`, transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }} />}
          {getTotal > 0 && <div className="rounded-full bg-[#DBDEE1]" style={{ width: `${getPercent}%`, transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }} />}
          {giveTotal === 0 && getTotal === 0 && <div className="w-full h-full rounded-full bg-[#111214] transition-all duration-500" />}
        </div>
        <div className="text-[10px] md:text-[11.5px] font-medium text-[#B5BAC1] text-center mt-3 tracking-wide px-1">
          <DynamicSummary giveItems={giveItems} getItems={getItems} giveTotal={giveTotal} getTotal={getTotal} ALL_UNITS={ALL_UNITS} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 md:gap-2">
        <div className="flex flex-col items-center p-1.5 md:p-2 rounded-[6px] bg-[#111214] border border-[rgba(255,255,255,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#949BA4] mb-0.5 md:mb-1">Rarity</span>
          <span className="text-[10px] md:text-[12px] font-bold text-[#DBDEE1] font-mono flex items-center gap-1">{avgStat(giveItems, "rarity", ALL_UNITS)} <span className="text-[#80848E] text-[8px] md:text-[10px]">➔</span> {avgStat(getItems, "rarity", ALL_UNITS)}</span>
        </div>
        <div className="flex flex-col items-center p-1.5 md:p-2 rounded-[6px] bg-[#111214] border border-[rgba(255,255,255,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#949BA4] mb-0.5 md:mb-1">Supply</span>
          <span className="text-[10px] md:text-[12px] font-bold text-[#DBDEE1] font-mono flex items-center gap-1">{avgStat(giveItems, "supply", ALL_UNITS)} <span className="text-[#80848E] text-[8px] md:text-[10px]">➔</span> {avgStat(getItems, "supply", ALL_UNITS)}</span>
        </div>
        <div className="flex flex-col items-center p-1.5 md:p-2 rounded-[6px] bg-[#111214] border border-[rgba(255,255,255,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#949BA4] mb-0.5 md:mb-1">Demand</span>
          <span className="text-[10px] md:text-[12px] font-bold text-[#DBDEE1] font-mono flex items-center gap-1">{avgStat(giveItems, "demand", ALL_UNITS)} <span className="text-[#80848E] text-[8px] md:text-[10px]">➔</span> {avgStat(getItems, "demand", ALL_UNITS)}</span>
        </div>
      </div>
    </div>
  );
}