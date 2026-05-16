import React, { useState, useEffect, useMemo } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import RegionDetail from './RegionDetail.jsx'
import Layout from './Layout.jsx'
import './styles/App.css'
import NationalSummary from './NationalSummary.jsx'
import { RegionProvider, useRegionNames } from './RegionContext.jsx'
import NationalAcresChart from './components/NationalAcresChart.jsx'
import RegionAcresChart from './components/RegionAcresChart.jsx'

function Dashboard() {
  const today = useMemo(() => {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }, []);

  const [loading, setLoading] = useState(false); // regionNames now comes from props
  const [summaryRows, setSummaryRows] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [header, setHeader] = useState([]);
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const params = useParams(); // <-- Add this line
  const { regionNames, regionFileIds, loading: regionNamesLoading } = useRegionNames();
  const [isMobile, setIsMobile] = useState(false);

  // Dynamically generate regions array from regionNames keys
  const regions = Object.keys(regionNames).map(key => parseInt(key)).sort((a, b) => a - b);
  const sitReportHeaderRows = useMemo(() => {
    const [reportTitle = '', issuedAt = '', preparednessLevel = ''] = header;

    return [
      { label: 'Report', value: reportTitle.trim() || 'Unavailable' },
      { label: 'Issued', value: issuedAt.trim() || 'Unavailable' },
      { label: 'Preparedness Level', value: preparednessLevel.trim() || 'Unavailable' }
    ];
  }, [header]);
  const sitReportRows = useMemo(() => {
    return [...sitReportHeaderRows, ...summaryRows];
  }, [sitReportHeaderRows, summaryRows]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
  }

  useEffect(() => {
    if (params.region) {
      navigate(`/region/${params.region}`);
    }else{
      setSelectedRegion(""); // <-- Fix function name
    }
  }, [params.region]);

  const cleanSummaryString = (data) => {

    let cleanSummary = data.summary.replace(/Understanding the IMSR\s*/g, '').replace(/IMSR Map\s*/g, '');
    // Remove "Fire Activity and Teams Assigned Totals"
    cleanSummary = cleanSummary.replace(/Fire Activity and Teams Assigned Totals\s*/g, '');
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

  const renderSitReportTable = () => (
    <table className="sit-report-header-table fire-activity-table" aria-label="SIT report summary">
      <tbody>
        {sitReportRows.map((row, index) => (
          <tr key={`${row.label}-${index}`}>
            <th scope="row">{row.label}</th>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

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

  

  if (loading || summaryLoading || regionNamesLoading) {
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
          <h1>NIFC daily SIT report graphs</h1>
          <h2 className="predictive-summary-label">Incident Graphs are updated daily at 7:30am MDT.</h2>
          {renderSitReportTable()}
        </div>

        <div className="graph-card national-landing-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/national')}>
          <h2>National Fire Summary</h2>
          <div className="graph-wrapper">
            <NationalAcresChart isMobile={isMobile} today={today}/>
          </div>
        </div>
      </section>

      <section className="regions-section" aria-label="Regional fire summaries">
        <div className="regions-section-header">
          <h2>Regions</h2>
        </div>
        <div className="graphs-container">
          {regions.map((region) => (
            <div key={region} onClick={() => navigate(`/region/${region}`)} className="graph-card">
              <h2>{regionNames[region] || `Region ${region}`}</h2>
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
            <Route path="national" element={<NationalSummary today={today} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RegionProvider>
  );
}

export default App
