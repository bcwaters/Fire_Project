import { createContext, useContext, useState, useEffect } from 'react';

const RegionContext = createContext();

export function RegionProvider({ children, today }) {
  // Use a known working date instead of today's date
  const [regionNames, setRegionNames] = useState({});
  const [loading, setLoading] = useState(true);

  // Always load region names when the provider is created
  useEffect(() => {
    const loadRegionNames = async () => {
      try {
        const response = await fetch(`/data/${today}/regions/region_key_${today}.json`);
        if (!response.ok) {
          throw new Error('Failed to load region names');
        }
        const data = await response.json();
        console.log("region names loaded:", data);
        setRegionNames(data);
      } catch (error) {
        console.error('Error loading region names:', error);
        // Set empty object as fallback
        setRegionNames({});
      } finally {
        setLoading(false);
      }
    };

    loadRegionNames();
  }, [today]);

  return (
    <RegionContext.Provider value={{ regionNames, loading }}>
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