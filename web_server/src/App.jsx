import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import RegionDetail from './RegionDetail.jsx'
import Layout from './Layout.jsx'
import './App.css'
import NationalSummary from './NationalSummary.jsx'

function getTodayMDTPretty() {
  const mdtDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
  return mdtDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Denver'
  });
}

function Dashboard({ regionNames }) {
  const todayPrettyMDT = getTodayMDTPretty();
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [loading, setLoading] = useState(false); // regionNames now comes from props
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState(null);


  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
  }

  //TODO dynamically load regions from region_key_${today}.json
  const regions = [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    if (params.region) {
      navigate(`/region/${params.region}`);
    }else{
      setRegionSelected("");
    }
  }, [params.region]);

  useEffect(() => {
    fetch(`data/${today}/daily_summary.json`)
      .then(response => response.json())
      .then(data => {
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

  if (loading || summaryLoading) {
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
      {/* Daily Summary Block */}
      <div className="daily-summary-block hide-on-mobile">
        <h2>Daily National Fire Summary <span style={{fontSize: '1rem', fontWeight: 400, color: '#b28704'}}>&mdash; {todayPrettyMDT} MDT</span></h2>
        <p> <span style={{ fontSize: '0.8em' }}>updated daily at 8:30am MDT</span></p>
        {/* Comp fires block is not displayed */}
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: '1em', borderRadius: '8px', border: '1px solid #eee' }}>{summary}</pre>
      </div>
      {/* Summary Graph Row */}
      <div className="summary-row">
        <div className="graph-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/national')}>
          <h2>National Fire Summary <span style={{fontSize: '1rem', fontWeight: 400, color: '#555', paddingLeft: '1rem'}}> {todayPrettyMDT} MDT</span></h2>
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
          <div key={region} className="graph-card">
            <h2>{regionNames[region] || `Region ${region}`} <span style={{fontSize: '.91rem', fontWeight: 400, color: '#555', paddingLeft: '1rem'}}>  {todayPrettyMDT} MDT</span></h2>
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

  if (loading) {
    return (
      <div className="app">
        <main>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout regionNames={regionNames} />}>
          <Route index element={<Dashboard regionNames={regionNames} />} />
          <Route path="region/:regionId" element={<RegionDetail />} />
          <Route path="national" element={<NationalSummary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
