import React from 'react';

const DetailsTable = ({ svg, data, width, height, xOffset, yOffset, title = 'Details', isRegional = true, isMobile = false }) => {
  const chartGroup = svg.append('g')
    .attr('transform', `translate(${xOffset}, ${yOffset})`);

  // Responsive font sizes
  const titleFontSize = isMobile ? '10px' : '12px';
  const headerFontSize = isMobile ? '8px' : '10px';
  const dataFontSize = isMobile ? '7px' : '9px';

  // Internal margins for table readability
  const internalMargin = { top: 30, right: 10, bottom: 5, left: 10 };
  const tableWidth = width - internalMargin.left - internalMargin.right;
  const tableHeight = height - internalMargin.top - internalMargin.bottom;

  const convertNumber = (num) => {
    if (num === null || num === undefined) {
      return 'N/A';
    }
    
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Create table background
  chartGroup.append('rect')
    .attr('x', internalMargin.left)
    .attr('y', internalMargin.top)
    .attr('width', tableWidth)
    .attr('height', tableHeight)
    .attr('fill', '#f5f5f5')
    .attr('stroke', '#ddd')
    .attr('stroke-width', 1);

  // Table header with truncated words
  const headerData = isRegional 
    ? ['Incident', 'Crews', 'Engines', 'Helis', 'Contained', 'Personnel', 'Cost']
    : ['GACC', 'Incidents', 'Acres', 'Crews', 'Engines', 'Helis', 'Personnel', 'Change'];
  
  const truncatedHeaders = headerData.map(h => h.length > 5 ? h.substring(0, 5) : h);
  
  // Column widths
  let colWidth, firstColWidth, otherColWidth;
  
  if (isRegional) {
    // Column widths with more padding for first column (regional)
    firstColWidth = tableWidth * 0.25; // 25% for first column
    const remainingWidth = tableWidth - firstColWidth;
    otherColWidth = remainingWidth / (headerData.length - 1);
  } else {
    // Column widths - equal distribution for national summary
    colWidth = tableWidth / headerData.length;
  }

  // Header row
  chartGroup.selectAll('.header-cell')
    .data(truncatedHeaders)
    .enter()
    .append('text')
    .attr('class', 'header-cell')
    .attr('x', (d, i) => {
      if (isRegional) {
        return internalMargin.left + (i === 0 ? 10 : firstColWidth + (i - 1) * otherColWidth + 5);
      } else {
        return internalMargin.left + i * colWidth + 5;
      }
    })
    .attr('y', internalMargin.top + 20)
    .style('font-size', headerFontSize)
    .style('font-weight', 'bold')
    .text(d => d);

  // Data rows
  data.forEach((row, rowIndex) => {
    const yPos = internalMargin.top + 40 + rowIndex * (isMobile ? 15 : 20);
    
    if (isRegional) {
      // Regional data layout
      // Incident name (truncated)
      chartGroup.append('text')
        .attr('x', internalMargin.left + 10)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(row.name.length > (isMobile ? 8 : 12) ? row.name.substring(0, isMobile ? 8 : 12) + '...' : row.name);

      // Crews
      chartGroup.append('text')
        .attr('x', internalMargin.left + firstColWidth + 5)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(convertNumber(row.crews));

      // Engines
      chartGroup.append('text')
        .attr('x', internalMargin.left + firstColWidth + otherColWidth + 5)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(convertNumber(row.engines));

      // Helicopters
      chartGroup.append('text')
        .attr('x', internalMargin.left + firstColWidth + 2 * otherColWidth + 5)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(convertNumber(row.helicopters));

      // Containment
      chartGroup.append('text')
        .attr('x', internalMargin.left + firstColWidth + 3 * otherColWidth + 5)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(row.containedPercent + '%');

      // Personnel
      chartGroup.append('text')
        .attr('x', internalMargin.left + firstColWidth + 4 * otherColWidth + 5)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(convertNumber(row.personnel));

      // Cost
      chartGroup.append('text')
        .attr('x', internalMargin.left + firstColWidth + 5 * otherColWidth + 5)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(convertNumber(row.costToDate));
    } else {
      // National summary data layout
      // GACC
      chartGroup.append('text')
        .attr('x', internalMargin.left + 5)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(row.name);

      // Incidents
      chartGroup.append('text')
        .attr('x', internalMargin.left + colWidth + 5)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(convertNumber(row.incidents));

      // Acres
      chartGroup.append('text')
        .attr('x', internalMargin.left + 2 * colWidth)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(convertNumber(row.totalAcres));

      // Crews
      chartGroup.append('text')
        .attr('x', internalMargin.left + 3 * colWidth + 10)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(convertNumber(row.crews));

      // Engines
      chartGroup.append('text')
        .attr('x', internalMargin.left + 4 * colWidth + 5)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(convertNumber(row.engines));

      // Helicopters
      chartGroup.append('text')
        .attr('x', internalMargin.left + 5 * colWidth + 5)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(convertNumber(row.helicopters));

      // Personnel
      chartGroup.append('text')
        .attr('x', internalMargin.left + 6 * colWidth + 5)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(convertNumber(row.personnel));

      // Change
      chartGroup.append('text')
        .attr('x', internalMargin.left + 7 * colWidth + 5)
        .attr('y', yPos)
        .style('font-size', dataFontSize)
        .style('font-family', 'monospace')
        .text(convertNumber(row.changePersonnel));
    }
  });

  // Add title
  chartGroup.append('text')
    .attr('x', width / 2)
    .attr('y', internalMargin.top - 10)
    .attr('text-anchor', 'middle')
    .style('font-size', titleFontSize)
    .text(title);

  return null; // This component doesn't render JSX, it manipulates D3
};

export default DetailsTable; 