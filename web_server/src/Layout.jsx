import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './styles/App.css';
import { useState, useEffect } from 'react';
import fireGraphIcon from './assets/fire_graph_icon.png';
import { useRegionNames } from './RegionContext.jsx';

function Layout() {
  // Use a known working date instead of today's date
  
  const { regionNames, loading: regionNamesLoading } = useRegionNames();
  
  // Dynamically generate regions array from regionNames keys
  const regions = Object.keys(regionNames).map(key => parseInt(key)).sort((a, b) => a - b);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Determine selected region from the current path
  const match = location.pathname.match(/^\/region\/(\d+)/);
  const selectedRegion = match ? match[1] : "";

  const handleRegionChange = (e) => {
    const region = e.target.value;
    if (region) {
      navigate(`/region/${region}`);
    }
  };


  const handleMobileRegionSelect = (region) => {
    navigate(`/region/${region}`);

  };

  // Show loading state while region names are being fetched
  if (regionNamesLoading) {
    return (
      <div className="app">
        <main>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <div className="header-left">
            <img 
              src={fireGraphIcon} 
              alt="Fire Graph Icon" 
              className="header-icon"
              onClick={() => navigate('/')}
            />
            
          </div>
          {/* Desktop dropdown */}
          <select onChange={handleRegionChange} value={selectedRegion} className="region-dropdown hide-on-mobile">
            <option value="" disabled>Region</option>
            {regions.map(region => (
              <option key={region} value={region} className="region-dropdown-option">
                {regionNames[region] || `Region ${region}`}
              </option>
            ))}
          </select>
          {/* Mobile dropdown */}
          <select onChange={handleRegionChange} value={selectedRegion} className="region-dropdown hide-on-desktop">
            <option value="" disabled>Region</option>
            {regions.map(region => (
              <option key={region} value={region} className="region-dropdown-option">
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