import React, { useRef, useEffect, useState } from 'react';
import ChartContainer from './components/ChartContainer';
import './NationalSummaryGraph.css';
import ChartComponentContainer from './components/ChartComponentContainer';

const NationalSummaryGraph = ({ data, headerData, setDownloadGraph }) => {
  const chartContainerRef = useRef();
  const [showDownloadContainer, setShowDownloadContainer] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for download chart sizing
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const saveAsSVG = () => {
    // Show the download container temporarily
    setShowDownloadContainer(true);
    
    // Wait a bit for the chart to render, then download
    setTimeout(() => {
      const svgElement = chartContainerRef.current?.querySelector('svg');
      if (!svgElement) {
        alert('Chart not ready for export');
        setShowDownloadContainer(false);
        return;
      }

      // Clone the SVG to avoid modifying the displayed version
      const clonedSvg = svgElement.cloneNode(true);
      
      // Set a reasonable fixed width for download (1200px is a good standard width)
      const downloadWidth = 1200;
      const downloadHeight = 1000;
      
      clonedSvg.setAttribute('width', downloadWidth);
      clonedSvg.setAttribute('height', downloadHeight);
      clonedSvg.setAttribute('viewBox', `0 0 ${downloadWidth} ${downloadHeight}`);
      
      // Remove any CSS classes that might affect the download
      clonedSvg.removeAttribute('class');
      
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `national-summary-${new Date().toISOString().split('T')[0]}.svg`;
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
      
      // Hide the download container after download
      setTimeout(() => {
        setShowDownloadContainer(false);
      }, 100);
    }, 500); // Wait 500ms for chart to render
  };

  useEffect(() => {
    setDownloadGraph(saveAsSVG);
  }, []); // Empty dependency array since we only want to set it once

  return (
    <div className="national-summary-graph-container">
      <ChartComponentContainer
        data={data}
        headerData={headerData}
        isRegional={false}
        className="national-summary-graph"
      />
      <div 
        ref={chartContainerRef} 
        className="download-chart-container"
        style={{ 
          display: showDownloadContainer ? 'block' : 'none',
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: windowWidth + 'px'
        }}
      >
        <ChartContainer
          data={data}
          headerData={headerData}
          isRegional={false}
          className="national-summary-graph"
          windowWidth={windowWidth}
        />
      </div>
    </div>
  );
};

export default NationalSummaryGraph; 