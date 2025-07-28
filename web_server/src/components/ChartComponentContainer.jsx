import React, { useEffect, useRef, useState } from 'react';
import AcresChart from './AcresChart';
import PersonnelChart from './PersonnelChart';
import ResourcesChart from './ResourcesChart';
import DetailsTable from './DetailsTable';
import './ChartComponentContainer.css';

const ChartComponentContainer = ({ 
  data, 
  regionId, 
  headerData, 
  isRegional = true,
  className = "chart-component-container"
}) => {
  const acresSvgRef = useRef();
  const personnelSvgRef = useRef();
  const resourcesSvgRef = useRef();
  const detailsSvgRef = useRef();
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [resizeKey, setResizeKey] = useState(0); // Add key to force re-render on resize
  const [chartHeight, setChartHeight] = useState(350); // Default height

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate chart dimensions when mobile state changes
  useEffect(() => {
    const containerElement = acresSvgRef.current?.parentElement;
    const containerWidth = containerElement ? containerElement.clientWidth : window.innerWidth;
    const maxWidth = 1300; // Maximum width to prevent charts from becoming too wide
    const effectiveWidth = Math.min(containerWidth, maxWidth);
    
    let newChartHeight;
    
    if (isMobile) {
      // Mobile layout: full width charts with proportional height
      newChartHeight = Math.min(effectiveWidth * 0.8, 300); // 40% of width, max 300px
    } else {
      // Desktop layout: 2x2 grid - use full width for each chart
      newChartHeight = 350; // Fixed height for each chart
    }
    
    setChartHeight(newChartHeight);
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
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [data]);

  useEffect(() => {
    if (!data || data.length === 0) {
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
      : data.map(incident => ({
          name: incident['GACC'],
          totalAcres: parseFloat(incident['Cumulative Acres'].replace(',', '')) || 0,
          incidents: parseInt(incident['Incidents']) || 0,
          personnel: parseInt(incident['Total Personnel'].replace(',', '')) || 0,
          changePersonnel: parseInt(incident['Change in Personnel']) || 0,
          crews: parseInt(incident['Crews']) || 0,
          engines: parseInt(incident['Engines']) || 0,
          helicopters: parseInt(incident['Helicopters']) || 0
        }));

    // Responsive dimensions for individual charts
    const containerElement = acresSvgRef.current?.parentElement;
    const containerWidth = containerElement ? containerElement.clientWidth : window.innerWidth;
    const maxWidth = 1300; // Maximum width to prevent charts from becoming too wide
    const effectiveWidth = Math.min(containerWidth, maxWidth);
    
    let chartWidth;
    
    if (isMobile) {
      // Mobile layout: full width charts with proportional height
      chartWidth = effectiveWidth;
    } else {
      // Desktop layout: 2x2 grid - use full width for each chart
      chartWidth = effectiveWidth; // Use full width instead of dividing by 2
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

    // Clear and create Details Table SVG
    d3.select(detailsSvgRef.current).selectAll("*").remove();
    const detailsSvg = d3.select(detailsSvgRef.current)
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
    
    // Chart 4: Details Table
    DetailsTable({ 
      svg: detailsSvg,
      data: processedData, 
      width: chartWidth, 
      height: chartHeight, 
      xOffset: 0, 
      yOffset: 0,
      title: 'Details',
      isRegional: isRegional,
      isMobile: isMobile
    });

    setLoading(false);
  }, [data, regionId, headerData, isRegional, isMobile, resizeKey]);

  if (loading) {
    return <div>Loading chart...</div>;
  }

  if (!data || data.length === 0) {
    return <div>No data available{isRegional ? ' for this region.' : ' for national summary.'}</div>;
  }

  return (
    <div className={className}>
      <div className={`chart-grid ${isMobile ? 'mobile' : 'desktop'}`}>
        <div 
          className="chart-item" 
          style={{ height: chartHeight + 25 + 'px' }}
        >
          <svg ref={acresSvgRef} style={{ height: chartHeight + 20 + 'px' }}></svg>
        </div>
        <div 
          className="chart-item" 
          style={{ height: chartHeight + 25 + 'px' }}
        >
          <svg ref={personnelSvgRef} style={{ height: chartHeight + 20 + 'px' }}></svg>
        </div>
        <div 
          className="chart-item" 
          style={{ height: chartHeight + 25 + 'px' }}
        >
          <svg ref={resourcesSvgRef} style={{ height: chartHeight + 20 + 'px' }}></svg>
        </div>
        <div 
          className="chart-item" 
          style={{ height: chartHeight + 25 + 'px' }}
        >
          <svg ref={detailsSvgRef} style={{ height: chartHeight + 20 + 'px' }}></svg>
        </div>
      </div>
    </div>
  );
};

export default ChartComponentContainer; 