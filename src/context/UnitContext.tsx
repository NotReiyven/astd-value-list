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
  isSyncing: boolean; // Added to quietly track background revalidation
  isError: boolean;
};

const CACHE_VERSION = "astd_cache_v2"; // Bump this whenever data structures change to force clean syncs

const UnitContext = createContext<UnitContextType>({
  units: LOCAL_FALLBACK_UNITS,
  changelog: [],
  notices: [],
  sheetTitle: "ASTD Official Value List",
  lastUpdated: new Date().toISOString(),
  isLoading: true,
  isSyncing: false,
  isError: false,
});

export const UnitProvider = ({ children }: { children: React.ReactNode }) => {
  // Check cache version validity on boot
  const isCacheValid = () => {
    try {
      return localStorage.getItem('astd_cache_version') === CACHE_VERSION;
    } catch {
      return false;
    }
  };

  const [units, setUnits] = useState<MasterUnit[]>(() => {
    try { 
      if (!isCacheValid()) return LOCAL_FALLBACK_UNITS;
      const c = localStorage.getItem('astd_units_cache'); 
      return c ? JSON.parse(c) : LOCAL_FALLBACK_UNITS; 
    } catch { 
      return LOCAL_FALLBACK_UNITS; 
    }
  });

  const [changelog, setChangelog] = useState<string[]>(() => {
    try { const c = localStorage.getItem('astd_changelog_cache'); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  
  const [notices, setNotices] = useState<any[]>(() => {
    try { const c = localStorage.getItem('astd_notices_cache'); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  
  const [sheetTitle, setSheetTitle] = useState(() => localStorage.getItem('astd_title_cache') || "ASTD Official Value List");
  const [lastUpdated, setLastUpdated] = useState(() => localStorage.getItem('astd_date_cache') || new Date().toISOString());
  
  // If cache is invalid or missing, force full loading state
  const [isLoading, setIsLoading] = useState(!isCacheValid() || !localStorage.getItem('astd_units_cache'));
  const [isSyncing, setIsSyncing] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchLiveUnits = async () => {
      // If we already have a valid cache, run sync quietly in the background (Stale-While-Revalidate)
      if (!isLoading) {
        setIsSyncing(true);
      }

      try {
        const res = await fetch('/.netlify/functions/syncSheet');
        if (!res.ok) throw new Error('API Response not OK');
        
        const data = await res.json();
        
        if (data.sheetTitle) { setSheetTitle(data.sheetTitle); localStorage.setItem('astd_title_cache', data.sheetTitle); }
        if (data.lastUpdated) { setLastUpdated(data.lastUpdated); localStorage.setItem('astd_date_cache', data.lastUpdated); }
        
        if (data.changelog) { setChangelog(data.changelog); localStorage.setItem('astd_changelog_cache', JSON.stringify(data.changelog)); }
        if (data.notices) { setNotices(data.notices); localStorage.setItem('astd_notices_cache', JSON.stringify(data.notices)); }

        if (data && data.units && data.units.length > 0) {
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
              imageUrl: localMatch?.imageUrl || apiUnit.imageUrl || "",
              aliases: localMatch?.aliases || apiUnit.aliases || []
            };
          });
          
          // Strict deduplication map
          const uniqueUnitsMap = new Map<string, MasterUnit>();
          mergedUnits.forEach((u: MasterUnit) => uniqueUnitsMap.set(u.id, u));
          const finalUniqueUnits = Array.from(uniqueUnitsMap.values());

          setUnits(finalUniqueUnits);
          
          // Save to localStorage along with version stamp
          localStorage.setItem('astd_units_cache', JSON.stringify(finalUniqueUnits));
          localStorage.setItem('astd_cache_version', CACHE_VERSION);
        }
      } catch (error) {
        console.error("Live sync failed, falling back to local cache:", error);
        if (isLoading) {
          setIsError(true);
        }
      } finally {
        setIsLoading(false);
        setIsSyncing(false);
      }
    };

    fetchLiveUnits();
  }, []);

  return (
    <UnitContext.Provider value={{ units, changelog, notices, sheetTitle, lastUpdated, isLoading, isSyncing, isError }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnits = () => useContext(UnitContext);