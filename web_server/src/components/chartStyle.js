export const chartColors = {
  acres: '#b8562a',
  containment: '#5f8f6b',
  total: '#50606a',
  positive: '#5f8f6b',
  negative: '#a7472f',
  crews: '#5c6f7f',
  engines: '#8a9aa6',
  helicopters: '#c0a35a',
  axis: '#5f6862',
  grid: '#ddd6ca',
  title: '#1f2522',
  text: '#303831'
};

export const chartFontFamily = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export function formatTickLabel(label, isMobile = false) {
  const maxLength = isMobile ? 10 : 16;
  return label && label.length > maxLength ? `${label.slice(0, maxLength - 1)}...` : label;
}

export function styleChartText(selection) {
  selection
    .style('font-family', chartFontFamily)
    .style('fill', chartColors.text);
}

export function addHorizontalGrid(chartGroup, yScale, width, margin, ticks = 4) {
  const values = yScale.ticks(ticks).filter(tick => tick !== 0);

  chartGroup.append('g')
    .attr('class', 'grid-lines')
    .attr('transform', `translate(${margin.left},${margin.top})`)
    .selectAll('line')
    .data(values)
    .join('line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', d => yScale(d))
    .attr('y2', d => yScale(d))
    .attr('stroke', chartColors.grid)
    .attr('stroke-width', 0.8)
    .attr('stroke-dasharray', '2 4');
}

export function styleAxes(chartGroup) {
  chartGroup.selectAll('.domain')
    .attr('stroke', chartColors.grid)
    .attr('stroke-width', 0.8);

  chartGroup.selectAll('.tick line')
    .attr('stroke', chartColors.grid)
    .attr('stroke-width', 0.8);

  chartGroup.selectAll('.tick text')
    .style('fill', chartColors.axis)
    .style('font-family', chartFontFamily);
}
