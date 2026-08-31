import { useState, useRef, useEffect } from "react";
import {
  Calculator,
  LayoutGrid,
  Hand,
  Sparkles,
  Rocket,
  BarChart3,
  Tag,
  ArrowRight,
  List,
  Hash,
  TrendingUp,
  Info,
  ChevronRight,
  ChevronLeft,
  Flame,
  Zap
} from "lucide-react";
import { PopupUnit } from "../../types";
import { GRID_STATUS_CFG } from "../../data";

function SpotlightCard({ children, color, className = "" }: { children: React.ReactNode, color: string, className?: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsHovering(true);
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovering(false)}
      className={`bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] flex flex-col shadow-sm relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] duration-300 ${className}`}
    >
      <div 
        className="absolute pointer-events-none transition-opacity duration-300 z-0 mix-blend-screen"
        style={{
          top: mousePos.y - 150, left: mousePos.x - 150, width: 300, height: 300,
          background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
          opacity: isHovering ? 1 : 0
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-[4px] z-20 rounded-t-[12px]" style={{ backgroundColor: color }} />
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none z-0 transition-opacity group-hover:opacity-20 duration-500" 
        style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }} 
      />
      {children}
    </div>
  );
}

function TiltCard({ children, color, className = "" }: { children: React.ReactNode, color: string, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glowRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    
    // Direct DOM mutation bypasses React's render cycle completely
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    cardRef.current.style.zIndex = '30';
    
    glowRef.current.style.top = `${y - 150}px`;
    glowRef.current.style.left = `${x - 150}px`;
    glowRef.current.style.opacity = '1';
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || !glowRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    cardRef.current.style.zIndex = '1';
    glowRef.current.style.opacity = '0';
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] flex flex-col shadow-sm relative overflow-hidden group transition-transform duration-500 ease-out ${className}`}
      style={{ willChange: 'transform' }}
    >
      <div 
        ref={glowRef}
        className="absolute pointer-events-none transition-opacity duration-300 z-0 mix-blend-screen opacity-0"
        style={{
          width: 300, height: 300,
          background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-[4px] z-20 rounded-t-[12px]" style={{ backgroundColor: color }} />
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0 transition-opacity group-hover:opacity-20 duration-500" style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }} />
      {children}
    </div>
  );
}

export function TutorialChannel({
  onToggleAnalyzer,
  onAddGive,
  onAddGet
}: {
  onToggleAnalyzer: () => void;
  onAddGive: (u: PopupUnit) => void;
  onAddGet: (u: PopupUnit) => void;
}) {
  const [activeTab, setActiveTab] = useState<"platform" | "tags" | "stats">("platform");
  const [lastAction, setLastAction] = useState<{ type: "give" | "get"; unit: string } | null>(null);
  const [viewModeDemo, setViewModeDemo] = useState<"grid" | "list">("grid");
  const [dragClicked, setDragClicked] = useState(false);
  const [sparks, setSparks] = useState<{id: number, x: number, y: number, tx: number, ty: number, color: string}[]>([]);

  // 🔥 NEW EASTER EGG: DEV GOD MODE & HYPE CLICKER MINI-GAME
  const [godModeClicks, setGodModeClicks] = useState(0);
  const [godModeActive, setGodModeActive] = useState(false);
  const [comboPoints, setComboPoints] = useState(0);

  useEffect(() => {
    console.log("%c🔥 ASTD TUTORIAL v3.0 %c- Cheat codes enabled! Click 'Platform Guidelines' 7 times for God Mode.", "color: #FAA61A; font-weight: bold;", "color: #949BA4;");
  }, []);

  const handleHeaderSecret = () => {
    const next = godModeClicks + 1;
    setGodModeClicks(next);
    if (next >= 7) {
      setGodModeActive(true);
    }
  };

  const tradeAnalyzerIcon = "https://static.wikia.nocookie.net/allstartd/images/3/31/Water_Goddess_Old.png/revision/latest?cb=20240306082508";
  const mobileGesturesIcon = "https://media.discordapp.net/attachments/1543674169173221520/1543674555044860105/image.png?ex=6a95ba76&is=6a9468f6&hm=8f1b5a59a4217e71c1c0dcbd49493b465c9ba3f4de535bad95ac988f763649a2&=&format=webp&quality=lossless";
  const quickAddingIcon = "https://media.discordapp.net/attachments/1538970612947615744/1543324532385910834/image.png?ex=6a94747a&is=6a9322fa&hm=4b7ccdc9fed856babfc8bb7274afd1c3d3394e4a44a14e00b6c7d222e6cec82d&=&format=webp&quality=lossless";
  const advancedGesturesIcon = "https://media.discordapp.net/attachments/1538970612947615744/1543324532876779520/image.png?ex=6a94747a&is=6a9322fa&hm=c88602297fa118bcd37ace496d84ea83c0291198e936f04b42340f5b5ee4631a&=&format=webp&quality=lossless";
  const viewModesIcon = "https://static.wikia.nocookie.net/allstartd/images/f/f7/Chains_%28Pose%29.png/revision/latest?cb=20260715185249";
  const primaryStatusIcon = "https://static.wikia.nocookie.net/allstartd/images/9/98/Ice_Dragon_%28Pose%29.png/revision/latest?cb=20260717231055";
  const secondaryTagsIcon = "https://static.wikia.nocookie.net/allstartd/images/c/c1/Crimson_Mommy_%28Pose%29.png/revision/latest?cb=20231122024001";

  const demoUnit: PopupUnit = {
    id: "tut-demo-unit",
    name: godModeActive ? "🔥 GOD MODE DUMMY 🔥" : "Sandbox Dummy",
    subtitle: godModeActive ? "Level 999 Trading God" : "Tutorial Unit",
    value: godModeActive ? 999999 : 50000,
    demand: 5
  };

  const handleSandboxClick = (e: React.MouseEvent, type: "give" | "get") => {
    e.preventDefault();
    if (type === "give") onAddGive(demoUnit);
    else onAddGet(demoUnit);
    
    setLastAction({ type, unit: demoUnit.name });
    setComboPoints(prev => prev + 1);
    setTimeout(() => setLastAction(null), 1500);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = godModeActive ? "#EF4444" : (type === "give" ? "#FAA61A" : "#5865F2");

    const newSparks = Array.from({ length: godModeActive ? 16 : 8 }).map((_, i) => {
      const angle = (i * (godModeActive ? 22.5 : 45)) + (Math.random() * 20);
      const distance = 30 + Math.random() * (godModeActive ? 45 : 20);
      return {
        id: Date.now() + i,
        x, y,
        tx: Math.cos((angle * Math.PI) / 180) * distance,
        ty: Math.sin((angle * Math.PI) / 180) * distance,
        color
      };
    });
    setSparks(newSparks);
    setTimeout(() => setSparks([]), 600);
  };

  const handleDragSimClick = () => {
    onAddGive(demoUnit);
    setDragClicked(true);
    setComboPoints(prev => prev + 1);
    setTimeout(() => setDragClicked(false), 1500);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("unit", JSON.stringify(demoUnit));
    e.dataTransfer.effectAllowed = "copy";
  };

  const primaryTags = [
    { key: "stable", color: "#E6D8A1" }, { key: "unstable", color: "#6B9EB5" },
    { key: "rising", color: "#30A163" }, { key: "dropping", color: "#E60A18" },
    { key: "inflated", color: "#c27a40" }, { key: "deflated", color: "#3C81F3" },
    { key: "varies", color: "#9b8de8" }, { key: "maximum", color: "#E66C19" },
  ];

  const secondaryTags = [
    { key: "hyped", color: "#01EFFD" }, { key: "gatekept", color: "#AF78A8" },
    { key: "black-marketed", color: "#9aa3b2" },
  ];

  const getTagStyle = (key: string) => {
    const cfg = GRID_STATUS_CFG[key as keyof typeof GRID_STATUS_CFG];
    if (!cfg) return { bg: "#1E1F22", color: "#949BA4", border: "rgba(255,255,255,0.04)" };
    return { bg: cfg.bg, color: cfg.color, border: cfg.border };
  };

  const rarityScale = [
    { value: "0", label: "Forever Obtainable" }, { value: "1-3", label: "Common Levels" },
    { value: "4-5", label: "Pretty / Slightly Common" }, { value: "6-8", label: "Uncommon Levels" },
    { value: "9", label: "Slightly Rare" }, { value: "10", label: "Pretty Rare (as rare as Aqua)" },
    { value: "11-12", label: "Rare Levels" }, { value: "13", label: "Very Rare (~1,000 Copies)" },
    { value: "14", label: "Very Very Rare" }, { value: "15", label: "Extremely Rare (~500 Copies)" },
    { value: "16", label: "Absurdly Rare" }, { value: "17", label: "Super Rare (~100-150 Copies)" },
    { value: "18", label: "Mega Rare" }, { value: "19", label: "Ultra Rare (~50 Copies)" },
    { value: "20", label: "Ultra Mega Rare (20 or Less)" },
  ];

  const supplyScale = [
    { value: "1", label: "Very Low — Barely anyone is selling", pct: 10 },
    { value: "2", label: "Low — Few sellers available", pct: 30 },
    { value: "3", label: "Average — Some availability", pct: 50 },
    { value: "4", label: "High — Plenty of sellers", pct: 70 },
    { value: "5", label: "Very High — Flooded market", pct: 90 },
  ];

  const demandScale = [
    { value: "1", label: "Very Low — Almost no buyers", pct: 10 },
    { value: "2", label: "Low — Few people want it", pct: 30 },
    { value: "3", label: "Average — Moderate interest", pct: 50 },
    { value: "4", label: "High — Many buyers competing", pct: 70 },
    { value: "5", label: "Very High — Everyone wants it", pct: 90 },
  ];

  return (
    <div className={`flex-1 flex flex-col overflow-hidden bg-[#313338] h-full select-none ${godModeActive ? 'ring-4 ring-[#EF4444]/40' : ''}`}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #2B2D31; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1A1B1E; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes sparkOut { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }
        .animate-spark { animation: sparkOut 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .stat-bar { height: 6px; border-radius: 4px; transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

      {/* GOD MODE BANNER */}
      {godModeActive && (
        <div className="bg-gradient-to-r from-red-600 via-amber-500 to-indigo-600 px-4 py-2 text-white flex items-center justify-between shadow-md text-xs font-bold animate-fade-in shrink-0">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 animate-bounce text-yellow-200" />
            <span>CODY MODE ACTIVE: Sandbox Dummy Value Boosted to 999,999! Combo Clicks: {comboPoints}</span>
          </div>
          <button onClick={() => setGodModeActive(false)} className="bg-black/30 hover:bg-black/50 px-2 py-0.5 rounded text-[10px]">Deactivate</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex-shrink-0 px-4 md:px-6 py-3 border-b border-[rgba(255,255,255,0.04)] bg-[#2B2D31]">
        <div className="flex bg-[#1E1F22] rounded-[6px] p-1 border border-[rgba(255,255,255,0.04)] w-full md:w-fit overflow-x-auto hide-scrollbar">
          <button onClick={() => setActiveTab("platform")} className={`flex items-center gap-1.5 px-6 py-1.5 rounded-[4px] text-[12px] font-bold transition-all whitespace-nowrap ${activeTab === "platform" ? "bg-[#5865F2] text-white shadow-sm" : "text-[#949BA4] hover:text-[#DBDEE1]"}`}><Rocket className="w-3.5 h-3.5" /> Platform Guide</button>
          <button onClick={() => setActiveTab("tags")} className={`flex items-center gap-1.5 px-6 py-1.5 rounded-[4px] text-[12px] font-bold transition-all whitespace-nowrap ${activeTab === "tags" ? "bg-[#5865F2] text-white shadow-sm" : "text-[#949BA4] hover:text-[#DBDEE1]"}`}><Tag className="w-3.5 h-3.5" /> Unit Tags</button>
          <button onClick={() => setActiveTab("stats")} className={`flex items-center gap-1.5 px-6 py-1.5 rounded-[4px] text-[12px] font-bold transition-all whitespace-nowrap ${activeTab === "stats" ? "bg-[#5865F2] text-white shadow-sm" : "text-[#949BA4] hover:text-[#DBDEE1]"}`}><BarChart3 className="w-3.5 h-3.5" /> R / S / D Stats</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">

        {/* PLATFORM GUIDE */}
        {activeTab === "platform" && (
          <div className="animate-fade-in pb-4">
            
            <div onClick={handleHeaderSecret} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[8px] p-4 mb-4 shadow-sm cursor-pointer hover:border-[#5865F2]/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[6px] bg-[#1E1F22] border border-[rgba(255,255,255,0.04)] flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-[#949BA4]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#F2F3F5] flex items-center gap-1.5">
                    Platform Guidelines {godModeClicks > 0 && !godModeActive && <span className="text-[10px] text-amber-400 font-mono">({godModeClicks}/7)</span>}
                  </span>
                  <span className="text-[12px] text-[#949BA4] mt-0.5">Review how values, tags, and calculations are handled. (Click here for a surprise!)</span>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new Event("open-welcome-modal")); }} className="px-4 py-2 bg-[#1E1F22] hover:bg-[#3F4147] text-[#DBDEE1] text-[12px] font-semibold rounded-[4px] transition-all border border-[rgba(255,255,255,0.04)] active:scale-[0.98] whitespace-nowrap shadow-sm">
                View Rules
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
              
              <div className="flex flex-col gap-4 md:gap-5">
                <SpotlightCard color={godModeActive ? "#EF4444" : "#8b7a7a"} className="flex-auto min-h-[220px]">
                  <div className="p-5 md:p-6 flex flex-col h-full relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0 overflow-hidden">
                        <img src={tradeAnalyzerIcon} alt="" draggable={false} className="w-full h-full object-cover rounded-[8px]" />
                      </div>
                      <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase">Trade Analyzer</h3>
                    </div>
                    <p className="text-[13px] text-[#DBDEE1] leading-[1.65] mb-6">Calculates value differences & average stats. Open the panel and start typing to instantly find and compare units.</p>
                    <div className="mt-auto">
                      <button onClick={onToggleAnalyzer} className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-[6px] font-bold text-[12px] text-white bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] transition-colors cursor-pointer shadow-sm">
                        <Rocket className="w-3.5 h-3.5" /> Launch Analyzer
                      </button>
                    </div>
                  </div>
                </SpotlightCard>

                <SpotlightCard color={godModeActive ? "#EF4444" : "#8b7a7a"} className="flex-auto min-h-[220px]">
                  <div className="p-5 md:p-6 flex flex-col h-full relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0 overflow-hidden">
                        <img src={mobileGesturesIcon} alt="" draggable={false} className="w-full h-full object-cover rounded-[8px]" />
                      </div>
                      <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase">Mobile Gestures</h3>
                    </div>
                    <p className="text-[13px] text-[#DBDEE1] leading-[1.65] mb-5">Navigate the entire app with quick, edge-to-edge screen swipes.</p>
                    <div className="mt-auto flex flex-col gap-2">
                      <div className="flex items-center gap-3 bg-[#1E1F22] p-2.5 rounded-[6px] border border-[rgba(255,255,255,0.04)]">
                        <ChevronRight className="w-4 h-4 text-[#00A8FC] flex-shrink-0" />
                        <span className="text-[12px] font-bold text-[#F2F3F5] min-w-[70px]">Swipe Right</span>
                        <span className="text-[11.5px] text-[#949BA4] truncate">Open Menu Sidebar</span>
                      </div>
                      <div className="flex items-center gap-3 bg-[#1E1F22] p-2.5 rounded-[6px] border border-[rgba(255,255,255,0.04)]">
                        <ChevronLeft className="w-4 h-4 text-[#00A8FC] flex-shrink-0" />
                        <span className="text-[12px] font-bold text-[#F2F3F5] min-w-[70px]">Swipe Left</span>
                        <span className="text-[11.5px] text-[#949BA4] truncate">Open Trade Analyzer</span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </div>

              <div className="flex flex-col gap-4 md:gap-5">
                <SpotlightCard color={godModeActive ? "#EF4444" : "#8b7a7a"} className="flex-auto min-h-[220px]">
                  <div className="p-5 md:p-6 flex flex-col h-full relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0 overflow-hidden">
                        <img src={quickAddingIcon} alt="" draggable={false} className="w-full h-full object-cover rounded-[8px]" />
                      </div>
                      <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase">Quick Adding</h3>
                    </div>
                    <p className="text-[13px] text-[#DBDEE1] leading-[1.65] mb-5">
                      <strong className="text-[#F2F3F5]">Desktop:</strong> Left or right click units directly.<br/>
                      <strong className="text-[#F2F3F5]">Mobile:</strong> Tap any unit to open the quick-action menu.
                    </p>
                    
                    <div className="mt-auto bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] rounded-[8px] p-3 flex flex-col gap-3 cursor-pointer transition-all hover:border-[#23a559] active:scale-[0.98] relative shadow-sm overflow-hidden" onClick={(e) => handleSandboxClick(e, "give")} onContextMenu={(e) => handleSandboxClick(e, "get")}>
                      {sparks.map(s => (
                        <span key={s.id} className="absolute w-2 h-2 rounded-full pointer-events-none animate-spark" style={{ backgroundColor: s.color, '--tx': `${s.tx}px`, '--ty': `${s.ty}px`, left: s.x, top: s.y, marginLeft: '-4px', marginTop: '-4px' } as any} />
                      ))}
                      <div className="flex items-center justify-between z-10 relative pointer-events-none">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#111214] rounded-[6px] flex items-center justify-center border border-[rgba(255,255,255,0.04)] shadow-inner">
                            {godModeActive ? <Zap className="w-4 h-4 text-red-500 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#FAA61A]" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] font-extrabold text-[#F2F3F5]">{demoUnit.name}</span>
                            <span className={`text-[10px] font-mono font-bold mt-0.5 ${godModeActive ? 'text-red-400' : 'text-[#23a559]'}`}>
                              {godModeActive ? '999,999' : '50,000'}
                            </span>
                          </div>
                        </div>
                        {lastAction && (
                          <div className="absolute -top-2 -right-2 bg-[#23a559] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-[rgba(255,255,255,0.1)] animate-fade-in">
                            +1 {lastAction.type === "give" ? "Give" : "Get"}!
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.04)] pt-2 mt-1 z-10 relative pointer-events-none">
                        <span className="text-[9px] font-bold text-[#80848E] uppercase tracking-wider hidden md:block"><span className="text-[#FAA61A]">[L-Click]</span> Give</span>
                        <span className="text-[9px] font-bold text-[#80848E] uppercase tracking-wider hidden md:block"><span className="text-[#5865F2]">[R-Click]</span> Get</span>
                        <span className="text-[9px] font-bold text-[#80848E] uppercase tracking-wider md:hidden w-full text-center"><span className="text-[#FAA61A]">[Tap]</span> For Action Menu</span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>

                <SpotlightCard color={godModeActive ? "#EF4444" : "#8b7a7a"} className="flex-1 min-h-[220px]">
                  <div className="p-5 md:p-6 flex flex-col h-full relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0 overflow-hidden">
                        <img src={advancedGesturesIcon} alt="" draggable={false} className="w-full h-full object-cover rounded-[8px]" />
                      </div>
                      <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase">Advanced Gestures</h3>
                    </div>
                    <p className="text-[13px] text-[#DBDEE1] leading-[1.65] mb-5">
                      <strong className="text-[#F2F3F5]">Desktop:</strong> Drag & Drop units into the Analyzer.<br/>
                      <strong className="text-[#F2F3F5]">Mobile:</strong> Swipe unit cards left or right to add them.
                    </p>
                    
                    <div className="mt-auto flex items-center gap-3 p-2 bg-[#1E1F22] rounded-[8px] border border-[rgba(255,255,255,0.04)] shadow-inner">
                      <div draggable onDragStart={handleDragStart} onClick={handleDragSimClick} className={`flex items-center gap-2 px-3 py-2 bg-[#2B2D31] rounded-[6px] border transition-all cursor-grab active:cursor-grabbing hover:border-[#ec4899] shadow-sm ${dragClicked ? 'border-[#23a559] bg-[rgba(35,165,89,0.1)]' : 'border-[rgba(255,255,255,0.06)]'}`} title="Drag me or click to add!">
                        <Hash className="w-3.5 h-3.5 text-[#80848E]" />
                        <span className="text-[12px] font-bold text-[#F2F3F5]">{godModeActive ? 'God Kaido' : 'Kaido'}</span>
                        <Hand className={`w-3.5 h-3.5 ${dragClicked ? 'text-[#23a559]' : 'text-[#ec4899]'}`} />
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#80848E] flex-shrink-0" />
                      <div className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-[6px] border-2 border-dashed transition-all ${dragClicked ? 'border-[#23a559] bg-[rgba(35,165,89,0.1)]' : 'border-[rgba(255,255,255,0.06)] bg-transparent'}`}>
                        <Calculator className={`w-4 h-4 ${dragClicked ? 'text-[#23a559]' : 'text-[#80848E]'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${dragClicked ? 'text-[#23a559]' : 'text-[#80848E]'}`}>{dragClicked ? 'Added!' : 'Drop Here'}</span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </div>

              <SpotlightCard color={godModeActive ? "#EF4444" : "#8b7a7a"} className="min-h-[220px]">
                <div className="p-5 md:p-6 flex flex-col h-full relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0 overflow-hidden">
                      <img src={viewModesIcon} alt="" draggable={false} className="w-full h-full object-cover rounded-[8px]" />
                    </div>
                    <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase">View Modes</h3>
                  </div>
                  <p className="text-[13px] text-[#DBDEE1] leading-[1.65] mb-5">Swap between the classic Grid view and the detailed Google Sheets-style List view in the main Value List tab.</p>
                  
                  <div className="mt-auto bg-[#1E1F22] rounded-[8px] p-4 border border-[rgba(255,255,255,0.04)] shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#949BA4]">Live Preview</span>
                      <div className="flex bg-[#111214] rounded-[6px] p-[2px] border border-[rgba(255,255,255,0.04)]">
                        <button onClick={() => setViewModeDemo("grid")} className={`px-3 py-1.5 rounded-[4px] text-[11px] font-bold transition-all flex items-center gap-1.5 ${viewModeDemo === "grid" ? "bg-[#4e5058] text-white shadow-sm" : "text-[#80848E] hover:text-[#DBDEE1]"}`}><LayoutGrid className="w-3.5 h-3.5" /> Grid</button>
                        <button onClick={() => setViewModeDemo("list")} className={`px-3 py-1.5 rounded-[4px] text-[11px] font-bold transition-all flex items-center gap-1.5 ${viewModeDemo === "list" ? "bg-[#4e5058] text-white shadow-sm" : "text-[#80848E] hover:text-[#DBDEE1]"}`}><List className="w-3.5 h-3.5" /> List</button>
                      </div>
                    </div>
                    
                    {viewModeDemo === "grid" ? (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {["Kaido", "Death", "Sinbad", "Aqua"].map((name) => (
                          <div key={name} className="bg-[#2B2D31] rounded-[6px] p-2 border border-[rgba(255,255,255,0.04)] text-center shadow-sm">
                            <div className="w-full aspect-square bg-[#111214] rounded-[4px] mb-1.5 flex items-center justify-center border border-[rgba(255,255,255,0.02)]"><Hash className="w-3.5 h-3.5 text-[#4e5058]" /></div>
                            <span className="text-[10px] font-bold text-[#DBDEE1] truncate block">{name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {["Kaido", "Death", "Sinbad", "Aqua"].map((name) => (
                          <div key={name} className="flex items-center gap-2.5 bg-[#2B2D31] rounded-[6px] px-3 py-2 border border-[rgba(255,255,255,0.04)] shadow-sm">
                            <div className="w-5 h-5 bg-[#111214] rounded-[4px] flex items-center justify-center border border-[rgba(255,255,255,0.02)] shrink-0"><Hash className="w-2.5 h-2.5 text-[#4e5058]" /></div>
                            <span className="text-[12px] font-bold text-[#DBDEE1]">{name}</span>
                            <span className="text-[11px] font-mono font-bold text-[#949BA4] ml-auto">{godModeActive ? '999,999' : '23,000'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </SpotlightCard>

            </div>
          </div>
        )}

        {/* UNIT TAGS */}
        {activeTab === "tags" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-fade-in pb-4">
            <TiltCard color="#5865F2">
              <div className="p-5 md:p-6 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0 overflow-hidden">
                    <img src={primaryStatusIcon} alt="" draggable={false} className="w-full h-full object-cover rounded-[8px]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase">Primary Status</h3>
                    <p className="text-[11px] text-[#949BA4] font-medium mt-0.5">The main market indicator for a unit.</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2.5">
                  {primaryTags.map((tag) => {
                    const style = getTagStyle(tag.key);
                    const cfg = GRID_STATUS_CFG[tag.key as keyof typeof GRID_STATUS_CFG];
                    return (
                      <div key={tag.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-[#1E1F22] rounded-[8px] p-3 border border-[rgba(255,255,255,0.04)] shadow-sm hover:border-[#5865F2] transition-colors">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-[4px] tracking-wide inline-block w-full text-center" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>{cfg?.label || tag.key}</span>
                        </div>
                        <span className="text-[12px] text-[#DBDEE1] leading-relaxed">{cfg?.tip || ""}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TiltCard>

            <TiltCard color="#a855f7">
              <div className="p-5 md:p-6 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0 overflow-hidden">
                    <img src={secondaryTagsIcon} alt="" draggable={false} className="w-full h-full object-cover rounded-[8px]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase">Secondary Tags</h3>
                    <p className="text-[11px] text-[#949BA4] font-medium mt-0.5">Special behavioral market notes.</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2.5">
                  {secondaryTags.map((tag) => {
                    const style = getTagStyle(tag.key);
                    const cfg = GRID_STATUS_CFG[tag.key as keyof typeof GRID_STATUS_CFG];
                    return (
                      <div key={tag.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-[#1E1F22] rounded-[8px] p-3 border border-[rgba(255,255,255,0.04)] shadow-sm hover:border-[#a855f7] transition-colors">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-[4px] tracking-wide inline-block w-full text-center" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>{cfg?.label || tag.key}</span>
                        </div>
                        <span className="text-[12px] text-[#DBDEE1] leading-relaxed">{cfg?.tip || ""}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TiltCard>
          </div>
        )}

        {/* R/S/D STATS */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in pb-4">
            <TiltCard color="#4DB6AC">
              <div className="p-5 md:p-6 flex flex-col h-full relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0"><span className="text-[18px] font-black text-[#4DB6AC] font-mono leading-none">R</span></div>
                  <div>
                    <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase">Rarity</h3>
                    <p className="text-[11px] text-[#949BA4] font-medium mt-0.5">Scale: 0 – 20</p>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-2 flex-1">
                  {rarityScale.map((item) => {
                    const val = parseInt(item.value) || 0;
                    let pct = Math.min(100, val * 5 + 10);
                    let color = "#81C784";
                    if (val >= 15) color = "#E66C19";
                    else if (val >= 8) color = "#FFB74D";
                    return (
                      <div key={item.value} className="flex flex-col gap-1 bg-[#1E1F22] p-2.5 rounded-[6px] border border-[rgba(255,255,255,0.02)] hover:border-[#4DB6AC] transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#DBDEE1] text-[12px]">{item.value}</span>
                          <span className="text-[11px] text-[#949BA4] text-right truncate pl-2">{item.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#111214] rounded-full overflow-hidden mt-0.5"><div className="stat-bar" style={{ width: `${pct}%`, background: color }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TiltCard>

            <TiltCard color="#81C784">
              <div className="p-5 md:p-6 flex flex-col h-full relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0"><span className="text-[18px] font-black text-[#81C784] font-mono leading-none">S</span></div>
                  <div>
                    <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase">Supply</h3>
                    <p className="text-[11px] text-[#949BA4] font-medium mt-0.5">Scale: 1 – 5</p>
                  </div>
                </div>

                <div className="space-y-2.5 flex-1">
                  {supplyScale.map((item) => {
                    let color = "#E57373";
                    if (parseInt(item.value) <= 2) color = "#4DB6AC";
                    else if (parseInt(item.value) === 3) color = "#FFB74D";
                    return (
                      <div key={item.value} className="flex flex-col gap-1 bg-[#1E1F22] p-2.5 rounded-[6px] border border-[rgba(255,255,255,0.02)] hover:border-[#81C784] transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#DBDEE1] text-[13px]">{item.value}</span>
                          <span className="text-[11.5px] text-[#949BA4]">{item.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#111214] rounded-full overflow-hidden mt-1"><div className="stat-bar" style={{ width: `${item.pct}%`, background: color }} /></div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                  <p className="text-[12px] text-[#B5BAC1] leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#81C784] shrink-0 mt-0.5" />
                    <span><strong className="text-[#F2F3F5]">Lower supply is better</strong>, meaning the unit is harder to find and highly coveted.</span>
                  </p>
                </div>
              </div>
            </TiltCard>

            <TiltCard color="#FFB74D">
              <div className="p-5 md:p-6 flex flex-col h-full relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0"><span className="text-[18px] font-black text-[#FFB74D] font-mono leading-none">D</span></div>
                  <div>
                    <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase">Demand</h3>
                    <p className="text-[11px] text-[#949BA4] font-medium mt-0.5">Scale: 1 – 5</p>
                  </div>
                </div>

                <div className="space-y-2.5 flex-1">
                  {demandScale.map((item) => {
                    let color = "#E57373";
                    if (parseInt(item.value) >= 4) color = "#4DB6AC";
                    else if (parseInt(item.value) === 3) color = "#FFB74D";
                    return (
                      <div key={item.value} className="flex flex-col gap-1 bg-[#1E1F22] p-2.5 rounded-[6px] border border-[rgba(255,255,255,0.02)] hover:border-[#FFB74D] transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#DBDEE1] text-[13px]">{item.value}</span>
                          <span className="text-[11.5px] text-[#949BA4]">{item.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#111214] rounded-full overflow-hidden mt-1"><div className="stat-bar" style={{ width: `${item.pct}%`, background: color }} /></div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                  <p className="text-[12px] text-[#B5BAC1] leading-relaxed flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-[#FFB74D] shrink-0 mt-0.5" />
                    <span><strong className="text-[#F2F3F5]">Demand CAN influence value</strong>, but is not a direct 1:1 relationship.</span>
                  </p>
                </div>
              </div>
            </TiltCard>
          </div>
        )}

      </div>
    </div>
  );
}