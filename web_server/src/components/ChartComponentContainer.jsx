import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import AcresChart from './AcresChart';
import PersonnelChart from './PersonnelChart';
import ResourcesChart from './ResourcesChart';
import '../styles/ChartComponentContainer.css';

const ChartComponentContainer = ({ 
  data, 
  regionId, 
  headerData, 
  isRegional = true,
  className = "chart-component-container",
  topLeftContent = null
}) => {
  const acresSvgRef = useRef();
  const personnelSvgRef = useRef();
  const resourcesSvgRef = useRef();
  const containerRef = useRef();
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [resizeKey, setResizeKey] = useState(0); // Add key to force re-render on resize
  const [chartHeight, setChartHeight] = useState(350); // Default height
  const [processedDataRows, setProcessedDataRows] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate chart dimensions when mobile state changes - use useLayoutEffect for initial sizing
  useLayoutEffect(() => {
    const calculateDimensions = () => {
      // Try to get container width from the actual container element first
      let containerWidth;
      
      if (containerRef.current) {
        containerWidth = containerRef.current.clientWidth;
      } else if (acresSvgRef.current?.parentElement) {
        containerWidth = acresSvgRef.current.parentElement.clientWidth;
      } else {
        // Fallback to window width if container not available yet
        containerWidth = window.innerWidth;
      }
      
      const maxWidth = 1300; // Maximum width to prevent charts from becoming too wide
      const effectiveWidth = Math.min(containerWidth, maxWidth);
      
      let newChartHeight;
      
      if (isMobile) {
        // Mobile layout: full width charts with proportional height
        newChartHeight = Math.min(effectiveWidth * 0.8, 300); // 80% of width, max 300px
      } else {
        // Desktop layout: 2x2 grid - use full width for each chart
        newChartHeight = 350; // Fixed height for each chart
      }
      
      setChartHeight(newChartHeight);
    };

    // Add a small delay to ensure DOM is ready, then calculate dimensions
    const timer = setTimeout(calculateDimensions, 50);
    
    return () => clearTimeout(timer);
  }, [isMobile]);

  // Handle container resize for chart redrawing
  useEffect(() => {
    let resizeTimeout;
    
    const handleResize = () => {
      // Clear previous timeout to debounce resize events
      clearTimeout(resizeTimeout);
      
      // Trigger chart redraw when window resizes
      if (data && data.length > 0) {
        // Use a key to force re-render instead of loading state
        resizeTimeout = setTimeout(() => {
          setResizeKey(prev => prev + 1);
        }, 100);
      }
    };
    
    // Add ResizeObserver to watch container size changes
    let resizeObserver;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearTimeout(resizeTimeout);
    };
  }, [data]);

  useEffect(() => {
    setLoading(true);

    if (!data || data.length === 0) {
      setProcessedDataRows([]);
      d3.select(acresSvgRef.current).selectAll("*").remove();
      d3.select(personnelSvgRef.current).selectAll("*").remove();
      d3.select(resourcesSvgRef.current).selectAll("*").remove();
      setLoading(false);
      return;
    }

    // Parse and clean data similar to Python visualization
    const processedData = isRegional 
      ? data.map(incident => ({
          name: incident['Incident Name'],
          totalAcres: parseFloat(incident['Total Acres'].replace(',', '')) || 0,
          containedPercent: parseInt(incident['%']) || 0,
          personnel: incident['Total PPL'] === 'UNK' ? 0 : 
                     parseInt(incident['Total PPL'].split('/')[0].replace(',', '')) || 0,
          changePersonnel: parseInt(incident['Chge in PPL'].replace(',', '')) || 0,
          crews: parseInt(incident['Crw']) || 0,
          engines: parseInt(incident['Eng']) || 0,
          helicopters: parseInt(incident['Heli']) || 0,
          costToDate: incident['$$ CTD'] || '0'
        }))
      : data.map(incident => (
        console.log("incident:", incident),
        {
          name: incident['GACC'],
          totalAcres: parseInt(incident['Cumulative Acres'].replaceAll(',', '')) || 0,
          incidents: parseInt(incident['Incidents']) || 0,
          personnel: parseInt(incident['Total Personnel'].replaceAll(',', '')) || 0,
          changePersonnel: parseInt(incident['Change in Personnel'].replaceAll(',', '')) || 0,
          crews: parseInt(incident['Crews']) || 0,
          engines: parseInt(incident['Engines']) || 0,
          helicopters: parseInt(incident['Helicopters']) || 0
        }));
    setProcessedDataRows(processedData);

    // Responsive dimensions for individual charts
    let containerWidth;
    
    if (containerRef.current) {
      containerWidth = containerRef.current.clientWidth;
    } else if (acresSvgRef.current?.parentElement) {
      containerWidth = acresSvgRef.current.parentElement.clientWidth;
    } else {
      containerWidth = window.innerWidth;
    }
    
    const maxWidth = 1300; // Maximum width to prevent charts from becoming too wide
    const effectiveWidth = Math.min(containerWidth, maxWidth);
    
    let chartWidth;
    
    if (isMobile) {
      // Mobile layout: full width charts with proportional height
      chartWidth = effectiveWidth;
    } else {
      // Desktop layout: 2x2 grid - use half width for each chart
      chartWidth = effectiveWidth / 2; // Divide by 2 for 2x2 grid
    }

    // Clear and create Acres Chart SVG
    d3.select(acresSvgRef.current).selectAll("*").remove();
    const acresSvg = d3.select(acresSvgRef.current)
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g');

    // Clear and create Personnel Chart SVG
    d3.select(personnelSvgRef.current).selectAll("*").remove();
    const personnelSvg = d3.select(personnelSvgRef.current)
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g');

    // Clear and create Resources Chart SVG
    d3.select(resourcesSvgRef.current).selectAll("*").remove();
    const resourcesSvg = d3.select(resourcesSvgRef.current)
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g');

    // Chart 1: Total Acres and Containment
    if (isRegional) {
      AcresChart({ 
        svg: acresSvg,
        data: processedData, 
        width: chartWidth, 
        height: chartHeight, 
        xOffset: 0, 
        yOffset: 0,
        title: 'Total Acres and Containment',
        showContainment: true,
        isMobile: isMobile
      });
    } else {
      AcresChart({ 
        svg: acresSvg,
        data: processedData, 
        width: chartWidth, 
        height: chartHeight, 
        xOffset: 0, 
        yOffset: 0,
        title: 'Cumulative Acres by GACC',
        showContainment: false,
        isMobile: isMobile
      });
    }
    
    // Chart 2: Personnel
    PersonnelChart({ 
      svg: personnelSvg,
      data: processedData, 
      width: chartWidth, 
      height: chartHeight, 
      xOffset: 0, 
      yOffset: 0,
      title: isRegional ? 'Personnel' : 'Personnel by GACC',
      isMobile: isMobile
    });
    
    // Chart 3: Resources
    ResourcesChart({ 
      svg: resourcesSvg,
      data: processedData, 
      width: chartWidth, 
      height: chartHeight, 
      xOffset: 0, 
      yOffset: 0,
      title: isRegional ? 'Resources' : 'Resources by GACC',
      isMobile: isMobile
    });
    
    setLoading(false);
  }, [data, regionId, headerData, isRegional, isMobile,  chartHeight]);

  if (loading && (!data || data.length === 0)) {
    return <div>Loading chart...</div>;
  }

  if (!data || data.length === 0) {
    return <div>No data available{isRegional ? ' for this region.' : ' for national summary.'}</div>;
  }

  const chartItemHeight = chartHeight + 50;
  const hasTopLeftContent = Boolean(topLeftContent);

  const formatDetailValue = (value) => {
    if (typeof value === 'number') return value.toLocaleString();
    return value || 'N/A';
  };

  const renderDetailSentence = (row, rowIndex) => {
    if (isRegional) {
      return (
        <p key={`${row.name}-${rowIndex}`}>
          <strong>{row.name}:</strong> Currently {formatDetailValue(row.containedPercent)}% contained at a cost of {formatDetailValue(row.costToDate)} with {formatDetailValue(row.personnel)} personnel made up of {formatDetailValue(row.crews)} crews, {formatDetailValue(row.engines)} engines, and {formatDetailValue(row.helicopters)} helicopters.
        </p>
      );
    }

    return (
      <p key={`${row.name}-${rowIndex}`}>
        <strong>{row.name}:</strong> Currently reporting {formatDetailValue(row.incidents)} incidents and {formatDetailValue(row.totalAcres)} acres with {formatDetailValue(row.personnel)} personnel, {formatDetailValue(row.crews)} crews, {formatDetailValue(row.engines)} engines, {formatDetailValue(row.helicopters)} helicopters, and a personnel change of {formatDetailValue(row.changePersonnel)}.
      </p>
    );
  };

  return (
    <div className={className} ref={containerRef}>
      <div className={`chart-grid ${isMobile ? 'mobile' : 'desktop'} ${hasTopLeftContent ? 'regional-detail-layout' : ''}`}>
        {hasTopLeftContent && (
          <div className="chart-item region-summary-grid-item">
            {topLeftContent}
          </div>
        )}
        {hasTopLeftContent ? (
          <div className="chart-column-stack regional-graph-stack">
            <div
              className="chart-item acres-chart-item modal-trigger-chart"
              role="button"
              tabIndex={0}
              aria-label="Show incident line items"
              style={{ height: chartItemHeight + 'px' }}
              onClick={() => setShowDetailsModal(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setShowDetailsModal(true);
                }
              }}
            >
              <svg ref={acresSvgRef} style={{ height: chartItemHeight + 'px' }}></svg>
            </div>
            <div
              className="chart-item personnel-chart-item modal-trigger-chart"
              role="button"
              tabIndex={0}
              aria-label="Show incident line items"
              style={{ height: chartItemHeight + 'px' }}
              onClick={() => setShowDetailsModal(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setShowDetailsModal(true);
                }
              }}
            >
              <svg ref={personnelSvgRef} style={{ height: chartItemHeight + 'px' }}></svg>
            </div>
            <div
              className="chart-item resources-chart-item modal-trigger-chart"
              role="button"
              tabIndex={0}
              aria-label="Show incident line items"
              style={{ height: chartItemHeight + 'px' }}
              onClick={() => setShowDetailsModal(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setShowDetailsModal(true);
                }
              }}
            >
              <svg ref={resourcesSvgRef} style={{ height: chartItemHeight + 'px' }}></svg>
            </div>
          </div>
        ) : (
          <>
            <div
              className="chart-item acres-chart-item"
              style={{ height: chartItemHeight + 'px' }}
            >
              <svg ref={acresSvgRef} style={{ height: chartItemHeight + 'px' }}></svg>
            </div>
            <div
              className="chart-item details-chart-item"
            >
              <div className="details-html-table-container">
                <div className="details-sentence-list">
                  {processedDataRows.map(renderDetailSentence)}
                </div>
              </div>
            </div>
            <div className="chart-column-stack personnel-resources-stack">
              <div
                className="chart-item personnel-chart-item"
                style={{ height: chartItemHeight + 'px' }}
              >
                <svg ref={personnelSvgRef} style={{ height: chartItemHeight + 'px' }}></svg>
              </div>
              <div
                className="chart-item resources-chart-item"
                style={{ height: chartItemHeight + 'px' }}
              >
                <svg ref={resourcesSvgRef} style={{ height: chartItemHeight + 'px' }}></svg>
              </div>
            </div>
          </>
        )}
      </div>
      {showDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div 
            className="modal-content regional-line-items-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="regional-line-items-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="regional-line-items-title">Incident line items</h3>
              <button className="close-button" type="button" aria-label="Close" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="details-sentence-list">
                {processedDataRows.map(renderDetailSentence)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartComponentContainer; 
