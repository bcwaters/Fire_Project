import React, { useEffect, useRef, useState } from 'react';
import AcresChart from './AcresChart';

const RegionAcresChart = ({ regionId, regionName, isMobile = false }) => {
  const svgRef = useRef();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    fetch(`/data/${today}/regions/Region_${regionId}_${today}.json`)
      .then(response => {
        if (!response.ok) throw new Error('Region data not found');
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading region data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [regionId]);

  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Parse and clean data similar to ChartContainer
    const processedData = data.map(incident => ({
      name: incident['Incident Name'] || 'Unknown',
      totalAcres: parseFloat((incident['Total Acres'] || '0').replace(',', '')) || 0,
      containedPercent: parseInt(incident['%']) || 0,
      personnel: incident['Total PPL'] === 'UNK' ? 0 : 
                 parseInt((incident['Total PPL'] || '0').split('/')[0].replace(',', '')) || 0,
      changePersonnel: parseInt((incident['Chge in PPL'] || '0').replace(',', '')) || 0,
      crews: parseInt(incident['Crw']) || 0,
      engines: parseInt(incident['Eng']) || 0,
      helicopters: parseInt(incident['Heli']) || 0,
      costToDate: incident['$$ CTD'] || '0'
    }));

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
      title: `${regionName} - Acres and Containment`,
      showContainment: true,
      isMobile: isMobile
    });

  }, [data, regionName, isMobile]);

  if (loading) {
    return <div className="loading-chart">Loading chart...</div>;
  }

  if (error) {
    return <div className="error-message">Chart not available for {regionName}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="error-message">No data available for {regionName}</div>;
  }

  return (
    <div className="region-acres-chart">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RegionAcresChart; 