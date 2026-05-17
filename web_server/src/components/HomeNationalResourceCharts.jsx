import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PersonnelChart from './PersonnelChart';
import ResourcesChart from './ResourcesChart';

const HomeNationalResourceCharts = ({ today }) => {
  const personnelSvgRef = useRef();
  const resourcesSvgRef = useRef();
  const personnelContainerRef = useRef();
  const resourcesContainerRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [resizeKey, setResizeKey] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/data/${today}/fire_summary_${today}.json`)
      .then(response => {
        if (!response.ok) throw new Error('National fire summary not found');
        return response.json();
      })
      .then(setData)
      .catch(err => {
        console.error('Error loading home national resource charts:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [today]);

  useEffect(() => {
    const handleResize = () => {
      setResizeKey(prev => prev + 1);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const processedData = data
      .map(row => ({
        name: row['GACC'] || 'Unknown',
        personnel: parseInt((row['Total Personnel'] || '0').replace(/,/g, '')) || 0,
        changePersonnel: parseInt((row['Change in Personnel'] || '0').replace(/,/g, '')) || 0,
        crews: parseInt((row['Crews'] || '0').replace(/,/g, '')) || 0,
        engines: parseInt((row['Engines'] || '0').replace(/,/g, '')) || 0,
        helicopters: parseInt((row['Helicopters'] || '0').replace(/,/g, '')) || 0
      }))
      .filter(row => row.name !== 'Unknown' && row.name !== 'Total');

    const chartHeight = isMobile ? 300 : 350;
    const renderChart = (svgRef, containerRef, renderFn, title) => {
      const containerWidth = containerRef.current?.clientWidth || 400;
      const width = Math.min(containerWidth, 650);
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', chartHeight)
        .attr('viewBox', `0 0 ${width} ${chartHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      svg.selectAll('*').remove();
      renderFn({
        svg: svg.append('g'),
        data: processedData,
        width,
        height: chartHeight,
        xOffset: 0,
        yOffset: 0,
        title,
        isMobile
      });
    };

    renderChart(personnelSvgRef, personnelContainerRef, PersonnelChart, 'Personnel by GACC');
    renderChart(resourcesSvgRef, resourcesContainerRef, ResourcesChart, 'Resources by GACC');
  }, [data, isMobile, resizeKey]);

  if (loading) {
    return <div className="loading-chart">Loading charts...</div>;
  }

  if (error) {
    return <div className="error-message">Resource charts are not available.</div>;
  }

  if (!data.length) {
    return <div className="error-message">No resource data available.</div>;
  }

  return (
    <section className="home-national-charts" aria-label="National resource charts">
      <div className="graph-card home-national-chart-card" ref={personnelContainerRef}>
        <div className="graph-wrapper">
          <svg ref={personnelSvgRef}></svg>
        </div>
      </div>
      <div className="graph-card home-national-chart-card" ref={resourcesContainerRef}>
        <div className="graph-wrapper">
          <svg ref={resourcesSvgRef}></svg>
        </div>
      </div>
    </section>
  );
};

export default HomeNationalResourceCharts;
