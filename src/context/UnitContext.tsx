import React, { createContext, useContext, useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';
import { MasterUnit } from '../types';
import { ALL_UNITS as LOCAL_FALLBACK_UNITS } from '../data/units';
import { getObtainability } from '../data/helpers';

type UnitContextType = {
  units: MasterUnit[];
  changelog: string[];
  notices: { title: string, date: string | null, content: string }[];
  sheetTitle: string;
  lastUpdated: string;
  isLoading: boolean;
  isSyncing: boolean; 
  isError: boolean;
};

// Bumped to v3 for the IndexedDB migration
const CACHE_VERSION = "astd_cache_v3"; 

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
  // Initialize with fallbacks; we will quickly overwrite these via IDB
  const [units, setUnits] = useState<MasterUnit[]>(LOCAL_FALLBACK_UNITS);
  const [changelog, setChangelog] = useState<string[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  
  // Lightweight scalar values can still safely use synchronous localStorage
  const [sheetTitle, setSheetTitle] = useState(() => localStorage.getItem('astd_title_cache') || "ASTD Official Value List");
  const [lastUpdated, setLastUpdated] = useState(() => localStorage.getItem('astd_date_cache') || new Date().toISOString());
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let mounted = true; // Guard to prevent state updates if the component unmounts

    const initCacheAndFetch = async () => {
      let hasValidCache = false;
      
      try {
        const cacheVersion = localStorage.getItem('astd_cache_version');
        if (cacheVersion === CACHE_VERSION) {
          // Read heavy payloads from IndexedDB in parallel
          const [cachedUnits, cachedChangelog, cachedNotices] = await Promise.all([
            get('astd_units_cache'),
            get('astd_changelog_cache'),
            get('astd_notices_cache')
          ]);

          if (cachedUnits && mounted) {
            setUnits(cachedUnits);
            hasValidCache = true;
          }
          if (cachedChangelog && mounted) setChangelog(cachedChangelog);
          if (cachedNotices && mounted) setNotices(cachedNotices);
        }
      } catch (e) {
        console.warn("Failed to read from IndexedDB", e);
      }

      if (!mounted) return;

      // If a valid cache exists, drop the loading screen and show the background sync spinner
      if (hasValidCache) {
        setIsLoading(false);
        setIsSyncing(true);
      }

      // Fetch live data from the Netlify Serverless Function
      try {
        const res = await fetch('/.netlify/functions/syncSheet');
        if (!res.ok) throw new Error('API Response not OK');
        
        const data = await res.json();
        if (!mounted) return;
        
        if (data.sheetTitle) { 
          setSheetTitle(data.sheetTitle); 
          localStorage.setItem('astd_title_cache', data.sheetTitle); 
        }
        if (data.lastUpdated) { 
          setLastUpdated(data.lastUpdated); 
          localStorage.setItem('astd_date_cache', data.lastUpdated); 
        }
        
        // Save to state and write back to IndexedDB
        if (data.changelog) { 
          setChangelog(data.changelog); 
          await set('astd_changelog_cache', data.changelog); 
        }
        if (data.notices) { 
          setNotices(data.notices); 
          await set('astd_notices_cache', data.notices); 
        }

        if (data?.units?.length > 0) {
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
              aliases: localMatch?.aliases || apiUnit.aliases || [],
              obtainability: getObtainability(apiUnit) // Cached directly to the object here
            };
          });
          
          // Strict deduplication
          const uniqueUnitsMap = new Map<string, MasterUnit>();
          mergedUnits.forEach((u: MasterUnit) => uniqueUnitsMap.set(u.id, u));
          const finalUniqueUnits = Array.from(uniqueUnitsMap.values());

          setUnits(finalUniqueUnits);
          
          // Save structural clones directly to IndexedDB (No JSON.stringify needed!)
          await set('astd_units_cache', finalUniqueUnits);
          localStorage.setItem('astd_cache_version', CACHE_VERSION);
        }
      } catch (error) {
        console.error("Live sync failed, falling back to local cache:", error);
        if (!hasValidCache && mounted) {
          setIsError(true);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsSyncing(false);
        }
      }
    };

    initCacheAndFetch();

    return () => { mounted = false; };
  }, []);

  return (
    <UnitContext.Provider value={{ units, changelog, notices, sheetTitle, lastUpdated, isLoading, isSyncing, isError }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnits = () => useContext(UnitContext);