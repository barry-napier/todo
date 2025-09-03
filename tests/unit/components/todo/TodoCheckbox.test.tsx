import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoCheckbox } from '@/components/todo/TodoCheckbox';

describe('TodoCheckbox', () => {
  const mockOnCheckedChange = vi.fn();
  const defaultProps = {
    todoId: 'test-id-1',
    todoText: 'Test todo item',
    checked: false,
    onCheckedChange: mockOnCheckedChange,
  };

  beforeEach(() => {
    mockOnCheckedChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render checkbox with correct initial state', () => {
      render(<TodoCheckbox {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
      expect(checkbox).toHaveAttribute('id', 'todo-test-id-1');
    });

    it('should render as checked when checked prop is true', () => {
      render(<TodoCheckbox {...defaultProps} checked={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should apply custom className when provided', () => {
      const { container } = render(<TodoCheckbox {...defaultProps} className="custom-class" />);

      const checkbox = container.querySelector('button[role="checkbox"]');
      expect(checkbox).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have correct aria-label for unchecked state', () => {
      render(<TodoCheckbox {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Mark "Test todo item" as complete');
    });

    it('should have correct aria-label for checked state', () => {
      render(<TodoCheckbox {...defaultProps} checked={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Mark "Test todo item" as incomplete');
    });

    it('should be focusable via keyboard', async () => {
      render(<TodoCheckbox {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });

    it('should have proper keyboard navigation attributes', async () => {
      render(<TodoCheckbox {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      // Radix UI CheckboxPrimitive handles keyboard events internally
      // We verify that the checkbox is keyboard accessible by checking it can receive focus
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });
  });

  describe('Interactions', () => {
    it('should call onCheckedChange when clicked', async () => {
      const user = userEvent.setup();
      render(<TodoCheckbox {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockOnCheckedChange).toHaveBeenCalledTimes(1);
      expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should toggle from checked to unchecked', async () => {
      const user = userEvent.setup();
      render(<TodoCheckbox {...defaultProps} checked={true} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockOnCheckedChange).toHaveBeenCalledWith(false);
    });

    it('should handle rapid clicks correctly', async () => {
      const user = userEvent.setup();
      render(<TodoCheckbox {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      expect(mockOnCheckedChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Visual States', () => {
    it('should show check icon when checked', () => {
      const { container } = render(<TodoCheckbox {...defaultProps} checked={true} />);

      const checkIcon = container.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
      expect(checkIcon).toHaveClass('h-3.5', 'w-3.5');
    });

    it('should have hover styles', async () => {
      const user = userEvent.setup();
      const { container } = render(<TodoCheckbox {...defaultProps} />);

      const checkbox = container.querySelector('button[role="checkbox"]');

      await user.hover(checkbox!);
      expect(checkbox).toHaveClass('hover:border-primary/80', 'hover:shadow-sm');
    });

    it('should have focus styles', () => {
      render(<TodoCheckbox {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      expect(checkbox).toHaveClass(
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2'
      );
    });
  });
});
