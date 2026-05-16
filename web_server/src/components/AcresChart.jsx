import React from 'react';
import * as d3 from 'd3';
import { addHorizontalGrid, chartColors, chartFontFamily, formatTickLabel, styleAxes } from './chartStyle';

const AcresChart = ({ svg, data, width, height, xOffset, yOffset, title = 'Total Acres and Containment', showContainment = true, isMobile = false }) => {
  const chartGroup = svg.append('g')
    .attr('transform', `translate(${xOffset}, ${yOffset})`);

  // Responsive font sizes
  const titleFontSize = isMobile ? '11px' : '13px';
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
        { key: 'acres', value: d.totalAcres, color: chartColors.acres, opacity: 0.9 }
      ];
      
      if (showContainment && d.containedPercent !== undefined) {
        bars.push({
          key: 'containment', 
          value: (d.containedPercent / 100) * d.totalAcres, 
          color: chartColors.containment,
          opacity: 0.9
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
    .attr('height', 0)
    .attr('fill', d => d.color)
    .attr('opacity', d => d.opacity)
    .transition()
    .duration(220)
    .ease(d3.easeCubicOut)
    .attr('y', d => y(d.value) + internalMargin.top)
    .attr('height', d => chartHeight - y(d.value));

  addHorizontalGrid(chartGroup, y, chartWidth, internalMargin);

  // Add axes
  chartGroup.append('g')
    .attr('transform', `translate(${internalMargin.left},${chartHeight + internalMargin.top})`)
    .call(d3.axisBottom(x).tickSize(0)) // Remove tick lines
    .selectAll('text')
    .attr('transform', 'rotate(-45)') // Same rotation for mobile and desktop
    .style('text-anchor', 'end')
    .style('font-size', axisFontSize)
    .style('fill', chartColors.axis)
    .style('font-family', chartFontFamily)
    .attr('dy', isMobile ? '1.5em' : '0.71em')
    .text(d => formatTickLabel(d, isMobile));

  chartGroup.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${internalMargin.left},${internalMargin.top})`)
    .call(d3.axisLeft(y).tickFormat(convertNumber))
    .selectAll('text')
    .style('font-size', axisFontSize)
    .style('fill', chartColors.axis)
    .style('font-family', chartFontFamily);

  styleAxes(chartGroup);

  // Add labels
  chartGroup.append('text')
    .attr('x', width / 2)
    .attr('y', internalMargin.top - 10)
    .attr('text-anchor', 'middle')
    .style('font-size', titleFontSize)
    .style('font-family', chartFontFamily)
    .style('font-weight', 700)
    .style('fill', chartColors.title)
    .text(title);

  // Add legend
  const legend = chartGroup.append('g')
    .attr('transform', `translate(${internalMargin.left + 10}, ${internalMargin.top + 20})`);

  // Calculate legend dimensions based on content
  const legendItemHeight =  20;
  const legendItemSpacing =  8;
  const legendTextWidth =  100;
  legend.append('rect')
    .attr('x', 0)
    .attr('y', 5)
    .attr('width', isMobile ? 10 : 15)
    .attr('height', isMobile ? 10 : 15)
    .attr('fill', chartColors.acres)
    .attr('opacity', 1);

  legend.append('text')
    .attr('x', isMobile ? 15 : 20)
    .attr('y', isMobile ? 13 : 18)
    .style('font-size', legendFontSize)
    .style('font-family', chartFontFamily)
    .style('fill', chartColors.text)
    .text('Acres');

  if (showContainment && data[0].containedPercent !== undefined) {
    legend.append('rect')
      .attr('x', 0)
      .attr('y', isMobile ? 20 : 25)
      .attr('width', isMobile ? 10 : 15)
      .attr('height', isMobile ? 10 : 15)
      .attr('fill', chartColors.containment)
      .attr('opacity', 1);

    legend.append('text')
      .attr('x', isMobile ? 15 : 20)
      .attr('y', isMobile ? 28 : 38)
      .style('font-size', legendFontSize)
      .style('font-family', chartFontFamily)
      .style('fill', chartColors.text)
      .text('Containment');
  }

  return null; // This component doesn't render JSX, it manipulates D3
};

export default AcresChart; 
