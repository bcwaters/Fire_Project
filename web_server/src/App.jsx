import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RegionDetail from './RegionDetail.jsx'
import Layout from './Layout.jsx'
import './App.css'
import NationalSummary from './NationalSummary.jsx'

function Dashboard() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [regionNames, setRegionNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const regions = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    fetch(`data/${today}/regions/region_key_${today}.json`)
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

  useEffect(() => {
    fetch(`data/${today}/daily_summary.json`)
      .then(response => response.json())
      .then(data => {
        let cleanSummary = data.summary.replace(/Understanding the IMSR\s*/g, '').replace(/IMSR Map\s*/g, '');
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
        <h2>Daily National Fire Summary</h2>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: '1em', borderRadius: '8px', border: '1px solid #eee' }}>{summary}</pre>
      </div>
      {/* Summary Graph Row */}
      <div className="summary-row">
        <div className="graph-card" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/national'}>
          <h2>National Fire Summary</h2>
          <div className="graph-wrapper">
            <img 
              src={`data/${today}/fire_summary_analysis.png`}
              alt="Fire summary analysis"
              className="fire-graph summary-graph"
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
            <h2>{regionNames[region] || `Region ${region}`}</h2>
            <div className="graph-wrapper">
              <img 
                src={`data/${today}/regions/fire_analysis_region_${region}.png`}
                alt={`Fire analysis for ${regionNames[region] || `Region ${region}`}`}
                className="fire-graph"
                onClick={() => window.location.href = `/region/${region}`}
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="region/:regionId" element={<RegionDetail />} />
          <Route path="national" element={<NationalSummary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
