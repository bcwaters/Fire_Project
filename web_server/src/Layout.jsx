import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { useState, useEffect } from 'react';
import fireGraphIcon from './assets/fire_graph_icon.png';
import { useRegionNames } from './RegionContext.jsx';

function Layout() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const { regionNames, loading: regionNamesLoading } = useRegionNames();
  
  // Dynamically generate regions array from regionNames keys
  const regions = Object.keys(regionNames).map(key => parseInt(key)).sort((a, b) => a - b);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine selected region from the current path
  const match = location.pathname.match(/^\/region\/(\d+)/);
  const selectedRegion = match ? match[1] : "";

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  const handleRegionChange = (e) => {
    const region = e.target.value;
    if (region) {
      navigate(`/region/${region}`);
    }
  };

  const handleMobileMenuOpen = () => setIsMobileMenuOpen(true);
  const handleMobileMenuClose = () => setIsMobileMenuOpen(false);
  const handleMobileRegionSelect = (region) => {
    navigate(`/region/${region}`);
    setIsMobileMenuOpen(false);
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
          {/* Mobile hamburger */}
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
      {/* Mobile modal */}
      {isMobileMenuOpen && (
        <div className="region-modal-overlay" onClick={handleMobileMenuClose}>
          <div className="region-modal" onClick={e => e.stopPropagation()}>
            <div className="region-modal-header">
              <span>Select Region</span>
              <button className="region-modal-close" onClick={handleMobileMenuClose} aria-label="Close">&times;</button>
            </div>
            <ul className="region-modal-list">
              {regions.map(region => (
                <li key={region}>
                  <button className="region-modal-option" onClick={() => handleMobileRegionSelect(region)}>
                    {regionNames[region] || `Region ${region}`}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <Outlet />
    </div>
  );
}

export default Layout; 