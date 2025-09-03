import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoActions } from '@/components/todo/TodoActions';

describe('TodoActions', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const todoText = 'Test todo item';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render edit and delete buttons', () => {
    render(<TodoActions todoText={todoText} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButton = screen.getByLabelText(`Edit "${todoText}"`);
    const deleteButton = screen.getByLabelText(`Delete "${todoText}"`);

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<TodoActions todoText={todoText} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButton = screen.getByLabelText(`Edit "${todoText}"`);
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<TodoActions todoText={todoText} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByLabelText(`Delete "${todoText}"`);
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it('should have proper accessibility labels', () => {
    render(<TodoActions todoText={todoText} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButton = screen.getByLabelText(`Edit "${todoText}"`);
    const deleteButton = screen.getByLabelText(`Delete "${todoText}"`);

    expect(editButton).toHaveAttribute('aria-label', `Edit "${todoText}"`);
    expect(deleteButton).toHaveAttribute('aria-label', `Delete "${todoText}"`);
  });

  it('should apply correct styling classes', () => {
    render(
      <TodoActions
        todoText={todoText}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        className="custom-class"
      />
    );

    const actionsContainer = screen.getByLabelText(`Delete "${todoText}"`).parentElement;
    expect(actionsContainer).toHaveClass('custom-class');
    expect(actionsContainer).toHaveClass('flex');
    expect(actionsContainer).toHaveClass('gap-1');
  });

  it('should apply destructive styling to delete button', () => {
    render(<TodoActions todoText={todoText} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByLabelText(`Delete "${todoText}"`);
    expect(deleteButton).toHaveClass('text-destructive');
  });
});
