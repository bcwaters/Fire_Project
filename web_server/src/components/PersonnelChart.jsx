import React from 'react';
import * as d3 from 'd3';
import { addHorizontalGrid, chartColors, chartFontFamily, formatTickLabel, styleAxes } from './chartStyle';

const PersonnelChart = ({ svg, data, width, height, xOffset, yOffset, title = 'Personnel', isMobile = false }) => {
  const chartGroup = svg.append('g')
    .attr('transform', `translate(${xOffset}, ${yOffset})`);

  const titleFontSize = isMobile ? '11px' : '13px';
  const axisFontSize = isMobile ? '8px' : '10px';
  const labelFontSize = isMobile ? '8px' : '10px';
  const internalMargin = { top: 46, right: 20, bottom: 34, left: 58 };
  const chartWidth = width - internalMargin.left - internalMargin.right;
  const chartHeight = height - internalMargin.top - internalMargin.bottom;
  const panelGap = isMobile ? 18 : 28;
  const totalPanelWidth = Math.max(120, chartWidth * 0.58);
  const changePanelWidth = Math.max(90, chartWidth - totalPanelWidth - panelGap);

  const convertNumber = (num) => {
    if (Math.abs(num) >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const xTotal = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, totalPanelWidth])
    .padding(0.18);

  const xChange = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, changePanelWidth])
    .padding(0.26);

  const yTotal = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.personnel) || 1])
    .nice()
    .range([chartHeight, 0]);

  const maxChange = d3.max(data, d => Math.abs(d.changePersonnel)) || 1;
  const yChange = d3.scaleLinear()
    .domain([-maxChange, maxChange])
    .nice()
    .range([chartHeight, 0]);

  const totalGroup = chartGroup.append('g')
    .attr('transform', `translate(${internalMargin.left},${internalMargin.top})`);

  const changeGroup = chartGroup.append('g')
    .attr('transform', `translate(${internalMargin.left + totalPanelWidth + panelGap},${internalMargin.top})`);

  addHorizontalGrid(totalGroup, yTotal, totalPanelWidth, { top: 0, left: 0 }, 4);

  totalGroup.selectAll('.personnel-total-bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'personnel-total-bar')
    .attr('x', d => xTotal(d.name))
    .attr('y', chartHeight)
    .attr('width', Math.min(xTotal.bandwidth(), isMobile ? 20 : 34))
    .attr('height', 0)
    .attr('fill', chartColors.total)
    .attr('opacity', 0.9)
    .transition()
    .duration(220)
    .ease(d3.easeCubicOut)
    .attr('y', d => yTotal(d.personnel))
    .attr('height', d => chartHeight - yTotal(d.personnel));

  changeGroup.append('line')
    .attr('x1', 0)
    .attr('x2', changePanelWidth)
    .attr('y1', yChange(0))
    .attr('y2', yChange(0))
    .attr('stroke', chartColors.axis)
    .attr('stroke-width', 1);

  changeGroup.selectAll('.personnel-change-bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'personnel-change-bar')
    .attr('x', d => xChange(d.name))
    .attr('y', yChange(0))
    .attr('width', Math.min(xChange.bandwidth(), isMobile ? 16 : 26))
    .attr('height', 0)
    .attr('fill', d => d.changePersonnel < 0 ? chartColors.negative : chartColors.positive)
    .attr('opacity', 0.95)
    .transition()
    .duration(220)
    .ease(d3.easeCubicOut)
    .attr('y', d => d.changePersonnel >= 0 ? yChange(d.changePersonnel) : yChange(0))
    .attr('height', d => Math.abs(yChange(d.changePersonnel) - yChange(0)));

  totalGroup.append('g')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xTotal).tickSize(0))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .style('font-size', axisFontSize)
    .style('fill', chartColors.axis)
    .style('font-family', chartFontFamily)
    .attr('dy', isMobile ? '1.5em' : '0.71em')
    .text(d => formatTickLabel(d, isMobile));

  changeGroup.append('g')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xChange).tickSize(0).tickFormat(''))
    .selectAll('text')
    .remove();

  totalGroup.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yTotal).ticks(4).tickFormat(convertNumber))
    .selectAll('text')
    .style('font-size', axisFontSize)
    .style('fill', chartColors.axis)
    .style('font-family', chartFontFamily);

  changeGroup.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yChange).ticks(5).tickFormat(convertNumber))
    .selectAll('text')
    .style('font-size', axisFontSize)
    .style('fill', chartColors.axis)
    .style('font-family', chartFontFamily);

  styleAxes(chartGroup);

  chartGroup.append('text')
    .attr('x', width / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .style('font-size', titleFontSize)
    .style('font-family', chartFontFamily)
    .style('font-weight', 700)
    .style('fill', chartColors.title)
    .text(title);

  totalGroup.append('text')
    .attr('x', totalPanelWidth / 2)
    .attr('y', -12)
    .attr('text-anchor', 'middle')
    .style('font-size', labelFontSize)
    .style('font-family', chartFontFamily)
    .style('font-weight', 700)
    .style('fill', chartColors.axis)
    .text('Total personnel');

  changeGroup.append('text')
    .attr('x', changePanelWidth / 2)
    .attr('y', -12)
    .attr('text-anchor', 'middle')
    .style('font-size', labelFontSize)
    .style('font-family', chartFontFamily)
    .style('font-weight', 700)
    .style('fill', chartColors.axis)
    .text('Change');

  return null;
};

export default PersonnelChart;
