import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoList } from '@/components/todo/TodoList';
import { Todo } from '@/types/todo';

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
];

describe('TodoList', () => {
  it('should render empty state when no todos', () => {
    const mockHandlers = {
      onToggle: vi.fn(),
      onDelete: vi.fn(),
      onUpdate: vi.fn(),
    };

    render(<TodoList todos={[]} {...mockHandlers} />);

    expect(screen.getByText('No todos yet. Add one above to get started!')).toBeInTheDocument();
  });

  it('should render all todos', () => {
    const mockHandlers = {
      onToggle: vi.fn(),
      onDelete: vi.fn(),
      onUpdate: vi.fn(),
    };

    render(<TodoList todos={mockTodos} {...mockHandlers} />);

    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
  });

  it('should apply animation classes', () => {
    const mockHandlers = {
      onToggle: vi.fn(),
      onDelete: vi.fn(),
      onUpdate: vi.fn(),
    };

    const { container } = render(<TodoList todos={mockTodos} {...mockHandlers} />);

    const animatedElements = container.querySelectorAll('.animate-slide-in-from-top');
    expect(animatedElements).toHaveLength(2);
  });

  it('should apply staggered animation delays', () => {
    const mockHandlers = {
      onToggle: vi.fn(),
      onDelete: vi.fn(),
      onUpdate: vi.fn(),
    };

    const { container } = render(<TodoList todos={mockTodos} {...mockHandlers} />);

    const animatedElements = container.querySelectorAll('.animate-slide-in-from-top');
    expect(animatedElements[0]).toHaveStyle({ animationDelay: '0ms' });
    expect(animatedElements[1]).toHaveStyle({ animationDelay: '50ms' });
  });
});
