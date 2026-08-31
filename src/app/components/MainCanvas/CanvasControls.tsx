import { X, LayoutGrid, List, ArrowUpDown, Filter } from "lucide-react";
import { FilterKey } from "../../../types";
import { FILTERS } from "../../../data";
import { CustomDropdown } from "./CustomDropdown";

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

interface CanvasControlsProps {
  activeTierFilter: FilterKey;
  setActiveTierFilter: (f: FilterKey) => void;
  deferredSearchQuery: string;
  hasFiltersApplied: boolean;
  handleResetFilters: () => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  sortMode: string;
  setSortMode: (s: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (v: "grid" | "list") => void;
}

export function CanvasControls({
  activeTierFilter,
  setActiveTierFilter,
  deferredSearchQuery,
  hasFiltersApplied,
  handleResetFilters,
  statusFilter,
  setStatusFilter,
  sortMode,
  setSortMode,
  viewMode,
  setViewMode
}: CanvasControlsProps) {
  return (
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
  );
}