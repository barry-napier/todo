import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout/Header';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';

// Mock matchMedia and localStorage
const matchMediaMock = vi.fn(() => ({
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

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

describe('Header', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock,
      writable: true,
    });
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Only define setAttribute if it doesn't already exist or redefine safely
    const originalSetAttribute = document.documentElement.setAttribute;
    if (originalSetAttribute !== vi.fn()) {
      Object.defineProperty(document.documentElement, 'setAttribute', {
        value: vi.fn(),
        writable: true,
        configurable: true,
      });
    }

    vi.clearAllMocks();
  });

  const renderWithTheme = (component: React.ReactNode) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('should render app title', () => {
    renderWithTheme(<Header />);
    const title = screen.getByText('Todo App');
    expect(title).toBeInTheDocument();
  });

  it('should have sticky positioning', () => {
    const { container } = renderWithTheme(<Header />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky', 'top-0');
  });

  it('should be responsive with different text sizes', () => {
    const { container } = renderWithTheme(<Header />);
    const title = container.querySelector('h1');
    expect(title).toHaveClass('text-lg', 'sm:text-xl', 'md:text-2xl');
  });

  it('should have proper z-index for layering', () => {
    const { container } = renderWithTheme(<Header />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('z-50');
  });
});
