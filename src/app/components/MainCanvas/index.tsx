import { useState, useRef, useDeferredValue, useMemo, memo, useEffect } from "react";
import { Search, X, LayoutGrid, List, ArrowUpDown, Filter, ArrowUp } from "lucide-react";
import { PopupUnit, FilterKey, MasterUnit } from "../../../types";
import { TIER_CONFIG, FILTERS, getTier } from "../../../data"; 
import { useUnits } from "../../../context/UnitContext"; 

import { CustomDropdown } from "./CustomDropdown";
import { UnitGrid } from "./UnitGrid";
import { UnitListTable } from "./UnitListTable";
import { TierBanner, DynamicTierSection, processUnits } from "./TierSections";

const SORT_OPTIONS = {
  "value-desc": "Value: High to Low", "value-asc": "Value: Low to High",
  "demand-desc": "Demand: High to Low", "supply-asc": "Supply: Rarest First",
  "rarity-desc": "Rarity: Rarest First", "alpha-asc": "Alphabetical: A-Z"
};

const FILTER_OPTIONS = {
  "all": "All Statuses", "stable": "Stable", "unstable": "Unstable",
  "rising": "Rising", "dropping": "Dropping", "inflated": "Inflated",
  "deflated": "Deflated", "varies": "Varies", "maximum": "Maximum",
  "gatekept": "Gatekept", "hyped": "Hyped", "black-marketed": "Black Market"
};

const STICKY_HEADER_CLASS = "relative md:sticky md:top-[-1px] z-30 bg-[#313338] pt-2 md:pt-3 pb-3 -mx-2 px-2 md:-mx-8 md:px-8 mb-4 md:shadow-[0_12px_20px_-15px_rgba(0,0,0,0.8)]";

const SkeletonLoader = ({ viewMode }: { viewMode: "grid" | "list" }) => {
  if (viewMode === "list") {
    return (
      <div className="w-full rounded-[8px] border border-[rgba(255,255,255,0.06)] bg-[#2B2D31] shadow-sm overflow-hidden animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex md:grid md:grid-cols-[56px_280px_minmax(200px,1fr)_160px_120px] items-stretch border-b border-[rgba(255,255,255,0.04)] min-h-[56px] px-4 py-2 gap-4">
            <div className="hidden md:flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-[#1E1F22]" /></div>
            <div className="flex flex-col justify-center gap-2"><div className="h-3 w-3/4 bg-[#1E1F22] rounded" /><div className="h-2 w-1/2 bg-[#1E1F22] rounded" /></div>
            <div className="hidden md:flex items-center"><div className="h-2 w-full bg-[#1E1F22] rounded" /></div>
            <div className="hidden md:flex items-center justify-center"><div className="h-2 w-24 bg-[#1E1F22] rounded" /></div>
            <div className="hidden md:flex items-center justify-end"><div className="h-3 w-16 bg-[#1E1F22] rounded" /></div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 155px), 1fr))" }}>
      {[...Array(12)].map((_, i) => (
        <div key={i} className="flex flex-col h-[260px] rounded-[8px] bg-[#2B2D31] border border-[rgba(255,255,255,0.04)] overflow-hidden animate-pulse">
          <div className="w-full aspect-square bg-[#1E1F22]" />
          <div className="p-3 md:p-4 flex flex-col gap-2 flex-1">
            <div className="h-3.5 bg-[#1E1F22] rounded w-3/4" />
            <div className="h-2.5 bg-[#1E1F22] rounded w-1/2" />
            <div className="mt-auto pt-3 border-t border-[rgba(255,255,255,0.04)]">
               <div className="h-5 bg-[#1E1F22] rounded w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const MainCanvas = memo(function MainCanvas({
  activeTierFilter, setActiveTierFilter, searchQuery, setSearchQuery, onAddGive, onAddGet, scrollToSection,
}: {
  activeTierFilter: FilterKey; setActiveTierFilter: (f: FilterKey) => void;
  searchQuery: string; setSearchQuery: (s: string) => void;
  onAddGive: (u: PopupUnit) => void; onAddGet: (u: PopupUnit) => void;
  scrollToSection?: { tier: string; sectionId: string } | null;
}) {
  const { units: ALL_UNITS, isLoading } = useUnits(); 
  const tier = TIER_CONFIG[activeTierFilter] ?? TIER_CONFIG["S"];
  
  const [showWelcome, setShowWelcome] = useState(() => {
    try { return localStorage.getItem("astd_welcome_dismissed") !== "true"; } 
    catch (e) { return true; }
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortMode, setSortMode] = useState("value-desc");
  const [statusFilter, setStatusFilter] = useState("all");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    if (!scrollToSection) return;
    
    setSearchQuery("");
    setStatusFilter("all");
    setActiveTierFilter("All");

    const timer = setTimeout(() => {
      const el = document.getElementById(scrollToSection.sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [scrollToSection]);

  useEffect(() => {
    if (scrollToSection) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [deferredSearchQuery, statusFilter, sortMode, activeTierFilter, scrollToSection]);

  const dismissWelcome = () => {
    setShowWelcome(false);
    try { localStorage.setItem("astd_welcome_dismissed", "true"); } 
    catch (e) { console.error("Failed to save banner preference", e); }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScroll = e.currentTarget.scrollTop;
    if (currentScroll > 400 && !showScrollTop) setShowScrollTop(true);
    else if (currentScroll <= 400 && showScrollTop) setShowScrollTop(false);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortMode("value-desc");
    setActiveTierFilter("All");
  };

  const hasFiltersApplied = deferredSearchQuery !== "" || statusFilter !== "all" || sortMode !== "value-desc" || activeTierFilter !== "All";
  const isDefaultView = sortMode === "value-desc" && statusFilter === "all" && deferredSearchQuery === "";

  const UNITS_BY_TIER = useMemo(() => {
    const map: Record<string, MasterUnit[]> = { S: [], A: [], B: [], C: [], Pure: [], Oddities: [], Untiered: [] };
    ALL_UNITS.forEach(u => {
      const t = getTier(u);
      if (map[t]) map[t].push(u);
    });
    return map;
  }, [ALL_UNITS]); 

  const filteredAllUnits = useMemo(() => {
    const rawFiltered = ALL_UNITS.filter(u => {
      const q = deferredSearchQuery.toLowerCase();
      const matchesSearch = deferredSearchQuery === "" || (u.name?.toLowerCase() || "").includes(q) || (u.subtitle?.toLowerCase() || "").includes(q);
      const matchesTier = deferredSearchQuery !== "" || activeTierFilter === "All" || getTier(u) === activeTierFilter;
      return matchesSearch && matchesTier;
    });
    return processUnits(rawFiltered, sortMode, statusFilter);
  }, [ALL_UNITS, deferredSearchQuery, activeTierFilter, sortMode, statusFilter]); 

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#313338] relative">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #2B2D31; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1A1B1E; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #111214; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes slideUpFade { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>

      <div className="flex-shrink-0 flex flex-col lg:flex-row lg:items-center justify-between px-3 md:px-5 py-3 shadow-sm z-40 relative gap-3 bg-[#2B2D31] border-b border-[rgba(0,0,0,0.22)]">
        <div className="flex flex-nowrap lg:flex-wrap gap-1.5 overflow-x-auto hide-scrollbar pb-0">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveTierFilter(f)}
              className="flex-shrink-0 px-3 py-1 rounded-[4px] text-[11px] md:text-[12px] font-bold transition-all duration-300 ease-out hover:-translate-y-0.5"
              style={
                activeTierFilter === f && !deferredSearchQuery
                  ? { background: "#5865F2", color: "#fff", boxShadow: "0 4px 12px rgba(88,101,242,0.3)" }
                  : { background: "rgba(255,255,255,0.04)", color: "#949BA4", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }
              }
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto flex-wrap relative z-50">
          {hasFiltersApplied && (
            <button 
              onClick={handleResetFilters} 
              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] text-[11px] font-bold text-[#ed4245] bg-[rgba(237,66,69,0.1)] hover:bg-[#ed4245] hover:text-white transition-colors animate-fade-in"
              title="Reset Filters"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Filters</span>
            </button>
          )}

          <CustomDropdown icon={Filter} value={statusFilter} options={FILTER_OPTIONS} onChange={setStatusFilter} defaultLabel="All Statuses" />
          <CustomDropdown icon={ArrowUpDown} value={sortMode} options={SORT_OPTIONS} onChange={setSortMode} />
          <div className="hidden md:block w-px h-4 mx-0 md:mx-1 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="flex bg-[#1E1F22] rounded-[4px] p-[2px] border border-[rgba(255,255,255,0.04)] flex-shrink-0 ml-auto md:ml-0">
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-[3px] transition-all duration-300 ease-out ${viewMode === "grid" ? "bg-[#4e5058] text-white shadow-sm" : "text-[#80848E] hover:text-[#DBDEE1]"}`} title="Grid View"><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-[3px] transition-all duration-300 ease-out ${viewMode === "list" ? "bg-[#4e5058] text-white shadow-sm" : "text-[#80848E] hover:text-[#DBDEE1]"}`} title="List View"><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div 
        id="main-scroll-container"
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 md:px-8 pb-4 md:pb-8 custom-scrollbar relative" 
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="h-4 md:h-6 flex-shrink-0 w-full" />
        
        <div>
          {showWelcome && !deferredSearchQuery && statusFilter === "all" && sortMode === "value-desc" && (
            <div className="mb-4 md:mb-8 flex flex-col md:flex-row gap-3 md:gap-4 bg-[#2B2D31] md:bg-transparent p-3 md:p-0 rounded-[8px] md:rounded-none border md:border-none border-[rgba(255,255,255,0.04)] mx-2 md:mx-0">
              <div className="flex items-start justify-between md:hidden w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-lg">👋</div>
                  <h2 className="text-[16px] font-bold text-[#F2F3F5] tracking-tight">Welcome!</h2>
                </div>
                <button onClick={dismissWelcome} className="text-[#80848E] hover:text-[#DBDEE1] p-1"><X className="w-4 h-4" /></button>
              </div>
              
              <div className="hidden md:flex w-14 h-14 rounded-full bg-[#5865F2] items-center justify-center flex-shrink-0 text-3xl">👋</div>
              
              <div className="flex flex-col justify-center max-w-2xl">
                <h2 className="hidden md:block text-[22px] font-bold text-[#F2F3F5] mb-1 font-sans tracking-tight">Welcome to the value-list!</h2>
                <p className="text-[12px] md:text-[13px] text-[#B5BAC1] mb-2 md:mb-2.5 leading-relaxed">
                  This is the official ASTD value list. <strong>Left-click</strong> any unit card to instantly add it to <i>You Give</i>, and <strong>Right-click</strong> to add it to <i>You Get</i>.
                </p>
                <div className="flex flex-wrap items-center gap-1.5 md:gap-3 text-[9px] md:text-[11px] font-bold text-[#949BA4]">
                  <span className="bg-[#1E1F22] px-2 py-1 rounded border border-[rgba(255,255,255,0.04)]">R = Rarity (/20)</span>
                  <span className="bg-[#1E1F22] px-2 py-1 rounded border border-[rgba(255,255,255,0.04)]">S = Supply (/5)</span>
                  <span className="bg-[#1E1F22] px-2 py-1 rounded border border-[rgba(255,255,255,0.04)]">D = Demand (/5)</span>
                </div>
              </div>
              <button onClick={dismissWelcome} className="hidden md:block ml-auto self-start text-[#80848E] hover:text-[#DBDEE1] p-2"><X className="w-5 h-5" /></button>
            </div>
          )}

          {isLoading ? (
            <div className="mx-2 md:mx-0">
               <div className={STICKY_HEADER_CLASS}>
                  <TierBanner tier={tier} />
               </div>
               <SkeletonLoader viewMode={viewMode} />
            </div>
          ) : deferredSearchQuery ? (
             <div className="flex flex-col gap-4 mx-2 md:mx-0">
               <div className="flex items-center gap-2 mb-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#949BA4]">Search Results</span>
                  <span className="text-[11px] font-bold bg-[rgba(255,255,255,0.06)] text-[#DBDEE1] px-2 py-0.5 rounded transition-all">{filteredAllUnits.length} Found</span>
               </div>
               {filteredAllUnits.length === 0 ? (
                  <div className="py-24 text-center text-[#80848E] text-sm font-medium">No units found matching "{searchQuery}"</div>
               ) : (
                  <div className="flex flex-col gap-8 md:gap-14 mt-2">
                    {["S", "A", "B", "C", "Pure", "Oddities", "Untiered"].map((tKey) => {
                      const unitsInTier = filteredAllUnits.filter(u => getTier(u) === tKey);
                      if (unitsInTier.length === 0) return null;
                      const tCfg = TIER_CONFIG[tKey];
                      return (
                        <div id={`${tKey.toLowerCase()}-tier`} key={tKey} className="flex flex-col w-full relative">
                          <div className={STICKY_HEADER_CLASS}>
                            <TierBanner tier={tCfg} />
                          </div>
                          <div className="w-full">
                            {viewMode === "grid" ? (
                              <UnitGrid units={unitsInTier} onAddGive={onAddGive} onAddGet={onAddGet} />
                            ) : (
                              <UnitListTable units={unitsInTier} onAddGive={onAddGive} onAddGet={onAddGet} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
               )}
             </div>
          ) : activeTierFilter === "All" ? (
              <div className="flex flex-col gap-8 md:gap-14 mx-2 md:mx-0">
                {["S", "A", "B", "C", "Pure", "Oddities", "Untiered"].map((tKey) => {
                  const rawUnitsInTier = UNITS_BY_TIER[tKey];
                  const unitsInTier = processUnits(rawUnitsInTier, sortMode, statusFilter);
                  if (unitsInTier.length === 0) return null;
                  const tCfg = TIER_CONFIG[tKey];
                  return (
                    <div id={`${tKey.toLowerCase()}-tier`} key={tKey} className="flex flex-col w-full relative">
                      <div className={STICKY_HEADER_CLASS}>
                        <TierBanner tier={tCfg} />
                      </div>
                      <div className="w-full">
                        {isDefaultView ? (
                          <DynamicTierSection tier={tKey} units={rawUnitsInTier} viewMode={viewMode} sortMode={sortMode} statusFilter={statusFilter} onAddGive={onAddGive} onAddGet={onAddGet} />
                        ) : viewMode === "grid" ? (
                          <UnitGrid units={unitsInTier} onAddGive={onAddGive} onAddGet={onAddGet} />
                        ) : (
                          <UnitListTable units={unitsInTier} onAddGive={onAddGive} onAddGet={onAddGet} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
          ) : (
            <div className="w-full mx-2 md:mx-0 relative">
              <div className={STICKY_HEADER_CLASS}>
                <TierBanner tier={tier} />
              </div>

              {processUnits(UNITS_BY_TIER[activeTierFilter] || [], sortMode, statusFilter).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-14 h-14 rounded-[8px] flex items-center justify-center bg-[rgba(255,255,255,0.04)]"><Search className="w-6 h-6 text-[#4e5058]" /></div>
                  <p className="text-sm font-bold text-[#4e5058]">No units match your current filters.</p>
                </div>
              ) : (
                <div className="w-full pr-4 md:pr-0">
                  {isDefaultView ? (
                    <DynamicTierSection tier={activeTierFilter} units={UNITS_BY_TIER[activeTierFilter] || []} viewMode={viewMode} sortMode={sortMode} statusFilter={statusFilter} onAddGive={onAddGive} onAddGet={onAddGet} />
                  ) : viewMode === "grid" ? (
                    <UnitGrid units={processUnits(UNITS_BY_TIER[activeTierFilter] || [], sortMode, statusFilter)} onAddGive={onAddGive} onAddGet={onAddGet} />
                  ) : (
                    <UnitListTable units={processUnits(UNITS_BY_TIER[activeTierFilter] || [], sortMode, statusFilter)} onAddGive={onAddGive} onAddGet={onAddGet} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className={`absolute bottom-6 right-6 md:bottom-8 md:right-8 w-[46px] h-[46px] md:w-[52px] md:h-[52px] bg-[#5865F2] text-white rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out hover:bg-[#4752C4] hover:-translate-y-1 z-50 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
        title="Scroll to Top"
      >
        <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
      </button>

    </div>
  );
});