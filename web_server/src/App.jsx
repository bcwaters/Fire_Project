import React, { useState, useEffect, useMemo } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import RegionDetail from './RegionDetail.jsx'
import Layout from './Layout.jsx'
import './styles/App.css'
import { RegionProvider, useRegionNames } from './RegionContext.jsx'
import NationalAcresChart from './components/NationalAcresChart.jsx'
import RegionAcresChart from './components/RegionAcresChart.jsx'
import HomeNationalResourceCharts from './components/HomeNationalResourceCharts.jsx'

function Dashboard() {
  const today = useMemo(() => {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }, []);

  const [loading] = useState(false); // regionNames now comes from props
  const [summaryRows, setSummaryRows] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [totalAcres, setTotalAcres] = useState(null);
  const [totalAcresLoading, setTotalAcresLoading] = useState(true);
  const [nationalRows, setNationalRows] = useState([]);
  const [showNationalRowsModal, setShowNationalRowsModal] = useState(false);
  const [header, setHeader] = useState([]);
  const navigate = useNavigate();
  const { regionNames, regionFileIds, loading: regionNamesLoading } = useRegionNames();
  const [isMobile, setIsMobile] = useState(false);

  // Dynamically generate regions array from regionNames keys
  const regions = Object.keys(regionNames).map(key => parseInt(key)).sort((a, b) => a - b);
  const sitReportHeaderRows = useMemo(() => {
    const [, issuedAt = '', preparednessLevel = ''] = header;

    return [
      { label: 'Issued', value: issuedAt.trim() || 'Unavailable' },
      { label: 'Preparedness Level', value: preparednessLevel.trim() || 'Unavailable' }
    ];
  }, [header]);
  const sitReportRows = useMemo(() => {
    const totalAcresRows = totalAcres === null
      ? []
      : [{ label: 'Total Acres', value: totalAcres.toLocaleString() }];

    return [...sitReportHeaderRows, ...totalAcresRows, ...summaryRows];
  }, [sitReportHeaderRows, summaryRows, totalAcres]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cleanSummaryString = (data) => {

    let cleanSummary = data.summary.replace(/Understanding the IMSR\s*/g, '').replace(/IMSR Map\s*/g, '');
    // Remove "Fire Activity and Teams Assigned Totals"
    cleanSummary = cleanSummary.replace(/Fire Activity and Teams Assigned Totals\s*/g, '');
    // Remove the Comp fires block
    const compFiresRegex = /Fires not managed under a full suppression strategy[\s\S]*?can be found in the NWCG glossary\s\sor here/;
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
    setSummaryRows(parseSummaryRows(cleanSummary));
    setSummaryLoading(false);
  }

  const parseSummaryRows = (summaryText) => {
    return summaryText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();

        if (!value) {
          return null;
        }

        return {
          label: label.replace(/\s+/g, ' ').trim(),
          value: value.replace(/\s+/g, ' ').trim()
        };
      })
      .filter(Boolean);
  };

  const renderSitReportSummary = () => (
    <div className="sit-report-sentence-list" aria-label="SIT report summary">
      {sitReportRows.map((row, index) => (
        <p key={`${row.label}-${index}`}>
          <strong>{row.label}:</strong> {row.value}
        </p>
      ))}
    </div>
  );

  const formatDetailValue = (value) => {
    if (typeof value === 'number') return value.toLocaleString();
    return value || 'N/A';
  };

  const nationalRegionLineItems = useMemo(() => {
    return nationalRows
      .map(row => ({
        name: row['GACC'] || 'Unknown',
        incidents: parseInt(row['Incidents']) || 0,
        acres: parseInt((row['Cumulative Acres'] || '0').replace(/,/g, '')) || 0,
        personnel: parseInt((row['Total Personnel'] || '0').replace(/,/g, '')) || 0,
        crews: parseInt(row['Crews']) || 0,
        engines: parseInt(row['Engines']) || 0,
        helicopters: parseInt(row['Helicopters']) || 0,
        changePersonnel: parseInt((row['Change in Personnel'] || '0').replace(/,/g, '')) || 0
      }))
      .filter(row => row.name !== 'Unknown' && row.name !== 'Total');
  }, [nationalRows]);

  useEffect(() => {
    const dailySummaryUrl = `/data/${today}/daily_summary.json`;
    console.log('[init data fetch] daily summary start', { today, url: dailySummaryUrl });

    fetch(dailySummaryUrl)
      .then(response => {
        console.log('[init data fetch] daily summary response', {
          url: dailySummaryUrl,
          status: response.status,
          ok: response.ok
        });

        if (!response.ok) {
          throw new Error(`Daily summary request failed with status ${response.status}`);
        }

        return response.json();
      })
      .then(data => {
        console.log('[init data fetch] daily summary json', data);
        setHeader(data.header || []);
        cleanSummaryString(data); 
      }
        )
      .catch(error => {
        console.error('Error loading daily summary:', error);
        setSummaryRows([{ label: 'Summary', value: 'Not available.' }]);
        setSummaryLoading(false);
      });
  }, [today]);

  useEffect(() => {
    const nationalDataUrl = `/data/${today}/fire_summary_${today}.json`;
    setTotalAcresLoading(true);

    fetch(nationalDataUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`National fire summary request failed with status ${response.status}`);
        }

        return response.json();
      })
      .then(data => {
        setNationalRows(data);
        const acres = data.reduce((sum, row) => {
          const value = parseFloat((row['Cumulative Acres'] || '0').replace(/,/g, '')) || 0;
          return sum + value;
        }, 0);

        setTotalAcres(acres);
      })
      .catch(error => {
        console.error('Error loading national total acres:', error);
        setNationalRows([]);
        setTotalAcres(null);
      })
      .finally(() => {
        setTotalAcresLoading(false);
      });
  }, [today]);

  

  if (loading || summaryLoading || totalAcresLoading || regionNamesLoading) {
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
      <section className="landing-grid" aria-label="Daily national fire overview">
        <div className="welcome-section">
          {renderSitReportSummary()}
        </div>

        <div className="graph-card national-landing-card" style={{ cursor: 'pointer' }} onClick={() => setShowNationalRowsModal(true)}>
          <div className="graph-wrapper">
            <NationalAcresChart isMobile={isMobile} today={today}/>
          </div>
        </div>
      </section>

      {showNationalRowsModal && (
        <div className="modal-overlay" onClick={() => setShowNationalRowsModal(false)}>
          <div className="modal-content national-line-items-modal" role="dialog" aria-modal="true" aria-labelledby="national-line-items-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 id="national-line-items-title">Incidents by GACC</h3>
              <button className="close-button" type="button" aria-label="Close" onClick={() => setShowNationalRowsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="details-sentence-list">
                {nationalRegionLineItems.map((row) => (
                  <p key={row.name}>
                    <strong>{row.name}:</strong> Currently reporting {formatDetailValue(row.incidents)} incidents and {formatDetailValue(row.acres)} acres with {formatDetailValue(row.personnel)} personnel, {formatDetailValue(row.crews)} crews, {formatDetailValue(row.engines)} engines, {formatDetailValue(row.helicopters)} helicopters, and a personnel change of {formatDetailValue(row.changePersonnel)}.
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <HomeNationalResourceCharts today={today} />

      <section className="regions-section" aria-label="Regional fire summaries">
        <div className="regions-section-header">
          <h2>Regions</h2>
        </div>
        <div className="graphs-container">
          {regions.map((region) => (
            <div key={region} onClick={() => navigate(`/region/${region}`)} className="graph-card">
              <div className="graph-wrapper">
                <RegionAcresChart
                  regionId={regionFileIds[region] || region}
                  regionName={regionNames[region] || `Region ${region}`}
                  today={today}
                  isMobile={isMobile}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function App() {
  const today = useMemo(() => {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }, []);
  
  return (
    <RegionProvider today={today}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="region/:regionId" element={<RegionDetail today={today} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RegionProvider>
  );
}

export default App
