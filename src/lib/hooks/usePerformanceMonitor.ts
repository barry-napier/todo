import { useEffect, useRef } from 'react';
import {
  measureWebVitals,
  getPerformanceMonitor,
  measureRenderTime,
} from '@/lib/utils/performance';

interface UsePerformanceMonitorOptions {
  componentName?: string;
  measureRender?: boolean;
  logMetrics?: boolean;
}

/**
 * Hook to monitor component performance
 */
export function usePerformanceMonitor(options: UsePerformanceMonitorOptions = {}) {
  const {
    componentName = 'Component',
    measureRender = true,
    logMetrics = process.env.NODE_ENV === 'development',
  } = options;

  const renderTimer = useRef<ReturnType<typeof measureRenderTime> | undefined>(undefined);
  const hasStarted = useRef(false);

  useEffect(() => {
    // Start global performance monitoring once
    if (!hasStarted.current) {
      hasStarted.current = true;

      // Measure web vitals
      measureWebVitals((metric) => {
        if (logMetrics) {
          console.log(`[WebVital] ${metric.name}:`, metric.value);
        }

        // You could send this to analytics here
        // analytics.track('web_vital', metric);
      });

      // Start performance monitor
      const monitor = getPerformanceMonitor();
      monitor.start();

      return () => {
        monitor.stop();
      };
    }
    return undefined;
  }, [logMetrics]);

  // Measure component render time
  useEffect(() => {
    if (measureRender && renderTimer.current) {
      const duration = renderTimer.current.end();

      if (logMetrics && duration > 16) {
        console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`);
      }
    }
  });

  // Start render measurement
  if (measureRender && !renderTimer.current) {
    renderTimer.current = measureRenderTime(componentName);
    renderTimer.current.start();
  }

  return {
    measureCustomMetric: (name: string, value: number) => {
      if (logMetrics) {
        console.log(`[CustomMetric] ${name}:`, value);
      }
      // You could send this to analytics here
    },
  };
}
