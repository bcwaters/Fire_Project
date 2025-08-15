import React from 'react';

const AcresChart = ({ svg, data, width, height, xOffset, yOffset, title = 'Total Acres and Containment', showContainment = true, isMobile = false }) => {
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

  const numOfBars = showContainment && data[0] && data[0].containedPercent !== undefined ? 2 : 1;
  const spacingWithinGroup = 2;

  // Scales
  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, chartWidth])
    .padding(0.1);

  const barWidth = Math.min((x.bandwidth() - (spacingWithinGroup * (numOfBars - 1))) / numOfBars, isMobile ? 20 : 40);
  const groupWidth = numOfBars * (barWidth + spacingWithinGroup);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.totalAcres)])
    .range([chartHeight, 0]);

  // Create groups for each category and add bars within each group
  const categoryGroups = chartGroup.selectAll('.category-group')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'category-group')
    .attr('transform', d => `translate(${x(d.name) + internalMargin.left}, 0)`);

  // Draw bars for each series within the category
  categoryGroups.selectAll('.bar')
    .data(d => {
      const bars = [
        { key: 'acres', value: d.totalAcres, color: '#36454F', opacity: 0.7 }
      ];
      
      if (showContainment && d.containedPercent !== undefined) {
        bars.push({
          key: 'containment', 
          value: (d.containedPercent / 100) * d.totalAcres, 
          color: '#4e8a4e', 
          opacity: 1
        });
      }
      
      return bars;
    })
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d, i) => i * (barWidth + spacingWithinGroup))
    .attr('y', chartHeight + internalMargin.top) // Start from bottom
    .attr('width', barWidth)
    .attr('height', 0) // Start with height 0
    .attr('fill', d => d.color)
    .attr('opacity', d => d.opacity)
    .transition()
    .duration(750) // 750ms transition duration
    .ease(d3.easeCubicOut) // Smooth easing function
    .attr('y', d => y(d.value) + internalMargin.top)
    .attr('height', d => chartHeight - y(d.value));

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
    .text(d => d); // Show only the incident name, no numeric values

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

  // Calculate legend dimensions based on content
  const legendItemHeight =  20;
  const legendItemSpacing =  8;
  const legendTextWidth =  100;
  const legendBoxWidth = isMobile ? 87 : 92; // Reduced by 10 pixels total for mobile
  const legendBoxHeight = (showContainment && data[0].containedPercent !== undefined) ? 
    (isMobile ? (2 * legendItemHeight + legendItemSpacing - 8) : (2 * legendItemHeight + legendItemSpacing)) : 
    (isMobile ? (legendItemHeight + 2) : (legendItemHeight + 10)); // Reduced by 8 pixels for mobile
  
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
    .text('Acres');

  if (showContainment && data[0].containedPercent !== undefined) {
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
      .text('Containment');
  }

  return null; // This component doesn't render JSX, it manipulates D3
};

export default AcresChart; 