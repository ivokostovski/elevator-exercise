import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './theme-toggle';

// Mock the theme context
const mockToggleTheme = jest.fn();
const mockUseTheme = jest.fn();

jest.mock('../contexts/theme-context', () => ({
  useTheme: () => mockUseTheme(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Light theme state', () => {
    beforeEach(() => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });
    });

    it('renders with light theme styling', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('theme-toggle');
    });

    it('displays moon icon and dark label for light theme', () => {
      render(<ThemeToggle />);

      expect(screen.getByText('🌙')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    it('has correct accessibility attributes for light theme', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
      expect(button).toHaveAttribute('title', 'Switch to dark theme');
    });

    it('calls toggleTheme when clicked', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      await act(async () => {
        await user.click(button);
      });

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dark theme state', () => {
    beforeEach(() => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      });
    });

    it('displays sun icon and light label for dark theme', () => {
      render(<ThemeToggle />);

      expect(screen.getByText('☀️')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('has correct accessibility attributes for dark theme', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
      expect(button).toHaveAttribute('title', 'Switch to light theme');
    });

    it('calls toggleTheme when clicked', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      await act(async () => {
        await user.click(button);
      });

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component structure', () => {
    beforeEach(() => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });
    });

    it('renders as a button element', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('contains theme icon and label spans', () => {
      render(<ThemeToggle />);

      const iconSpan = screen.getByText('🌙').closest('span');
      const labelSpan = screen.getByText('Dark').closest('span');

      expect(iconSpan).toHaveClass('theme-icon');
      expect(labelSpan).toHaveClass('theme-label');
    });

    it('has proper CSS classes', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('theme-toggle');
    });
  });

  describe('Integration with theme context', () => {
    it('uses theme context hook', () => {
      render(<ThemeToggle />);

      expect(mockUseTheme).toHaveBeenCalledTimes(1);
    });

    it('passes theme and toggleTheme from context', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeToggle />);

      expect(mockUseTheme).toHaveBeenCalled();
    });
  });

  describe('User interactions', () => {
    beforeEach(() => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });
    });

    it('handles multiple clicks correctly', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      await act(async () => {
        await user.click(button);
      });
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);

      await act(async () => {
        await user.click(button);
      });
      expect(mockToggleTheme).toHaveBeenCalledTimes(2);
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      button.focus();

      await act(async () => {
        await user.keyboard('{Enter}');
      });
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);

      await act(async () => {
        await user.keyboard(' ');
      });
      expect(mockToggleTheme).toHaveBeenCalledTimes(2);
    });
  });
});
