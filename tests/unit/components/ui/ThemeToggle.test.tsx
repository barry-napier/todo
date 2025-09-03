import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';

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

describe('ThemeToggle', () => {
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

  const renderWithThemeProvider = (component: React.ReactNode) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  describe('rendering', () => {
    it('should render theme toggle button', () => {
      renderWithThemeProvider(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have proper ARIA labels for light mode', () => {
      matchMediaMock.mockReturnValue({
        matches: false, // light mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      // Ensure localStorage returns null for clean state
      localStorageMock.getItem.mockReturnValue(null);

      renderWithThemeProvider(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
      expect(button).toHaveAttribute('title', 'Switch to dark mode');
    });

    it('should have proper ARIA labels for dark mode', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      renderWithThemeProvider(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      expect(button).toHaveAttribute('title', 'Switch to light mode');
    });

    it('should display sun icon in light mode', () => {
      matchMediaMock.mockReturnValue({
        matches: false, // light mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      // Ensure localStorage returns null for clean state
      localStorageMock.getItem.mockReturnValue(null);

      renderWithThemeProvider(<ThemeToggle />);

      // Check for sun icon SVG
      const sunIcon = screen.getByRole('button').querySelector('svg');
      expect(sunIcon).toBeInTheDocument();
      expect(sunIcon).toHaveAttribute('viewBox', '0 0 24 24');

      // Sun icon should have a circle (sun center) and paths (rays)
      const circle = sunIcon?.querySelector('circle[cx="12"][cy="12"][r="4"]');
      expect(circle).toBeInTheDocument();

      // Check for sun rays (should have multiple paths)
      const paths = sunIcon?.querySelectorAll('path');
      expect(paths?.length).toBeGreaterThan(0);
    });

    it('should display moon icon in dark mode', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      renderWithThemeProvider(<ThemeToggle />);

      // Check for moon icon SVG
      const moonIcon = screen.getByRole('button').querySelector('svg');
      expect(moonIcon).toBeInTheDocument();
      expect(moonIcon).toHaveAttribute('viewBox', '0 0 24 24');

      // Moon icon should have a path (crescent shape)
      const path = moonIcon?.querySelector('path[d*="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"]');
      expect(path).toBeInTheDocument();
    });

    it('should show label when showLabel is true', () => {
      // Ensure localStorage returns null for clean light mode state
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({
        matches: false, // light mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      renderWithThemeProvider(<ThemeToggle showLabel={true} />);

      // In light mode, should show "Dark" as the label (what you can switch TO)
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    it('should apply custom variant and size', () => {
      renderWithThemeProvider(<ThemeToggle variant="outline" size="lg" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-background', 'shadow-xs', 'h-10'); // outline variant and lg size styles
    });

    it('should apply custom className', () => {
      renderWithThemeProvider(<ThemeToggle className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('interactions', () => {
    it('should toggle theme on click', () => {
      // Ensure clean light mode state
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({
        matches: false, // light mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      renderWithThemeProvider(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Initially in light mode
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');

      // Click to toggle
      fireEvent.click(button);

      // Should save dark theme to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('todo-app-theme', 'dark');
    });

    it('should toggle theme on Enter key', () => {
      // Ensure clean light mode state
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({
        matches: false, // light mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      renderWithThemeProvider(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Press Enter key
      fireEvent.keyDown(button, { key: 'Enter' });

      // Should save dark theme to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('todo-app-theme', 'dark');
    });

    it('should toggle theme on Space key', () => {
      // Ensure clean light mode state
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({
        matches: false, // light mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      renderWithThemeProvider(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Press Space key
      fireEvent.keyDown(button, { key: ' ' });

      // Should save dark theme to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('todo-app-theme', 'dark');
    });

    it('should not toggle theme on other keys', () => {
      matchMediaMock.mockReturnValue({
        matches: false, // light mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      renderWithThemeProvider(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Press random key
      fireEvent.keyDown(button, { key: 'a' });

      // Should not save theme to localStorage
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should handle keyboard events properly', () => {
      // Ensure clean light mode state
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({
        matches: false, // light mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      renderWithThemeProvider(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Test that Enter and Space keys trigger theme toggle (testing the actual behavior)
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('todo-app-theme', 'dark');

      // Reset mock and test Space key
      localStorageMock.setItem.mockClear();
      fireEvent.keyDown(button, { key: ' ' });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('todo-app-theme', 'light');
    });
  });

  describe('accessibility', () => {
    it('should have proper button type', () => {
      renderWithThemeProvider(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should be keyboard focusable', () => {
      renderWithThemeProvider(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveProperty('tabIndex', 0);
    });

    it('should update ARIA labels when theme changes', () => {
      // Ensure clean light mode state
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({
        matches: false, // light mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      renderWithThemeProvider(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Initially in light mode
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');

      // Toggle to dark mode
      fireEvent.click(button);

      // Should update ARIA label
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });
  });

  describe('icon display', () => {
    it('should switch from sun to moon icon when toggling', () => {
      // Ensure clean light mode state
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({
        matches: false, // light mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      renderWithThemeProvider(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Initially should show sun icon (light mode)
      let icon = button.querySelector('svg');
      const circle = icon?.querySelector('circle[cx="12"][cy="12"][r="4"]');
      expect(circle).toBeInTheDocument();

      // Toggle to dark mode
      fireEvent.click(button);

      // Should now show moon icon
      icon = button.querySelector('svg');
      const path = icon?.querySelector('path[d*="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"]');
      expect(path).toBeInTheDocument();
    });
  });
});
