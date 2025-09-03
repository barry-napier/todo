import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoItem } from '@/components/todo/TodoItem';
import { Todo } from '@/types/todo';

describe('TodoItem - Delete Functionality', () => {
  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdate = vi.fn();

  const testTodo: Todo = {
    id: '1',
    text: 'Test todo item',
    completed: false,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render delete button', () => {
    render(
      <TodoItem
        todo={testTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByLabelText(`Delete "${testTodo.text}"`);
    expect(deleteButton).toBeInTheDocument();
  });

  it('should show confirmation dialog when delete is clicked', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => false);

    render(
      <TodoItem
        todo={testTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByLabelText(`Delete "${testTodo.text}"`);
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith(`Delete "${testTodo.text}"?`);
    expect(mockOnDelete).not.toHaveBeenCalled(); // Should not delete if not confirmed
  });

  it('should call onDelete when deletion is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <TodoItem
        todo={testTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByLabelText(`Delete "${testTodo.text}"`);
    fireEvent.click(deleteButton);

    // Wait for animation timeout
    await waitFor(
      () => {
        expect(mockOnDelete).toHaveBeenCalledWith(testTodo.id);
      },
      { timeout: 400 }
    );
  });

  it('should not call onDelete when deletion is cancelled', () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => false);

    render(
      <TodoItem
        todo={testTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByLabelText(`Delete "${testTodo.text}"`);
    fireEvent.click(deleteButton);

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should apply animation class when deleting', async () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    const { container } = render(
      <TodoItem
        todo={testTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByLabelText(`Delete "${testTodo.text}"`);
    fireEvent.click(deleteButton);

    // Check that animation class is applied
    const card = container.querySelector('.animate-slide-out');
    expect(card).toBeInTheDocument();

    // Wait for deletion to complete
    await waitFor(
      () => {
        expect(mockOnDelete).toHaveBeenCalled();
      },
      { timeout: 400 }
    );
  });

  it('should create screen reader announcement for deletion', async () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <TodoItem
        todo={testTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByLabelText(`Delete "${testTodo.text}"`);
    fireEvent.click(deleteButton);

    // Wait for announcement to be created
    await waitFor(() => {
      const announcement = document.querySelector('[role="status"][aria-live="polite"]');
      expect(announcement).toBeInTheDocument();
      expect(announcement).toHaveTextContent(`Deleting todo: ${testTodo.text}`);
    });

    // Wait for deletion to complete and announcement to update
    await waitFor(
      () => {
        const announcement = document.querySelector('[role="status"][aria-live="polite"]');
        expect(announcement).toHaveTextContent(`Todo deleted: ${testTodo.text}`);
      },
      { timeout: 400 }
    );
  });

  it('should handle delete errors gracefully', async () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    const mockOnDeleteWithError = vi.fn(() => {
      throw new Error('Delete failed');
    });

    render(
      <TodoItem
        todo={testTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDeleteWithError}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByLabelText(`Delete "${testTodo.text}"`);
    fireEvent.click(deleteButton);

    // Wait for animation timeout
    await waitFor(
      () => {
        expect(mockOnDeleteWithError).toHaveBeenCalled();
      },
      { timeout: 400 }
    );
  });

  it('should have keyboard accessible delete button', () => {
    render(
      <TodoItem
        todo={testTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByLabelText(`Delete "${testTodo.text}"`);

    // Check that button is focusable
    deleteButton.focus();
    expect(document.activeElement).toBe(deleteButton);

    // Click via keyboard (Enter/Space triggers click on button)
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
  });

  it('should show delete button on hover (desktop)', () => {
    const { container } = render(
      <TodoItem
        todo={testTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const card = container.querySelector('.group');
    expect(card).toBeInTheDocument();

    // TodoActions should have opacity-0 class initially
    const actionsContainer = screen.getByLabelText(`Delete "${testTodo.text}"`).parentElement;
    expect(actionsContainer).toHaveClass('opacity-0');
    expect(actionsContainer).toHaveClass('group-hover:opacity-100');
  });
});
