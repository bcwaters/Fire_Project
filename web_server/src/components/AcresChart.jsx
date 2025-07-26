import React from 'react';

const AcresChart = ({ svg, data, width, height, xOffset, yOffset, title = 'Total Acres and Containment', showContainment = true, isMobile = false }) => {
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
    .domain([0, d3.max(data, d => d.totalAcres)])
    .range([chartHeight, 0]);

  // Add bars for total acres
  chartGroup.selectAll('.acres-bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'acres-bar')
    .attr('x', d => x(d.name) + internalMargin.left)
    .attr('y', d => y(d.totalAcres) + internalMargin.top)
    .attr('width', Math.min(x.bandwidth() / 2, isMobile ? 20 : 40))
    .attr('height', d => chartHeight - y(d.totalAcres))
    .attr('fill', '#36454F') // Charcoal
    .attr('opacity', 0.7);

  // Add bars for scaled containment (if enabled)
  if (showContainment && data[0].containedPercent !== undefined) {
    chartGroup.selectAll('.containment-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'containment-bar')
      .attr('x', d => x(d.name) + x.bandwidth() / 2 + internalMargin.left)
      .attr('y', d => y((d.containedPercent / 100) * d.totalAcres) + internalMargin.top)
      .attr('width', Math.min(x.bandwidth() / 2, isMobile ? 20 : 40))
      .attr('height', d => chartHeight - y((d.containedPercent / 100) * d.totalAcres))
      .attr('fill', '#4e8a4e') // Pastel grey-green
      .attr('opacity', 1);
  }

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
        return isMobile ? `${d}` : `${d} ${dataPoint.totalAcres.toLocaleString()}`;
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
    .attr('transform', `translate(${width - (isMobile ? 80 : 130)}, ${internalMargin.top + 20})`);

  legend.append('rect')
    .attr('width', isMobile ? 10 : 15)
    .attr('height', isMobile ? 10 : 15)
    .attr('fill', '#36454F') // Charcoal
    .attr('opacity', 1);

  legend.append('text')
    .attr('x', isMobile ? 15 : 20)
    .attr('y', isMobile ? 8 : 12)
    .style('font-size', legendFontSize)
    .text('Acres');

  if (showContainment && data[0].containedPercent !== undefined) {
    legend.append('rect')
      .attr('y', isMobile ? 15 : 20)
      .attr('width', isMobile ? 10 : 15)
      .attr('height', isMobile ? 10 : 15)
      .attr('fill', '#4e8a4e') // Pastel grey-green
      .attr('opacity', 1);

    legend.append('text')
      .attr('x', isMobile ? 15 : 20)
      .attr('y', isMobile ? 23 : 32)
      .style('font-size', legendFontSize)
      .text('Containment');
  }

  return null; // This component doesn't render JSX, it manipulates D3
};

export default AcresChart; 