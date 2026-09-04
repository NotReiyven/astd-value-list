import { useState, useEffect, Suspense, lazy, useRef, useCallback } from "react";
import { Hash, Calculator, Check } from "lucide-react";
import { FilterKey, PopupUnit } from "../types";
import { useStickyState, isBoolean, isNonEmptyString } from "../hooks/useStickyState";
import { AquaGuideOverlay, GuideType } from "./components/guides/AquaGuideOverlay";
import { TopBar } from "./components/layout/TopBar";
import { WelcomeModal } from "./components/WelcomeModal";
import { useTradeStore } from "../store/useTradeStore";

const TradeAnalyzerPanel = lazy(() => import("./components/TradeAnalyzer").then(module => ({ default: module.TradeAnalyzerPanel })));
const Sidebar = lazy(() => import("./components/Sidebar").then(module => ({ default: module.Sidebar })));
const MainCanvas = lazy(() => import("./components/MainCanvas").then(module => ({ default: module.MainCanvas })));
const HomeChannel = lazy(() => import("./components/HomeChannel").then(module => ({ default: module.HomeChannel })));
const TutorialChannel = lazy(() => import("./components/TutorialChannel").then(module => ({ default: module.TutorialChannel })));
const ExtraNoticesChannel = lazy(() => import("./components/ExtraNoticesChannel").then(module => ({ default: module.ExtraNoticesChannel })));
const LegalChannel = lazy(() => import("./components/LegalChannel").then(module => ({ default: module.LegalChannel })));

const CHANNEL_INFO: Record<string, { title: string; subtitle: string }> = {
  "home": { title: "home", subtitle: "Welcome to the ASTD Value List! Important information and update logs are posted here." },
  "value-list": { title: "value-list", subtitle: "Official ASTD unit values • Live Updated" },
  "tutorial": { title: "tutorial", subtitle: "Learn how to use the ASTD trading calculator and value list." },
  "extra-notices": { title: "extra-notices", subtitle: "Additional rules, exceptions, and community notes." },
  "terms-of-service": { title: "terms-of-service", subtitle: "Rules and guidelines for using the ASTD Value List." },
  "privacy-policy": { title: "privacy-policy", subtitle: "How we handle and protect your data." }
};

type BootStage = 'loading' | 'tension' | 'strike' | 'fracture' | 'complete';

export default function App() {
  const [bootStage, setBootStage] = useState<BootStage>('loading');
  const [guideState, setGuideState] = useState<{ type: GuideType; step: number }>({ type: null, step: 0 });
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);

  const giveItems = useTradeStore((s) => s.giveItems);
  const getItems = useTradeStore((s) => s.getItems);

  const [activeChannel, setActiveChannel] = useStickyState("home", "astd_channel", isNonEmptyString);
  const [activeTierFilter, setActiveTierFilter] = useStickyState<FilterKey>("S", "astd_tier");

  const [completedGuides, setCompletedGuides] = useStickyState<Record<string, boolean>>(
    {}, 
    "astd_completed_guides", 
    (v): v is Record<string, boolean> => typeof v === "object" && v !== null
  );

  const [scrollToSection, setScrollToSection] = useState<{ tier: string; sectionId: string } | null>(null);
  const [isRosterOpen, setIsRosterOpen] = useStickyState(window.innerWidth >= 768, "astd_roster", isBoolean);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useStickyState(false, "astd_analyzer", isBoolean);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  const touchStartPos = useRef<{x: number, y: number} | null>(null);
  const [toast, setToast] = useState<{ id: number; unitName: string; type: "give" | "get" } | null>(null);
  const activeItemsCount = giveItems.reduce((acc, c) => acc + c.qty, 0) + getItems.reduce((acc, c) => acc + c.qty, 0);

  // Cinematic Boot Sequence orchestration
  useEffect(() => {
    Promise.all([
      import("./components/TradeAnalyzer"),
      import("./components/Sidebar"),
      import("./components/MainCanvas"),
      import("./components/HomeChannel"),
      import("./components/TutorialChannel"),
      import("./components/ExtraNoticesChannel"),
      import("./components/LegalChannel")
    ]).then(() => {
      setTimeout(() => {
        setBootStage('tension'); // Fade out UI, leave dark background
        setTimeout(() => {
          setBootStage('strike'); // Flash the slash line, shake screen
          setTimeout(() => {
            setBootStage('fracture'); // Slide triangles apart, parallax app down
            setTimeout(() => {
              setBootStage('complete'); // Unmount overlay entirely
            }, 700);
          }, 250);
        }, 200);
      }, 1200);
    }).catch(() => setBootStage('complete'));
  }, []);

  // Delay Welcome logic until the cinematic is completely finished
  useEffect(() => {
    if (bootStage !== 'complete') return;
    
    const timer = setTimeout(() => {
      if (!completedGuides["main"]) {
        setGuideState({ type: "main", step: 1 });
        if (window.innerWidth < 768) setIsRosterOpen(true);
      } else if (localStorage.getItem("astd_welcome_acknowledged") !== "true") {
        window.dispatchEvent(new Event("open-welcome-modal"));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [setIsRosterOpen, completedGuides, bootStage]);

  useEffect(() => {
    const handleTradeAdded = (e: Event) => {
      const customEvent = e as CustomEvent<{ name: string; type: "give" | "get" }>;
      if (!customEvent.detail) return;
      setToast({ id: Date.now(), unitName: customEvent.detail.name, type: customEvent.detail.type });
      setGuideState(prev => (prev.type === "main" && prev.step === 2) ? { ...prev, step: 3 } : prev);
    };
    
    const handleNavigate = (e: Event) => {
      const target = (e as CustomEvent<string>).detail;
      if (target) {
        setActiveChannel(target);
        if (window.innerWidth < 768) setIsRosterOpen(false);
      }
    };

    window.addEventListener("trade-added", handleTradeAdded);
    window.document.addEventListener("navigate", handleNavigate);
    
    return () => {
      window.removeEventListener("trade-added", handleTradeAdded);
      window.document.removeEventListener("navigate", handleNavigate);
    };
  }, []);

  const startGuide = useCallback((type: GuideType, force: boolean = false) => {
    if (!force && type && completedGuides[type]) return;

    setHelpMenuOpen(false);
    setGuideState({ type, step: 1 });
    
    if (type === "developer") setActiveChannel("home");
    else if (type === "advanced" || type === "dictionary" || type === "management") setIsAnalyzerOpen(true);
    else if (type === "channels" || type === "main") {
      if (window.innerWidth < 768) setIsRosterOpen(true);
    }
  }, [completedGuides, setActiveChannel, setIsAnalyzerOpen, setIsRosterOpen]);

  const endGuide = useCallback(() => {
    if (guideState.type) {
      setCompletedGuides(prev => ({ ...prev, [guideState.type as string]: true }));
      if (guideState.type === "main") {
        if (localStorage.getItem("astd_welcome_acknowledged") !== "true") {
          setTimeout(() => window.dispatchEvent(new Event("open-welcome-modal")), 400);
        }
      }
    }
    setGuideState({ type: null, step: 0 });
  }, [guideState.type, setCompletedGuides]);

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
      else if (!isAnalyzerOpen && window.innerWidth < 768) setIsAnalyzerOpen(true);
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
    setTimeout(() => setScrollToSection(null), 400);
  }, [setActiveChannel, setActiveTierFilter, setIsRosterOpen]);

  const handleAddGive = useCallback((unit: PopupUnit) => {
    useTradeStore.getState().addCard("give", { ...unit, qty: 1 });
    window.dispatchEvent(new CustomEvent("trade-added", { detail: { name: unit.name, type: "give" } }));
  }, []);

  const handleAddGet = useCallback((unit: PopupUnit) => {
    useTradeStore.getState().addCard("get", { ...unit, qty: 1 });
    window.dispatchEvent(new CustomEvent("trade-added", { detail: { name: unit.name, type: "get" } }));
  }, []);

  const handleToggleAnalyzer = useCallback(() => {
    setIsAnalyzerOpen(prev => !prev);
    if (guideState.type === "main" && guideState.step === 3) setGuideState(prev => ({ ...prev, step: 4 }));
  }, [setIsAnalyzerOpen, guideState]);

  const currentChannelInfo = CHANNEL_INFO[activeChannel] || { title: activeChannel, subtitle: "" };

  const isMainStep1 = guideState.type === "main" && guideState.step === 1;
  const isMainStep2 = guideState.type === "main" && guideState.step === 2;
  const isMainStep3 = guideState.type === "main" && guideState.step === 3;
  const isMainStep4 = guideState.type === "main" && guideState.step === 4;

  const sidebarZ = isMainStep1 || guideState.type === "channels" ? "!z-[100000] shadow-[15px_0_50px_rgba(0,0,0,0.8)]" : "z-50";
  const mainContentZ = isMainStep2 || guideState.type === "developer" || guideState.type === "filters" || guideState.type === "stats" ? "!z-[100000] relative shadow-[0_0_50px_rgba(0,0,0,0.8)]" : "";
  const calcHeaderZ = helpMenuOpen || isMainStep3 ? "!z-[99999] shadow-[0_0_50px_rgba(0,0,0,0.8)]" : "z-50";
  const analyzerZ = isMainStep4 || guideState.type === "advanced" || guideState.type === "dictionary" || guideState.type === "management" ? "!z-[100000] shadow-[-20px_0_50px_rgba(0,0,0,0.8)]" : "z-50";

  return (
    <>
      <style>{`
        @keyframes loadingBarProgress { 0% { transform: translateX(-100%); width: 30%; } 50% { transform: translateX(100%); width: 50%; } 100% { transform: translateX(350%); width: 30%; } }
        .animate-loading-bar { animation: loadingBarProgress 1.5s infinite ease-in-out; }
        
        @keyframes slashExpand { 
          0% { transform: scaleX(0); opacity: 0; } 
          20% { opacity: 1; } 
          100% { transform: scaleX(1); opacity: 1; } 
        }
        .animate-slash-expand { animation: slashExpand 0.15s cubic-bezier(0.16,1,0.3,1) forwards; }
        
        @keyframes strikeShake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-8px, 8px); }
          40% { transform: translate(8px, -8px); }
          60% { transform: translate(-4px, 4px); }
          80% { transform: translate(4px, -4px); }
        }
        .animate-strike-shake { animation: strikeShake 0.25s ease-in-out; }

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

      {bootStage !== 'complete' && (
        <div className="fixed inset-0 z-[1000000] pointer-events-none flex items-center justify-center overflow-hidden bg-transparent">
          
          <div className={`absolute inset-0 w-full h-full ${bootStage === 'strike' ? 'animate-strike-shake' : ''}`}>
            {/* Top Left Fracture */}
            <div 
              className={`absolute inset-0 bg-[#313338] transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${bootStage === 'fracture' ? '-translate-x-full -translate-y-full' : 'translate-x-0 translate-y-0'}`} 
              style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} 
            />
            {/* Bottom Right Fracture */}
            <div 
              className={`absolute inset-0 bg-[#313338] transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${bootStage === 'fracture' ? 'translate-x-full translate-y-full' : 'translate-x-0 translate-y-0'}`} 
              style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} 
            />
          </div>

          {(bootStage === 'strike' || bootStage === 'fracture') && (
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${bootStage === 'fracture' ? 'opacity-0' : 'opacity-100'}`}>
              <div className="w-[150vw] h-[3px] bg-white shadow-[0_0_30px_8px_#5865F2] -rotate-45 animate-slash-expand rounded-full" />
            </div>
          )}

          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-200 ${bootStage === 'loading' ? 'opacity-100' : 'opacity-0'}`}>
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
        </div>
      )}

      <div 
        className="flex h-screen overflow-hidden relative" 
        style={{ 
          background: "#313338", 
          fontFamily: "'Inter', sans-serif", 
          color: "#F2F3F5",
          transform: bootStage === 'complete' ? 'none' : (bootStage === 'fracture' ? 'scale(1)' : 'scale(1.05)'),
          filter: bootStage === 'complete' ? 'none' : (bootStage === 'fracture' ? 'blur(0px)' : 'blur(8px)'),
          transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.7s cubic-bezier(0.16,1,0.3,1)'
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Suspense fallback={null}>
          
          <WelcomeModal />
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
            
            <TopBar 
              calcHeaderZ={calcHeaderZ}
              isRosterOpen={isRosterOpen}
              setIsRosterOpen={setIsRosterOpen}
              currentChannelInfo={currentChannelInfo}
              helpMenuOpen={helpMenuOpen}
              setHelpMenuOpen={setHelpMenuOpen}
              startGuide={(type) => startGuide(type, true)}
              globalSearchQuery={globalSearchQuery}
              setGlobalSearchQuery={setGlobalSearchQuery}
              handleToggleAnalyzer={handleToggleAnalyzer}
              isAnalyzerOpen={isAnalyzerOpen}
              isMainStep3={isMainStep3}
              activeItemsCount={activeItemsCount}
            />

            <div className="flex-1 flex flex-col overflow-hidden relative">
              {activeChannel === "home" ? ( <HomeChannel guideState={guideState} />
              ) : activeChannel === "tutorial" ? ( 
                <TutorialChannel 
                  onToggleAnalyzer={handleToggleAnalyzer} 
                  onAddGive={handleAddGive} 
                  onAddGet={handleAddGet} 
                  startGuide={startGuide} 
                /> 
              ) : activeChannel === "value-list" ? ( 
                <MainCanvas 
                  activeTierFilter={activeTierFilter} 
                  setActiveTierFilter={setActiveTierFilter} 
                  searchQuery={globalSearchQuery} 
                  setSearchQuery={setGlobalSearchQuery} 
                  scrollToSection={scrollToSection}
                  startGuide={startGuide}
                />
              ) : activeChannel === "extra-notices" ? ( <ExtraNoticesChannel />
              ) : activeChannel === "terms-of-service" ? ( <LegalChannel type="tos" />
              ) : activeChannel === "privacy-policy" ? ( <LegalChannel type="privacy" />
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
                guideState={guideState}
                startGuide={startGuide}
              />
            </div>
          </div>
        </Suspense>
      </div>
    </>
  );
}