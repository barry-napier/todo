import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface UseInstallPromptReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
  dismissInstall: () => void;
  canInstall: boolean;
}

/**
 * Hook for managing PWA installation prompt
 */
export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if app is already installed
  const checkIfInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;

    // Check if running in standalone mode (installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // Check iOS standalone mode
    const isIOSStandalone = (window.navigator as { standalone?: boolean }).standalone === true;

    // Check if installed via Chrome's app install banner
    const isInstalled = isStandalone || isIOSStandalone;

    setIsInstalled(isInstalled);
    return isInstalled;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check initial installation state
    checkIfInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');

      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Save the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Optionally, send analytics event
      console.log('PWA install prompt available');
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsInstalled(true);

      // Show success notification
      console.log('App installed successfully!');
    };

    const handleDisplayModeChange = () => {
      checkIfInstalled();
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    } else if (mediaQuery.addListener) {
      // Fallback for older browsers
      mediaQuery.addListener(handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);

      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, [checkIfInstalled]);

  /**
   * Show the install prompt
   */
  const promptInstall = useCallback(async (): Promise<void> => {
    if (!deferredPrompt) {
      console.warn('Install prompt not available');
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`User response to install prompt: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      // Clean up the deferred prompt
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  }, [deferredPrompt]);

  /**
   * Dismiss the install prompt (hide it from UI)
   */
  const dismissInstall = useCallback(() => {
    setIsInstallable(false);
    console.log('Install prompt dismissed by user');

    // Optionally store dismissal in localStorage to avoid showing again soon
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  }, []);

  /**
   * Check if we can show install prompt based on dismissal history
   */
  const canInstall = useCallback(() => {
    if (!isInstallable || isInstalled) return false;

    if (typeof window === 'undefined') return false;

    // Check if user recently dismissed the prompt
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const timeSinceDismissal = Date.now() - parseInt(dismissedTime, 10);
      const DISMISSAL_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (timeSinceDismissal < DISMISSAL_COOLDOWN) {
        return false;
      }
    }

    return true;
  }, [isInstallable, isInstalled]);

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    dismissInstall,
    canInstall: canInstall(),
  };
}

/**
 * Hook for detecting PWA installation state changes
 */
export function useInstallationState() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [installationMethod, setInstallationMethod] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkInstallationState = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;

      const installed = isStandalone || isIOSStandalone || isFullscreen || isMinimalUI;
      setIsInstalled(installed);

      // Detect installation method
      if (isStandalone) {
        setInstallationMethod('web-app-manifest');
      } else if (isIOSStandalone) {
        setInstallationMethod('ios-add-to-homescreen');
      } else if (isFullscreen) {
        setInstallationMethod('fullscreen');
      } else if (isMinimalUI) {
        setInstallationMethod('minimal-ui');
      } else {
        setInstallationMethod(null);
      }
    };

    // Initial check
    checkInstallationState();

    // Listen for display mode changes
    const mediaQueries = [
      '(display-mode: standalone)',
      '(display-mode: fullscreen)',
      '(display-mode: minimal-ui)',
    ];

    const listeners = mediaQueries.map((query) => {
      const mq = window.matchMedia(query);
      const listener = checkInstallationState;

      if (mq.addEventListener) {
        mq.addEventListener('change', listener);
      } else if (mq.addListener) {
        mq.addListener(listener);
      }

      return { mq, listener };
    });

    return () => {
      listeners.forEach(({ mq, listener }) => {
        if (mq.removeEventListener) {
          mq.removeEventListener('change', listener);
        } else if (mq.removeListener) {
          mq.removeListener(listener);
        }
      });
    };
  }, []);

  return {
    isInstalled,
    installationMethod,
  };
}
