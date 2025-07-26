import React, { useRef } from 'react';
import ChartContainer from './components/ChartContainer';
import './NationalSummaryGraph.css';

const NationalSummaryGraph = ({ data, headerData }) => {
  const chartContainerRef = useRef();


  const saveAsSVG = () => {
    const svgElement = chartContainerRef.current?.querySelector('svg');
    if (!svgElement) {
      alert('Chart not ready for export');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `national-summary-${new Date().toISOString().split('T')[0]}.svg`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="national-summary-graph-container">
      <div className="save-controls">
        <button onClick={saveAsSVG} className="save-btn save-svg">
        Download Graph
        </button>
      </div>
      <div ref={chartContainerRef}>
        <ChartContainer 
          data={data}
          headerData={headerData}
          isRegional={false}
          className="national-summary-graph"
        />
      </div>
    </div>
  );
};

export default NationalSummaryGraph; 