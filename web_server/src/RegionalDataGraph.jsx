import React, { useRef, useEffect } from 'react';
import ChartContainer from './components/ChartContainer';
import './RegionalDataGraph.css';

const RegionalDataGraph = ({ regionId, data, headerData, setDownloadGraph }) => {
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

  useEffect(() => {
    setDownloadGraph(saveAsSVG);
  }, []); // Empty dependency array since we only want to set it once

  return (
    <div className="regional-data-graph-container">
      
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
