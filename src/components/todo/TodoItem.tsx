'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Todo } from '@/types/todo';
import { TodoCheckbox } from '@/components/todo/TodoCheckbox';
import { TodoActions } from '@/components/todo/TodoActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>) => void;
  tabIndex?: number;
  index?: number;
}

export function TodoItem({ todo, onToggle, onDelete, onUpdate, tabIndex = 0 }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedText = editText.trim();

    // Validation: prevent empty text and check max length
    if (!trimmedText) {
      setEditText(todo.text); // Restore original text
      setIsEditing(false);
      return;
    }

    if (trimmedText.length > 500) {
      setEditText(trimmedText.substring(0, 500)); // Truncate to max length
      return;
    }

    if (trimmedText !== todo.text) {
      onUpdate(todo.id, { text: trimmedText });
    }

    setIsEditing(false);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = () => {
    // Show confirmation dialog with improved UX
    const confirmed = window.confirm(`Delete "${todo.text}"?`);

    if (confirmed) {
      try {
        setIsDeleting(true);

        // Announce deletion to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = `Deleting todo: ${todo.text}`;
        document.body.appendChild(announcement);

        setTimeout(() => {
          try {
            onDelete(todo.id);
            // Update announcement on success
            announcement.textContent = `Todo deleted: ${todo.text}`;
            setTimeout(() => document.body.removeChild(announcement), 1000);
          } catch (error) {
            console.error('Failed to delete todo:', error);
            setIsDeleting(false); // Reset animation state on error
            announcement.textContent = 'Failed to delete todo';
            setTimeout(() => document.body.removeChild(announcement), 1000);
            alert('Failed to delete todo. Please try again.');
          }
        }, 300); // Match animation duration
      } catch (error) {
        console.error('Error initiating delete:', error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card
      className={cn(
        'group transition-all duration-300 hover:shadow-md',
        // Responsive padding
        'p-3 sm:p-4',
        isDeleting && 'animate-slide-out',
        todo.completed && 'opacity-60',
        // Focus styles for keyboard navigation
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
      )}
      data-todo-item
      tabIndex={tabIndex}
      role="article"
      aria-label={`Todo: ${todo.text}${todo.completed ? ', completed' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !isEditing) {
          setIsEditing(true);
        }
      }}
    >
      <div className="flex items-start sm:items-center gap-2 sm:gap-3">
        <TodoCheckbox
          todoId={todo.id}
          todoText={todo.text}
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          className="mt-1 sm:mt-0 min-w-[24px] min-h-[24px] sm:min-w-[20px] sm:min-h-[20px]"
        />

        {isEditing ? (
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <Input
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="flex-1 h-10 sm:h-9"
              maxLength={500}
              aria-label="Edit todo text"
              aria-describedby={`edit-instructions-${todo.id}`}
            />
            <span id={`edit-instructions-${todo.id}`} className="sr-only">
              Press Enter to save, Escape to cancel
            </span>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSave}
                aria-label="Save changes"
                className="min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px]"
              >
                <Check className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleCancel}
                aria-label="Cancel editing"
                className="min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px]"
              >
                <X className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <span
              onClick={() => setIsEditing(true)}
              className={cn(
                'flex-1 cursor-pointer transition-all duration-200',
                'text-base sm:text-sm',
                'py-1 sm:py-0',
                todo.completed && 'line-through text-muted-foreground decoration-2'
              )}
              role="button"
              tabIndex={-1}
              aria-label={`${todo.text}, click to edit`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsEditing(true);
                }
              }}
            >
              {todo.text}
            </span>
            <TodoActions
              todoText={todo.text}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            />
          </>
        )}
      </div>
    </Card>
  );
}
