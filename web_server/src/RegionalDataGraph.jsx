import React, { useEffect, useRef, useState } from 'react';
import './RegionalDataGraph.css';

const RegionalDataGraph = ({ regionId, data, headerData }) => {
  const svgRef = useRef();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Parse and clean data similar to Python visualization
    const processedData = data.map(incident => ({
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
    }));

    // Set up dimensions with more space for margins
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create subplot layout with gaps
    const gap = 30; // Gap between subplots
    const verticalGap = 90; // Triple the vertical gap
    const subplotWidth = (width - gap) / 2;
    const subplotHeight = (height - verticalGap) / 2;

    // Chart 1: Total Acres and Containment (top-left)
    createAcresChart(svg, processedData, subplotWidth, subplotHeight, 0, 0);
    
    // Chart 2: Personnel (top-right)
    createPersonnelChart(svg, processedData, subplotWidth, subplotHeight, subplotWidth + gap, 0);
    
    // Chart 3: Resources (bottom-left)
    createResourcesChart(svg, processedData, subplotWidth, subplotHeight, 0, subplotHeight + verticalGap);
    
    // Chart 4: Details Table (bottom-right)
    createDetailsTable(svg, processedData, subplotWidth, subplotHeight, subplotWidth + gap, subplotHeight + verticalGap);

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text(``);

    setLoading(false);
  }, [data, regionId, headerData]);

  const createAcresChart = (svg, data, width, height, xOffset, yOffset) => {
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${xOffset}, ${yOffset})`);

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.totalAcres)])
      .range([height, 0]);

    // Add bars for total acres
    chartGroup.selectAll('.acres-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'acres-bar')
      .attr('x', d => x(d.name))
      .attr('y', d => y(d.totalAcres))
      .attr('width', Math.min(x.bandwidth() / 2, 40))
      .attr('height', d => height - y(d.totalAcres))
      .attr('fill', '#36454F') // Charcoal
      .attr('opacity', 0.7);

    // Add bars for scaled containment
    chartGroup.selectAll('.containment-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'containment-bar')
      .attr('x', d => x(d.name) + x.bandwidth() / 2)
      .attr('y', d => y((d.containedPercent / 100) * d.totalAcres))
      .attr('width', Math.min(x.bandwidth() / 2, 40))
      .attr('height', d => height - y((d.containedPercent / 100) * d.totalAcres))
      .attr('fill', '#4e8a4e') // Pastel grey-green
      .attr('opacity', 0.7);

    // Add axes
    chartGroup.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0)) // Remove tick lines
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .text(d => {
        const dataPoint = data.find(item => item.name === d);
        if (dataPoint) {
          return `${d} ${dataPoint.totalAcres.toLocaleString()}`;
        }
        return d;
      });

    chartGroup.append('g')
      .call(d3.axisLeft(y));

    // Add labels
    chartGroup.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Total Acres and Containment');

    // Add legend
    const legend = chartGroup.append('g')
      .attr('transform', `translate(${width - 100}, 20)`);

    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#36454F') // Charcoal
      .attr('opacity', 0.7);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .style('font-size', '10px')
      .text('Total Acres');

    legend.append('rect')
      .attr('y', 20)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#4e8a4e') // Pastel grey-green
      .attr('opacity', 0.7);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 32)
      .style('font-size', '10px')
      .text('Containment');
  };

  const createPersonnelChart = (svg, data, width, height, xOffset, yOffset) => {
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${xOffset}, ${yOffset})`);
  
    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d.changePersonnel) * 1.1, d3.max(data, d => Math.max(d.personnel, Math.abs(d.changePersonnel)))])
      .range([height, 0]);
  
    // Add bars for total personnel
    chartGroup.selectAll('.personnel-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'personnel-bar')
      .attr('x', d => x(d.name))
      .attr('y', d => y(Math.max(0, d.personnel))) // Start at zero or personnel value
      .attr('width', Math.min(x.bandwidth() / 2, 40))
      .attr('height', d => Math.abs(y(d.personnel) - y(0))) // Height from zero to personnel
      .attr('fill', '#36454F') // Charcoal
      .attr('opacity', 0.7);

    // Add bars for change in personnel
    chartGroup.selectAll('.change-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'change-bar')
      .attr('x', d => x(d.name) + x.bandwidth() / 2)
      .attr('y', d => d.changePersonnel >= 0 ? y(d.changePersonnel) : y(0)) // Start at zero for negative values
      .attr('width', Math.min(x.bandwidth() / 2, 40))
      .attr('height', d => Math.abs(y(d.changePersonnel) - y(0))) // Use absolute difference for height
      .attr('fill', d => d.changePersonnel < 0 ? '#8b2513' : '#4e8a4e') // Dark grey-red for negative, pastel grey-green for positive
      .attr('opacity', 0.7);
  
    // Add axes
    chartGroup.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0)) // Remove tick lines
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .text(d => {
        const dataPoint = data.find(item => item.name === d);
        if (dataPoint) {
          return `${d} ${dataPoint.personnel} ${dataPoint.changePersonnel}`;
        }
        return d;
      });
  
    chartGroup.append('g')
      .call(d3.axisLeft(y));
  
    // Add zero line for clarity
    chartGroup.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(0))
      .attr('y2', y(0))
      .attr('stroke', 'black')
      .attr('stroke-width', 1);
  
    // Add labels
    chartGroup.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Personnel');
  
    // Add legend
    const legend = chartGroup.append('g')
      .attr('transform', `translate(${width - 100}, 20)`);

    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#36454F') // Charcoal
      .attr('opacity', 0.7);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .style('font-size', '10px')
      .text('Total');

    legend.append('rect')
      .attr('y', 20)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#8FBC8F') // Pastel grey-green
      .attr('opacity', 0.7);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 32)
      .style('font-size', '10px')
      .text('Change +');

    legend.append('rect')
      .attr('y', 40)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#8b2513') // Dark grey-red
      .attr('opacity', 0.7);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 52)
      .style('font-size', '10px')
      .text('Change -');
  };
  const createResourcesChart = (svg, data, width, height, xOffset, yOffset) => {
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${xOffset}, ${yOffset})`);

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.crews, d.engines, d.helicopters))])
      .range([height, 0]);

    const barWidth = x.bandwidth() / 3;

    // Add bars for crews
    chartGroup.selectAll('.crews-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'crews-bar')
      .attr('x', d => x(d.name))
      .attr('y', d => y(d.crews))
      .attr('width', Math.min(barWidth, 40))
      .attr('height', d => height - y(d.crews))
      .attr('fill', '#696969') // Dark grey
      .attr('opacity', 0.7);

    // Add bars for engines
    chartGroup.selectAll('.engines-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'engines-bar')
      .attr('x', d => x(d.name) + barWidth)
      .attr('y', d => y(d.engines))
      .attr('width', Math.min(barWidth, 40))
      .attr('height', d => height - y(d.engines))
      .attr('fill', '#A9A9A9') // Medium grey
      .attr('opacity', 0.7);

    // Add bars for helicopters
    chartGroup.selectAll('.helicopters-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'helicopters-bar')
      .attr('x', d => x(d.name) + 2 * barWidth)
      .attr('y', d => y(d.helicopters))
      .attr('width', Math.min(barWidth, 40))
      .attr('height', d => height - y(d.helicopters))
      .attr('fill', '#D3D3D3') // Light grey
      .attr('opacity', 0.7);

    // Add axes
    chartGroup.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0)) // Remove tick lines
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .text(d => {
        const dataPoint = data.find(item => item.name === d);
        if (dataPoint) {
          return `${d} ${dataPoint.crews} ${dataPoint.engines} ${dataPoint.helicopters}`;
        }
        return d;
      });

    chartGroup.append('g')
      .call(d3.axisLeft(y));

    // Add labels
    chartGroup.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Resources');

    // Add legend
    const legend = chartGroup.append('g')
      .attr('transform', `translate(${width - 80}, 20)`);

    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#696969') // Dark grey
      .attr('opacity', 0.7);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .style('font-size', '10px')
      .text('Crews');

    legend.append('rect')
      .attr('y', 20)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#A9A9A9') // Medium grey
      .attr('opacity', 0.7);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 32)
      .style('font-size', '10px')
      .text('Engines');

    legend.append('rect')
      .attr('y', 40)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#D3D3D3') // Light grey
      .attr('opacity', 0.7);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 52)
      .style('font-size', '10px')
      .text('Helicopters');
  };

  const createDetailsTable = (svg, data, width, height, xOffset, yOffset) => {
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${xOffset}, ${yOffset})`);

    // Create table background
    chartGroup.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#f5f5f5')
      .attr('stroke', '#ddd')
      .attr('stroke-width', 1);

    // Table header with truncated words
    const headerData = ['Incident', 'Crews', 'Engines', 'Helis', 'Contained', 'Personnel', 'Cost'];
    const truncatedHeaders = headerData.map(h => h.length > 5 ? h.substring(0, 5) : h);
    
    // Column widths with more padding for first column
    const firstColWidth = width * 0.25; // 25% for first column
    const remainingWidth = width - firstColWidth;
    const otherColWidth = remainingWidth / (headerData.length - 1);

    // Header row
    chartGroup.selectAll('.header-cell')
      .data(truncatedHeaders)
      .enter()
      .append('text')
      .attr('class', 'header-cell')
      .attr('x', (d, i) => i === 0 ? 10 : firstColWidth + (i - 1) * otherColWidth + 5)
      .attr('y', 20)
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .text(d => d);

    // Data rows
    data.forEach((row, rowIndex) => {
      const yPos = 40 + rowIndex * 20;
      
      // Incident name (truncated)
      chartGroup.append('text')
        .attr('x', 10)
        .attr('y', yPos)
        .style('font-size', '9px')
        .style('font-family', 'monospace')
        .text(row.name.length > 12 ? row.name.substring(0, 12) + '...' : row.name);

      // Crews
      chartGroup.append('text')
        .attr('x', firstColWidth + 5)
        .attr('y', yPos)
        .style('font-size', '9px')
        .style('font-family', 'monospace')
        .text(row.crews);

      // Engines
      chartGroup.append('text')
        .attr('x', firstColWidth + otherColWidth + 5)
        .attr('y', yPos)
        .style('font-size', '9px')
        .style('font-family', 'monospace')
        .text(row.engines);

      // Helicopters
      chartGroup.append('text')
        .attr('x', firstColWidth + 2 * otherColWidth + 5)
        .attr('y', yPos)
        .style('font-size', '9px')
        .style('font-family', 'monospace')
        .text(row.helicopters);

      // Containment
      chartGroup.append('text')
        .attr('x', firstColWidth + 3 * otherColWidth + 5)
        .attr('y', yPos)
        .style('font-size', '9px')
        .style('font-family', 'monospace')
        .text(row.containedPercent + '%');

      // Personnel
      chartGroup.append('text')
        .attr('x', firstColWidth + 4 * otherColWidth + 5)
        .attr('y', yPos)
        .style('font-size', '9px')
        .style('font-family', 'monospace')
        .text(row.personnel);

      // Cost
      chartGroup.append('text')
        .attr('x', firstColWidth + 5 * otherColWidth + 5)
        .attr('y', yPos)
        .style('font-size', '9px')
        .style('font-family', 'monospace')
        .text(row.costToDate);
    });

    // Add title
    chartGroup.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Details');
  };

  if (loading) {
    return <div>Loading chart...</div>;
  }

  if (!data || data.length === 0) {
    return <div>No data available for this region.</div>;
  }

  return (
    <div className="regional-data-graph">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RegionalDataGraph;
