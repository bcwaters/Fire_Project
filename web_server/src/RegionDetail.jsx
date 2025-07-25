import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';

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
  const [regionName, setRegionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regionSummary, setRegionSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    <div>
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'flex-start' }}>
    <button className="back-button" onClick={() => navigate('/')}>← Home</button>
  </div>
    <div className="region-detail">

      <div className="region-detail-header">

        <h1 className="region-detail-title">Fire Analysis for {regionName} <span style={{fontSize: '1rem', fontWeight: 400, color: '#b28704'}}> {todayPrettyMDT} MDT</span></h1>

      </div>
      <img
        src={`/data/${today}/regions/fire_analysis_region_${regionId}.png`}
        alt={`Fire analysis for ${regionName}`}
        className="full-image region-zoomable-image"
        onClick={() => setModalOpen(true)}
      />
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" style={{ padding: 0, background: 'none', boxShadow: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} onClick={e => e.stopPropagation()}>
            <button className="close-button" style={{ position: 'absolute', top: 20, right: 30, zIndex: 2 }} onClick={() => setModalOpen(false)}>&times;</button>
            <img
              src={`/data/${today}/regions/fire_analysis_region_${regionId}.png`}
              alt={`Fire analysis for ${regionName} full size`}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
                background: 'white',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </div>
        </div>
      )}
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