import { useState, useEffect, Suspense, lazy, useRef, useCallback } from "react";
import { PanelLeft, Calculator, Hash, Search, X, Check, GraduationCap, Map, User, Settings2 } from "lucide-react";
import { FilterKey, PopupUnit, TradeCard } from "../types";

const TradeAnalyzerPanel = lazy(() => import("./components/TradeAnalyzer").then(module => ({ default: module.TradeAnalyzerPanel })));
const Sidebar = lazy(() => import("./components/Sidebar").then(module => ({ default: module.Sidebar })));
const MainCanvas = lazy(() => import("./components/MainCanvas").then(module => ({ default: module.MainCanvas })));
const HomeChannel = lazy(() => import("./components/HomeChannel").then(module => ({ default: module.HomeChannel })));
const TutorialChannel = lazy(() => import("./components/TutorialChannel").then(module => ({ default: module.TutorialChannel })));
const ExtraNoticesChannel = lazy(() => import("./components/ExtraNoticesChannel").then(module => ({ default: module.ExtraNoticesChannel })));

function useStickyState<T>(
  defaultValue: T,
  key: string,
  isValid: (value: unknown) => value is T = (_value): _value is T => true
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      if (stickyValue !== null) {
        const parsed = JSON.parse(stickyValue);
        if (isValid(parsed)) return parsed;
      }
    } catch (err) {}
    return defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

const isTradeCardArray = (value: unknown): value is TradeCard[] =>
  Array.isArray(value) &&
  value.every(item => item && typeof item === "object" && typeof (item as any).id === "string" && typeof (item as any).qty === "number");

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.length > 0;

const CHANNEL_INFO: Record<string, { title: string; subtitle: string }> = {
  "home": { title: "home", subtitle: "Welcome to the ASTD Value List! Important information and update logs are posted here." },
  "value-list": { title: "value-list", subtitle: "Official ASTD unit values • Last updated August 27, 2026" },
  "tutorial": { title: "tutorial", subtitle: "Learn how to use the ASTD trading calculator and value list." },
  "extra-notices": { title: "extra-notices", subtitle: "Additional rules, exceptions, and community notes." }
};

type GuideType = "main" | "channels" | "advanced" | "developer" | null;

const AQUA_DIALOGUES: Record<string, string[]> = {
  main: [
    "",
    "Listen up, you shut-in NEET! I, the beautiful and wise Goddess Aqua, have descended to save you from getting completely scammed! You'd be helpless without me. First, click the **Value List** channel in the sidebar so we can begin!",
    "Hmph, even someone with your pitiful intelligence stat can do this part. Let's build a mock trade. If you're on a PC, **Left-click** a unit for your *Give* side, or **Right-click** for your *Get* side! On mobile? Just **tap** or **swipe** the card! Don't mess this up!",
    "W-Wait! Don't just accept a trade blindly! Are you trying to lose all your value?! Use the divine tool I've graciously bestowed upon you! Click that glowing **Calculator** button right now to open the Analyzer!",
    "See?! It instantly breaks down the value differences and market momentum for you! I just saved you from financial ruin, so you should be on your knees thanking me! Now get out there and trade, and don't forget to praise your Goddess!"
  ],
  channels: [
    "",
    "Lost, are we? Typical. Pay attention to the sidebar on the left! **Home** has patch notes, and **Extra Notices** has crucial market rules you probably ignored! Don't just stare at the Value List all day!"
  ],
  advanced: [
    "",
    "Too lazy to type? Click the **Wand** in the calculator to paste whole paragraphs and let my divine magic sort the units! Also, keep an eye on the **Trade Notices** below the calculator—they'll tell you if a unit is Inflated or dropping!"
  ],
  developer: [
    "",
    "Oh, you want to know who built this shrine to my greatness? It was my loyal head developer, Reiyven! He spent way too much time coding this instead of going outside. Be sure to appreciate his hard work!"
  ]
};

// --- OPTIMIZATION 3: STATE ISOLATED AQUA TYPEWRITER COMPONENT ---
// This completely shields the main App and heavy canvas/analyzer components 
// from running 40 re-renders a second during the 25ms typewriter interval.
function AquaGuideOverlay({ 
  guideState, 
  onEndGuide 
}: { 
  guideState: { type: GuideType; step: number }; 
  onEndGuide: () => void 
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!guideState.type || guideState.step === 0) return;
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const fullText = AQUA_DIALOGUES[guideState.type]?.[guideState.step] || "";
    const interval = setInterval(() => {
      setDisplayedText(fullText.substring(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [guideState]);

  const handleSkipTyping = () => {
    if (isTyping && guideState.type && guideState.step > 0) {
      setDisplayedText(AQUA_DIALOGUES[guideState.type]?.[guideState.step] || "");
      setIsTyping(false);
    }
  };

  const renderDialogue = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] tracking-wide">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx} className="text-[#00A8FC] font-bold not-italic">{part.slice(1, -1)}</em>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  if (!guideState.type) return null;

  const isMainStep4 = guideState.type === "main" && guideState.step === 4;

  return (
    <>
      <div className="fixed inset-0 z-[99998] bg-black/75 transition-opacity backdrop-blur-sm pointer-events-auto" onClick={handleSkipTyping} />
      <div className="fixed inset-0 z-[100005] pointer-events-none flex items-end justify-center pb-6 md:pb-12 px-4">
        <div className="relative w-full max-w-[800px] flex items-end drop-shadow-2xl animate-slide-up pointer-events-auto" onClick={handleSkipTyping}>
           <div className="hidden md:block w-[180px] shrink-0 relative z-20 pointer-events-none">
              <img 
                 src="https://static.wikia.nocookie.net/allstartd/images/c/c7/Water_Goddess.png" 
                 className="absolute bottom-[-10px] right-[-20px] w-[260px] max-w-none drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] object-contain"
                 alt="Aqua"
              />
           </div>
           <div className="bg-[#111214]/95 backdrop-blur-xl border-2 border-[#5865F2] p-5 md:p-6 rounded-[12px] flex-1 relative z-10 shadow-[0_0_40px_rgba(88,101,242,0.25)] min-h-[140px] flex flex-col cursor-pointer transition-all hover:bg-[#111214]">
             <div className="flex items-center gap-3 mb-3 md:mb-4 border-b border-[rgba(255,255,255,0.06)] pb-3">
               <img 
                 src="https://static.wikia.nocookie.net/allstartd/images/c/c7/Water_Goddess.png" 
                 className="md:hidden w-10 h-10 rounded-full border border-[#5865F2] object-cover bg-[#2B2D31] shadow-md"
                 alt="Aqua"
               />
               <span className="text-[#5865F2] font-black text-[16px] md:text-[18px] uppercase tracking-wider drop-shadow-md">Goddess Aqua</span>
             </div>
             <p className="text-[#B5BAC1] text-[14px] md:text-[16px] leading-relaxed font-medium min-h-[60px]">
               {renderDialogue(displayedText)}
               {isTyping && <span className="animate-pulse text-[#5865F2] font-black">|</span>}
             </p>
             {(!isTyping && (isMainStep4 || guideState.type !== "main")) && (
               <button onClick={(e) => { e.stopPropagation(); onEndGuide(); }} className="mt-5 self-start bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2.5 px-6 rounded-[6px] transition-all active:scale-95 shadow-md border border-[rgba(255,255,255,0.1)]">
                 Praise Aqua! (Finish)
               </button>
             )}
             <button onClick={(e) => { e.stopPropagation(); onEndGuide(); }} className="absolute bottom-3 right-4 text-[#80848E] hover:text-[#DBDEE1] text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-colors z-30 bg-[#1E1F22] px-2 py-1 rounded border border-[rgba(255,255,255,0.04)]">
               Skip
             </button>
           </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [isBooting, setIsBooting] = useState(true);

  const [guideState, setGuideState] = useState<{ type: GuideType; step: number }>({ type: null, step: 0 });
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);

  const [globalYouGive, setGlobalYouGive] = useStickyState<TradeCard[]>([], "astd_give", isTradeCardArray);
  const [globalYouGet,  setGlobalYouGet]  = useStickyState<TradeCard[]>([], "astd_get", isTradeCardArray);
  const [activeChannel, setActiveChannel] = useStickyState("home", "astd_channel", isNonEmptyString);
  const [activeTierFilter, setActiveTierFilter] = useStickyState<FilterKey>("S", "astd_tier");

  const [scrollToSection, setScrollToSection] = useState<{ tier: string; sectionId: string } | null>(null);
  const [isRosterOpen, setIsRosterOpen] = useStickyState(window.innerWidth >= 768, "astd_roster", isBoolean);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useStickyState(false, "astd_analyzer", isBoolean);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  const touchStartPos = useRef<{x: number, y: number} | null>(null);
  const [toast, setToast] = useState<{ id: number; unitName: string; type: "give" | "get" } | null>(null);
  const activeItemsCount = globalYouGive.reduce((acc, c) => acc + c.qty, 0) + globalYouGet.reduce((acc, c) => acc + c.qty, 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localStorage.getItem("astd_tutorial_done") !== "true") {
        setGuideState({ type: "main", step: 1 });
        if (window.innerWidth < 768) setIsRosterOpen(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [setIsRosterOpen]);

  const startGuide = useCallback((type: GuideType) => {
    setHelpMenuOpen(false);
    setGuideState({ type, step: 1 });
    
    if (type === "developer") {
      setActiveChannel("home");
    } else if (type === "advanced") {
      setIsAnalyzerOpen(true);
    } else if (type === "channels") {
      if (window.innerWidth < 768) setIsRosterOpen(true);
    } else if (type === "main") {
      if (window.innerWidth < 768) setIsRosterOpen(true);
    }
  }, [setActiveChannel, setIsAnalyzerOpen, setIsRosterOpen]);

  const endGuide = useCallback(() => {
    if (guideState.type === "main") {
      localStorage.setItem("astd_tutorial_done", "true");
    }
    setGuideState({ type: null, step: 0 });
  }, [guideState.type]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsRosterOpen(false);
      setIsAnalyzerOpen(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      import("./components/TradeAnalyzer"),
      import("./components/Sidebar"),
      import("./components/MainCanvas"),
      import("./components/HomeChannel"),
      import("./components/TutorialChannel"),
      import("./components/ExtraNoticesChannel")
    ]).then(() => {
      setTimeout(() => setIsBooting(false), 1500);
    }).catch(() => setIsBooting(false));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const dx = e.changedTouches[0].clientX - touchStartPos.current.x;
    const dy = e.changedTouches[0].clientY - touchStartPos.current.y;

    if (Math.abs(dy) > 40) return;

    if (dx > 60) {
      if (isAnalyzerOpen) setIsAnalyzerOpen(false);
      else if (!isRosterOpen && window.innerWidth < 768) setIsRosterOpen(true);
    } else if (dx < -60) {
      if (isRosterOpen) setIsRosterOpen(false);
      else if (!isAnalyzerOpen && window.innerWidth < 768) setIsRosterOpen(true);
    }
    touchStartPos.current = null;
  }, [isAnalyzerOpen, isRosterOpen, setIsAnalyzerOpen, setIsRosterOpen]);

  const handleChannelChange = useCallback((id: string) => {
    setActiveChannel(id);
    if (id === "value-list" && guideState.type === "main" && guideState.step === 1) {
      setGuideState(prev => ({ ...prev, step: 2 }));
      if (window.innerWidth < 768) setIsRosterOpen(false);
    }
  }, [setActiveChannel, guideState, setIsRosterOpen]);

  const handleThreadClick = useCallback((tier: FilterKey, sectionId: string) => {
    setActiveChannel("value-list");
    setActiveTierFilter(tier); 
    setGlobalSearchQuery(""); 
    if (window.innerWidth < 768) setIsRosterOpen(false);
    setScrollToSection({ tier, sectionId });
    setTimeout(() => {
      setScrollToSection(null);
    }, 400);
  }, [setActiveChannel, setActiveTierFilter, setIsRosterOpen]);

  const handleAddGive = useCallback((unit: PopupUnit) => {
    setGlobalYouGive((prev) => {
      const existing = prev.find((c) => c.id === unit.id);
      if (existing) return prev.map((c) => c.id === unit.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: unit.id, name: unit.name, subtitle: unit.subtitle, value: unit.value, demand: unit.demand, qty: 1 }];
    });
    setToast({ id: Date.now(), unitName: unit.name, type: "give" });
    if (guideState.type === "main" && guideState.step === 2) setGuideState(prev => ({ ...prev, step: 3 }));
  }, [setGlobalYouGive, guideState]);

  const handleAddGet = useCallback((unit: PopupUnit) => {
    setGlobalYouGet((prev) => {
      const existing = prev.find((c) => c.id === unit.id);
      if (existing) return prev.map((c) => c.id === unit.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: unit.id, name: unit.name, subtitle: unit.subtitle, value: unit.value, demand: unit.demand, qty: 1 }];
    });
    setToast({ id: Date.now(), unitName: unit.name, type: "get" });
    if (guideState.type === "main" && guideState.step === 2) setGuideState(prev => ({ ...prev, step: 3 }));
  }, [setGlobalYouGet, guideState]);

  const handleChangeQty = useCallback((col: "give" | "get", id: string, qty: number) => {
    const setter = col === "give" ? setGlobalYouGive : setGlobalYouGet;
    setter((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
  }, [setGlobalYouGive, setGlobalYouGet]);

  const handleRemoveCard = useCallback((col: "give" | "get", id: string) => {
    const setter = col === "give" ? setGlobalYouGive : setGlobalYouGet;
    setter((prev) => prev.filter((c) => c.id !== id));
  }, [setGlobalYouGive, setGlobalYouGet]);

  const handleClear = useCallback((col: "give" | "get") => {
    if (col === "give") setGlobalYouGive([]);
    else setGlobalYouGet([]);
  }, [setGlobalYouGive, setGlobalYouGet]);

  const handleOverwrite = useCallback((giveCards: TradeCard[], getCards: TradeCard[]) => {
    setGlobalYouGive(giveCards);
    setGlobalYouGet(getCards);
  }, [setGlobalYouGive, setGlobalYouGet]);

  const handleAddCard = useCallback((col: "give" | "get", card: TradeCard) => {
    const setter = col === "give" ? setGlobalYouGive : setGlobalYouGet;
    setter((prev) => {
      const existing = prev.find((c) => c.id === card.id);
      if (existing) return prev.map((c) => c.id === card.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, card];
    });
  }, [setGlobalYouGive, setGlobalYouGet]);

  const handleSwap = useCallback(() => {
    setGlobalYouGive([...globalYouGet]);
    setGlobalYouGet([...globalYouGive]);
  }, [globalYouGet, globalYouGive, setGlobalYouGive, setGlobalYouGet]);

  const handleToggleAnalyzer = useCallback(() => {
    setIsAnalyzerOpen(prev => !prev);
    if (guideState.type === "main" && guideState.step === 3) setGuideState(prev => ({ ...prev, step: 4 }));
  }, [setIsAnalyzerOpen, guideState]);

  const currentChannelInfo = CHANNEL_INFO[activeChannel] || { title: activeChannel, subtitle: "" };

  if (isBooting) {
    return (
      <div className="flex flex-col items-center justify-center bg-[#313338] w-screen h-screen fixed inset-0 z-[999]">
        <style>{`
          @keyframes loadingBarProgress { 0% { transform: translateX(-100%); width: 30%; } 50% { transform: translateX(100%); width: 50%; } 100% { transform: translateX(350%); width: 30%; } }
          .animate-loading-bar { animation: loadingBarProgress 1.5s infinite ease-in-out; }
        `}</style>
        <div className="relative flex items-center justify-center mb-6">
           <div className="absolute w-24 h-24 bg-[#5865F2] rounded-full blur-[40px] opacity-30 animate-pulse"></div>
           <div className="w-16 h-16 bg-[#2B2D31] rounded-[16px] border border-[rgba(255,255,255,0.06)] flex items-center justify-center shadow-xl relative z-10">
             <Hash className="w-8 h-8 text-[#5865F2]" />
           </div>
        </div>
        <h3 className="text-[#F2F3F5] font-extrabold text-[18px] tracking-tight mb-1">ASTD Value List</h3>
        <p className="text-[#949BA4] text-[12px] font-medium uppercase tracking-widest mb-6 animate-pulse">Starting Engine...</p>
        <div className="w-48 h-[3px] bg-[#1E1F22] rounded-full overflow-hidden border border-[rgba(255,255,255,0.02)] relative">
          <div className="absolute top-0 bottom-0 left-0 bg-[#5865F2] rounded-full animate-loading-bar shadow-[0_0_8px_rgba(88,101,242,0.8)]"></div>
        </div>
      </div>
    );
  }

  // --- OPTIMIZATION 4: DYNAMIC COMPOSITING & PAINT LAYER Z-INDEX MANAGEMENT ---
  // Heavy z-indices are only injected into active states to avoid bloating browser paint layers.
  const isMainStep1 = guideState.type === "main" && guideState.step === 1;
  const isMainStep2 = guideState.type === "main" && guideState.step === 2;
  const isMainStep3 = guideState.type === "main" && guideState.step === 3;
  const isMainStep4 = guideState.type === "main" && guideState.step === 4;

  const sidebarZ = isMainStep1 || guideState.type === "channels" ? "!z-[100000] shadow-[15px_0_50px_rgba(0,0,0,0.8)]" : "z-50";
  const mainContentZ = isMainStep2 || guideState.type === "developer" ? "!z-[100000] relative shadow-[0_0_50px_rgba(0,0,0,0.8)]" : "";
  const calcHeaderZ = helpMenuOpen || isMainStep3 ? "!z-[99999] shadow-[0_0_50px_rgba(0,0,0,0.8)]" : "z-30";
  const analyzerZ = isMainStep4 || guideState.type === "advanced" ? "!z-[100000] shadow-[-20px_0_50px_rgba(0,0,0,0.8)]" : "z-50";

  return (
    <div 
      className="flex h-screen overflow-hidden relative" 
      style={{ background: "#313338", fontFamily: "'Inter', sans-serif", color: "#F2F3F5" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        @keyframes sonar {
          0% { box-shadow: 0 0 0 0 rgba(88, 101, 242, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(88, 101, 242, 0); }
          100% { box-shadow: 0 0 0 0 rgba(88, 101, 242, 0); }
        }
        .animate-sonar { animation: sonar 1.5s infinite; }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-6deg) scale(1.05); }
          50% { transform: rotate(6deg) scale(1.05); }
          75% { transform: rotate(-6deg) scale(1.05); }
        }
        .animate-wiggle { animation: wiggle 0.4s ease-in-out infinite; }
      `}</style>
      <Suspense fallback={null}>
        
        {/* Isolated Aqua Overlay Component */}
        <AquaGuideOverlay guideState={guideState} onEndGuide={endGuide} />

        {isRosterOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-40 animate-fade-in" onClick={() => setIsRosterOpen(false)} />}
        {isAnalyzerOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-40 animate-fade-in" onClick={() => setIsAnalyzerOpen(false)} />}

        <div 
          className={`fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${guideState.type ? 'z-[100002]' : 'z-[9999]'} ${
            toast ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
          }`}
        >
          {toast && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.08)] bg-[#2B2D31]">
               <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-[#23a559]">
                 <Check className="w-3.5 h-3.5 text-white" />
               </div>
               <span className="text-[#F2F3F5] text-[13px] md:text-[14px] font-medium tracking-wide whitespace-nowrap">
                 Added <strong className="font-extrabold">{toast.unitName}</strong> to You {toast.type === "give" ? "Give" : "Get"}
               </span>
            </div>
          )}
        </div>

        <div 
          className={`fixed md:relative top-0 bottom-0 left-0 flex-shrink-0 overflow-hidden transition-all duration-300 ease-out shadow-2xl md:shadow-none will-change-[width,transform] ${isRosterOpen ? 'w-[85vw] max-w-[320px] md:w-[240px] translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'} ${sidebarZ}`}
          style={{ opacity: isRosterOpen ? 1 : 0 }}
        >
          <div className="w-[85vw] max-w-[320px] md:w-[240px] h-full">
            <Sidebar activeChannel={activeChannel} setActiveChannel={handleChannelChange} onThreadClick={handleThreadClick} guideState={guideState} />
          </div>
        </div>

        <div className={`flex-1 flex flex-col min-w-0 bg-[#313338] ${mainContentZ}`}>
          <div className={`flex-shrink-0 flex items-center justify-between px-2 md:px-4 py-3 min-h-[48px] relative border-b border-[rgba(0,0,0,0.22)] shadow-sm bg-[#313338] ${calcHeaderZ}`}>
            <div className="flex items-center gap-1 md:gap-3 overflow-hidden pr-2">
              <button onClick={() => setIsRosterOpen(!isRosterOpen)} className={`p-2 transition-colors flex-shrink-0 ${isRosterOpen ? 'text-[#F2F3F5]' : 'text-[#80848E] hover:text-[#DBDEE1]'}`}>
                <PanelLeft className="w-5 h-5 md:w-[20px] md:h-[20px]" />
              </button>

              <div className="w-px h-5 mx-0.5 md:mx-1 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
              <Hash className="w-5 h-5 flex-shrink-0 text-[#80848E]" />
              <span className="text-[14px] md:text-[15px] font-bold text-[#F2F3F5] whitespace-nowrap truncate">{currentChannelInfo.title}</span>

              {currentChannelInfo.subtitle && (
                <div className="hidden lg:flex items-center flex-shrink-0 min-w-0">
                  <div className="w-px h-5 mx-2" style={{ background: "rgba(255,255,255,0.08)" }} />
                  <span className="text-[13px] font-medium text-[#B5BAC1] truncate max-w-[300px] xl:max-w-none">{currentChannelInfo.subtitle}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <div className="relative">
                <button 
                  onClick={() => setHelpMenuOpen(!helpMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all text-[12px] font-bold shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  title="Need Help? Open Guides"
                >
                  <span className="hidden sm:inline">Need Help?</span>
                </button>
                {helpMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[99998]" onClick={() => setHelpMenuOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-56 bg-[#2B2D31] border border-[rgba(255,255,255,0.08)] rounded-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-[99999] py-1.5 flex flex-col animate-fade-in">
                      <button onClick={() => startGuide("main")} className="flex items-center gap-3 px-4 py-2.5 text-[#DBDEE1] hover:bg-[#5865F2] hover:text-white transition-colors text-left text-[13px] font-semibold">
                        <GraduationCap className="w-4 h-4" /> Replay Tutorial
                      </button>
                      <button onClick={() => startGuide("channels")} className="flex items-center gap-3 px-4 py-2.5 text-[#DBDEE1] hover:bg-[#5865F2] hover:text-white transition-colors text-left text-[13px] font-semibold">
                        <Map className="w-4 h-4" /> Channel Guide
                      </button>
                      <button onClick={() => startGuide("advanced")} className="flex items-center gap-3 px-4 py-2.5 text-[#DBDEE1] hover:bg-[#5865F2] hover:text-white transition-colors text-left text-[13px] font-semibold">
                        <Settings2 className="w-4 h-4" /> Advanced Tools
                      </button>
                      <div className="w-full h-px bg-[rgba(255,255,255,0.04)] my-1" />
                      <button onClick={() => startGuide("developer")} className="flex items-center gap-3 px-4 py-2.5 text-[#DBDEE1] hover:bg-[#5865F2] hover:text-white transition-colors text-left text-[13px] font-semibold">
                        <User className="w-4 h-4" /> About the Developer
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="relative hidden md:flex items-center bg-[#1E1F22] rounded-[4px] px-2 h-[26px] w-[90px] focus-within:w-[150px] md:w-48 md:focus-within:w-64 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border border-[rgba(255,255,255,0.04)]">
                <input type="text" placeholder="Search..." value={globalSearchQuery} onChange={(e) => setGlobalSearchQuery(e.target.value)} className="bg-transparent text-[12.5px] text-[#DBDEE1] w-full h-full outline-none placeholder-[#949BA4] font-medium" />
                {globalSearchQuery ? <X className="w-3.5 h-3.5 flex-shrink-0 text-[#949BA4] cursor-pointer hover:text-[#DBDEE1]" onClick={() => setGlobalSearchQuery("")} /> : <Search className="w-3.5 h-3.5 flex-shrink-0 text-[#949BA4]" />}
              </div>
              <div className="hidden md:block w-px h-4 mx-0 md:mx-1 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
              
              <button 
                onClick={handleToggleAnalyzer} 
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-[6px] transition-all duration-300 shadow-sm font-bold text-[12px] active:scale-95 ${
                  isAnalyzerOpen 
                    ? 'bg-[#4752C4] text-white shadow-[0_0_12px_rgba(88,101,242,0.4)]' 
                    : 'bg-[#5865F2] hover:bg-[#4752C4] text-white'
                } ${isMainStep3 ? 'animate-wiggle ring-4 ring-[#5865F2] shadow-[0_0_20px_rgba(88,101,242,0.8)]' : ''}`}
                title="Toggle Trade Analyzer"
              >
                <Calculator className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Calculator</span>
                {activeItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#ed4245] text-white font-mono font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {activeItemsCount > 9 ? '9+' : activeItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative">
            {activeChannel === "home" ? ( <HomeChannel guideState={guideState} />
            ) : activeChannel === "tutorial" ? ( <TutorialChannel onToggleAnalyzer={handleToggleAnalyzer} onAddGive={handleAddGive} onAddGet={handleAddGet} /> 
            ) : activeChannel === "value-list" ? ( 
              <MainCanvas 
                activeTierFilter={activeTierFilter} 
                setActiveTierFilter={setActiveTierFilter} 
                searchQuery={globalSearchQuery} 
                setSearchQuery={setGlobalSearchQuery} 
                onAddGive={handleAddGive} 
                onAddGet={handleAddGet} 
                scrollToSection={scrollToSection}
              />
            ) : activeChannel === "extra-notices" ? ( <ExtraNoticesChannel />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#313338] transition-all duration-300 animate-fade-in px-4">
                 <div className="text-center animate-slide-up"><h2 className="text-2xl font-bold text-[#F2F3F5] mb-2 capitalize">Welcome to {activeChannel}</h2><p className="text-[#949BA4]">This channel is currently under construction.</p></div>
              </div>
            )}
          </div>
        </div>

        {!isAnalyzerOpen && (
          <button
            onClick={handleToggleAnalyzer}
            className={`md:hidden fixed bottom-6 right-6 z-40 bg-[#5865F2] hover:bg-[#4752C4] text-white p-3.5 rounded-full flex items-center justify-center transition-all active:scale-95 ${isMainStep3 ? '!z-[99999] animate-wiggle ring-4 ring-[#5865F2]/60 shadow-[0_0_30px_rgba(88,101,242,0.8)]' : 'z-40 shadow-[0_4px_20px_rgba(88,101,242,0.5)]'}`}
            title="Open Calculator"
          >
            <Calculator className="w-6 h-6" />
            {activeItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ed4245] text-white font-mono font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {activeItemsCount}
              </span>
            )}
          </button>
        )}

        <div 
          className={`fixed md:relative top-0 bottom-0 right-0 flex-shrink-0 overflow-hidden transition-all duration-300 ease-out shadow-2xl md:shadow-none will-change-[width,transform] ${isAnalyzerOpen ? 'w-[90vw] max-w-[400px] md:w-[400px] translate-x-0 pointer-events-auto' : 'w-0 translate-x-full md:translate-x-0 pointer-events-none'} ${analyzerZ}`}
          style={{ opacity: isAnalyzerOpen ? 1 : 0 }}
        >
          <div className="w-[90vw] max-w-[400px] md:w-[400px] h-full bg-[#2B2D31]">
            <TradeAnalyzerPanel 
              isOpen={isAnalyzerOpen}
              onClose={() => setIsAnalyzerOpen(false)}
              giveItems={globalYouGive} 
              getItems={globalYouGet} 
              onChangeQty={handleChangeQty} 
              onRemoveCard={handleRemoveCard} 
              onClear={handleClear} 
              onAdd={handleAddCard} 
              onSwap={handleSwap} 
              onOverwrite={handleOverwrite} 
              guideState={guideState}
            />
          </div>
        </div>
      </Suspense>
    </div>
  );
}