import { useMemo } from "react";
import { PopupUnit, MasterUnit } from "../../../types";
import { sortVal } from "../../../data";
import { UnitGrid } from "./UnitGrid";
import { UnitListTable } from "./UnitListTable";

export function processUnits(units: MasterUnit[], sortMode: string, statusFilter: string) {
  let processed = [...units];
  if (statusFilter !== "all") processed = processed.filter(u => u.status === statusFilter);
  
  processed.sort((a, b) => {
    if (sortMode === "value-desc") return sortVal(b) - sortVal(a);
    if (sortMode === "value-asc") return sortVal(a) - sortVal(b);
    if (sortMode === "demand-desc") return (b.demand !== a.demand) ? b.demand - a.demand : sortVal(b) - sortVal(a); 
    if (sortMode === "supply-asc") return (a.supply !== b.supply) ? a.supply - b.supply : sortVal(b) - sortVal(a); 
    if (sortMode === "rarity-desc") return (b.rarity !== a.rarity) ? b.rarity - a.rarity : sortVal(b) - sortVal(a);
    if (sortMode === "alpha-asc") return a.name.localeCompare(b.name);
    return 0;
  });
  return processed;
}

export function TierBanner({ tier }: { tier: { label: string; badgeColor: string } }) {
  return (
    <div className="relative w-full mb-8 overflow-hidden rounded-xl" style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 50%, rgba(0,0,0,0.08) 100%), #2B2D31`, border: "1px solid rgba(255,255,255,0.07)", boxShadow: `0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.035)` }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% -30%, ${tier.badgeColor}30 0%, ${tier.badgeColor}12 35%, transparent 70%)` }} />
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent 0%, ${tier.badgeColor} 25%, ${tier.badgeColor} 75%, transparent 100%)`, boxShadow: `0 0 14px ${tier.badgeColor}80` }} />
      <div className="relative z-10 flex min-h-[88px] items-center justify-center px-6">
        <div className="flex flex-col items-center">
          <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.35em] opacity-60" style={{ color: tier.badgeColor }}>Tier</span>
          <h1 className="text-[28px] font-black uppercase tracking-[0.18em] leading-none" style={{ color: tier.badgeColor, textShadow: `0 2px 8px rgba(0,0,0,0.45), 0 0 18px ${tier.badgeColor}35` }}>{tier.label}</h1>
        </div>
      </div>
    </div>
  );
}

export function TierSubHeader({ label, valueRange, count }: { label: string; valueRange: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-4">
      <div className="flex items-baseline gap-2 flex-shrink-0">
        <span className="text-[12px] font-bold uppercase tracking-wider text-[#949BA4]">{label}</span>
        <span className="text-[12px] font-semibold text-[#DBDEE1]">{valueRange}</span>
      </div>
      <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
      <span className="text-[10px] font-bold px-1.5 py-[2px] rounded-[4px] bg-[rgba(255,255,255,0.04)] text-[#949BA4]">{count}</span>
    </div>
  );
}

export function DynamicTierSection({ tier, units, viewMode, sortMode, statusFilter, onAddGive, onAddGet }: any) {
  const isValueSort = sortMode === "value-desc" || sortMode === "value-asc";
  
  const sections = useMemo(() => {
    const sectionsMap = new Map<string, { label: string; range: string; units: MasterUnit[] }>();
    
    units.forEach((u: MasterUnit) => {
      const cat = u.subCategory || "Uncategorized";
      if (!sectionsMap.has(cat)) sectionsMap.set(cat, { label: cat, range: u.subCategoryRange || "N/A", units: [] });
      sectionsMap.get(cat)!.units.push(u);
    });

    const mappedSections = Array.from(sectionsMap.values()).map(sec => ({
      ...sec, processedUnits: processUnits(sec.units, sortMode, statusFilter)
    })).filter(sec => sec.processedUnits.length > 0);

    // FIXED: Sort subcategory sections by value so higher-tier subcategories (Top/High) always appear above lower ones (Mid/Low)
    if (isValueSort) {
      mappedSections.sort((a, b) => {
        const valA = Math.max(...a.processedUnits.map(u => sortVal(u)));
        const valB = Math.max(...b.processedUnits.map(u => sortVal(u)));
        return sortMode === "value-desc" ? valB - valA : valA - valB;
      });
    }

    return mappedSections;
  }, [units, sortMode, statusFilter, isValueSort]);

  if (!isValueSort && sections.length > 0) {
    // Flatten for non-value sorts if needed, or render sections normally
    const flattened = sections.flatMap(s => s.processedUnits);
    if (flattened.length === 0) return null;
    return viewMode === "grid" ? <UnitGrid units={flattened} onAddGive={onAddGive} onAddGet={onAddGet} /> : <UnitListTable units={flattened} onAddGive={onAddGive} onAddGet={onAddGet} />;
  }

  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-10">
      {sections.map(sec => {
        const uniqueSecId = `${tier.toLowerCase()}-${sec.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        return (
          <div id={uniqueSecId} key={sec.label} className="scroll-mt-[120px]">
            <TierSubHeader label={sec.label} valueRange={sec.range} count={sec.processedUnits.length} />
            {viewMode === "grid" ? <UnitGrid units={sec.processedUnits} onAddGive={onAddGive} onAddGet={onAddGet} /> : <UnitListTable units={sec.processedUnits} onAddGive={onAddGive} onAddGet={onAddGet} />}
          </div>
        );
      })}
    </div>
  );
}