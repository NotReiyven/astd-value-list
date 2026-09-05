// src/app/components/TutorialChannel/index.tsx
import { useState, useEffect } from "react";
import { LayoutGrid, Target, BookOpen, Search, Flame } from "lucide-react";
import { PopupUnit } from "../../../types";
import { GuideType } from "../guides/AquaGuideOverlay";

import { SandboxTab } from "./SandboxTab";
import { SimulatorTab } from "./SimulatorTab";
import { TheoryTab } from "./TheoryTab";
import { DictionaryTab } from "./DictionaryTab";

export function TutorialChannel({
  onToggleAnalyzer,
  onAddGive,
  onAddGet,
  startGuide
}: {
  onToggleAnalyzer: () => void;
  onAddGive: (u: PopupUnit) => void;
  onAddGet: (u: PopupUnit) => void;
  startGuide: (type: GuideType) => void;
}) {
  const [activeTab, setActiveTab] = useState<"sandbox" | "simulator" | "theory" | "dictionary">("sandbox");
  
  // Easter Egg states
  const [godModeClicks, setGodModeClicks] = useState(0);
  const [godModeActive, setGodModeActive] = useState(false);
  const [comboPoints, setComboPoints] = useState(0);

  useEffect(() => {
    console.log("%c🔥 ASTD ACADEMY %c- Cheat codes enabled! Click 'Platform Guidelines' 7 times for God Mode.", "color: #FAA61A; font-weight: bold;", "color: #949BA4;");
  }, []);

  const handleHeaderSecret = () => {
    const next = godModeClicks + 1;
    setGodModeClicks(next);
    if (next >= 7) setGodModeActive(true);
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden bg-[#313338] h-full select-none ${godModeActive ? 'ring-4 ring-[#EF4444]/40' : ''}`}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #2B2D31; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1A1B1E; border-radius: 3px; }
      `}</style>

      {godModeActive && (
        <div className="bg-gradient-to-r from-red-600 via-amber-500 to-indigo-600 px-4 py-2 text-white flex items-center justify-between shadow-md text-xs font-bold shrink-0 z-50 relative">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 animate-bounce text-yellow-200" />
            <span>GOD MODE: Practice Dummy value boosted to 999,999! Combo Clicks: {comboPoints}</span>
          </div>
          <button onClick={() => setGodModeActive(false)} className="bg-black/30 hover:bg-black/50 px-2 py-0.5 rounded text-[10px]">Deactivate</button>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex-shrink-0 px-4 md:px-6 py-3 border-b border-[rgba(255,255,255,0.04)] bg-[#2B2D31] relative z-40">
        <div className="flex bg-[#1E1F22] rounded-[6px] p-1 border border-[rgba(255,255,255,0.04)] w-full overflow-x-auto hide-scrollbar">
          <button onClick={() => setActiveTab("sandbox")} className={`flex items-center gap-1.5 px-5 py-1.5 rounded-[4px] text-[12px] font-bold transition-all whitespace-nowrap ${activeTab === "sandbox" ? "bg-[#5865F2] text-white shadow-sm" : "text-[#949BA4] hover:text-[#DBDEE1]"}`}>
            <LayoutGrid className="w-3.5 h-3.5" /> Training Lab
          </button>
          <button onClick={() => setActiveTab("simulator")} className={`flex items-center gap-1.5 px-5 py-1.5 rounded-[4px] text-[12px] font-bold transition-all whitespace-nowrap ${activeTab === "simulator" ? "bg-[#5865F2] text-white shadow-sm" : "text-[#949BA4] hover:text-[#DBDEE1]"}`}>
            <Target className="w-3.5 h-3.5" /> Mock Trades
          </button>
          <button onClick={() => setActiveTab("theory")} className={`flex items-center gap-1.5 px-5 py-1.5 rounded-[4px] text-[12px] font-bold transition-all whitespace-nowrap ${activeTab === "theory" ? "bg-[#5865F2] text-white shadow-sm" : "text-[#949BA4] hover:text-[#DBDEE1]"}`}>
            <BookOpen className="w-3.5 h-3.5" /> Market Theory
          </button>
          <button onClick={() => setActiveTab("dictionary")} className={`flex items-center gap-1.5 px-5 py-1.5 rounded-[4px] text-[12px] font-bold transition-all whitespace-nowrap ${activeTab === "dictionary" ? "bg-[#5865F2] text-white shadow-sm" : "text-[#949BA4] hover:text-[#DBDEE1]"}`}>
            <Search className="w-3.5 h-3.5" /> Live Parser Demo
          </button>
        </div>
      </div>

      {/* Tab viewport */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 relative z-10">
        {activeTab === "sandbox" && (
            <SandboxTab 
                godModeActive={godModeActive} 
                godModeClicks={godModeClicks}
                handleHeaderSecret={handleHeaderSecret}
                setComboPoints={setComboPoints}
                onAddGive={onAddGive}
                onAddGet={onAddGet}
                onToggleAnalyzer={onToggleAnalyzer}
                startGuide={startGuide}
            />
        )}
        
        {activeTab === "simulator" && (
            <SimulatorTab />
        )}
        
        {activeTab === "theory" && (
            <TheoryTab />
        )}
        
        {activeTab === "dictionary" && (
            <DictionaryTab />
        )}
      </div>
    </div>
  );
}