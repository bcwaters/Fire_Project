import { createContext, useContext, useState, useEffect } from 'react';

const RegionContext = createContext();

const isRegionName = (name) => {
  const normalizedName = String(name || '').replace(/\s+/g, ' ').trim().toLowerCase();
  return normalizedName && normalizedName !== 'national fire activity:';
};

export function RegionProvider({ children, today }) {
  // Use a known working date instead of today's date
  const [regionNames, setRegionNames] = useState({});
  const [regionFileIds, setRegionFileIds] = useState({});
  const [loading, setLoading] = useState(true);

  // Always load region names when the provider is created
  useEffect(() => {
    const loadRegionNames = async () => {
      const regionKeyUrl = `/data/${today}/regions/region_key_${today}.json`;
      console.log('[init data fetch] region key start', { today, url: regionKeyUrl });

      try {
        const response = await fetch(regionKeyUrl);
        console.log('[init data fetch] region key response', {
          url: regionKeyUrl,
          status: response.status,
          ok: response.ok
        });

        if (!response.ok) {
          throw new Error(`Region key request failed with status ${response.status}`);
        }

        const data = await response.json();
        const regionOnlyEntries = Object.entries(data).filter(([, name]) => isRegionName(name));
        const regionOnlyData = {};
        const fileIdLookup = {};

        regionOnlyEntries.forEach(([sourceId, name], index) => {
          const displayId = String(index + 1);
          regionOnlyData[displayId] = name;
          fileIdLookup[displayId] = Number(sourceId);
        });

        console.log('[init data fetch] region key json', regionOnlyData);
        setRegionNames(regionOnlyData);
        setRegionFileIds(fileIdLookup);
      } catch (error) {
        console.error('Error loading region names:', error);
        // Set empty object as fallback
        setRegionNames({});
        setRegionFileIds({});
      } finally {
        setLoading(false);
      }
    };

    loadRegionNames();
  }, [today]);

  return (
    <RegionContext.Provider value={{ regionNames, regionFileIds, loading }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegionNames() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegionNames must be used within a RegionProvider');
  }
  return context;
} 
