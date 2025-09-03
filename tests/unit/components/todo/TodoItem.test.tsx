import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from '@/components/todo/TodoItem';
import { Todo } from '@/types/todo';

describe('TodoItem', () => {
  const mockTodo: Todo = {
    id: '1',
    text: 'Test todo',
    completed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render todo text correctly', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  it('should show strikethrough for completed todos', () => {
    const completedTodo = { ...mockTodo, completed: true };

    render(
      <TodoItem
        todo={completedTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const todoText = screen.getByText('Test todo');
    expect(todoText).toHaveClass('line-through');
    expect(todoText).toHaveClass('text-muted-foreground');
    expect(todoText).toHaveClass('decoration-2');
  });

  it('should apply opacity to completed todo card', () => {
    const completedTodo = { ...mockTodo, completed: true };

    const { container } = render(
      <TodoItem
        todo={completedTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const card = container.querySelector('.opacity-60');
    expect(card).toBeInTheDocument();
  });

  it('should have transition animations for visual feedback', () => {
    const { container } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const card = container.querySelector('[class*="transition-all"]');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('duration-300');

    const todoText = screen.getByText('Test todo');
    expect(todoText).toHaveClass('transition-all', 'duration-200');
  });

  it('should call onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  it('should enter edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByLabelText('Edit "Test todo"');
    await user.click(editButton);

    expect(screen.getByDisplayValue('Test todo')).toBeInTheDocument();
    expect(screen.getByLabelText('Save changes')).toBeInTheDocument();
    expect(screen.getByLabelText('Cancel editing')).toBeInTheDocument();
  });

  it('should update todo text when saved', async () => {
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByLabelText('Edit "Test todo"');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test todo');
    await user.clear(input);
    await user.type(input, 'Updated todo');

    const saveButton = screen.getByLabelText('Save changes');
    await user.click(saveButton);

    expect(mockOnUpdate).toHaveBeenCalledWith('1', { text: 'Updated todo' });
  });

  it('should cancel edit mode when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByLabelText('Edit "Test todo"');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test todo');
    await user.clear(input);
    await user.type(input, 'Changed text');

    const cancelButton = screen.getByLabelText('Cancel editing');
    await user.click(cancelButton);

    expect(screen.getByText('Test todo')).toBeInTheDocument();
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should save on Enter key press', async () => {
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByLabelText('Edit "Test todo"');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test todo');
    await user.clear(input);
    await user.type(input, 'New text{Enter}');

    expect(mockOnUpdate).toHaveBeenCalledWith('1', { text: 'New text' });
  });

  it('should cancel on Escape key press', async () => {
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByLabelText('Edit "Test todo"');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test todo');
    await user.clear(input);
    await user.type(input, 'Changed text{Escape}');

    expect(screen.getByText('Test todo')).toBeInTheDocument();
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should call onDelete with animation when delete button is clicked', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByLabelText('Delete "Test todo"');
    await user.click(deleteButton);

    const card = container.querySelector('.animate-slide-out');
    expect(card).toBeInTheDocument();

    await waitFor(
      () => {
        expect(mockOnDelete).toHaveBeenCalledWith('1');
      },
      { timeout: 400 }
    );
  });

  it('should have hover state on card', () => {
    const { container } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const card = container.querySelector('[class*="hover:shadow-md"]');
    expect(card).toBeInTheDocument();
  });

  it('should trim whitespace when saving edited text', async () => {
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByLabelText('Edit "Test todo"');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test todo');
    await user.clear(input);
    await user.type(input, '  Trimmed text  ');

    const saveButton = screen.getByLabelText('Save changes');
    await user.click(saveButton);

    expect(mockOnUpdate).toHaveBeenCalledWith('1', { text: 'Trimmed text' });
  });

  it('should not update if text is unchanged', async () => {
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByLabelText('Edit "Test todo"');
    await user.click(editButton);

    const saveButton = screen.getByLabelText('Save changes');
    await user.click(saveButton);

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should not save empty text', async () => {
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByLabelText('Edit "Test todo"');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test todo');
    await user.clear(input);

    const saveButton = screen.getByLabelText('Save changes');
    await user.click(saveButton);

    expect(mockOnUpdate).not.toHaveBeenCalled();
    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  describe('Accessibility for Toggle', () => {
    it('should have proper aria-label on checkbox for uncompleted todo', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Mark "Test todo" as complete');
    });

    it('should have proper aria-label on checkbox for completed todo', () => {
      const completedTodo = { ...mockTodo, completed: true };

      render(
        <TodoItem
          todo={completedTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Mark "Test todo" as incomplete');
    });

    it('should support keyboard focus on checkbox', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      expect(checkbox).toHaveFocus();
      // Radix UI CheckboxPrimitive handles keyboard events (Space/Enter) internally
      // The onToggle is called through Radix's internal keyboard handling
    });

    it('should have correct checkbox association', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', `todo-${mockTodo.id}`);
    });
  });

  describe('Edit Mode Features', () => {
    it('should enter edit mode when clicking on todo text', async () => {
      const user = userEvent.setup();

      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const todoText = screen.getByText('Test todo');
      await user.click(todoText);

      expect(screen.getByDisplayValue('Test todo')).toBeInTheDocument();
      expect(screen.getByLabelText('Save changes')).toBeInTheDocument();
      expect(screen.getByLabelText('Cancel editing')).toBeInTheDocument();
    });

    it('should auto-focus and select all text when entering edit mode', async () => {
      const user = userEvent.setup();

      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const editButton = screen.getByLabelText('Edit "Test todo"');
      await user.click(editButton);

      const input = screen.getByDisplayValue('Test todo') as HTMLInputElement;
      expect(input).toHaveFocus();
    });

    it('should save on blur (clicking outside)', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <TodoItem
            todo={mockTodo}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
            onUpdate={mockOnUpdate}
          />
          <button>Outside element</button>
        </div>
      );

      const editButton = screen.getByLabelText('Edit "Test todo"');
      await user.click(editButton);

      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);
      await user.type(input, 'New text');

      const outsideElement = screen.getByText('Outside element');
      await user.click(outsideElement);

      expect(mockOnUpdate).toHaveBeenCalledWith('1', { text: 'New text' });
    });

    it('should not allow text longer than 500 characters', async () => {
      const user = userEvent.setup();

      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const editButton = screen.getByLabelText('Edit "Test todo"');
      await user.click(editButton);

      const input = screen.getByDisplayValue('Test todo') as HTMLInputElement;
      expect(input).toHaveAttribute('maxLength', '500');
    });

    it('should restore original text when saving empty string', async () => {
      const user = userEvent.setup();

      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const editButton = screen.getByLabelText('Edit "Test todo"');
      await user.click(editButton);

      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);
      await user.type(input, '   '); // Only spaces

      const saveButton = screen.getByLabelText('Save changes');
      await user.click(saveButton);

      expect(screen.getByText('Test todo')).toBeInTheDocument();
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('should not call onUpdate if text is only whitespace changes', async () => {
      const user = userEvent.setup();

      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const editButton = screen.getByLabelText('Edit "Test todo"');
      await user.click(editButton);

      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);
      await user.type(input, '  Test todo  '); // Same text with spaces

      const saveButton = screen.getByLabelText('Save changes');
      await user.click(saveButton);

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('should show edit icon button with Pencil icon', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const editButton = screen.getByLabelText('Edit "Test todo"');
      expect(editButton).toBeInTheDocument();

      // Check for the Edit2 icon from lucide-react
      const icon = editButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should handle max length validation by truncating', async () => {
      const user = userEvent.setup();
      const longText = 'a'.repeat(501); // 501 characters

      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const editButton = screen.getByLabelText('Edit "Test todo"');
      await user.click(editButton);

      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);

      // The input element has maxLength=500, so it won't accept more than 500 chars
      await user.type(input, longText);

      const saveButton = screen.getByLabelText('Save changes');
      await user.click(saveButton);

      // Verify the onUpdate was called with exactly 500 characters
      expect(mockOnUpdate).toHaveBeenCalledWith('1', { text: 'a'.repeat(500) });
    });
  });
});
