/**
 * PWA utilities for service worker registration and management
 */

interface ServiceWorkerUpdateEvent {
  type: 'update-available';
  registration: ServiceWorkerRegistration;
}

type PWAEventListener = (event: ServiceWorkerUpdateEvent) => void;

class PWAManager {
  private eventListeners: PWAEventListener[] = [];
  private registration: ServiceWorkerRegistration | null = null;

  /**
   * Register service worker and handle lifecycle events
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      // Wait for page load to avoid interfering with initial page load
      if (document.readyState === 'loading') {
        await new Promise((resolve) => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      console.log('Registering Service Worker...');
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully:', this.registration);

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              console.log('New Service Worker version available');
              this.notifyListeners({
                type: 'update-available',
                registration: this.registration!,
              });
            }
          });
        }
      });

      // Handle controller change (when new SW takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
        // Optionally reload the page when new SW takes control
        // window.location.reload();
      });

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Unregister service worker
   */
  async unregisterServiceWorker(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      this.registration = null;
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Update service worker (skip waiting)
   */
  async updateServiceWorker(): Promise<void> {
    if (!this.registration) {
      console.warn('No service worker registration found');
      return;
    }

    const waitingWorker = this.registration.waiting;
    if (waitingWorker) {
      // Tell the waiting service worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Force check for updates
      await this.registration.update();
    }
  }

  /**
   * Add event listener for PWA events
   */
  addEventListener(listener: PWAEventListener): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: PWAEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Notify all event listeners
   */
  private notifyListeners(event: ServiceWorkerUpdateEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('PWA event listener error:', error);
      }
    });
  }

  /**
   * Get current service worker registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Check if app is running in standalone mode (installed as PWA)
   */
  isPWAInstalled(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    );
  }

  /**
   * Request background sync (requires service worker registration)
   */
  async requestBackgroundSync(tag: string): Promise<void> {
    if (!this.registration) {
      console.warn('No service worker registration for background sync');
      return;
    }

    try {
      // Background sync API is not widely supported yet
      if ('sync' in this.registration) {
        await (this.registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register(tag);
        console.log('Background sync registered:', tag);
      } else {
        console.warn('Background sync not supported');
      }
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }
}

// Singleton instance
const pwaManager = new PWAManager();

/**
 * Initialize PWA features
 */
export async function initializePWA(): Promise<ServiceWorkerRegistration | null> {
  return pwaManager.registerServiceWorker();
}

/**
 * Show update notification using toast system
 */
export function showUpdateNotification(): void {
  // This would integrate with the toast system from Story 3.4
  // For now, we'll use a simple confirm dialog
  const shouldUpdate = confirm(
    'A new version of the app is available. Would you like to update now?'
  );

  if (shouldUpdate) {
    pwaManager.updateServiceWorker();
  }
}

/**
 * Register PWA update listener
 */
export function onPWAUpdate(callback: PWAEventListener): () => void {
  pwaManager.addEventListener(callback);

  return () => {
    pwaManager.removeEventListener(callback);
  };
}

/**
 * Check if PWA is installed
 */
export function isPWAInstalled(): boolean {
  return pwaManager.isPWAInstalled();
}

/**
 * Request background sync
 */
export function requestSync(tag: string): Promise<void> {
  return pwaManager.requestBackgroundSync(tag);
}

export { pwaManager };
