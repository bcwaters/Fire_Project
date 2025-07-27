import { createContext, useContext, useState, useEffect } from 'react';

const RegionContext = createContext();

export function RegionProvider({ children }) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [regionNames, setRegionNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`data/${today}/regions/region_key_${today}.json`)
      .then(response => response.json())
      .then(data => {
        console.log("region names loaded:", data);
        setRegionNames(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading region names:', error);
        setLoading(false);
      });
  }, []);

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