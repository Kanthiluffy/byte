import React, { useState, useEffect } from 'react';
import './PerformanceMonitor.css';

const PerformanceMonitor = ({ onMetrics }) => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    memoryUsage: 0,
    networkLatency: 0
  });

  useEffect(() => {
    // Measure initial load time
    const loadTime = performance.now();
    
    // Get memory usage (if available)
    const getMemoryUsage = () => {
      if ('memory' in performance) {
        return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      }
      return 0;
    };

    // Measure network latency with a simple ping
    const measureLatency = async () => {
      const start = performance.now();
      try {
        await fetch('/api/ping', { method: 'HEAD' });
        return performance.now() - start;
      } catch {
        return 0;
      }
    };

    const updateMetrics = async () => {
      const newMetrics = {
        loadTime: Math.round(loadTime),
        memoryUsage: getMemoryUsage(),
        networkLatency: Math.round(await measureLatency())
      };
      
      setMetrics(newMetrics);
      onMetrics?.(newMetrics);
    };

    updateMetrics();
    
    // Update metrics every 30 seconds
    const interval = setInterval(updateMetrics, 30000);
    
    return () => clearInterval(interval);
  }, [onMetrics]);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="performance-monitor">
      <div className="performance-metric">
        <span className="metric-label">Load:</span>
        <span className="metric-value">{metrics.loadTime}ms</span>
      </div>
      {metrics.memoryUsage > 0 && (
        <div className="performance-metric">
          <span className="metric-label">Memory:</span>
          <span className="metric-value">{metrics.memoryUsage}MB</span>
        </div>
      )}
      <div className="performance-metric">
        <span className="metric-label">Latency:</span>
        <span className="metric-value">{metrics.networkLatency}ms</span>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
