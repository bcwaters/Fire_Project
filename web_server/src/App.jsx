import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Calculate today's date in YYYYMMDD format
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  const [regionNames, setRegionNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // Array of region numbers for the graphs
  const regions = [1, 2, 3, 4, 5, 6, 7, 8];

  // Load region names from JSON file
  useEffect(() => {
    fetch(`/${today}/regions/region_key_${today}.json`)
      .then(response => response.json())
      .then(data => {
        setRegionNames(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading region names:', error);
        setLoading(false);
      });
  }, [today]);

  // Handle image click
  const handleImageClick = (region) => {
    const imageUrl = `/${today}/regions/fire_analysis_region_${region}.png`;
    const regionName = regionNames[region] || `Region ${region}`;
    setSelectedImage({ url: imageUrl, name: regionName });
  };

  // Close modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Fire Analysis Dashboard</h1>
          <p>Loading...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Fire Analysis Dashboard</h1>
        <p>Fire analysis graphs for {today}</p>
      </header>
      
      <main className="graphs-container">
        {regions.map((region) => (
          <div key={region} className="graph-card">
            <h2>{regionNames[region] || `Region ${region}`}</h2>
            <div className="graph-wrapper">
              <img 
                src={`/${today}/regions/fire_analysis_region_${region}.png`}
                alt={`Fire analysis for ${regionNames[region] || `Region ${region}`}`}
                className="fire-graph"
                onClick={() => handleImageClick(region)}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="error-message" style={{ display: 'none' }}>
                <p>Graph not available for {regionNames[region] || `Region ${region}`}</p>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Modal for full image */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedImage.name}</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.name}
                className="full-image"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
