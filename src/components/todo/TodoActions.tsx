'use client';

import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TodoActionsProps {
  todoText: string;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function TodoActions({ todoText, onEdit, onDelete, className }: TodoActionsProps) {
  return (
    <div className={cn('flex gap-1 transition-opacity duration-200', className)}>
      <Button
        size="icon"
        variant="ghost"
        onClick={onEdit}
        aria-label={`Edit "${todoText}"`}
        className={cn(
          'hover:bg-accent',
          // Larger touch targets on mobile
          'min-w-[44px] min-h-[44px]',
          'sm:min-w-[32px] sm:min-h-[32px]'
        )}
      >
        <Edit2 className="h-5 w-5 sm:h-4 sm:w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onDelete}
        aria-label={`Delete "${todoText}"`}
        className={cn(
          'text-destructive hover:bg-destructive/10 hover:text-destructive',
          // Larger touch targets on mobile
          'min-w-[44px] min-h-[44px]',
          'sm:min-w-[32px] sm:min-h-[32px]'
        )}
      >
        <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
}
