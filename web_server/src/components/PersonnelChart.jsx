import React from 'react';

const PersonnelChart = ({ svg, data, width, height, xOffset, yOffset, title = 'Personnel', isMobile = false }) => {
  const chartGroup = svg.append('g')
    .attr('transform', `translate(${xOffset}, ${yOffset})`);

  // Responsive font sizes
  const titleFontSize = isMobile ? '10px' : '12px';
  const axisFontSize = isMobile ? '8px' : '10px';
  const legendFontSize = isMobile ? '8px' : '10px';

  // Internal margins for chart readability
  const internalMargin = { top: 30, right: 20, bottom: 30, left: 60 };
  const chartWidth = width - internalMargin.left - internalMargin.right;
  const chartHeight = height - internalMargin.top - internalMargin.bottom;

  const convertNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Scales
  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, chartWidth])
    .padding(0.05);

  const y = d3.scaleLinear()
    .domain([d3.min(data, d => d.changePersonnel) * 1.1, d3.max(data, d => Math.max(d.personnel, Math.abs(d.changePersonnel)))])
    .range([chartHeight, 0]);

  // Add bars for total personnel
  chartGroup.selectAll('.personnel-bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'personnel-bar')
    .attr('x', d => x(d.name) + internalMargin.left)
    .attr('y', d => y(Math.max(0, d.personnel)) + internalMargin.top) // Start at zero or personnel value
    .attr('width', Math.min(x.bandwidth() / 2, isMobile ? 20 : 40))
    .attr('height', d => Math.abs(y(d.personnel) - y(0))) // Height from zero to personnel
    .attr('fill', '#36454F') // Charcoal
    .attr('opacity', 0.7);

  // Add bars for change in personnel
  chartGroup.selectAll('.change-bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'change-bar')
    .attr('x', d => x(d.name) + x.bandwidth() / 2 + internalMargin.left)
    .attr('y', d => (d.changePersonnel >= 0 ? y(d.changePersonnel) : y(0)) + internalMargin.top) // Start at zero for negative values
    .attr('width', Math.min(x.bandwidth() / 2, isMobile ? 20 : 40))
    .attr('height', d => Math.abs(y(d.changePersonnel) - y(0))) // Use absolute difference for height
    .attr('fill', d => d.changePersonnel < 0 ? '#8b2513' : '#4e8a4e') // Dark grey-red for negative, pastel grey-green for positive
    .attr('opacity', 0.7);

  // Add axes
  chartGroup.append('g')
    .attr('transform', `translate(${internalMargin.left},${chartHeight + internalMargin.top})`)
    .call(d3.axisBottom(x).tickSize(0)) // Remove tick lines
    .selectAll('text')
    .attr('transform', 'rotate(-45)') // Same rotation for mobile and desktop
    .style('text-anchor', 'end')
    .style('font-size', axisFontSize)
    .style('fill', '#000') // Black color for x-axis labels
    .attr('dy', isMobile ? '1.5em' : '0.71em') // Add padding for mobile
    .text(d => d); // Show only the incident/GACC name, no numeric values

  chartGroup.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${internalMargin.left},${internalMargin.top})`)
    .call(d3.axisLeft(y).tickFormat(convertNumber))
    .selectAll('text')
    .style('font-size', axisFontSize)
    .style('fill', '#000'); // Black color for y-axis labels

  // Make y-axis lines much thinner
  chartGroup.selectAll('.y-axis .domain, .y-axis .tick line')
    .style('stroke-width', '0.1px')
    .attr('stroke-width', '0.1px');

  // Add zero line for clarity
  chartGroup.append('line')
    .attr('x1', internalMargin.left)
    .attr('x2', chartWidth + internalMargin.left)
    .attr('y1', y(0) + internalMargin.top)
    .attr('y2', y(0) + internalMargin.top)
    .attr('stroke', 'black')
    .attr('stroke-width', 1);

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
  const legendItemHeight =  20;
  const legendItemSpacing =  8;
  const legendBoxWidth = isMobile ? 82 : 92; // Reduced by 10 pixels total for mobile
  const legendBoxHeight = isMobile ? (3 * legendItemHeight + 2 * legendItemSpacing - 8) : (3 * legendItemHeight + 2 * legendItemSpacing); // Reduced by 8 pixels for mobile
  
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
    .attr('fill', '#36454F') // Charcoal
    .attr('opacity', 1);

  legend.append('text')
    .attr('x', isMobile ? 20 : 25)
    .attr('y', isMobile ? 13 : 18)
    .style('font-size', legendFontSize)
    .text('Total');

  legend.append('rect')
    .attr('x', 5)
    .attr('y', isMobile ? 20 : 25)
    .attr('width', isMobile ? 10 : 15)
    .attr('height', isMobile ? 10 : 15)
    .attr('fill', '#4e8a4e') // Pastel grey-green
    .attr('opacity', 1);

  legend.append('text')
    .attr('x', isMobile ? 20 : 25)
    .attr('y', isMobile ? 28 : 38)
    .style('font-size', legendFontSize)
    .text('Change +');

  legend.append('rect')
    .attr('x', 5)
    .attr('y', isMobile ? 35 : 45)
    .attr('width', isMobile ? 10 : 15)
    .attr('height', isMobile ? 10 : 15)
    .attr('fill', '#8b2513') // Dark grey-red
    .attr('opacity', 1);

  legend.append('text')
    .attr('x', isMobile ? 20 : 25)
    .attr('y', isMobile ? 43 : 58)
    .style('font-size', legendFontSize)
    .text('Change -');

  return null; // This component doesn't render JSX, it manipulates D3
};

export default PersonnelChart; 