import { useNavigate } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';

function NationalSummary() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const navigate = useNavigate();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="national-summary-detail">
      <div className="region-detail-header">
        <h1 className="region-detail-title">National Fire Summary</h1>
        <button className="back-button" onClick={() => navigate('/')}>← Back to Dashboard</button>
      </div>
      <img
        src={`data/${today}/fire_summary_analysis.png`}
        alt="National fire summary analysis"
        className="full-image"
        style={{ maxWidth: '100%', margin: '2rem 0' }}
      />
      <div className="predictive-summary-container">
        <h2 className="predictive-summary-label">Predictive Services Discussion:</h2>
        {loading && <p className="predictive-summary-loading">Loading predictive summary...</p>}
        {error && <p className="predictive-summary-error">{error}</p>}
        {!loading && !error && (
          <pre className="predictive-summary-text">{summary}</pre>
        )}
      </div>
    </div>
  );
}

export default NationalSummary; 