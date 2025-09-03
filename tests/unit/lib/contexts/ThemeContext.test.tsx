import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/lib/contexts/ThemeContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock matchMedia
const matchMediaMock = vi.fn(() => ({
  matches: false,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// Mock document.documentElement.setAttribute
const setAttributeMock = vi.fn();

describe('ThemeContext', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup global mocks
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock,
    });

    Object.defineProperty(document.documentElement, 'setAttribute', {
      value: setAttributeMock,
    });

    // Reset localStorage mock store
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ThemeProvider', () => {
    it('should provide theme context to children', () => {
      const TestComponent = () => {
        const { theme } = useTheme();
        return <div data-testid="theme">{theme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme')).toBeInTheDocument();
    });

    it('should initialize with system theme by default', () => {
      const TestComponent = () => {
        const { theme } = useTheme();
        return <div data-testid="theme">{theme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('system');
    });

    it('should set data-theme attribute on document element', () => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      );

      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'light');
    });
  });

  describe('localStorage persistence', () => {
    it('should load theme from localStorage on initialization', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const TestComponent = () => {
        const { theme } = useTheme();
        return <div data-testid="theme">{theme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(localStorageMock.getItem).toHaveBeenCalledWith('todo-app-theme');
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    it('should save theme to localStorage when setTheme is called', () => {
      const TestComponent = () => {
        const { setTheme, theme } = useTheme();
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <button data-testid="set-theme" onClick={() => setTheme('dark')}>
              Set Dark
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      act(() => {
        screen.getByTestId('set-theme').click();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('todo-app-theme', 'dark');
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const TestComponent = () => {
        const { setTheme } = useTheme();
        return (
          <button data-testid="set-theme" onClick={() => setTheme('dark')}>
            Set Dark
          </button>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      act(() => {
        screen.getByTestId('set-theme').click();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save theme preference to localStorage');

      consoleSpy.mockRestore();
    });

    it('should handle invalid localStorage values', () => {
      localStorageMock.getItem.mockReturnValue('invalid-theme');

      const TestComponent = () => {
        const { theme } = useTheme();
        return <div data-testid="theme">{theme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('system');
    });
  });

  describe('system theme detection', () => {
    it('should detect system dark mode preference', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const TestComponent = () => {
        const { effectiveTheme } = useTheme();
        return <div data-testid="effective-theme">{effectiveTheme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(screen.getByTestId('effective-theme')).toHaveTextContent('dark');
    });

    it('should detect system light mode preference', () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const TestComponent = () => {
        const { effectiveTheme } = useTheme();
        return <div data-testid="effective-theme">{effectiveTheme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('effective-theme')).toHaveTextContent('light');
    });

    it('should listen for system theme changes when theme is system', () => {
      const addEventListenerMock = vi.fn();
      const removeEventListenerMock = vi.fn();

      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
      });

      const { unmount } = render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      );

      expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));

      unmount();

      expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      matchMediaMock.mockReturnValue({
        matches: false, // light mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const TestComponent = () => {
        const { toggleTheme, effectiveTheme, theme } = useTheme();
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <div data-testid="effective-theme">{effectiveTheme}</div>
            <button data-testid="toggle" onClick={toggleTheme}>
              Toggle
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('effective-theme')).toHaveTextContent('light');

      act(() => {
        screen.getByTestId('toggle').click();
      });

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('effective-theme')).toHaveTextContent('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('todo-app-theme', 'dark');
    });

    it('should toggle from dark to light', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const TestComponent = () => {
        const { toggleTheme, effectiveTheme, theme } = useTheme();
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <div data-testid="effective-theme">{effectiveTheme}</div>
            <button data-testid="toggle" onClick={toggleTheme}>
              Toggle
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('effective-theme')).toHaveTextContent('dark');

      act(() => {
        screen.getByTestId('toggle').click();
      });

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('effective-theme')).toHaveTextContent('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('todo-app-theme', 'light');
    });
  });

  describe('useTheme hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      const TestComponent = () => {
        useTheme();
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => render(<TestComponent />)).toThrow(
        'useTheme must be used within a ThemeProvider'
      );

      console.error = originalError;
    });
  });
});
