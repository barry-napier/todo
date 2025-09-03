'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AddTodoProps {
  onAdd: (text: string) => void;
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      setError('Please enter a todo item');
      return;
    }

    if (trimmedText.length > 500) {
      setError('Todo must be 500 characters or less');
      return;
    }

    onAdd(trimmedText);
    setText('');
    setError('');

    // Auto-focus input after successful add
    const input = document.querySelector<HTMLInputElement>('#add-todo-input');
    if (input) {
      input.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setText('');
      setError('');
    }
  };

  const handleInputChange = (value: string) => {
    setText(value);
    if (error) {
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          id="add-todo-input"
          type="text"
          placeholder="What needs to be done?"
          value={text}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex-1',
            // Larger touch targets on mobile
            'h-12 sm:h-10',
            'text-base sm:text-sm',
            'px-4',
            error && 'border-red-500'
          )}
          maxLength={500}
          autoFocus
          aria-label="New todo input"
          aria-invalid={!!error}
          aria-describedby={error ? 'todo-error' : undefined}
        />
        <Button
          type="submit"
          aria-label="Add todo"
          className={cn(
            // Responsive sizing
            'h-12 sm:h-10',
            'min-w-[120px] sm:min-w-[44px]',
            'px-4 sm:px-3'
          )}
        >
          <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
          <span className="ml-2 sm:hidden">Add Todo</span>
        </Button>
      </div>
      {error && (
        <p id="todo-error" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </form>
  );
}
