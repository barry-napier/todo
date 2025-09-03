/**
 * Performance monitoring utilities
 */

export interface PerformanceMetrics {
  firstContentfulPaint: number | null;
  timeToInteractive: number | null;
  lighthouseScore: number | null;
  bundleSize: number | null;
  animationFrameRate: number | null;
}

export const PERFORMANCE_TARGETS = {
  firstContentfulPaint: 1000, // < 1s
  timeToInteractive: 2000, // < 2s
  lighthouseScore: 95, // > 95
  bundleSize: 200 * 1024, // < 200KB gzipped
  animationFrameRate: 60, // 60fps
} as const;

/**
 * Measure Core Web Vitals
 */
interface WebVitalMetric {
  name: string;
  value: number;
  [key: string]: unknown;
}

export function measureWebVitals(callback?: (metric: WebVitalMetric) => void) {
  if (typeof window === 'undefined') return;

  // Dynamically import web-vitals to avoid SSR issues
  import('web-vitals')
    .then((webVitals) => {
      const reportWebVital = (metric: WebVitalMetric) => {
        console.log(`[Web Vital] ${metric.name}:`, metric.value);

        // Report to analytics if needed
        if (callback) {
          callback(metric);
        }

        // Store in sessionStorage for debugging
        try {
          const vitals = JSON.parse(sessionStorage.getItem('webVitals') || '{}');
          vitals[metric.name as string] = {
            value: metric.value,
            timestamp: Date.now(),
          };
          sessionStorage.setItem('webVitals', JSON.stringify(vitals));
        } catch (error) {
          console.error('Failed to store web vital:', error);
        }
      };

      if (webVitals.onCLS)
        webVitals.onCLS((metric) => reportWebVital(metric as unknown as WebVitalMetric));
      if (webVitals.onINP)
        webVitals.onINP((metric) => reportWebVital(metric as unknown as WebVitalMetric));
      if (webVitals.onFCP)
        webVitals.onFCP((metric) => reportWebVital(metric as unknown as WebVitalMetric));
      if (webVitals.onLCP)
        webVitals.onLCP((metric) => reportWebVital(metric as unknown as WebVitalMetric));
      if (webVitals.onTTFB)
        webVitals.onTTFB((metric) => reportWebVital(metric as unknown as WebVitalMetric));
    })
    .catch((error) => {
      console.error('Failed to load web-vitals:', error);
    });
}

/**
 * Performance Observer for monitoring runtime performance
 */
export class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;
  private frameRateData: number[] = [];
  private lastFrameTime = 0;
  private animationId: number | null = null;

  constructor(private onMetric?: (name: string, value: number) => void) {}

  /**
   * Start monitoring performance
   */
  start() {
    if (typeof window === 'undefined') return;

    // Monitor long tasks
    this.observeLongTasks();

    // Monitor frame rate
    this.monitorFrameRate();

    // Monitor memory usage (if available)
    this.monitorMemory();
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Observe long tasks (> 50ms)
   */
  private observeLongTasks() {
    if (!('PerformanceObserver' in window)) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`[Long Task] Duration: ${entry.duration.toFixed(2)}ms`);
            if (this.onMetric) {
              this.onMetric('longTask', entry.duration);
            }
          }
        }
      });

      this.observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.error('Failed to observe long tasks:', error);
    }
  }

  /**
   * Monitor frame rate
   */
  private monitorFrameRate() {
    const measureFrameRate = (timestamp: number) => {
      if (this.lastFrameTime) {
        const frameDuration = timestamp - this.lastFrameTime;
        const fps = 1000 / frameDuration;

        this.frameRateData.push(fps);

        // Keep only last 60 frames
        if (this.frameRateData.length > 60) {
          this.frameRateData.shift();
        }

        // Report average FPS every 60 frames
        if (this.frameRateData.length === 60) {
          const avgFps = this.frameRateData.reduce((a, b) => a + b, 0) / this.frameRateData.length;

          if (avgFps < 55) {
            console.warn(`[Performance] Low frame rate: ${avgFps.toFixed(1)} fps`);
          }

          if (this.onMetric) {
            this.onMetric('frameRate', avgFps);
          }

          this.frameRateData = [];
        }
      }

      this.lastFrameTime = timestamp;
      this.animationId = requestAnimationFrame(measureFrameRate);
    };

    this.animationId = requestAnimationFrame(measureFrameRate);
  }

  /**
   * Monitor memory usage
   */
  private monitorMemory() {
    if (!('memory' in performance)) return;

    const checkMemory = () => {
      const perfWithMemory = performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };
      const memory = perfWithMemory.memory;

      if (!memory) return;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
      const usage = (usedMB / limitMB) * 100;

      if (usage > 90) {
        console.warn(
          `[Performance] High memory usage: ${usage.toFixed(1)}% (${usedMB.toFixed(1)}MB / ${limitMB.toFixed(1)}MB)`
        );
      }

      if (this.onMetric) {
        this.onMetric('memoryUsage', usage);
      }
    };

    // Check memory every 10 seconds
    setInterval(checkMemory, 10000);
  }
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string) {
  const startMark = `${componentName}-render-start`;
  const endMark = `${componentName}-render-end`;
  const measureName = `${componentName}-render`;

  return {
    start: () => performance.mark(startMark),
    end: () => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);

      const measure = performance.getEntriesByName(measureName)[0];
      if (measure && measure.duration > 16) {
        console.warn(
          `[Performance] Slow render for ${componentName}: ${measure.duration.toFixed(2)}ms`
        );
      }

      // Clean up marks and measures
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);

      return measure?.duration || 0;
    },
  };
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Check if browser supports performance features
 */
export function checkPerformanceSupport() {
  return {
    performanceObserver: 'PerformanceObserver' in window,
    webVitals: true, // We can load the polyfill
    memory: 'memory' in performance,
    navigation: 'navigation' in performance,
    resourceTiming: 'getEntriesByType' in performance,
  };
}

/**
 * Get current performance metrics
 */
export function getCurrentMetrics(): Partial<PerformanceMetrics> {
  const metrics: Partial<PerformanceMetrics> = {};

  // Get paint metrics
  if ('getEntriesByType' in performance) {
    const paintMetrics = performance.getEntriesByType('paint');
    const fcp = paintMetrics.find((entry) => entry.name === 'first-contentful-paint');

    if (fcp) {
      metrics.firstContentfulPaint = fcp.startTime;
    }
  }

  // Get web vitals from sessionStorage
  try {
    const vitals = JSON.parse(sessionStorage.getItem('webVitals') || '{}');

    if (vitals.FCP) {
      metrics.firstContentfulPaint = vitals.FCP.value;
    }

    if (vitals.TTI) {
      metrics.timeToInteractive = vitals.TTI.value;
    }
  } catch {
    // Ignore errors
  }

  return metrics;
}

// Singleton performance monitor instance
let monitorInstance: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!monitorInstance) {
    monitorInstance = new PerformanceMonitor((name, value) => {
      // Default callback - log to console in dev mode
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Metric] ${name}:`, value);
      }
    });
  }
  return monitorInstance;
}
