import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

function RegionDetail({ today } ) {
  const { regionId } = useParams();
  // Use the same date as the RegionProvider

  const todayPrettyMDT = getTodayMDTPretty();
  const [regionData, setRegionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regionSummary, setRegionSummary] = useState({ metrics: [], incidents: [] });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const { regionNames, regionFileIds, loading: regionNamesLoading } = useRegionNames();

  // Get region name from context - use useMemo to prevent unnecessary recalculations
  const regionName = React.useMemo(() => {
    return regionNames[regionId] || `Region ${regionId}`;
  }, [regionNames, regionId]);
  const regionFileId = regionFileIds[regionId] || regionId;

  const parseRegionSummary = (summaryLines) => {
    const metrics = [];
    const incidents = [];
    let currentIncident = [];
    let inIncidentDetails = false;

    summaryLines.forEach((rawLine) => {
      const line = rawLine.replace(/\s+/g, ' ').trim();

      if (!line) {
        if (currentIncident.length > 0) {
          incidents.push(currentIncident.join(' '));
          currentIncident = [];
        }
        return;
      }

      if (line === 'Fire Activity and Teams Assigned Totals') {
        return;
      }

      const [label, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      if (!inIncidentDetails && value) {
        metrics.push({
          label: label.trim(),
          value
        });
        return;
      }

      inIncidentDetails = true;
      currentIncident.push(line);
    });

    if (currentIncident.length > 0) {
      incidents.push(currentIncident.join(' '));
    }

    return { metrics, incidents };
  };

  const renderRegionSummary = () => (
    <div className="region-summary-panel-content">
      {summaryLoading && <p className="predictive-summary-loading">Loading region summary...</p>}
      {summaryError && <p className="predictive-summary-error">{summaryError}</p>}
      {!summaryLoading && !summaryError && (
        <>
          {regionSummary.incidents.length > 0 && (
            <div className="region-incident-list" aria-label={`${regionName} incident summaries`}>
              {regionSummary.incidents.map((incident, index) => (
                <p key={index}>{incident}</p>
              ))}
            </div>
          )}
          {!regionSummary.incidents.length && (
            <p className="predictive-summary-error">No summary available for this region.</p>
          )}
        </>
      )}
    </div>
  );

  useEffect(() => {
    let isCurrent = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      setRegionData(null);

      try {
        // Load region data
        const dataResp = await fetch(`/data/${today}/regions/Region_${regionFileId}_${today}.json`);
        if (!dataResp.ok) throw new Error('Region data not found');
        const dataJson = await dataResp.json();
        if (isCurrent) {
          setRegionData(dataJson);
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message);
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }
    
    // Only fetch if region names are loaded
    if (!regionNamesLoading) {
      fetchData();
    }

    return () => {
      isCurrent = false;
    };
  }, [regionId, regionFileId, today, regionNamesLoading]);

  useEffect(() => {
    let isCurrent = true;

    async function fetchRegionSummary() {
      setSummaryLoading(true);
      setSummaryError(null);
      setRegionSummary({ metrics: [], incidents: [] });

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

        const summaryLines = summaryJson[regionKey] || [];
        if (isCurrent) {
          setRegionSummary(parseRegionSummary(summaryLines));
        }
      } catch (err) {
        if (isCurrent) {
          setSummaryError('Could not load region summary.');
        }
      } finally {
        if (isCurrent) {
          setSummaryLoading(false);
        }
      }
    }
    
    // Only fetch if region names are loaded and we have a valid region name
    if (!regionNamesLoading && regionNames[regionId]) {
      fetchRegionSummary();
    }

    return () => {
      isCurrent = false;
    };
  }, [regionNames, regionId, today, regionNamesLoading]);

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
      <div className="region-detail">
        {/* D3.js Chart */}
        <div className="chart-container">
          {loading ? (
            <div className="loading-chart">Loading chart...</div>
          ) : (
            <RegionalDataGraph 
              key={`${today}-${regionId}-${regionFileId}`}
              regionId={regionFileId} 
              data={regionData} 
              headerData={{ header: ['', todayPrettyMDT] }}
              topLeftContent={renderRegionSummary()}
            />
          )}
        </div>

        {loading && <p>Loading region data...</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default RegionDetail; 
