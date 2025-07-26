import React, { useRef } from 'react';
import ChartContainer from './components/ChartContainer';
import './RegionalDataGraph.css';

const RegionalDataGraph = ({ regionId, data, headerData }) => {
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
    link.download = `region-${regionId}-${new Date().toISOString().split('T')[0]}.svg`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="regional-data-graph-container">
      <div className="save-controls">
        <button onClick={saveAsSVG} className="save-btn save-svg">
        Download Graph
        </button>
      </div>
      <div ref={chartContainerRef}>
        <ChartContainer 
          data={data}
          regionId={regionId}
          headerData={headerData}
          isRegional={true}
          className="regional-data-graph"
        />
      </div>
    </div>
  );
};

export default RegionalDataGraph;
