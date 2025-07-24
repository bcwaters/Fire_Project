import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';

function RegionDetail() {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [regionData, setRegionData] = useState(null);
  const [regionName, setRegionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regionSummary, setRegionSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Load region names
        const keyResp = await fetch(`/data/${today}/regions/region_key_${today}.json`);
        const keyJson = await keyResp.json();
        setRegionName(keyJson[regionId] || `Region ${regionId}`);
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
    if (regionName) {
      fetchRegionSummary();
    }
  }, [regionName, today]);

  return (
    <div className="region-detail">
      <div className="region-detail-header">
        <h1 className="region-detail-title">Fire Analysis for {regionName}</h1>
        <button className="back-button" onClick={() => navigate('/')}>← Back to Home Page</button>
      </div>
      <img
        src={`/data/${today}/regions/fire_analysis_region_${regionId}.png`}
        alt={`Fire analysis for ${regionName}`}
        className="full-image"
        style={{ maxWidth: '100%', margin: '2rem 0' }}
      />
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
  );
}

export default RegionDetail; 