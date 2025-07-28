import { useNavigate } from 'react-router-dom';
import './styles/App.css';
import { useEffect, useState, useCallback } from 'react';
import NationalSummaryGraph from './components/NationalSummaryGraph.jsx';
import { useRegionNames } from './RegionContext.jsx';

function getTodayMDTPretty() {
  const mdtDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
  return mdtDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Denver'
  });
}

function NationalSummary() {
  
  // Use the same date as the RegionProvider
  const today = '20250728'; // Hardcoded for testing
  const todayPrettyMDT = getTodayMDTPretty();
  const navigate = useNavigate();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fireDataLoading, setFireDataLoading] = useState(true);
  const [fireData, setFireData] = useState([]);
  const [downloadGraph, setDownloadGraph] = useState();
  const { regionNames, loading: regionNamesLoading } = useRegionNames();

  const memoizedSetDownloadGraph = useCallback((func) => {
    setDownloadGraph(() => func);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/data/${today}/predictive_summary.txt`)
      .then((res) => {
        if (!res.ok) throw new Error('Summary not found');
        return res.text();
      })
      .then((text) => {
        setSummary(text);
        setLoading(false);
      })
      .catch((err) => {
        setError('Could not load predictive summary.');
        setLoading(false);
      });
  }, [today]);

  useEffect(() => {
    setFireDataLoading(true);
    fetch(`/data/${today}/fire_summary_${today}.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Fire data not found');
        return res.json();
      })
      .then((data) => {
        setFireData(data);
        setFireDataLoading(false);
      })
      .catch((err) => {
        console.error('Error loading fire data:', err);
        setFireDataLoading(false);
      });
  }, [today]);

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
    <div>
      <div className="page-header-container">
        <button className="back-button" onClick={() => navigate('/')}>←</button>
        <button onClick={downloadGraph} className="save-btn save-svg">
          Download Graph
        </button>
      </div>
      <div className="national-summary-detail">
        <div className="region-detail-header">
          <h1 className="region-detail-title">National Fire Summary <span style={{fontSize: '.5rem', fontWeight: 400, color: '#b28704'}}> {todayPrettyMDT} MDT</span></h1>
        </div>
        
        {/* D3.js Chart */}
        <div className="chart-container">
          {fireDataLoading ? (
            <div className="loading-chart">Loading chart...</div>
          ) : (
            <>
              <NationalSummaryGraph setDownloadGraph={memoizedSetDownloadGraph} data={fireData} headerData={{ header: ['', todayPrettyMDT] }} />
            </> 
          )}
        </div>

        <div className="predictive-summary-container">
          <h2 className="predictive-summary-label">Predictive Services Discussion:</h2>
          {loading && <p className="predictive-summary-loading">Loading predictive summary...</p>}
          {error && <p className="predictive-summary-error">{error}</p>}
          {!loading && !error && (
            <pre className="predictive-summary-text">{summary}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

export default NationalSummary; 