import React, { useEffect, useRef, useState } from 'react';
import AcresChart from './AcresChart';
import PersonnelChart from './PersonnelChart';
import ResourcesChart from './ResourcesChart';
import DetailsTable from './DetailsTable';

const ChartContainer = ({ 
  data, 
  regionId, 
  headerData, 
  isRegional = true,
  className = "chart-container"
}) => {
  const svgRef = useRef();
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [resizeKey, setResizeKey] = useState(0); // Add key to force re-render on resize

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

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

    // Responsive dimensions - no margins
    let width, height, gap, verticalGap, subplotWidth, subplotHeight;
    
    // Get the actual container width instead of window width
    const containerElement = svgRef.current?.parentElement;
    const containerWidth = containerElement ? containerElement.clientWidth : window.innerWidth;
    const maxWidth = 1300; // Maximum width to prevent charts from becoming too wide
    const effectiveWidth = Math.min(containerWidth, maxWidth);
    
    if (isMobile) {
      // Mobile layout: single column, full width
      width = effectiveWidth;
      height = 1200; // Taller for stacked layout
      gap = 20;
      verticalGap = 40;
      subplotWidth = width;
      subplotHeight = 250; // Fixed height for each chart
    } else {
      // Desktop layout: 2x2 grid, full width
      width = effectiveWidth;
      height = 800;
      gap = 40; // Horizontal gap between columns
      verticalGap = 60; // Vertical gap between rows
      subplotWidth = (width - gap) / 2;
      subplotHeight = (height - verticalGap) / 2;
    }

    // Create SVG container - no margins
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g');

    // Create chart container IDs for individual components
    const chartContainerId = `chart-container-${Date.now()}`;
    svg.attr('id', chartContainerId);

    // Chart positioning based on layout
    let chart1X = 0, chart1Y = isMobile ? 0 : 40; // Add top margin for desktop
    let chart2X = isMobile ? 0 : subplotWidth + gap, chart2Y = isMobile ? subplotHeight + verticalGap : 40;
    let chart3X = 0, chart3Y = isMobile ? 2 * (subplotHeight + verticalGap) : subplotHeight + verticalGap + 40;
    let chart4X = isMobile ? 0 : subplotWidth + gap, chart4Y = isMobile ? 3 * (subplotHeight + verticalGap) : subplotHeight + verticalGap + 40;

    // Chart 1: Total Acres and Containment
    if (isRegional) {
      AcresChart({ 
        svg: svg,
        data: processedData, 
        width: subplotWidth, 
        height: subplotHeight, 
        xOffset: chart1X, 
        yOffset: chart1Y,
        title: 'Total Acres and Containment',
        showContainment: true,
        isMobile: isMobile
      });
    } else {
      AcresChart({ 
        svg: svg,
        data: processedData, 
        width: subplotWidth, 
        height: subplotHeight, 
        xOffset: chart1X, 
        yOffset: chart1Y,
        title: 'Cumulative Acres by GACC',
        showContainment: false,
        isMobile: isMobile
      });
    }
    
    // Chart 2: Personnel
    PersonnelChart({ 
      svg: svg,
      data: processedData, 
      width: subplotWidth, 
      height: subplotHeight, 
      xOffset: chart2X, 
      yOffset: chart2Y,
      title: isRegional ? 'Personnel' : 'Personnel by GACC',
      isMobile: isMobile
    });
    
    // Chart 3: Resources
    ResourcesChart({ 
      svg: svg,
      data: processedData, 
      width: subplotWidth, 
      height: subplotHeight, 
      xOffset: chart3X, 
      yOffset: chart3Y,
      title: isRegional ? 'Resources' : 'Resources by GACC',
      isMobile: isMobile
    });
    
    // Chart 4: Details Table
    DetailsTable({ 
      svg: svg,
      data: processedData, 
      width: subplotWidth, 
      height: subplotHeight, 
      xOffset: chart4X, 
      yOffset: chart4Y,
      title: 'Details',
      isRegional: isRegional,
      isMobile: isMobile
    });

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', isMobile ? '14px' : '18px')
      .style('font-weight', 'bold')
      .text('');

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
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ChartContainer; 