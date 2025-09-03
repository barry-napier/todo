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
});
