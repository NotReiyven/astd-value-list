// src/app/components/TutorialChannel/DictionaryTab.tsx
import React, { useState, useMemo } from "react";
import { BrainCircuit, Activity, MessageSquare } from "lucide-react";
import { MasterUnit } from "../../../types";
import { useUnits } from "../../../context/UnitContext";
import { TierGridCard } from "../MainCanvas/UnitGrid";

export function DictionaryTab() {
  const { units: ALL_UNITS } = useUnits();
  
  // Live Parser (Dictionary) State
  const [liveParserInput, setLiveParserInput] = useState("trading drb and fem law for overpays");
  
  const parsedResults = useMemo(() => {
    if (!liveParserInput.trim()) return [];
    const q = liveParserInput.toLowerCase();
    
    // Split into words, remove punctuation for clean matching
    const matchedUnits: { unit: MasterUnit; trigger: string }[] = [];
    const seenIds = new Set<string>();

    ALL_UNITS.forEach(u => {
      // Direct exact matches or alias matches inside the sentence
      let triggeredBy = "";
      
      const checkMatch = (term: string) => {
        const t = term.toLowerCase().replace(/[^a-z0-9\s]/g, "");
        if (t.length > 2 && q.includes(t) && new RegExp(`\\b${t}\\b`).test(q)) return t;
        return "";
      };

      triggeredBy = checkMatch(u.name) || checkMatch(u.subtitle);
      if (!triggeredBy && u.aliases) {
        for (const alias of u.aliases) {
          triggeredBy = checkMatch(alias);
          if (triggeredBy) break;
        }
      }

      if (triggeredBy && !seenIds.has(u.id)) {
        matchedUnits.push({ unit: u, trigger: triggeredBy });
        seenIds.add(u.id);
      }
    });

    return matchedUnits.slice(0, 10); // Limit to top 10 to avoid screen spam
  }, [liveParserInput, ALL_UNITS]);

  // Aqua Reactions for Dictionary
  const aquaReaction = useMemo(() => {
    const q = liveParserInput.toLowerCase();
    if (q.includes("scam") || q.includes("trash")) return "Hey! Are you trying to get me to evaluate garbage?!";
    if (q.includes("aqua") || q.includes("water goddess") || q.includes("konosuba")) return "Oh? Talking about me? Make sure you overpay!";
    if (q.includes("reiyven") || q.includes("developer")) return "Reiyven built this, but *I* am the face of it!";
    return null;
  }, [liveParserInput]);

  return (
    <div className="animate-fade-in pb-8 max-w-5xl mx-auto flex flex-col h-full gap-5">
      
      {/* Search / Live Test Area */}
      <div className="bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-5 md:p-8 shadow-xl flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#5865F2]/5 rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#23a559]/5 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-2">
              <BrainCircuit className="w-6 h-6 text-[#5865F2]" />
              <h2 className="text-[18px] font-black text-[#F2F3F5] uppercase tracking-wide">Test The AI Parser</h2>
          </div>
          <p className="text-[13px] text-[#B5BAC1] max-w-2xl leading-relaxed">
              Type a messy, realistic Discord trade message below. The parser uses Natural Language Processing to instantly identify unit slang and acronyms. 
          </p>

          <div className="relative mt-2">
              <textarea 
                  value={liveParserInput}
                  onChange={(e) => setLiveParserInput(e.target.value)}
                  placeholder="e.g., 'trading flaw and udbz for overpays...'"
                  className="w-full bg-[#111214] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-4 text-[#F2F3F5] text-[15px] font-medium resize-none outline-none focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] transition-all shadow-inner leading-relaxed min-h-[100px]"
              />
              
              {/* Aqua Reaction Easter Egg */}
              {aquaReaction && (
                  <div className="absolute -bottom-4 right-4 bg-[#2B2D31] border border-[#ed4245]/50 px-4 py-2.5 rounded-t-[12px] rounded-bl-[12px] rounded-br-sm shadow-xl flex items-center gap-3 animate-slide-up z-20">
                      <img src="https://static.wikia.nocookie.net/allstartd/images/c/c7/Water_Goddess.png" className="w-8 h-8 rounded-full border border-[#ed4245] object-cover" alt="Aqua" />
                      <span className="text-[#DBDEE1] text-[12px] font-medium italic">"{aquaReaction}"</span>
                  </div>
              )}
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px] text-[#80848E] font-bold uppercase tracking-wider">
              <span>{parsedResults.length} Units Recognized</span>
              <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-[#23a559] animate-pulse" /> Live Analysis Active</span>
          </div>
      </div>

      {/* Real-time Card Rendering */}
      <div className="bg-[#2B2D31] border border-[rgba(255,255,255,0.04)] rounded-[12px] p-5 md:p-6 shadow-sm min-h-[300px]">
          {parsedResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center opacity-50 py-16 text-center">
                  <MessageSquare className="w-12 h-12 text-[#80848E] mb-4" />
                  <p className="text-[#DBDEE1] font-bold text-[14px]">No units recognized in your input.</p>
                  <p className="text-[#80848E] text-[12px] mt-2">Try typing common slang like 'drb', 'frieren', or 'kido'.</p>
              </div>
          ) : (
              <div className="grid gap-3 sm:gap-4 w-full animate-fade-in" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 155px), 1fr))" }}>
                  {parsedResults.map(({ unit, trigger }) => (
                      <div key={unit.id} className="relative group mt-3">
                          {/* The triggering slang tag positioned to overlap the card border */}
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5865F2] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg z-20 border-2 border-[#2B2D31] animate-slide-up whitespace-nowrap pointer-events-none">
                              Matches "{trigger}"
                          </div>
                          <TierGridCard unit={unit} />
                      </div>
                  ))}
              </div>
          )}
      </div>

    </div>
  );
}