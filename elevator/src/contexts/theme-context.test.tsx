import { act, render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from './theme-context';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Test component to access context
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid='current-theme'>{theme}</div>
      <button data-testid='toggle-theme' onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Reset document attributes
    document.documentElement.removeAttribute('data-theme');
    // Reset matchMedia mock
    (window.matchMedia as jest.Mock).mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  describe('ThemeProvider', () => {
    it('renders children and provides context', () => {
      render(
        <ThemeProvider>
          <div data-testid='child'>Test Child</div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('initializes with light theme when no localStorage or system preference', async () => {
      await act(async () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('initializes with saved theme from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('dark');

      await act(async () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('initializes with system dark preference when no localStorage', async () => {
      (window.matchMedia as jest.Mock).mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      await act(async () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('prioritizes localStorage over system preference', async () => {
      localStorageMock.getItem.mockReturnValue('light');
      (window.matchMedia as jest.Mock).mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      await act(async () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('ignores invalid localStorage values', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-theme');

      await act(async () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('useTheme hook', () => {
    it('throws error when used outside provider', () => {
      const TestComponentOutsideProvider = () => {
        useTheme();
        return <div>Should not render</div>;
      };

      expect(() => {
        render(<TestComponentOutsideProvider />);
      }).toThrow('useTheme must be used within a ThemeProvider');
    });

    it('provides theme and toggleTheme when used within provider', async () => {
      await act(async () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      });

      expect(screen.getByTestId('current-theme')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-theme')).toBeInTheDocument();
    });
  });

  describe('Theme toggling', () => {
    it('toggles from light to dark theme', async () => {
      await act(async () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      });

      // Initial state
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      // Toggle theme
      await act(async () => {
        screen.getByTestId('toggle-theme').click();
      });

      // Should be dark now
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('toggles from dark to light theme', async () => {
      localStorageMock.getItem.mockReturnValue('dark');

      await act(async () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      });

      // Initial state
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      // Toggle theme
      await act(async () => {
        screen.getByTestId('toggle-theme').click();
      });

      // Should be light now
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('persists theme changes to localStorage', async () => {
      await act(async () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      });

      // Clear initial calls to focus on toggle
      localStorageMock.setItem.mockClear();

      // Get current theme and toggle to opposite
      const currentTheme = screen.getByTestId('current-theme').textContent;
      const expectedTheme = currentTheme === 'light' ? 'dark' : 'light';

      // Toggle theme
      await act(async () => {
        screen.getByTestId('toggle-theme').click();
      });

      // Should save to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'elevator-theme',
        expectedTheme
      );
    });

    it('updates document attribute when theme changes', async () => {
      await act(async () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      });

      // Get initial state
      const initialTheme = screen.getByTestId('current-theme').textContent;
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        initialTheme
      );

      // Toggle theme
      await act(async () => {
        screen.getByTestId('toggle-theme').click();
      });

      // Should update document attribute to opposite theme
      const newTheme = initialTheme === 'light' ? 'dark' : 'light';
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        newTheme
      );
    });
  });

  describe('Context value structure', () => {
    it('provides correct context value structure', async () => {
      let contextValue: any;

      const TestContextValue = () => {
        const value = useTheme();
        contextValue = value;
        return <div data-testid='context-value'>Context loaded</div>;
      };

      await act(async () => {
        render(
          <ThemeProvider>
            <TestContextValue />
          </ThemeProvider>
        );
      });

      expect(contextValue).toHaveProperty('theme');
      expect(contextValue).toHaveProperty('toggleTheme');
      expect(typeof contextValue.toggleTheme).toBe('function');
      expect(['light', 'dark']).toContain(contextValue.theme);
    });
  });

  describe('Multiple theme toggles', () => {
    it('handles multiple theme toggles correctly', async () => {
      await act(async () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      });

      // Get initial theme
      let currentTheme = screen.getByTestId('current-theme').textContent;
      expect(currentTheme).toMatch(/^(light|dark)$/);

      // First toggle
      await act(async () => {
        screen.getByTestId('toggle-theme').click();
      });
      currentTheme = screen.getByTestId('current-theme').textContent;
      expect(currentTheme).toMatch(/^(light|dark)$/);

      // Second toggle
      await act(async () => {
        screen.getByTestId('toggle-theme').click();
      });
      currentTheme = screen.getByTestId('current-theme').textContent;
      expect(currentTheme).toMatch(/^(light|dark)$/);

      // Third toggle
      await act(async () => {
        screen.getByTestId('toggle-theme').click();
      });
      currentTheme = screen.getByTestId('current-theme').textContent;
      expect(currentTheme).toMatch(/^(light|dark)$/);
    });

    it('maintains localStorage consistency across toggles', async () => {
      await act(async () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      });

      // Clear initial calls
      localStorageMock.setItem.mockClear();

      // First toggle
      await act(async () => {
        screen.getByTestId('toggle-theme').click();
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'elevator-theme',
        expect.any(String)
      );

      // Second toggle
      await act(async () => {
        screen.getByTestId('toggle-theme').click();
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'elevator-theme',
        expect.any(String)
      );
    });
  });

  describe('Edge cases', () => {
    it('handles missing matchMedia gracefully', async () => {
      // Remove matchMedia from window
      const originalMatchMedia = window.matchMedia;
      delete (window as any).matchMedia;

      await act(async () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      });

      const theme = screen.getByTestId('current-theme').textContent;
      expect(theme).toMatch(/^(light|dark)$/);

      // Restore matchMedia
      (window as any).matchMedia = originalMatchMedia;
    });
  });
});
