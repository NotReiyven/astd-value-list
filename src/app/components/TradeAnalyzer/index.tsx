import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Calculator, RotateCcw, Share2, Check, TriangleAlert, ArrowUpDown, Wand2, X, HelpCircle, Book, Trash2 } from "lucide-react";
import { TradeCard, MasterUnit } from "../../../types";
import { TradeSectionPanel } from "./TradeSectionPanel";
import { TradeNotices } from "./TradeNotices";
import { parseSmartTrade, AmbiguousToken, getSlangCache, removeSlang, learnSlang } from "./smartParser";
import { avgStat, fmtK, generateTextSummary, DynamicSummary } from "./summaryUtils";
import { useUnits } from "../../../context/UnitContext";

export function TradeAnalyzerPanel({
  giveItems,
  getItems,
  onChangeQty,
  onRemoveCard,
  onClear,
  onAdd,
  onSwap,
  onOverwrite,
  isOpen = true,
  onClose,
}: {
  giveItems: TradeCard[];
  getItems: TradeCard[];
  onChangeQty: (col: "give" | "get", id: string, qty: number) => void;
  onRemoveCard: (col: "give" | "get", id: string) => void;
  onClear: (col: "give" | "get") => void;
  onAdd: (col: "give" | "get", card: TradeCard) => void;
  onSwap: () => void;
  onOverwrite: (giveCards: TradeCard[], getCards: TradeCard[]) => void;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const { units: ALL_UNITS } = useUnits();
  const [copied, setCopied] = useState(false);
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);

  const [smartMenuOpen, setSmartMenuOpen] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState<"import" | "dictionary">("import");
  const [smartInput, setSmartInput] = useState("");
  const [smartInputError, setSmartInputError] = useState("");
  const [ambiguousItems, setAmbiguousItems] = useState<AmbiguousToken[]>([]);

  const [slangDict, setSlangDict] = useState<Record<string, string>>({});
  const [newSlangKey, setNewSlangKey] = useState("");
  const [newSlangTargetId, setNewSlangTargetId] = useState("");

  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  const [panelWidth, setPanelWidth] = useState<number>(400); 
  const [isMobile, setIsMobile] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  const [undoCache, setUndoCache] = useState<{give: TradeCard[], get: TradeCard[]} | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (smartMenuOpen) {
      setSlangDict(getSlangCache());
    }
  }, [smartMenuOpen, activeMenuTab]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (panelRef.current) {
      const parent1 = panelRef.current.parentElement;
      const parent2 = parent1?.parentElement;

      if (parent1 && parent2) {
        if (isOpen && !isMobile) {
          parent1.style.width = `${panelWidth}px`;
          parent1.style.maxWidth = 'none';
          parent2.style.width = `${panelWidth}px`;
          parent2.style.maxWidth = 'none';
        } else {
          parent1.style.width = '';
          parent1.style.maxWidth = '';
          parent2.style.width = '';
          parent2.style.maxWidth = '';
        }
      }
    }
  }, [isOpen, panelWidth, isMobile]);

  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("unit")) setIsGlobalDragging(true);
    };
    const handleDragEnd = () => setIsGlobalDragging(false);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("dragend", handleDragEnd);
    return () => {
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("dragend", handleDragEnd);
    };
  }, []);

  const { giveTotal, getTotal, givePercent, getPercent } = useMemo(() => {
    const gTotal = giveItems.reduce((s, c) => s + c.value * c.qty, 0);
    const tTotal  = getItems.reduce((s, c) => s + c.value * c.qty, 0);
    const totalTradeValue = gTotal + tTotal;
    return {
      giveTotal: gTotal,
      getTotal: tTotal,
      givePercent: totalTradeValue === 0 ? 50 : (gTotal / totalTradeValue) * 100,
      getPercent: totalTradeValue === 0 ? 50 : (tTotal / totalTradeValue) * 100
    };
  }, [giveItems, getItems]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;
    let newWidth = startWidth;
    let ticking = false;

    const parent1 = panelRef.current?.parentElement;
    const parent2 = parent1?.parentElement;
    
    if (parent2) parent2.style.transition = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
       if (!ticking) {
         window.requestAnimationFrame(() => {
           const delta = startX - moveEvent.clientX; 
           newWidth = Math.min(Math.max(400, startWidth + delta), 800); 
           
           if (panelRef.current) {
             panelRef.current.style.width = `${newWidth}px`;
           }
           if (parent1 && parent2) {
             parent1.style.width = `${newWidth}px`;
             parent1.style.maxWidth = 'none';
             parent2.style.width = `${newWidth}px`;
             parent2.style.maxWidth = 'none';
           }
           ticking = false;
         });
         ticking = true;
       }
    };

    const onMouseUp = () => {
       document.removeEventListener("mousemove", onMouseMove);
       document.removeEventListener("mouseup", onMouseUp);
       document.body.style.cursor = 'default';
       
       if (parent2) parent2.style.transition = ''; 
       setPanelWidth(newWidth);
    };

    document.body.style.cursor = 'col-resize';
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [panelWidth]);

  const togglePin = useCallback((col: "give" | "get", id: string) => {
    setPinnedIds(prev => {
      const pinKey = `${col}-${id}`;
      const next = new Set(prev);
      if (next.has(pinKey)) next.delete(pinKey);
      else next.add(pinKey);
      return next;
    });
  }, []);

  const handleClearSection = useCallback((col: "give" | "get") => {
    if (col === "give") {
      onOverwrite(giveItems.filter(i => pinnedIds.has(`give-${i.id}`)), getItems);
    } else {
      onOverwrite(giveItems, getItems.filter(i => pinnedIds.has(`get-${i.id}`)));
    }
  }, [giveItems, getItems, pinnedIds, onOverwrite]);

  const handleGlobalClear = useCallback(() => {
    setUndoCache({ give: [...giveItems], get: [...getItems] });

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    undoTimerRef.current = setTimeout(() => {
      setUndoCache(null);
    }, 4000);

    onOverwrite(
      giveItems.filter(i => pinnedIds.has(`give-${i.id}`)), 
      getItems.filter(i => pinnedIds.has(`get-${i.id}`))
    );
  }, [giveItems, getItems, pinnedIds, onOverwrite]);

  const handleUndo = useCallback(() => {
    if (undoCache) {
      onOverwrite(undoCache.give, undoCache.get);
      setUndoCache(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    }
  }, [undoCache, onOverwrite]);

  const handleSmartImport = useCallback(() => {
    const result = parseSmartTrade(smartInput, ALL_UNITS); 
    if (result.error) {
      setSmartInputError(result.error);
      setTimeout(() => setSmartInputError(""), 3000);
    } else {
      const mergeCards = (arr1: TradeCard[], arr2: TradeCard[]) => {
        const map = new Map<string, TradeCard>();
        arr1.forEach(c => map.set(c.id, { ...c }));
        arr2.forEach(c => {
          if (map.has(c.id)) map.get(c.id)!.qty += c.qty;
          else map.set(c.id, { ...c });
        });
        return Array.from(map.values());
      };

      const pinnedGive = giveItems.filter(i => pinnedIds.has(`give-${i.id}`));
      const pinnedGet = getItems.filter(i => pinnedIds.has(`get-${i.id}`));

      onOverwrite(mergeCards(pinnedGive, result.giveCards), mergeCards(pinnedGet, result.getCards));
      setAmbiguousItems(result.ambiguous);
      setSmartInput("");
      if (result.ambiguous.length === 0) setSmartMenuOpen(false);
    }
  }, [smartInput, giveItems, getItems, pinnedIds, onOverwrite, ALL_UNITS]);

  const resolveAmbiguity = useCallback((index: number, resolvedUnit: MasterUnit, col: "give" | "get", qty: number) => {
    if (qty > 0) {
      onAdd(col, {
          id: resolvedUnit.id, name: resolvedUnit.name, subtitle: resolvedUnit.subtitle,
          value: typeof resolvedUnit.value === "number" ? resolvedUnit.value : 0,
          demand: resolvedUnit.demand, qty
      });
      learnSlang(ambiguousItems[index].rawName, resolvedUnit.id);
    }

    setAmbiguousItems(prev => {
      const newAmbiguous = [...prev];
      newAmbiguous.splice(index, 1);
      if (newAmbiguous.length === 0) setSmartMenuOpen(false);
      return newAmbiguous;
    });
  }, [onAdd, ambiguousItems]);

  const handleAddSlang = () => {
    if (!newSlangKey.trim() || !newSlangTargetId) return;
    learnSlang(newSlangKey, newSlangTargetId);
    setSlangDict(getSlangCache());
    setNewSlangKey("");
    setNewSlangTargetId("");
  };

  const handleRemoveSlang = (key: string) => {
    removeSlang(key);
    setSlangDict(getSlangCache());
  };

  const handleShare = useCallback(() => {
    const giveParts = giveItems.map((c) => `${c.qty}x ${c.name} (${fmtK(c.value * c.qty)})`).join("\n> ");
    const getParts  = getItems.map((c) => `${c.qty}x ${c.name} (${fmtK(c.value * c.qty)})`).join("\n> ");
    const rShift = `${avgStat(giveItems, "rarity", ALL_UNITS)} ➔ ${avgStat(getItems, "rarity", ALL_UNITS)}`;
    const sShift = `${avgStat(giveItems, "supply", ALL_UNITS)} ➔ ${avgStat(getItems, "supply", ALL_UNITS)}`;
    const dShift = `${avgStat(giveItems, "demand", ALL_UNITS)} ➔ ${avgStat(getItems, "demand", ALL_UNITS)}`;
    const text = `**[I GIVE]**\n> ${giveParts || "Nothing"}\n\n**[I GET]**\n> ${getParts || "Nothing"}\n\n📊 **Diff:** ${generateTextSummary(giveItems, getItems, giveTotal, getTotal, ALL_UNITS)}\n📈 **Rarity, Supply, Demand shift:**\n> R: ${rShift} | S: ${sShift} | D: ${dShift}\n\n`;

    const tryWrite = async () => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
        document.body.appendChild(ta);
        ta.focus(); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    tryWrite();
  }, [giveItems, getItems, giveTotal, getTotal, ALL_UNITS]);

  return (
    <div 
      ref={panelRef} 
      className="flex flex-col h-full w-full select-none border-l border-[rgba(0,0,0,0.32)] shadow-[-12px_0_40px_rgba(0,0,0,0.5)]" 
      style={{ width: isMobile ? "100%" : `${panelWidth}px`, minWidth: isMobile ? "100%" : "400px", background: "#2B2D31", fontFamily: "'Inter', sans-serif" }}
    >
      {!isMobile && (
        <div 
          className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-[#5865F2] z-[100000] transition-colors"
          onMouseDown={startResize}
          title="Drag to resize panel"
        />
      )}

      <div className="flex-shrink-0 flex items-center gap-2 px-3 md:px-4 py-3 md:py-4 border-b border-[rgba(0,0,0,0.28)]">
        <div className="w-7 h-7 flex-shrink-0 rounded-[6px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.04)]">
          <Calculator className="w-3.5 h-3.5 text-[#DBDEE1]" />
        </div>
        <span className="text-[14px] md:text-[15px] font-bold flex-1 text-[#F2F3F5] truncate">Trade Analyzer</span>

        <button onClick={() => setSmartMenuOpen(!smartMenuOpen)} className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-[4px] transition-all duration-300 ease-out hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2] ${smartMenuOpen ? "bg-[rgba(88,101,242,0.15)] text-[#5865F2]" : "text-[#B5BAC1] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#F2F3F5]"}`} title="Context Recognition">
          <Wand2 className="w-4 h-4" />
        </button>
        <button onClick={handleGlobalClear} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-[4px] transition-all duration-300 ease-out hover:scale-110 active:scale-95 text-[#B5BAC1] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#F2F3F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2]" title="Clear trade">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleShare} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[12px] font-bold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg active:scale-95 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2]" style={{ background: copied ? "#23a559" : "#5865F2", fontFamily: "'Inter', sans-serif" }}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Share"}
        </button>

        {onClose && (
          <button 
            onClick={onClose} 
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-[4px] text-[#B5BAC1] hover:bg-[rgba(237,66,69,0.1)] hover:text-[#ed4245] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed4245]" 
            title="Close Analyzer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {smartMenuOpen && (
        <div className="mx-3 md:mx-4 mt-3 p-4 bg-[#2B2D31] border border-[#1E1F22] rounded-[8px] animate-fade-in shadow-[0_8px_24px_rgba(0,0,0,0.15)] flex flex-col gap-4">
           <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#F2F3F5] uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-[#5865F2]"/> Smart Parser
              </span>
              <button onClick={() => setSmartMenuOpen(false)} className="text-[#949BA4] hover:text-[#DBDEE1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2] rounded-[3px]">
                 <X className="w-4 h-4" />
              </button>
           </div>

           <div className="flex bg-[#111214] p-1 rounded-[6px] border border-[rgba(255,255,255,0.04)]">
             <button onClick={() => setActiveMenuTab("import")} className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-[4px] transition-colors ${activeMenuTab === "import" ? "bg-[#5865F2] text-white shadow-sm" : "text-[#949BA4] hover:text-[#DBDEE1]"}`}>Import Trade</button>
             <button onClick={() => setActiveMenuTab("dictionary")} className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-[4px] transition-colors flex items-center justify-center gap-1.5 ${activeMenuTab === "dictionary" ? "bg-[#5865F2] text-white shadow-sm" : "text-[#949BA4] hover:text-[#DBDEE1]"}`}><Book className="w-3 h-3" /> Dictionary</button>
           </div>
           
           {activeMenuTab === "import" ? (
             ambiguousItems.length === 0 ? (
               <div className="flex flex-col gap-3">
                 <div className="flex flex-col gap-2.5 bg-[#111214] border border-[rgba(255,255,255,0.04)] rounded-[6px] p-3 shadow-inner">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#949BA4] uppercase tracking-wider">
                       <HelpCircle className="w-3.5 h-3.5" /> How to format your trade
                    </div>
                    <ul className="text-[12px] text-[#B5BAC1] flex flex-col gap-1.5 list-disc pl-4 marker:text-[#5865F2] leading-snug">
                       <li>Use <strong className="text-[#DBDEE1] font-semibold">"for"</strong> or <strong className="text-[#DBDEE1] font-semibold">"want"</strong> to separate your items from theirs.</li>
                       <li>Keep quantities next to the unit name (e.g., <strong className="text-[#DBDEE1] font-semibold">"5 x3"</strong>).</li>
                       <li>The AI will ask for clarification if a name matches multiple units.</li>
                    </ul>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-2 mt-1">
                    <input 
                      value={smartInput} 
                      onChange={e => setSmartInput(e.target.value)} 
                      onKeyDown={e => e.key === "Enter" && handleSmartImport()} 
                      placeholder="Paste offer here..." 
                      maxLength={500} 
                      className="flex-1 bg-[#1E1F22] border-none rounded-[4px] px-3 py-2.5 text-[14px] text-[#F2F3F5] outline-none placeholder-[#80848E] focus:ring-2 focus:ring-[#5865F2] transition-all" 
                      autoFocus 
                    />
                    <button onClick={handleSmartImport} className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-5 py-2.5 rounded-[4px] text-[14px] font-medium transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                      Import
                    </button>
                 </div>
                 {smartInputError && <p className="text-[12px] text-[#ed4245] mt-1 font-medium animate-fade-in flex items-center gap-1.5"><TriangleAlert className="w-3.5 h-3.5" /> {smartInputError}</p>}
               </div>
             ) : (
               <div className="flex flex-col gap-3 animate-fade-in">
                 <div className="flex items-start gap-3 bg-[rgba(250,166,26,0.1)] p-3 rounded-[6px] border border-[rgba(250,166,26,0.2)]">
                   <TriangleAlert className="w-5 h-5 text-[#FAA61A] shrink-0 mt-0.5" />
                   <div className="flex flex-col gap-0.5">
                     <span className="text-[14px] font-bold text-[#FAA61A]">Clarification Needed</span>
                     <span className="text-[13px] text-[#DBDEE1] leading-snug">Multiple units match your input. Please select the correct one below.</span>
                   </div>
                 </div>

                 <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1 pb-1">
                   {ambiguousItems.map((item, idx) => (
                     <div key={idx} className="flex flex-col p-3 bg-[#1E1F22] rounded-[8px] border border-[rgba(255,255,255,0.02)] shadow-inner">
                       <div className="flex items-center justify-between mb-3">
                           <p className="text-[13px] text-[#B5BAC1] font-medium">
                             For <strong className="text-[#F2F3F5] font-bold px-1.5 py-0.5 bg-[rgba(255,255,255,0.06)] rounded mx-1">"{item.rawName}"</strong>
                             <span className="text-[#949BA4] text-[12px] ml-1">(You {item.col})</span>
                           </p>
                       </div>
                       <div className="flex flex-col gap-2">
                         {item.options.map(opt => (
                            <button 
                              key={opt.id} 
                              onClick={() => resolveAmbiguity(idx, opt, item.col, item.qty)} 
                              className="group w-full flex items-center justify-between bg-[#2B2D31] hover:bg-[#5865F2] text-[#DBDEE1] hover:text-white px-3 py-2.5 rounded-[6px] transition-all duration-200 border border-[rgba(255,255,255,0.04)] hover:border-[#5865F2] active:scale-[0.99] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2]"
                            >
                              <div className="flex items-center gap-2">
                                 <span className="text-[13.5px] font-bold tracking-tight">{opt.name}</span>
                                 {opt.subtitle && <span className="text-[11px] font-medium opacity-60 bg-[rgba(0,0,0,0.2)] px-1.5 py-0.5 rounded-full">{opt.subtitle}</span>}
                              </div>
                            </button>
                         ))}
                         <div className="w-full h-px bg-[rgba(255,255,255,0.04)] my-1" />
                         <button 
                            onClick={() => resolveAmbiguity(idx, item.options[0], item.col, 0)} 
                            className="w-full flex items-center justify-center gap-1.5 bg-transparent hover:bg-[rgba(237,66,69,0.1)] text-[#949BA4] hover:text-[#ed4245] text-[12.5px] font-bold px-3 py-2 rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed4245]"
                         >
                            <X className="w-3.5 h-3.5" /> Ignore this unit
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )
           ) : (
             <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex flex-col gap-2">
                   <span className="text-[11px] font-bold text-[#949BA4] uppercase tracking-wider">Add New Slang</span>
                   <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        value={newSlangKey} 
                        onChange={e => setNewSlangKey(e.target.value)} 
                        placeholder="e.g. gg" 
                        className="w-full sm:w-[120px] bg-[#1E1F22] border-none rounded-[4px] px-3 py-2 text-[13px] text-[#F2F3F5] outline-none placeholder-[#80848E] focus:ring-2 focus:ring-[#5865F2]" 
                      />
                      <select
                        value={newSlangTargetId}
                        onChange={e => setNewSlangTargetId(e.target.value)}
                        className="flex-1 bg-[#1E1F22] border-none rounded-[4px] px-3 py-2 text-[13px] text-[#F2F3F5] outline-none focus:ring-2 focus:ring-[#5865F2] cursor-pointer appearance-none"
                      >
                         <option value="" disabled>Select target unit...</option>
                         {[...ALL_UNITS].sort((a,b) => a.name.localeCompare(b.name)).map(u => (
                           <option key={u.id} value={u.id}>{u.name} {u.subtitle ? `(${u.subtitle})` : ''}</option>
                         ))}
                      </select>
                      <button onClick={handleAddSlang} className="bg-[#23a559] hover:bg-[#1f914e] text-white px-4 py-2 rounded-[4px] text-[13px] font-bold transition-colors">Add</button>
                   </div>
                </div>
                
                <div className="flex flex-col gap-2 mt-2">
                   <span className="text-[11px] font-bold text-[#949BA4] uppercase tracking-wider">Saved Dictionary</span>
                   {Object.keys(slangDict).length === 0 ? (
                     <p className="text-[12px] text-[#80848E] italic p-3 bg-[#111214] rounded-[6px] border border-[rgba(255,255,255,0.02)]">Your dictionary is empty. Adding slang helps the parser recognize your unique abbreviations.</p>
                   ) : (
                     <div className="max-h-[200px] overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-2">
                       {Object.entries(slangDict).map(([key, targetId]) => {
                         const targetName = ALL_UNITS.find(u => u.id === targetId)?.name || targetId;
                         return (
                           <div key={key} className="flex items-center justify-between bg-[#1E1F22] p-2.5 rounded-[6px] border border-[rgba(255,255,255,0.02)]">
                             <div className="flex items-center gap-3 overflow-hidden">
                               <span className="text-[13px] font-bold text-[#F2F3F5] shrink-0">"{key}"</span>
                               <span className="text-[#80848E] text-[12px]">➔</span>
                               <span className="text-[12.5px] text-[#DBDEE1] truncate">{targetName}</span>
                             </div>
                             <button onClick={() => handleRemoveSlang(key)} className="text-[#80848E] hover:text-[#ed4245] p-1 transition-colors rounded-[3px] focus-visible:ring-2 focus-visible:ring-[#ed4245]">
                               <Trash2 className="w-3.5 h-3.5" />
                             </button>
                           </div>
                         )
                       })}
                     </div>
                   )}
                </div>
             </div>
           )}
        </div>
      )}

      <div className="flex-shrink-0 mx-3 md:mx-4 mt-4 rounded-[8px] px-4 py-3 md:px-5 md:py-4 relative overflow-hidden bg-[#1E1F22] border border-[rgba(255,255,255,0.04)]">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#949BA4] mb-1">Total Give</p>
              <p className="text-[16px] md:text-[18px] font-bold text-[#F2F3F5] font-mono transition-all duration-300">{giveTotal.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#949BA4] mb-1">Total Get</p>
              <p className="text-[16px] md:text-[18px] font-bold text-[#F2F3F5] font-mono transition-all duration-300">{getTotal.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex w-full h-[6px] gap-1 mb-2">
            {giveTotal > 0 && <div className="rounded-full bg-[#80848E]" style={{ width: `${givePercent}%`, transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }} />}
            {getTotal > 0 && <div className="rounded-full bg-[#DBDEE1]" style={{ width: `${getPercent}%`, transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }} />}
            {giveTotal === 0 && getTotal === 0 && <div className="w-full h-full rounded-full bg-[#111214] transition-all duration-500" />}
          </div>
          <p className="text-[10px] md:text-[11.5px] font-medium text-[#B5BAC1] text-center mt-3 tracking-wide px-1">
            <DynamicSummary giveItems={giveItems} getItems={getItems} giveTotal={giveTotal} getTotal={getTotal} ALL_UNITS={ALL_UNITS} />
          </p>
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

      <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
        <TradeSectionPanel 
          label="You Give" 
          type="give" 
          items={giveItems} 
          isDraggingGlobal={isGlobalDragging} 
          onQtyChange={(id, qty) => onChangeQty("give", id, qty)} 
          onRemove={(id) => onRemoveCard("give", id)} 
          onClear={() => handleClearSection("give")} 
          onAdd={(card) => onAdd("give", card)} 
          pinnedIds={pinnedIds}
          onTogglePin={(id) => togglePin("give", id)}
        />
        <div className="relative mx-3 md:mx-4 flex items-center justify-center my-1">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[rgba(255,255,255,0.04)]" /></div>
          <button onClick={onSwap} className="relative flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ease-out hover:scale-110 z-10 bg-[#1E1F22] border border-[rgba(255,255,255,0.08)] text-[#80848E] hover:text-[#DBDEE1] hover:bg-[#2B2D31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2]" title="Swap Give and Get">
            <ArrowUpDown className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </button>
        </div>
        <TradeSectionPanel 
          label="You Get" 
          type="get" 
          items={getItems} 
          isDraggingGlobal={isGlobalDragging} 
          onQtyChange={(id, qty) => onChangeQty("get", id, qty)} 
          onRemove={(id) => onRemoveCard("get", id)} 
          onClear={() => handleClearSection("get")} 
          onAdd={(card) => onAdd("get", card)} 
          pinnedIds={pinnedIds}
          onTogglePin={(id) => togglePin("get", id)}
        />
        <TradeNotices giveItems={giveItems} getItems={getItems} ALL_UNITS={ALL_UNITS} />
      </div>

      {undoCache && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-[#111214] border border-[rgba(255,255,255,0.08)] px-4 py-2.5 rounded-[8px] shadow-[0_8px_16px_rgba(0,0,0,0.4)] flex items-center gap-4 animate-fade-in">
          <span className="text-[13px] font-medium text-[#DBDEE1]">Trade cleared.</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleUndo} 
              className="text-[13px] font-bold text-[#5865F2] hover:text-[#4752C4] hover:underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2] rounded-[3px] px-1"
            >
              Undo
            </button>
            <div className="w-[1px] h-3 bg-[rgba(255,255,255,0.1)]"></div>
            <button 
              onClick={() => { setUndoCache(null); if (undoTimerRef.current) clearTimeout(undoTimerRef.current); }}
              className="text-[#80848E] hover:text-[#DBDEE1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2] rounded-[3px]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}