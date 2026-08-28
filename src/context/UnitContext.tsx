import React, { createContext, useContext, useState, useEffect } from 'react';
import { MasterUnit } from '../types';
import { ALL_UNITS as LOCAL_FALLBACK_UNITS } from '../data/units';

type UnitContextType = {
  units: MasterUnit[];
  changelog: string[];
  notices: { title: string, date: string | null, content: string }[];
  sheetTitle: string;
  lastUpdated: string;
  isLoading: boolean;
  isError: boolean;
};

const UnitContext = createContext<UnitContextType>({
  units: LOCAL_FALLBACK_UNITS,
  changelog: [],
  notices: [],
  sheetTitle: "ASTD Official Value List",
  lastUpdated: new Date().toISOString(),
  isLoading: true,
  isError: false,
});

export const UnitProvider = ({ children }: { children: React.ReactNode }) => {
  const [units, setUnits] = useState<MasterUnit[]>(() => {
    try { const c = localStorage.getItem('astd_units_cache'); return c ? JSON.parse(c) : LOCAL_FALLBACK_UNITS; } catch { return LOCAL_FALLBACK_UNITS; }
  });
  const [changelog, setChangelog] = useState<string[]>(() => {
    try { const c = localStorage.getItem('astd_changelog_cache'); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  const [notices, setNotices] = useState<any[]>(() => {
    try { const c = localStorage.getItem('astd_notices_cache'); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  
  const [sheetTitle, setSheetTitle] = useState(() => localStorage.getItem('astd_title_cache') || "ASTD Official Value List");
  const [lastUpdated, setLastUpdated] = useState(() => localStorage.getItem('astd_date_cache') || new Date().toISOString());
  const [isLoading, setIsLoading] = useState(!localStorage.getItem('astd_units_cache'));
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchLiveUnits = async () => {
      try {
        const res = await fetch('/.netlify/functions/syncSheet');
        if (!res.ok) throw new Error('API Response not OK');
        
        const data = await res.json();
        
        if (data.sheetTitle) { setSheetTitle(data.sheetTitle); localStorage.setItem('astd_title_cache', data.sheetTitle); }
        if (data.lastUpdated) { setLastUpdated(data.lastUpdated); localStorage.setItem('astd_date_cache', data.lastUpdated); }
        
        if (data.changelog) { setChangelog(data.changelog); localStorage.setItem('astd_changelog_cache', JSON.stringify(data.changelog)); }
        if (data.notices) { setNotices(data.notices); localStorage.setItem('astd_notices_cache', JSON.stringify(data.notices)); }

        if (data && data.units && data.units.length > 0) {
          // Merge Live Unit Data with Local Image/Alias Data from units.ts
          const mergedUnits = data.units.map((apiUnit: MasterUnit) => {
            const apiCleanName = apiUnit.name.toLowerCase().replace(/[^a-z0-9]/g, "");

            let localMatch = LOCAL_FALLBACK_UNITS.find(u => {
              const localCleanName = u.name.toLowerCase().replace(/[^a-z0-9]/g, "");
              if (u.id === apiUnit.id) return true;
              if (localCleanName === apiCleanName) return true;
              if (u.aliases && u.aliases.length > 0) {
                const cleanAliases = u.aliases.map(a => a.toLowerCase().replace(/[^a-z0-9]/g, ""));
                if (cleanAliases.includes(apiCleanName)) return true;
              }
              return false;
            });

            return {
              ...apiUnit,
              imageUrl: localMatch?.imageUrl || "",
              aliases: localMatch?.aliases || []
            };
          });
          
          setUnits(mergedUnits);
          localStorage.setItem('astd_units_cache', JSON.stringify(mergedUnits));
        }
      } catch (error) {
        console.error("Live sync failed:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveUnits();
  }, []);

  return (
    <UnitContext.Provider value={{ units, changelog, notices, sheetTitle, lastUpdated, isLoading, isError }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnits = () => useContext(UnitContext);