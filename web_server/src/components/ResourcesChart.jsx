import React from 'react';

const ResourcesChart = ({ svg, data, width, height, xOffset, yOffset, title = 'Resources', isMobile = false }) => {
  const chartGroup = svg.append('g')
    .attr('transform', `translate(${xOffset}, ${yOffset})`);

  // Responsive font sizes
  const titleFontSize = isMobile ? '10px' : '12px';
  const axisFontSize = isMobile ? '8px' : '10px';
  const legendFontSize = isMobile ? '8px' : '10px';

  // Internal margins for chart readability
  const internalMargin = { top: 30, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - internalMargin.left - internalMargin.right;
  const chartHeight = height - internalMargin.top - internalMargin.bottom;

  // Scales
  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.crews, d.engines, d.helicopters))])
    .range([chartHeight, 0]);

  const barWidth = x.bandwidth() / 3;

  // Add bars for crews
  chartGroup.selectAll('.crews-bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'crews-bar')
    .attr('x', d => x(d.name) + internalMargin.left)
    .attr('y', d => y(d.crews) + internalMargin.top)
    .attr('width', Math.min(barWidth, isMobile ? 15 : 40))
    .attr('height', d => chartHeight - y(d.crews))
    .attr('fill', '#696969') // Dark grey
    .attr('opacity', 0.7);

  // Add bars for engines
  chartGroup.selectAll('.engines-bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'engines-bar')
    .attr('x', d => x(d.name) + barWidth + internalMargin.left)
    .attr('y', d => y(d.engines) + internalMargin.top)
    .attr('width', Math.min(barWidth, isMobile ? 15 : 40))
    .attr('height', d => chartHeight - y(d.engines))
    .attr('fill', '#A9A9A9') // Medium grey
    .attr('opacity', 0.7);

  // Add bars for helicopters
  chartGroup.selectAll('.helicopters-bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'helicopters-bar')
    .attr('x', d => x(d.name) + 2 * barWidth + internalMargin.left)
    .attr('y', d => y(d.helicopters) + internalMargin.top)
    .attr('width', Math.min(barWidth, isMobile ? 15 : 40))
    .attr('height', d => chartHeight - y(d.helicopters))
    .attr('fill', '#D3D3D3') // Light grey
    .attr('opacity', 0.7);

  // Add axes
  chartGroup.append('g')
    .attr('transform', `translate(${internalMargin.left},${chartHeight + internalMargin.top})`)
    .call(d3.axisBottom(x).tickSize(0)) // Remove tick lines
    .selectAll('text')
    .attr('transform', 'rotate(-45)') // Same rotation for mobile and desktop
    .style('text-anchor', 'end')
    .style('font-size', axisFontSize)
    .attr('dy', isMobile ? '1.5em' : '0.71em') // Add padding for mobile
    .text(d => {
      const dataPoint = data.find(item => item.name === d);
      if (dataPoint) {
        return isMobile ? `${d}` : `${d} ${dataPoint.crews} ${dataPoint.engines} ${dataPoint.helicopters}`;
      }
      return d;
    });

  chartGroup.append('g')
    .attr('transform', `translate(${internalMargin.left},${internalMargin.top})`)
    .call(d3.axisLeft(y))
    .selectAll('text')
    .style('font-size', axisFontSize);

  // Add labels
  chartGroup.append('text')
    .attr('x', width / 2)
    .attr('y', internalMargin.top - 10)
    .attr('text-anchor', 'middle')
    .style('font-size', titleFontSize)
    .text(title);

  // Add legend
  const legend = chartGroup.append('g')
    .attr('transform', `translate(${internalMargin.left + 10}, ${internalMargin.top + 20})`);

  // Calculate legend dimensions based on content (3 items)
  const legendItemHeight = isMobile ? 15 : 20;
  const legendItemSpacing = isMobile ? 5 : 8;
  const legendBoxWidth = isMobile ? 60 : 92; // 80% of 75 and 115
  const legendBoxHeight = 3 * legendItemHeight + 2 * legendItemSpacing;
  
  // Add legend background box with border
  legend.append('rect')
    .attr('width', legendBoxWidth)
    .attr('height', legendBoxHeight)
    .attr('fill', 'white')
    .attr('stroke', '#ccc')
    .attr('stroke-width', 1)
    .attr('rx', 3); // Rounded corners

  legend.append('rect')
    .attr('x', 5)
    .attr('y', 5)
    .attr('width', isMobile ? 10 : 15)
    .attr('height', isMobile ? 10 : 15)
    .attr('fill', '#696969') // Dark grey
    .attr('opacity', 0.7);

  legend.append('text')
    .attr('x', isMobile ? 20 : 25)
    .attr('y', isMobile ? 13 : 18)
    .style('font-size', legendFontSize)
    .text('Crews');

  legend.append('rect')
    .attr('x', 5)
    .attr('y', isMobile ? 20 : 25)
    .attr('width', isMobile ? 10 : 15)
    .attr('height', isMobile ? 10 : 15)
    .attr('fill', '#A9A9A9') // Medium grey
    .attr('opacity', 0.7);

  legend.append('text')
    .attr('x', isMobile ? 20 : 25)
    .attr('y', isMobile ? 28 : 38)
    .style('font-size', legendFontSize)
    .text('Engines');

  legend.append('rect')
    .attr('x', 5)
    .attr('y', isMobile ? 35 : 45)
    .attr('width', isMobile ? 10 : 15)
    .attr('height', isMobile ? 10 : 15)
    .attr('fill', '#D3D3D3') // Light grey
    .attr('opacity', 0.7);

  legend.append('text')
    .attr('x', isMobile ? 20 : 25)
    .attr('y', isMobile ? 43 : 58)
    .style('font-size', legendFontSize)
    .text('Helicopters');

  return null; // This component doesn't render JSX, it manipulates D3
};

export default ResourcesChart; 