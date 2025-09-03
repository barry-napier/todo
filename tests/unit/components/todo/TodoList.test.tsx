import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoList } from '@/components/todo/TodoList';
import { Todo } from '@/types/todo';

describe('TodoList', () => {
  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdate = vi.fn();

  const mockTodos: Todo[] = [
    {
      id: '1',
      text: 'First todo',
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      text: 'Second todo',
      completed: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '3',
      text: 'Third todo',
      completed: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
  ];

  it('should render todos in chronological order (newest first)', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const todoTexts = screen.getAllByRole('checkbox').map((checkbox) => {
      const label = checkbox.closest('div')?.querySelector('label');
      return label?.textContent;
    });

    expect(todoTexts[0]).toBe('Third todo');
    expect(todoTexts[1]).toBe('Second todo');
    expect(todoTexts[2]).toBe('First todo');
  });

  it('should display empty state with icon when no todos exist', () => {
    render(
      <TodoList
        todos={[]}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('No todos yet!')).toBeInTheDocument();
    expect(screen.getByText('Add your first task above to get started')).toBeInTheDocument();
  });

  it('should display correct todo count', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('3 todos')).toBeInTheDocument();
    expect(screen.getByText('2 active')).toBeInTheDocument();
    expect(screen.getByText('1 completed')).toBeInTheDocument();
  });

  it('should display singular todo count when only one todo', () => {
    const singleTodo: Todo[] = [mockTodos[0]];

    render(
      <TodoList
        todos={singleTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('1 todo')).toBeInTheDocument();
  });

  it('should apply strikethrough styling to completed todos', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const completedTodoLabel = screen.getByText('Second todo');
    expect(completedTodoLabel).toHaveClass('line-through');
    expect(completedTodoLabel).toHaveClass('text-muted-foreground');
  });

  it('should add fade-in animation classes to todo items', () => {
    const { container } = render(
      <TodoList
        todos={mockTodos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const todoWrappers = container.querySelectorAll('.todo-item-wrapper');
    todoWrappers.forEach((wrapper) => {
      expect(wrapper).toHaveClass('animate-fade-in');
    });
  });

  it('should apply staggered animation delays', () => {
    const { container } = render(
      <TodoList
        todos={mockTodos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const todoWrappers = container.querySelectorAll('.todo-item-wrapper');
    expect(todoWrappers[0]).toHaveStyle({ animationDelay: '0ms' });
    expect(todoWrappers[1]).toHaveStyle({ animationDelay: '50ms' });
    expect(todoWrappers[2]).toHaveStyle({ animationDelay: '100ms' });
  });
});
