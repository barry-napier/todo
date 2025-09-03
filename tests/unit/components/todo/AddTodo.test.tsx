import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTodo } from '@/components/todo/AddTodo';

describe('AddTodo', () => {
  it('should render input and button', () => {
    const mockOnAdd = vi.fn();
    render(<AddTodo onAdd={mockOnAdd} />);

    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('should call onAdd with trimmed text when form is submitted', async () => {
    const mockOnAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, '  Buy groceries  ');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(mockOnAdd).toHaveBeenCalledWith('Buy groceries');
  });

  it('should clear input after successful submission', async () => {
    const mockOnAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?') as HTMLInputElement;
    await user.type(input, 'New task');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(input.value).toBe('');
  });

  it('should submit when Enter key is pressed', async () => {
    const mockOnAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'Test todo{Enter}');

    expect(mockOnAdd).toHaveBeenCalledWith('Test todo');
  });

  it('should show error for empty input', async () => {
    const mockOnAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={mockOnAdd} />);

    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.getByText('Please enter a todo item')).toBeInTheDocument();
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should show error for whitespace-only input', async () => {
    const mockOnAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.getByText('Please enter a todo item')).toBeInTheDocument();
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should enforce max length of 500 characters', () => {
    const mockOnAdd = vi.fn();
    render(<AddTodo onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    expect(input).toHaveAttribute('maxLength', '500');
  });

  it('should clear input when Escape key is pressed', async () => {
    const mockOnAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?') as HTMLInputElement;
    await user.type(input, 'Test todo');
    await user.keyboard('{Escape}');

    expect(input.value).toBe('');
  });

  it('should clear error when user starts typing', async () => {
    const mockOnAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={mockOnAdd} />);

    // Trigger error
    await user.click(screen.getByRole('button', { name: /add todo/i }));
    expect(screen.getByText('Please enter a todo item')).toBeInTheDocument();

    // Start typing
    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'N');

    expect(screen.queryByText('Please enter a todo item')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const mockOnAdd = vi.fn();
    render(<AddTodo onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    expect(input).toHaveAttribute('aria-label', 'New todo input');

    const button = screen.getByRole('button', { name: /add todo/i });
    expect(button).toHaveAttribute('aria-label', 'Add todo');
  });
});
