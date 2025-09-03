import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInstallPrompt, useInstallationState } from '@/lib/hooks/useInstallPrompt';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// Mock window and navigator
const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  matchMedia: vi.fn(),
  navigator: {
    standalone: false,
  },
};

describe('useInstallPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      configurable: true,
    });

    Object.defineProperty(global, 'window', {
      value: mockWindow,
      configurable: true,
    });

    global.console.log = vi.fn();
    global.console.warn = vi.fn();
    global.console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct default state', () => {
    mockWindow.matchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.canInstall).toBe(false);
  });

  it('should detect installed state in standalone mode', () => {
    mockWindow.matchMedia.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isInstalled).toBe(true);
  });

  it('should detect iOS standalone mode', () => {
    mockWindow.matchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    Object.defineProperty(global, 'window', {
      value: {
        ...mockWindow,
        navigator: { standalone: true },
      },
      configurable: true,
    });

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isInstalled).toBe(true);
  });

  it('should handle beforeinstallprompt event', () => {
    mockWindow.matchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useInstallPrompt());

    // Simulate beforeinstallprompt event
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    };

    const eventListener = mockWindow.addEventListener.mock.calls.find(
      (call) => call[0] === 'beforeinstallprompt'
    )?.[1];

    if (eventListener) {
      act(() => {
        eventListener(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.isInstallable).toBe(true);
    }
  });

  it('should prompt for installation', async () => {
    mockWindow.matchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useInstallPrompt());

    // Mock deferred prompt
    const mockDeferredPrompt = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    };

    // Simulate setting the deferred prompt
    const eventListener = mockWindow.addEventListener.mock.calls.find(
      (call) => call[0] === 'beforeinstallprompt'
    )?.[1];

    if (eventListener) {
      act(() => {
        eventListener(mockDeferredPrompt);
      });
    }

    // Now prompt for installation
    await act(async () => {
      await result.current.promptInstall();
    });

    expect(mockDeferredPrompt.prompt).toHaveBeenCalled();
  });

  it('should handle prompt rejection', async () => {
    mockWindow.matchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useInstallPrompt());

    const mockDeferredPrompt = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
    };

    const eventListener = mockWindow.addEventListener.mock.calls.find(
      (call) => call[0] === 'beforeinstallprompt'
    )?.[1];

    if (eventListener) {
      act(() => {
        eventListener(mockDeferredPrompt);
      });
    }

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(result.current.isInstallable).toBe(false);
  });

  it('should handle prompt install without deferred prompt', async () => {
    mockWindow.matchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useInstallPrompt());

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(global.console.warn).toHaveBeenCalledWith('Install prompt not available');
  });

  it('should dismiss install prompt', () => {
    mockWindow.matchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      result.current.dismissInstall();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'pwa-install-dismissed',
      expect.any(String)
    );
  });

  it('should respect dismissal cooldown', () => {
    mockWindow.matchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    // Mock recent dismissal
    const recentDismissal = (Date.now() - 1000).toString(); // 1 second ago
    mockLocalStorage.getItem.mockReturnValue(recentDismissal);

    const { result } = renderHook(() => useInstallPrompt());

    // Set installable state
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    };

    const eventListener = mockWindow.addEventListener.mock.calls.find(
      (call) => call[0] === 'beforeinstallprompt'
    )?.[1];

    if (eventListener) {
      act(() => {
        eventListener(mockEvent);
      });
    }

    expect(result.current.canInstall).toBe(false);
  });

  it('should handle appinstalled event', () => {
    mockWindow.matchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useInstallPrompt());

    const appInstalledListener = mockWindow.addEventListener.mock.calls.find(
      (call) => call[0] === 'appinstalled'
    )?.[1];

    if (appInstalledListener) {
      act(() => {
        appInstalledListener();
      });

      expect(result.current.isInstalled).toBe(true);
      expect(result.current.isInstallable).toBe(false);
    }
  });
});

describe('useInstallationState', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(global, 'window', {
      value: mockWindow,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect standalone installation', () => {
    mockWindow.matchMedia.mockImplementation((query) => ({
      matches: query === '(display-mode: standalone)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    const { result } = renderHook(() => useInstallationState());

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.installationMethod).toBe('web-app-manifest');
  });

  it('should detect iOS standalone installation', () => {
    mockWindow.matchMedia.mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    Object.defineProperty(global, 'window', {
      value: {
        ...mockWindow,
        navigator: { standalone: true },
      },
      configurable: true,
    });

    const { result } = renderHook(() => useInstallationState());

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.installationMethod).toBe('ios-add-to-homescreen');
  });

  it('should detect fullscreen mode', () => {
    mockWindow.matchMedia.mockImplementation((query) => ({
      matches: query === '(display-mode: fullscreen)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    const { result } = renderHook(() => useInstallationState());

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.installationMethod).toBe('fullscreen');
  });

  it('should detect minimal-ui mode', () => {
    mockWindow.matchMedia.mockImplementation((query) => ({
      matches: query === '(display-mode: minimal-ui)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    const { result } = renderHook(() => useInstallationState());

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.installationMethod).toBe('minimal-ui');
  });

  it('should handle no installation', () => {
    mockWindow.matchMedia.mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    const { result } = renderHook(() => useInstallationState());

    expect(result.current.isInstalled).toBe(false);
    expect(result.current.installationMethod).toBe(null);
  });
});
