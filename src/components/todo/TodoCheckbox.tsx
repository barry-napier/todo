'use client';

import { forwardRef } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodoCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  todoId: string;
  todoText: string;
  className?: string;
}

const TodoCheckbox = forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, TodoCheckboxProps>(
  ({ checked, onCheckedChange, todoId, todoText, className }, ref) => {
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        id={`todo-${todoId}`}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={`Mark "${todoText}" as ${checked ? 'incomplete' : 'complete'}`}
        className={cn(
          'peer h-5 w-5 shrink-0 rounded-md border-2 border-primary',
          'ring-offset-background transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          'data-[state=checked]:border-primary',
          'hover:border-primary/80 hover:shadow-sm',
          'data-[state=unchecked]:bg-background',
          'data-[state=unchecked]:hover:bg-accent/10',
          className
        )}
      >
        <CheckboxPrimitive.Indicator
          className={cn(
            'flex items-center justify-center text-current',
            'data-[state=checked]:animate-in data-[state=unchecked]:animate-out',
            'data-[state=checked]:zoom-in-95 data-[state=unchecked]:zoom-out-95',
            'data-[state=checked]:fade-in-0 data-[state=unchecked]:fade-out-0'
          )}
        >
          <Check className="h-3.5 w-3.5 stroke-[3]" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
);

TodoCheckbox.displayName = 'TodoCheckbox';

export { TodoCheckbox };
