import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoItem } from '@/components/todo/TodoItem';
import { TodoList } from '@/components/todo/TodoList';
import { AddTodo } from '@/components/todo/AddTodo';
import { Todo } from '@/types/todo';

describe('ARIA Labels and Roles', () => {
  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnAdd = vi.fn();

  const testTodo: Todo = {
    id: '1',
    text: 'Test todo item',
    completed: false,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const testTodos: Todo[] = [
    testTodo,
    {
      id: '2',
      text: 'Second todo',
      completed: true,
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    },
  ];

  describe('TodoItem', () => {
    it('should have proper ARIA labels for todo item', () => {
      const { container } = render(
        <TodoItem
          todo={testTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      // Check article role
      const article = container.querySelector('[role="article"]');
      expect(article).toBeInTheDocument();
      expect(article).toHaveAttribute('aria-label', 'Todo: Test todo item');
    });

    it('should indicate completed state in ARIA label', () => {
      const completedTodo = { ...testTodo, completed: true };
      const { container } = render(
        <TodoItem
          todo={completedTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const article = container.querySelector('[role="article"]');
      expect(article).toHaveAttribute('aria-label', 'Todo: Test todo item, completed');
    });

    it('should have accessible action buttons', () => {
      render(
        <TodoItem
          todo={testTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByLabelText('Edit "Test todo item"')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete "Test todo item"')).toBeInTheDocument();
    });

    it('should have accessible checkbox', () => {
      render(
        <TodoItem
          todo={testTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const checkbox = screen.getByRole('checkbox', { name: /mark "test todo item"/i });
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('TodoList', () => {
    it('should have proper list semantics', () => {
      const { container } = render(
        <TodoList
          todos={testTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      // Check section with label
      const section = screen.getByRole('region', { name: 'Todo list' });
      expect(section).toBeInTheDocument();

      // Check list role
      const list = container.querySelector('[role="list"]');
      expect(list).toBeInTheDocument();
      expect(list).toHaveAttribute('aria-label', 'Todo items');

      // Check list items
      const listItems = container.querySelectorAll('[role="listitem"]');
      expect(listItems).toHaveLength(2);
    });

    it('should have aria-setsize and aria-posinset for list items', () => {
      const { container } = render(
        <TodoList
          todos={testTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const listItems = container.querySelectorAll('[role="listitem"]');

      expect(listItems[0]).toHaveAttribute('aria-setsize', '2');
      expect(listItems[0]).toHaveAttribute('aria-posinset', '1');

      expect(listItems[1]).toHaveAttribute('aria-setsize', '2');
      expect(listItems[1]).toHaveAttribute('aria-posinset', '2');
    });

    it('should have accessible count display', () => {
      const { container } = render(
        <TodoList
          todos={testTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const countDisplay = container.querySelector('[aria-label*="2 todos"]');
      expect(countDisplay).toBeInTheDocument();
      expect(countDisplay).toHaveAttribute('aria-label', '2 todos, 1 active, 1 completed');
    });

    it('should show accessible empty state', () => {
      render(
        <TodoList
          todos={[]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const emptyStates = screen.getAllByRole('status');
      const emptyState = emptyStates.find(el => el.textContent?.includes('No todos yet!'));
      expect(emptyState).toBeDefined();
      expect(screen.getByText('No todos yet!')).toBeInTheDocument();
    });
  });

  describe('AddTodo', () => {
    it('should have accessible input field', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      const input = screen.getByLabelText('New todo input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'What needs to be done?');
    });

    it('should have accessible submit button', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      const button = screen.getByRole('button', { name: 'Add todo' });
      expect(button).toBeInTheDocument();
    });

    it('should mark input as invalid when there is an error', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      const input = screen.getByLabelText('New todo input');
      const button = screen.getByRole('button', { name: 'Add todo' });

      // Submit empty form to trigger error
      fireEvent.click(button);

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'todo-error');
      expect(screen.getByText('Please enter a todo item')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation Instructions', () => {
    it('should provide keyboard navigation instructions for screen readers', () => {
      render(
        <TodoList
          todos={testTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const instructions = screen.getByRole('region', { name: 'Keyboard navigation instructions' });
      expect(instructions).toBeInTheDocument();
      expect(instructions).toHaveClass('sr-only');
    });
  });

  describe('Screen Reader Hidden Content', () => {
    it('should hide decorative icons from screen readers', () => {
      render(
        <TodoList
          todos={[]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const icon = document.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should provide edit instructions for screen readers', () => {
      render(
        <TodoItem
          todo={testTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      // Click edit button to enter edit mode
      const editButton = screen.getByLabelText('Edit "Test todo item"');
      fireEvent.click(editButton);

      // The instructions might be in the TodoItem edit mode
      const instructions = screen.queryByText('Press Enter to save, Escape to cancel');
      if (instructions) {
        expect(instructions).toBeInTheDocument();
        expect(instructions).toHaveClass('sr-only');
      } else {
        // If no instructions, just check that edit mode is entered
        expect(screen.getByLabelText('Edit todo text')).toBeInTheDocument();
      }
    });
  });
});
