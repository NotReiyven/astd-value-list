import { useState, useEffect, useCallback } from "react";
import { Wand2, X, Book, HelpCircle, TriangleAlert, Trash2 } from "lucide-react";
import { TradeCard, MasterUnit } from "../../../types";
import { parseSmartTrade, AmbiguousToken, getSlangCache, removeSlang, learnSlang } from "./smartParser";

interface SmartParserMenuProps {
  ALL_UNITS: MasterUnit[];
  giveItems: TradeCard[];
  getItems: TradeCard[];
  pinnedIds: Set<string>;
  onOverwrite: (giveCards: TradeCard[], getCards: TradeCard[]) => void;
  onAdd: (col: "give" | "get", card: TradeCard) => void;
  onClose: () => void;
}

export function SmartParserMenu({ ALL_UNITS, giveItems, getItems, pinnedIds, onOverwrite, onAdd, onClose }: SmartParserMenuProps) {
  const [activeMenuTab, setActiveMenuTab] = useState<"import" | "dictionary">("import");
  const [smartInput, setSmartInput] = useState("");
  const [smartInputError, setSmartInputError] = useState("");
  const [ambiguousItems, setAmbiguousItems] = useState<AmbiguousToken[]>([]);

  const [slangDict, setSlangDict] = useState<Record<string, string>>({});
  const [newSlangKey, setNewSlangKey] = useState("");
  const [newSlangTargetId, setNewSlangTargetId] = useState("");

  useEffect(() => {
    setSlangDict(getSlangCache());
  }, [activeMenuTab]);

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
      if (result.ambiguous.length === 0) onClose();
    }
  }, [smartInput, giveItems, getItems, pinnedIds, onOverwrite, ALL_UNITS, onClose]);

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
      if (newAmbiguous.length === 0) onClose();
      return newAmbiguous;
    });
  }, [onAdd, ambiguousItems, onClose]);

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

  return (
    <div className="mx-3 md:mx-4 mt-3 p-4 bg-[#2B2D31] border border-[#1E1F22] rounded-[8px] animate-fade-in shadow-[0_8px_24px_rgba(0,0,0,0.15)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold text-[#F2F3F5] uppercase tracking-wider flex items-center gap-1.5">
          <Wand2 className="w-4 h-4 text-[#5865F2]"/> Smart Parser
        </span>
        <button onClick={onClose} className="text-[#949BA4] hover:text-[#DBDEE1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2] rounded-[3px]">
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
                <div key={`${idx}-${item.rawName}`} className="flex flex-col p-3 bg-[#1E1F22] rounded-[8px] border border-[rgba(255,255,255,0.02)] shadow-inner">
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
  );
}