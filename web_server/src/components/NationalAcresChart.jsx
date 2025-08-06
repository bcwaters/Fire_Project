import React, { useEffect, useRef, useState } from 'react';
import AcresChart from './AcresChart';

  const NationalAcresChart = ({ isMobile = false, today }) => {
  const svgRef = useRef();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use the same date as the RegionProvider
    
    fetch(`/data/${today}/fire_summary_${today}.json`)
      .then(response => {
        if (!response.ok) throw new Error('National data not found');
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading national data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Parse and clean data similar to ChartContainer for national data
    const processedData = data.map(incident => {
      try {
        return {
          name: incident['GACC'] || 'Unknown',
          totalAcres: parseFloat((incident['Cumulative Acres'] || '0').replace(/,/g, '')) || 0,
      incidents: parseInt(incident['Incidents']) || 0,
          personnel: parseInt((incident['Total Personnel'] || '0').replace(/,/g, '')) || 0,
      changePersonnel: parseInt(incident['Change in Personnel']) || 0,
      crews: parseInt(incident['Crews']) || 0,
      engines: parseInt(incident['Engines']) || 0,
      helicopters: parseInt(incident['Helicopters']) || 0
        };
      } catch (error) {
        console.error('Error parsing incident data:', error, incident);
        return {
          name: incident['GACC'] || 'Unknown',
          totalAcres: 0,
          incidents: 0,
          personnel: 0,
          changePersonnel: 0,
          crews: 0,
          engines: 0,
          helicopters: 0
        };
      }
    }).filter(item => item.name !== 'Unknown' && item.totalAcres > 0);

    // Responsive dimensions
    const containerElement = svgRef.current?.parentElement;
    const containerWidth = containerElement ? containerElement.clientWidth : 400;
    const width = Math.min(containerWidth, 600);
    const height = 300;

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g');

    // Create acres chart
    AcresChart({ 
      svg: svg,
      data: processedData, 
      width: width, 
      height: height, 
      xOffset: 0, 
      yOffset: 0,
      title: 'National Fire Summary - Cumulative Acres by GACC',
      showContainment: false,
      isMobile: isMobile
    });

  }, [data, isMobile]);

  if (loading) {
    return <div className="loading-chart">Loading chart...</div>;
  }

  if (error) {
    return <div className="error-message">Chart not available for national summary</div>;
  }

  if (!data || data.length === 0) {
    return <div className="error-message">No national data available</div>;
  }

  return (
    <div className="national-acres-chart">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default NationalAcresChart; 