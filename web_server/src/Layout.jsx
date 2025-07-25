import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { useState, useEffect } from 'react';

function Layout() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [regionNames, setRegionNames] = useState({});
  const regions = [1, 2, 3, 4, 5, 6, 7, 8];
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`data/${today}/regions/region_key_${today}.json`)
      .then(response => response.json())
      .then(data => setRegionNames(data))
      .catch(() => setRegionNames({}));
  }, []); // Only run once on mount

  // Determine selected region from the current path
  const match = location.pathname.match(/^\/region\/(\d+)/);
  const selectedRegion = match ? match[1] : "";

  const handleRegionChange = (e) => {
    const region = e.target.value;
    if (region) {
      navigate(`/region/${region}`);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <h1>Fire Analysis Dashboard</h1>
          <select onChange={handleRegionChange} value={selectedRegion} className="region-dropdown">
            <option value="" disabled>Go to Region...</option>
            {regions.map(region => (
              <option key={region} value={region}>
                {regionNames[region] || `Region ${region}`}
              </option>
            ))}
          </select>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default Layout; 