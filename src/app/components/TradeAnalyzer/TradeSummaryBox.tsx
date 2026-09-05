import { avgStat, getTradeForecast } from "./summaryUtils";
import { TradeCard, MasterUnit } from "../../../types";
import { TrendingUp, Clock, AlertTriangle } from "lucide-react"; 

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
  const forecast = getTradeForecast(giveItems, getItems, ALL_UNITS);

  return (
    <div className={`flex-shrink-0 mx-3 md:mx-4 mt-4 rounded-[8px] px-4 py-3 md:px-5 md:py-4 relative bg-[#1E1F22] border transition-all duration-300 z-20 ${isMainStep4 ? 'border-[#5865F2] shadow-[0_0_20px_rgba(88,101,242,0.4)] ring-4 ring-[#5865F2]/30' : 'border-[rgba(255,255,255,0.04)]'}`}>
      <div className="mb-4">
        
        <div className="flex items-center justify-between mb-3 gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#949BA4] mb-1">Total Give</p>
            <p className="text-[18px] font-black text-[#F2F3F5] font-mono truncate" title={giveTotal.toLocaleString()}>{giveTotal.toLocaleString()}</p>
          </div>
          
          {giveTotal > 0 && getTotal > 0 && (
             <div className="flex flex-col items-center flex-shrink-0 px-2">
                <span className={`text-[14px] font-black font-mono ${getTotal > giveTotal ? 'text-[#23a559]' : getTotal < giveTotal ? 'text-[#ed4245]' : 'text-[#DBDEE1]'}`}>
                  {getTotal > giveTotal ? '+' : ''}{(getTotal - giveTotal).toLocaleString()}
                </span>
                <span className="text-[9px] font-bold text-[#80848E] uppercase tracking-wider">Raw Diff</span>
             </div>
          )}

          <div className="min-w-0 flex-1 text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#949BA4] mb-1">Total Get</p>
            <p className="text-[18px] font-black text-[#F2F3F5] font-mono truncate" title={getTotal.toLocaleString()}>{getTotal.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex w-full h-[6px] gap-1 mb-4">
          {giveTotal > 0 && <div className="rounded-full bg-[#80848E]" style={{ width: `${givePercent}%`, transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }} />}
          {getTotal > 0 && <div className="rounded-full bg-[#DBDEE1]" style={{ width: `${getPercent}%`, transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }} />}
          {giveTotal === 0 && getTotal === 0 && <div className="w-full h-full rounded-full bg-[#111214] transition-all duration-500" />}
        </div>

        <div className="bg-[#111214] border border-[rgba(255,255,255,0.04)] rounded-[8px] p-3 shadow-inner">
          {forecast.calculable ? (
            <div className="flex justify-between items-stretch">
               {/* SHORT TERM FLIP (With Tooltip) */}
               <div className="flex flex-col flex-1 border-r border-[rgba(255,255,255,0.06)] pr-3 py-1 relative group cursor-help">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#FAA61A]" />
                    <span className="text-[10px] font-bold text-[#949BA4] uppercase tracking-wider">Short-Term Flip</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                     <span className={`text-[20px] font-black font-mono leading-none ${forecast.st > 0 ? 'text-[#23a559] drop-shadow-[0_0_8px_rgba(35,165,89,0.4)]' : forecast.st < 0 ? 'text-[#ed4245] drop-shadow-[0_0_8px_rgba(237,66,69,0.4)]' : 'text-[#DBDEE1]'}`}>
                       {forecast.st > 0 ? '+' : ''}{forecast.st.toFixed(1)}
                     </span>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute top-full mt-2 left-0 w-[200px] bg-[#111214] border border-[rgba(255,255,255,0.08)] text-[#DBDEE1] text-[11px] p-3 rounded-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.8)] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100]">
                    <strong className="text-[#FAA61A] block mb-1">Short-Term Flip</strong>
                    Scores &gt; 0 are wins. Calculated using Raw Value, Liquidity (Demand ÷ Supply), and immediate Market Tag momentum.
                  </div>
               </div>
               
               {/* LONG TERM HOLD (With Tooltip) */}
               <div className="flex flex-col flex-1 pl-4 py-1 relative group cursor-help">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#5865F2]" />
                    <span className="text-[10px] font-bold text-[#949BA4] uppercase tracking-wider">Long-Term Hold</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                     <span className={`text-[20px] font-black font-mono leading-none ${forecast.lt > 0 ? 'text-[#23a559] drop-shadow-[0_0_8px_rgba(35,165,89,0.4)]' : forecast.lt < 0 ? 'text-[#ed4245] drop-shadow-[0_0_8px_rgba(237,66,69,0.4)]' : 'text-[#DBDEE1]'}`}>
                       {forecast.lt > 0 ? '+' : ''}{forecast.lt.toFixed(1)}
                     </span>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute top-full mt-2 right-0 w-[200px] bg-[#111214] border border-[rgba(255,255,255,0.08)] text-[#DBDEE1] text-[11px] p-3 rounded-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.8)] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100]">
                    <strong className="text-[#5865F2] block mb-1">Long-Term Hold</strong>
                    Scores &gt; 0 are wins. Weighs Rarity heavily and mathematically punishes "Hyped" or "Unstable" units that may crash over time.
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 text-center gap-1">
              <AlertTriangle className="w-5 h-5 text-[#FAA61A] opacity-80" />
              <span className="text-[11px] font-bold text-[#DBDEE1]">Forecast Unavailable</span>
              <span className="text-[10px] font-medium text-[#80848E]">
                {giveItems.length === 0 || getItems.length === 0 
                  ? "Add units to both sides to generate a market projection." 
                  : "Cannot accurately predict trades containing Owner's Choice units."}
              </span>
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-3 gap-1.5 md:gap-2">
        {/* RARITY */}
        <div className="flex flex-col items-center p-1.5 md:p-2 rounded-[6px] bg-[#111214] border border-[rgba(255,255,255,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative group cursor-help">
          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#949BA4] mb-0.5 md:mb-1">Rarity</span>
          <span className="text-[10px] md:text-[12px] font-bold text-[#DBDEE1] font-mono flex items-center gap-1">{avgStat(giveItems, "rarity", ALL_UNITS)} <span className="text-[#80848E] text-[8px] md:text-[10px]">➔</span> {avgStat(getItems, "rarity", ALL_UNITS)}</span>
          <div className="absolute top-full mt-2 left-0 md:left-1/2 md:-translate-x-1/2 w-[160px] bg-[#111214] border border-[rgba(255,255,255,0.08)] text-[#DBDEE1] text-[11px] p-2.5 rounded-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.8)] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] text-left md:text-center">
            <strong className="text-[#F2F3F5] block mb-1">Rarity (0-20)</strong>
            <span className="text-[#23a559] font-bold">Higher is better.</span> Determines absolute scarcity. Impacts Long-Term hold scores heavily.
          </div>
        </div>
        {/* SUPPLY */}
        <div className="flex flex-col items-center p-1.5 md:p-2 rounded-[6px] bg-[#111214] border border-[rgba(255,255,255,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative group cursor-help">
          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#949BA4] mb-0.5 md:mb-1">Supply</span>
          <span className="text-[10px] md:text-[12px] font-bold text-[#DBDEE1] font-mono flex items-center gap-1">{avgStat(giveItems, "supply", ALL_UNITS)} <span className="text-[#80848E] text-[8px] md:text-[10px]">➔</span> {avgStat(getItems, "supply", ALL_UNITS)}</span>
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[160px] bg-[#111214] border border-[rgba(255,255,255,0.08)] text-[#DBDEE1] text-[11px] p-2.5 rounded-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.8)] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] text-center">
            <strong className="text-[#F2F3F5] block mb-1">Supply (1-5)</strong>
            <span className="text-[#23a559] font-bold">Lower is better.</span> Fewer copies in circulation creates higher liquidity.
          </div>
        </div>
        {/* DEMAND */}
        <div className="flex flex-col items-center p-1.5 md:p-2 rounded-[6px] bg-[#111214] border border-[rgba(255,255,255,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative group cursor-help">
          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#949BA4] mb-0.5 md:mb-1">Demand</span>
          <span className="text-[10px] md:text-[12px] font-bold text-[#DBDEE1] font-mono flex items-center gap-1">{avgStat(giveItems, "demand", ALL_UNITS)} <span className="text-[#80848E] text-[8px] md:text-[10px]">➔</span> {avgStat(getItems, "demand", ALL_UNITS)}</span>
          <div className="absolute top-full mt-2 right-0 md:left-1/2 md:-translate-x-1/2 w-[160px] bg-[#111214] border border-[rgba(255,255,255,0.08)] text-[#DBDEE1] text-[11px] p-2.5 rounded-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.8)] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] text-right md:text-center">
            <strong className="text-[#F2F3F5] block mb-1">Demand (1-5)</strong>
            <span className="text-[#23a559] font-bold">Higher is better.</span> Defines how easy a unit is to trade off to others.
          </div>
        </div>
      </div>
    </div>
  );
}