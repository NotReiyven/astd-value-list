import { memo, useState, useRef, useMemo } from "react";
import { Plus, X, ArrowRight, ArrowLeft } from "lucide-react";
import { PopupUnit, MasterUnit } from "../../../types";
import { GRID_STATUS_CFG, getTier, TIER_CONFIG, getProxyImage } from "../../../data";
import { getAvatarStyle, getInitials } from "../TradeAnalyzer/summaryUtils"; 
import { LazyRender } from "./LazyRender";

export const getStatColor = (label: string, value: number) => {
  if (label === "R") {
    if (value >= 19) return "#4DB6AC";
    if (value >= 9) return "#81C784";
    if (value >= 6) return "#FFB74D";
    return "#E57373";
  }
  if (label === "S") {
    if (value <= 1.5) return "#4DB6AC";
    if (value <= 2.5) return "#81C784";
    if (value <= 3.5) return "#B5BAC1";
    return "#E57373";
  }
  if (label === "D") {
    if (value >= 4) return "#4DB6AC";
    if (value >= 3) return "#81C784";
    if (value >= 2) return "#B5BAC1";
    return "#E57373";
  }
  return "#DBDEE1";
};

const UnitListRow = memo(function UnitListRow({ unit, isLast, onAddGive, onAddGet }: { unit: MasterUnit; isLast: boolean; onAddGive: (u: PopupUnit) => void; onAddGet: (u: PopupUnit) => void; }) {
  const [hovered, setHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const scrollDirectionRef = useRef<"horizontal" | "vertical" | null>(null);
  
  const popupUnit: PopupUnit = { id: unit.id, name: unit.name, subtitle: unit.subtitle, value: typeof unit.value === "number" ? unit.value : 0, demand: unit.demand };
  const sCfg = unit.status ? GRID_STATUS_CFG[unit.status] : null;
  const tierKey = getTier(unit);
  const tierColor = TIER_CONFIG[tierKey]?.badgeColor || "#5865F2";
  const proxyUrl = getProxyImage(unit.imageUrl);
  const obtainability = unit.obtainability || "UNOB";

  const triggerAddedGlow = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 200);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("unit", JSON.stringify(popupUnit));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(true);
    } else {
      onAddGive(popupUnit);
      triggerAddedGlow();
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    scrollDirectionRef.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (!scrollDirectionRef.current) {
      if (Math.abs(dx) > Math.abs(dy)) {
        scrollDirectionRef.current = "horizontal";
      } else {
        scrollDirectionRef.current = "vertical";
      }
    }

    if (scrollDirectionRef.current === "horizontal") {
      setSwipeOffset(dx);
    }
  };

  const onTouchEnd = () => {
    if (swipeOffset > 80) {
      onAddGive(popupUnit); triggerAddedGlow();
    } else if (swipeOffset < -80) {
      onAddGet(popupUnit); triggerAddedGlow();
    }
    setSwipeOffset(0);
    touchStartX.current = null;
    touchStartY.current = null;
    scrollDirectionRef.current = null;
  };

  // FIXED: Standardized Owner's Choice display rule
  const valDisplay = unit.value === "owner" || unit.valueDisplay === "Owner's Choice" || unit.valueDisplay === "O/C"
    ? <span className="text-[13px] md:text-[14px] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Owner's Choice</span>
    : unit.valueDisplay 
      ? <span className="text-[13px] md:text-[14px] font-bold tracking-tight text-[#DBDEE1] font-mono">{unit.valueDisplay}</span>
      : <span className="text-[14px] md:text-[15px] font-bold tracking-tight text-[#F2F3F5] font-mono">{(unit.value as number).toLocaleString()}</span>;

  return (
    <div className="relative group w-full overflow-hidden" style={{ borderBottom: !isLast ? "1px solid rgba(255,255,255,0.04)" : "none", contentVisibility: "auto", containIntrinsicSize: "56px" }}>
      <div className={`absolute inset-0 flex items-center px-5 font-bold transition-colors duration-200 z-0 ${swipeOffset > 0 ? 'bg-[#FAA61A] justify-start text-white' : swipeOffset < 0 ? 'bg-[#5865F2] justify-end text-white' : 'bg-transparent'}`}>
         {swipeOffset > 0 && <><ArrowRight className="w-4 h-4 mr-2" /> Add Give</>}
         {swipeOffset < 0 && <><ArrowLeft className="w-4 h-4 ml-2" /> Add Get</>}
      </div>

      <div
        draggable
        onDragStart={handleDragStart}
        onClick={handleCardClick}
        onContextMenu={(e) => { e.preventDefault(); onAddGet(popupUnit); triggerAddedGlow(); }}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex flex-col md:grid md:grid-cols-[56px_280px_minmax(200px,1fr)_160px_120px] items-stretch cursor-pointer select-none even:bg-[rgba(255,255,255,0.015)] bg-[#2B2D31] hover:bg-[rgba(255,255,255,0.04)] z-10 will-change-transform"
        style={{ 
          background: isAdded ? `${tierColor}40` : "",
          transform: `translateX(${swipeOffset}px) ${isAdded ? "scale(0.98)" : "scale(1)"}`,
          transition: swipeOffset === 0 ? "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease" : "none",
          touchAction: 'pan-y'
        }}
      >
        <div className="hidden md:flex px-4 py-2 border-r border-[rgba(255,255,255,0.04)] items-center justify-center">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#111214] border shadow-sm flex-shrink-0 flex items-center justify-center" style={{ borderColor: hovered ? `${tierColor}60` : "rgba(255,255,255,0.08)", transition: "border-color 0.3s ease" }}>
            {proxyUrl ? <img src={proxyUrl} alt={unit.name} loading="lazy" decoding="async" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-[10px]" style={getAvatarStyle(unit.name)}>{getInitials(unit.name)}</span>}
          </div>
        </div>

        <div className="flex md:hidden items-center justify-between w-full px-4 py-3">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#111214] border shadow-sm flex-shrink-0 flex items-center justify-center" style={{ borderColor: hovered ? `${tierColor}60` : "rgba(255,255,255,0.08)" }}>
              {proxyUrl ? <img src={proxyUrl} alt={unit.name} loading="lazy" decoding="async" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-[12px]" style={getAvatarStyle(unit.name)}>{getInitials(unit.name)}</span>}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[14px] font-extrabold tracking-tight text-[#F2F3F5] truncate">{unit.name}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-[#949BA4] truncate mt-1">{unit.subtitle}</span>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">{valDisplay}</div>
        </div>

        <div className="hidden md:flex flex-col justify-center min-w-0 px-4 py-2 border-r border-[rgba(255,255,255,0.04)]">
          <span className="text-[14px] font-extrabold tracking-tight text-[#F2F3F5] truncate transition-colors duration-300" style={{ color: hovered ? "#FFF" : "#F2F3F5" }}>{unit.name}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-[#949BA4] truncate mt-1 mb-1.5">{unit.subtitle}</span>
          <div className="flex items-center gap-1.5">
            {obtainability === "UNOB" ? (
              <span className="text-[8px] font-bold uppercase text-[#949BA4] bg-[#1E1F22] px-1.5 py-[2px] rounded-[3px] border border-[rgba(255,255,255,0.05)] tracking-widest leading-none">UNOBTAINABLE</span>
            ) : (
              <span className="text-[8px] font-bold uppercase text-[#DBDEE1] bg-[rgba(255,255,255,0.05)] px-1.5 py-[2px] rounded-[3px] border border-[rgba(255,255,255,0.1)] tracking-widest leading-none">OBTAINABLE</span>
            )}
            {sCfg && <span className="px-1.5 py-[2px] rounded-[3px] text-[8px] font-bold uppercase tracking-widest leading-none border" style={{ background: sCfg.bg, color: sCfg.color, borderColor: sCfg.border }}>{sCfg.label}</span>}
          </div>
        </div>

        <div className="flex md:contents items-center justify-between w-full px-4 pb-3 md:p-0 relative min-h-[28px] md:min-h-0">
          <div className={`flex md:contents items-center justify-between w-full transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'}`}>
            
            <div className="hidden md:flex px-4 py-2 border-r border-[rgba(255,255,255,0.04)] items-center w-full min-w-0">
              {unit.notice ? <span className="text-[11.5px] font-medium text-[#B5BAC1] line-clamp-2 leading-snug">{unit.notice}</span> : <span className="text-[11.5px] font-medium text-[#4e5058] italic">No notes</span>}
            </div>

            {unit.notice && <div className="md:hidden flex-1 pr-2 text-[11px] text-[#949BA4] italic leading-snug line-clamp-2">{unit.notice}</div>}

            <div className="w-auto md:w-full flex-shrink-0 flex items-center justify-center gap-2 md:border-r md:border-[rgba(255,255,255,0.04)] md:px-4 md:py-2 opacity-90 md:opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="text-[11px] md:text-[12px] font-mono font-bold"><span className="text-[#80848E]">R </span><span style={{ color: getStatColor("R", unit.rarity) }}>{unit.rarity}</span></span>
              <span className="text-[#3F4147] text-[11px] md:text-[12px] font-bold">|</span>
              <span className="text-[11px] md:text-[12px] font-mono font-bold"><span className="text-[#80848E]">S </span><span style={{ color: getStatColor("S", unit.supply) }}>{unit.supply}</span></span>
              <span className="text-[#3F4147] text-[11px] md:text-[12px] font-bold">|</span>
              <span className="text-[11px] md:text-[12px] font-mono font-bold"><span className="text-[#80848E]">D </span><span style={{ color: getStatColor("D", unit.demand) }}>{unit.demand}</span></span>
            </div>

            <button 
              className="md:hidden flex flex-shrink-0 items-center justify-center rounded-[4px] w-[28px] h-[28px] bg-[rgba(255,255,255,0.06)] text-[#B5BAC1] active:scale-95"
              onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(true); }}
            >
              <Plus className="w-4 h-4" />
            </button>

            <div className="hidden md:flex w-full flex-shrink-0 items-center justify-end px-4 py-2 relative">
              <div className="group-hover:opacity-0 transition-opacity duration-300 flex justify-end w-full">
                {valDisplay}
              </div>
              <div className="absolute inset-y-0 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                <span className="text-[10px] font-bold text-[#949BA4]"><strong className="text-[#FAA61A]">[L]</strong> Give</span>
                <span className="text-[10px] font-bold text-[#949BA4]"><strong className="text-[#5865F2]">[R]</strong> Get</span>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="absolute inset-0 flex items-center gap-2 bg-[#2B2D31] z-20 md:hidden animate-fade-in pl-1">
              <button onClick={(e) => { e.stopPropagation(); onAddGive(popupUnit); setMobileMenuOpen(false); triggerAddedGlow(); }} className="flex-1 bg-[#FAA61A] text-white text-[12px] font-bold h-[28px] rounded-[4px] active:scale-95 shadow-sm">Give</button>
              <button onClick={(e) => { e.stopPropagation(); onAddGet(popupUnit); setMobileMenuOpen(false); triggerAddedGlow(); }} className="flex-1 bg-[#5865F2] text-white text-[12px] font-bold h-[28px] rounded-[4px] active:scale-95 shadow-sm">Get</button>
              <button onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); }} className="flex-shrink-0 w-[28px] h-[28px] bg-[rgba(255,255,255,0.06)] text-[#F2F3F5] rounded-[4px] flex items-center justify-center active:scale-95"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export const UnitListTable = memo(function UnitListTable({ units, onAddGive, onAddGet }: { units: MasterUnit[]; onAddGive: (u: PopupUnit) => void; onAddGet: (u: PopupUnit) => void; }) {
  const chunks = useMemo(() => {
    const result = [];
    for (let i = 0; i < units.length; i += 30) {
      result.push(units.slice(i, i + 30));
    }
    return result;
  }, [units]);

  return (
    <div className="w-full rounded-[8px] border border-[rgba(255,255,255,0.06)] bg-[#2B2D31] shadow-sm pb-2 md:pb-0 overflow-hidden">
      <div className="flex flex-col w-full">
        <div className="hidden md:grid grid-cols-[56px_280px_minmax(200px,1fr)_160px_120px] items-center border-b border-[rgba(255,255,255,0.08)] bg-[#1E1F22] text-[#949BA4] text-[10px] font-bold uppercase tracking-wider select-none">
          <div className="px-4 py-3 border-r border-[rgba(255,255,255,0.04)] h-full flex items-center">Icon</div>
          <div className="px-4 py-3 border-r border-[rgba(255,255,255,0.04)] h-full flex items-center">Unit Information</div>
          <div className="px-4 py-3 border-r border-[rgba(255,255,255,0.04)] h-full flex items-center">Notes</div>
          <div className="px-4 py-3 border-r border-[rgba(255,255,255,0.04)] h-full flex items-center justify-center">Stats (R/S/D)</div>
          <div className="px-4 py-3 h-full flex items-center justify-end">Value</div>
        </div>
        
        <div className="flex flex-col bg-[#2B2D31]">
          {chunks.map((chunk, idx) => (
            <LazyRender key={idx} placeholderHeight="1680px">
              <div className="flex flex-col w-full">
                {chunk.map((unit, i) => (
                  <UnitListRow key={unit.id} unit={unit} isLast={idx === chunks.length - 1 && i === chunk.length - 1} onAddGive={onAddGive} onAddGet={onAddGet} />
                ))}
              </div>
            </LazyRender>
          ))}
        </div>
      </div>
    </div>
  );
});