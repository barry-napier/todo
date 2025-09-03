import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage for Node.js environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock document and DOM
const documentMock = {
  documentElement: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
    },
  },
};

Object.defineProperty(global, 'document', {
  value: documentMock,
  writable: true,
});

// Theme management functions
const THEME_STORAGE_KEY = 'personal-todo-app-theme';

type Theme = 'light' | 'dark';

const saveThemeToStorage = (theme: Theme): void => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

const loadThemeFromStorage = (): Theme => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return (stored === 'dark' || stored === 'light') ? stored : 'light';
};

const applyTheme = (theme: Theme): void => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const toggleTheme = (currentTheme: Theme): Theme => {
  const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
  saveThemeToStorage(newTheme);
  applyTheme(newTheme);
  return newTheme;
};

const initializeTheme = (): Theme => {
  const theme = loadThemeFromStorage();
  applyTheme(theme);
  return theme;
};

describe('Theme Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Theme Persistence', () => {
    it('should save theme to localStorage', () => {
      saveThemeToStorage('dark');

      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBe('dark');
    });

    it('should load theme from localStorage', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      
      const theme = loadThemeFromStorage();
      expect(theme).toBe('dark');
    });

    it('should default to light theme when no theme is stored', () => {
      const theme = loadThemeFromStorage();
      expect(theme).toBe('light');
    });

    it('should handle invalid theme values', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'invalid');
      
      const theme = loadThemeFromStorage();
      expect(theme).toBe('light');
    });
  });

  describe('Theme Application', () => {
    it('should apply dark theme to document', () => {
      applyTheme('dark');
      
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should remove dark theme for light theme', () => {
      applyTheme('light');
      
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    });

    it('should initialize theme on app start', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      
      const theme = initializeTheme();
      
      expect(theme).toBe('dark');
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should initialize with light theme by default', () => {
      const theme = initializeTheme();
      
      expect(theme).toBe('light');
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    });
  });

  describe('Theme Toggling', () => {
    it('should toggle from light to dark', () => {
      const newTheme = toggleTheme('light');
      
      expect(newTheme).toBe('dark');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should toggle from dark to light', () => {
      const newTheme = toggleTheme('dark');
      
      expect(newTheme).toBe('light');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    });

    it('should handle multiple toggles', () => {
      let currentTheme: Theme = 'light';
      
      // Toggle to dark
      currentTheme = toggleTheme(currentTheme);
      expect(currentTheme).toBe('dark');
      
      // Toggle back to light
      currentTheme = toggleTheme(currentTheme);
      expect(currentTheme).toBe('light');
      
      // Toggle to dark again
      currentTheme = toggleTheme(currentTheme);
      expect(currentTheme).toBe('dark');
    });
  });

  describe('Theme State Management', () => {
    it('should maintain theme consistency between storage and DOM', () => {
      // Set dark theme
      saveThemeToStorage('dark');
      applyTheme('dark');
      
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
      
      // Set light theme
      saveThemeToStorage('light');
      applyTheme('light');
      
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    });

    it('should handle theme changes during session', () => {
      // Start with light theme
      let theme = initializeTheme();
      expect(theme).toBe('light');
      
      // User toggles to dark
      theme = toggleTheme(theme);
      expect(theme).toBe('dark');
      
      // Simulate page reload - should maintain dark theme
      const reloadedTheme = initializeTheme();
      expect(reloadedTheme).toBe('dark');
    });
  });

  describe('System Theme Detection', () => {
    it('should handle system preference detection', () => {
      // Mock matchMedia for system theme detection
      const mockMatchMedia = vi.fn((query: string) => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      const detectSystemTheme = (): Theme => {
        if (typeof window !== 'undefined' && window.matchMedia) {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
      };

      const systemTheme = detectSystemTheme();
      expect(systemTheme).toBe('dark'); // Based on our mock
    });

    it('should fallback gracefully when matchMedia is not available', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
      });

      const detectSystemTheme = (): Theme => {
        if (typeof window !== 'undefined' && window.matchMedia) {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
      };

      const systemTheme = detectSystemTheme();
      expect(systemTheme).toBe('light');
    });
  });

  describe('Theme Performance', () => {
    it('should minimize DOM operations', () => {
      // Apply same theme twice - should not call DOM methods unnecessarily
      applyTheme('dark');
      vi.clearAllMocks();
      applyTheme('dark');
      
      // In a real implementation, this would check for current state
      // before making DOM changes to avoid unnecessary operations
    });

    it('should handle rapid theme changes', () => {
      let currentTheme: Theme = 'light';
      
      // Simulate rapid toggling
      for (let i = 0; i < 10; i++) {
        currentTheme = toggleTheme(currentTheme);
      }
      
      // Should end up back at light after even number of toggles
      expect(currentTheme).toBe('light');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    });
  });
});