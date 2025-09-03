import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainLayout } from '@/components/layout/MainLayout';
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

describe('MainLayout', () => {
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

  const renderWithTheme = (children: React.ReactNode) => {
    return render(<ThemeProvider>{children}</ThemeProvider>);
  };

  it('should render header and children', () => {
    renderWithTheme(
      <MainLayout>
        <div data-testid="content">Page Content</div>
      </MainLayout>
    );

    expect(screen.getByText('Todo App')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should have min-height screen', () => {
    const { container } = renderWithTheme(<MainLayout>Content</MainLayout>);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('min-h-screen');
  });

  it('should have background class', () => {
    const { container } = renderWithTheme(<MainLayout>Content</MainLayout>);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('bg-background');
  });

  it('should wrap children in main element', () => {
    const { container } = renderWithTheme(<MainLayout>Content</MainLayout>);
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1');
  });
});
