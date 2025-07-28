import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/App.css';
import RegionalDataGraph from './components/RegionalDataGraph.jsx';
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

function RegionDetail() {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const todayPrettyMDT = getTodayMDTPretty();
  const [regionData, setRegionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regionSummary, setRegionSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const [downloadGraph, setDownloadGraph] = useState();
  const { regionNames, loading: regionNamesLoading } = useRegionNames();

  const memoizedSetDownloadGraph = useCallback((func) => {
    setDownloadGraph(() => func);
  }, []);

  // Get region name from context
  const regionName = regionNames[regionId] || `Region ${regionId}`;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Load region data
        const dataResp = await fetch(`/data/${today}/regions/Region_${regionId}_${today}.json`);
        if (!dataResp.ok) throw new Error('Region data not found');
        const dataJson = await dataResp.json();
        setRegionData(dataJson);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [regionId, today]);

  useEffect(() => {
    async function fetchRegionSummary() {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const resp = await fetch(`/data/${today}/regions/region_summaries_${today}.json`);
        if (!resp.ok) throw new Error('Region summary not found');
        const summaryJson = await resp.json();
        // Try to match region name (trim spaces)
        let regionKey = regionName.trim();
        // Some region names in the key file may have extra spaces, so try to find a close match
        if (!summaryJson[regionKey]) {
          // Try to find a key that matches ignoring whitespace
          const foundKey = Object.keys(summaryJson).find(
            k => k.replace(/\s+/g, ' ').trim() === regionKey.replace(/\s+/g, ' ').trim()
          );
          regionKey = foundKey || regionKey;
        }
        setRegionSummary(summaryJson[regionKey] || null);
      } catch (err) {
        setSummaryError('Could not load region summary.');
      } finally {
        setSummaryLoading(false);
      }
    }
    if (regionName && !regionNamesLoading) {
      fetchRegionSummary();
    }
  }, [regionName, today, regionNamesLoading]);

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
      <div className="region-detail">
        <div className="region-detail-header">
          <h1 className="region-detail-title"> {regionName} <span style={{fontSize: '.5rem', fontWeight: 400, color: '#b28704'}}> {todayPrettyMDT} MDT</span></h1>
        </div>
        
        {/* D3.js Chart */}
        <div className="chart-container">
          {loading ? (
            <div className="loading-chart">Loading chart...</div>
          ) : (
            <RegionalDataGraph 
              regionId={regionId} 
              data={regionData} 
              headerData={{ header: ['', todayPrettyMDT] }}
              setDownloadGraph={memoizedSetDownloadGraph}
            />
          )}
        </div>

        {loading && <p>Loading region data...</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="predictive-summary-container">
          <h2 className="predictive-summary-label">Region Summary:</h2>
          {summaryLoading && <p className="predictive-summary-loading">Loading region summary...</p>}
          {summaryError && <p className="predictive-summary-error">{summaryError}</p>}
          {!summaryLoading && !summaryError && regionSummary && (
            <pre className="predictive-summary-text">{regionSummary.join('\n')}</pre>
          )}
          {!summaryLoading && !summaryError && !regionSummary && (
            <p className="predictive-summary-error">No summary available for this region.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegionDetail; 