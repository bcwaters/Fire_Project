import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import RegionDetail from './RegionDetail.jsx'
import Layout from './Layout.jsx'
import './App.css'
import NationalSummary from './NationalSummary.jsx'
import { RegionProvider, useRegionNames } from './RegionContext.jsx'

function getTodayMDTPretty() {
  const mdtDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
  return mdtDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Denver'
  });
}

function Dashboard() {

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [loading, setLoading] = useState(false); // regionNames now comes from props
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [header, setHeader] = useState([]);
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const params = useParams(); // <-- Add this line
  const { regionNames, loading: regionNamesLoading } = useRegionNames();
  const [isMobile, setIsMobile] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Dynamically generate regions array from regionNames keys
  const regions = Object.keys(regionNames).map(key => parseInt(key)).sort((a, b) => a - b);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
  }

  const toggleSummary = () => {
    setIsSummaryExpanded(!isSummaryExpanded);
  };

  useEffect(() => {
    if (params.region) {
      navigate(`/region/${params.region}`);
    }else{
      setSelectedRegion(""); // <-- Fix function name
    }
  }, [params.region]);

  useEffect(() => {
    fetch(`data/${today}/daily_summary.json`)
      .then(response => response.json())
      .then(data => {
        setHeader(data.header || []);
        let cleanSummary = data.summary.replace(/Understanding the IMSR\s*/g, '').replace(/IMSR Map\s*/g, '');
        // Remove the Comp fires block
        const compFiresRegex = /Fires not managed under a full suppression strategy[\s\S]*?can be found in the NWCG glossary  or here/;
        cleanSummary = cleanSummary.replace(compFiresRegex, '').trim();
        // Filter out lines with 3 or fewer characters
        cleanSummary = cleanSummary
          .split('\n')
          // Trim leading spaces from each line
          .map(line => line.trimStart())
          .filter(line => line.trim().length > 3)
          // Add a new line after 'NIMOs committed:'
          .flatMap(line =>
            line.includes('NIMOs committed:') ? [line, ''] : [line]
          )
          .join('\n');
        setSummary(cleanSummary);
        setSummaryLoading(false);
      })
      .catch(error => {
        console.error('Error loading daily summary:', error);
        setSummary('Summary not available.');
        setSummaryLoading(false);
      });
  }, [today]);

  if (loading || summaryLoading || regionNamesLoading) {
    return (
      <div className="app">
        <main>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <main>
      {/* Welcome Section */}
      <div className="welcome-section">
        <h2 className="predictive-summary-label">Incident Graphs are updated daily at 7:30am MDT.</h2>
        <pre className="predictive-summary-text mobile-header-content">{header.join('\n')}</pre>
        
        {/* Mobile expandable summary */}
        {isMobile ? (
          <div className="mobile-summary-container">
            {!isSummaryExpanded && (
              <button 
                className={`mobile-summary-toggle ${isSummaryExpanded ? 'expanded' : ''}`}
                onClick={toggleSummary}
              >
                {isSummaryExpanded ? 'Show Less' : 'Show More'}
              </button>
            )}
            {isSummaryExpanded && (
              <div className="mobile-summary-text expanded">
                <pre className="predictive-summary-text mobile-summary-content">{summary}</pre>
              </div>
            )}
          </div>
        ) : (
          <pre className="predictive-summary-text">{summary}</pre>
        )}
      </div>
      {/* Daily Summary Block */}

      {/* Summary Graph Row */}
      <div className="summary-row">
        <div className="graph-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/national')}>
          <h2>National Fire Summary</h2>
          <div className="graph-wrapper">
            <img 
              src={`data/${today}/fire_summary_analysis.png`}
              alt="Fire summary analysis"
              className="fire-graph summary-graph"
              onClick={() => navigate('/national')}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="error-message" style={{ display: 'none' }}>
              <p>Summary graph not available</p>
            </div>
          </div>
        </div>
      </div>
      {/* Divider between summary and regions */}
      <hr className="divider" />
      {/* Region Graphs Container */}
      <div className="graphs-container">
        {regions.map((region) => (
          <div key={region}   onClick={() => navigate(`/region/${region}`)} className="graph-card">
            <h2>{regionNames[region] || `Region ${region}`}</h2>
            <div className="graph-wrapper">
              <img 
                src={`data/${today}/regions/fire_analysis_region_${region}.png`}
                alt={`Fire analysis for ${regionNames[region] || `Region ${region}`}`}
                className="fire-graph"
                onClick={() => navigate(`/region/${region}`)}
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
      </div>
    </main>
  )
}

function App() {
  return (
    <RegionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="region/:regionId" element={<RegionDetail />} />
            <Route path="national" element={<NationalSummary />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RegionProvider>
  );
}

export default App
