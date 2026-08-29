import { useState, useEffect, Suspense, lazy, useRef, useCallback } from "react";
import { PanelLeft, Calculator, Hash, Search, X, Check } from "lucide-react";
import { FilterKey, PopupUnit, TradeCard } from "../types";

const TradeAnalyzerPanel = lazy(() => import("./components/TradeAnalyzer").then(module => ({ default: module.TradeAnalyzerPanel })));
const Sidebar = lazy(() => import("./components/Sidebar").then(module => ({ default: module.Sidebar })));
const MainCanvas = lazy(() => import("./components/MainCanvas").then(module => ({ default: module.MainCanvas })));
const HomeChannel = lazy(() => import("./components/HomeChannel").then(module => ({ default: module.HomeChannel })));
const TutorialChannel = lazy(() => import("./components/TutorialChannel").then(module => ({ default: module.TutorialChannel })));
const ExtraNoticesChannel = lazy(() => import("./components/ExtraNoticesChannel").then(module => ({ default: module.ExtraNoticesChannel })));
const WelcomeModal = lazy(() => import("./components/WelcomeModal").then(module => ({ default: module.WelcomeModal })));

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
        console.warn(`Ignoring malformed localStorage value for "${key}"`, parsed);
      }
    } catch (err) {
      console.warn(`Error reading localStorage key "${key}":`, err);
    }
    return defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

const isTradeCardArray = (value: unknown): value is TradeCard[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof (item as any).id === "string" &&
      typeof (item as any).qty === "number"
  );

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.length > 0;

const CHANNEL_INFO: Record<string, { title: string; subtitle: string }> = {
  "home": { title: "home", subtitle: "Welcome to the ASTD Value List! Important information and update logs are posted here." },
  "value-list": { title: "value-list", subtitle: "Official ASTD unit values • Last updated August 27, 2026" },
  "tutorial": { title: "tutorial", subtitle: "Learn how to use the ASTD trading calculator and value list." },
  "extra-notices": { title: "extra-notices", subtitle: "Additional rules, exceptions, and community notes." }
};

export default function App() {
  const [isBooting, setIsBooting] = useState(true);

  const [globalYouGive, setGlobalYouGive] = useStickyState<TradeCard[]>([], "astd_give", isTradeCardArray);
  const [globalYouGet,  setGlobalYouGet]  = useStickyState<TradeCard[]>([], "astd_get", isTradeCardArray);
  const [activeChannel, setActiveChannel] = useStickyState("home", "astd_channel", isNonEmptyString);
  const [activeTierFilter, setActiveTierFilter] = useStickyState<FilterKey>("S", "astd_tier");

  const [isRosterOpen, setIsRosterOpen] = useStickyState(window.innerWidth >= 768, "astd_roster", isBoolean);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useStickyState(false, "astd_analyzer", isBoolean);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  const touchStartPos = useRef<{x: number, y: number} | null>(null);
  
  const [toast, setToast] = useState<{ id: number; unitName: string; type: "give" | "get" } | null>(null);

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
      import("./components/ExtraNoticesChannel"),
      import("./components/WelcomeModal")
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

    if (Math.abs(dy) > 40) {
      touchStartPos.current = null;
      return;
    }

    if (dx > 60) {
      if (isAnalyzerOpen) setIsAnalyzerOpen(false);
      else if (!isRosterOpen && window.innerWidth < 768) setIsRosterOpen(true);
    } else if (dx < -60) {
      if (isRosterOpen) setIsRosterOpen(false);
      else if (!isAnalyzerOpen && window.innerWidth < 768) setIsAnalyzerOpen(true);
    }
    touchStartPos.current = null;
  }, [isAnalyzerOpen, isRosterOpen, setIsAnalyzerOpen, setIsRosterOpen]);

  const handleThreadClick = useCallback((tier: FilterKey, sectionId: string) => {
    setActiveChannel("value-list");
    setActiveTierFilter("All");
    setGlobalSearchQuery(""); 
    if (window.innerWidth < 768) setIsRosterOpen(false);

    setTimeout(() => {
      const container = document.getElementById("main-scroll-container");
      const el = document.getElementById(sectionId) || document.getElementById(`${tier.toLowerCase()}-tier`);

      if (container && el) {
         const containerRect = container.getBoundingClientRect();
         const elRect = el.getBoundingClientRect();
         const offset = (elRect.top - containerRect.top) + container.scrollTop - 60; 
         container.scrollTo({ top: offset, behavior: "smooth" });
      } else {
        setTimeout(() => {
          const retryContainer = document.getElementById("main-scroll-container");
          const retryEl = document.getElementById(sectionId) || document.getElementById(`${tier.toLowerCase()}-tier`);
          if (retryContainer && retryEl) {
            const cRect = retryContainer.getBoundingClientRect();
            const eRect = retryEl.getBoundingClientRect();
            const finalOffset = (eRect.top - cRect.top) + retryContainer.scrollTop - 60;
            retryContainer.scrollTo({ top: finalOffset, behavior: "smooth" });
          }
        }, 150);
      }
    }, 100); 
  }, [setActiveChannel, setActiveTierFilter, setIsRosterOpen]);

  const handleAddGive = useCallback((unit: PopupUnit) => {
    setGlobalYouGive((prev) => {
      const existing = prev.find((c) => c.id === unit.id);
      if (existing) return prev.map((c) => c.id === unit.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: unit.id, name: unit.name, subtitle: unit.subtitle, value: unit.value, demand: unit.demand, qty: 1 }];
    });
    setToast({ id: Date.now(), unitName: unit.name, type: "give" });
  }, [setGlobalYouGive]);

  const handleAddGet = useCallback((unit: PopupUnit) => {
    setGlobalYouGet((prev) => {
      const existing = prev.find((c) => c.id === unit.id);
      if (existing) return prev.map((c) => c.id === unit.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: unit.id, name: unit.name, subtitle: unit.subtitle, value: unit.value, demand: unit.demand, qty: 1 }];
    });
    setToast({ id: Date.now(), unitName: unit.name, type: "get" });
  }, [setGlobalYouGet]);

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

  return (
    <div 
      className="flex h-screen overflow-hidden relative" 
      style={{ background: "#313338", fontFamily: "'Inter', sans-serif", color: "#F2F3F5" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Suspense fallback={null}>
        
        <WelcomeModal />

        {isRosterOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-40 animate-fade-in" onClick={() => setIsRosterOpen(false)} />}
        {isAnalyzerOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-40 animate-fade-in" onClick={() => setIsAnalyzerOpen(false)} />}

        <div 
          className={`fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
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
          className={`fixed md:relative z-50 top-0 bottom-0 left-0 flex-shrink-0 overflow-hidden transition-all duration-300 ease-out shadow-2xl md:shadow-none will-change-[width,transform] ${isRosterOpen ? 'w-[85vw] max-w-[320px] md:w-[240px] translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}`}
          style={{ opacity: isRosterOpen ? 1 : 0 }}
        >
          <div className="w-[85vw] max-w-[320px] md:w-[240px] h-full">
            <Sidebar activeChannel={activeChannel} setActiveChannel={setActiveChannel} onThreadClick={handleThreadClick} />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-[#313338]">
          <div className="flex-shrink-0 flex items-center justify-between px-2 md:px-4 py-3 min-h-[48px] z-20 relative border-b border-[rgba(0,0,0,0.22)] shadow-sm bg-[#313338]">
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

            <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
              <div className="relative flex items-center bg-[#1E1F22] rounded-[4px] px-2 h-[26px] w-[90px] focus-within:w-[150px] md:w-48 md:focus-within:w-64 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border border-[rgba(255,255,255,0.04)]">
                <input type="text" placeholder="Search..." value={globalSearchQuery} onChange={(e) => setGlobalSearchQuery(e.target.value)} className="bg-transparent text-[12.5px] text-[#DBDEE1] w-full h-full outline-none placeholder-[#949BA4] font-medium" />
                {globalSearchQuery ? <X className="w-3.5 h-3.5 flex-shrink-0 text-[#949BA4] cursor-pointer hover:text-[#DBDEE1]" onClick={() => setGlobalSearchQuery("")} /> : <Search className="w-3.5 h-3.5 flex-shrink-0 text-[#949BA4]" />}
              </div>
              <div className="w-px h-4 mx-0 md:mx-1 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
              <button onClick={() => setIsAnalyzerOpen(!isAnalyzerOpen)} className={`p-2 transition-colors flex-shrink-0 ${isAnalyzerOpen ? 'text-[#F2F3F5]' : 'text-[#80848E] hover:text-[#DBDEE1]'}`}>
                <Calculator className="w-5 h-5 md:w-[20px] md:h-[20px]" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative">
            {activeChannel === "home" ? ( <HomeChannel />
            ) : activeChannel === "tutorial" ? ( <TutorialChannel onToggleAnalyzer={() => setIsAnalyzerOpen(!isAnalyzerOpen)} onAddGive={handleAddGive} onAddGet={handleAddGet} /> 
            ) : activeChannel === "value-list" ? ( 
              <MainCanvas 
                activeTierFilter={activeTierFilter} 
                setActiveTierFilter={setActiveTierFilter} 
                searchQuery={globalSearchQuery} 
                setSearchQuery={setGlobalSearchQuery} 
                onAddGive={handleAddGive} 
                onAddGet={handleAddGet} 
              />
            ) : activeChannel === "extra-notices" ? ( <ExtraNoticesChannel />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#313338] transition-all duration-300 animate-fade-in px-4">
                 <div className="text-center animate-slide-up"><h2 className="text-2xl font-bold text-[#F2F3F5] mb-2 capitalize">Welcome to {activeChannel}</h2><p className="text-[#949BA4]">This channel is currently under construction.</p></div>
              </div>
            )}
          </div>
        </div>

        <div 
          className={`fixed md:relative z-50 top-0 bottom-0 right-0 flex-shrink-0 overflow-hidden transition-all duration-300 ease-out shadow-2xl md:shadow-none will-change-[width,transform] ${isAnalyzerOpen ? 'w-[90vw] max-w-[400px] md:w-[400px] translate-x-0 pointer-events-auto' : 'w-0 translate-x-full md:translate-x-0 pointer-events-none'}`}
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
            />
          </div>
        </div>
      </Suspense>
    </div>
  );
}