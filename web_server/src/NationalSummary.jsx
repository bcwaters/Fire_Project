import { useNavigate } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';

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
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const todayPrettyMDT = getTodayMDTPretty();
  const navigate = useNavigate();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <div>
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'flex-start' }}>
    <button className="back-button" onClick={() => navigate('/')}>← Home</button>
  </div>
    <div className="national-summary-detail">
      <div className="region-detail-header">
        <h1 className="region-detail-title">National Fire Summary <span style={{fontSize: '1rem', fontWeight: 400, color: '#b28704'}}> {todayPrettyMDT} MDT</span></h1>

      </div>
      <img
        src={`data/${today}/fire_summary_analysis.png`}
        alt="National fire summary analysis"
        className="full-image zoomable-image"
        onClick={() => setModalOpen(true)}
      />
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" style={{ padding: 0, background: 'none', boxShadow: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} onClick={e => e.stopPropagation()}>
            <button className="close-button" style={{ position: 'absolute', top: 20, right: 30, zIndex: 2 }} onClick={() => setModalOpen(false)}>&times;</button>
            <img
              src={`data/${today}/fire_summary_analysis.png`}
              alt="National fire summary analysis full size"
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