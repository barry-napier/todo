import { useEffect, useRef, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  isEnabled?: boolean;
  onEnter?: (index: number) => void;
  onSpace?: (index: number) => void;
  onDelete?: (index: number) => void;
  itemCount: number;
}

export function useKeyboardNavigation({
  isEnabled = true,
  onEnter,
  onSpace,
  onDelete,
  itemCount,
}: UseKeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const focusedIndexRef = useRef<number>(-1);

  const getFocusableItems = useCallback(() => {
    if (!containerRef.current) return [];
    // Find all todo items that can receive focus
    return Array.from(containerRef.current.querySelectorAll('[data-todo-item]')) as HTMLElement[];
  }, []);

  const focusItem = useCallback(
    (index: number) => {
      const items = getFocusableItems();
      if (items[index]) {
        items[index].focus();
        focusedIndexRef.current = index;

        // Ensure item is visible in viewport (only if scrollIntoView is available)
        if (typeof items[index].scrollIntoView === 'function') {
          items[index].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }
    },
    [getFocusableItems]
  );

  const focusNext = useCallback(() => {
    const nextIndex = Math.min(focusedIndexRef.current + 1, itemCount - 1);
    if (nextIndex !== focusedIndexRef.current) {
      focusItem(nextIndex);
    }
  }, [itemCount, focusItem]);

  const focusPrevious = useCallback(() => {
    const prevIndex = Math.max(focusedIndexRef.current - 1, 0);
    if (prevIndex !== focusedIndexRef.current) {
      focusItem(prevIndex);
    }
  }, [focusItem]);

  const focusFirst = useCallback(() => {
    if (itemCount > 0) {
      focusItem(0);
    }
  }, [itemCount, focusItem]);

  const focusLast = useCallback(() => {
    if (itemCount > 0) {
      focusItem(itemCount - 1);
    }
  }, [itemCount, focusItem]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled || itemCount === 0) return;

      const target = event.target as HTMLElement;
      const isWithinContainer = containerRef.current?.contains(target);

      // Don't handle if we're in an input field or button unless it's a todo item
      const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      const isTodoItem = target.hasAttribute('data-todo-item');

      if (!isWithinContainer || (isInInput && !isTodoItem)) return;

      switch (event.key) {
        case 'ArrowDown':
        case 'j': // Vim-style navigation
          event.preventDefault();
          focusNext();
          break;

        case 'ArrowUp':
        case 'k': // Vim-style navigation
          event.preventDefault();
          focusPrevious();
          break;

        case 'Home':
          event.preventDefault();
          focusFirst();
          break;

        case 'End':
          event.preventDefault();
          focusLast();
          break;

        case 'Enter':
          if (onEnter && focusedIndexRef.current >= 0) {
            event.preventDefault();
            onEnter(focusedIndexRef.current);
          }
          break;

        case ' ':
        case 'Space':
          if (onSpace && focusedIndexRef.current >= 0) {
            event.preventDefault();
            onSpace(focusedIndexRef.current);
          }
          break;

        case 'Delete':
        case 'Backspace':
          if (onDelete && focusedIndexRef.current >= 0 && event.shiftKey) {
            event.preventDefault();
            onDelete(focusedIndexRef.current);
          }
          break;

        case 'Escape':
          // Blur current element to exit focus mode
          (document.activeElement as HTMLElement)?.blur();
          focusedIndexRef.current = -1;
          break;
      }
    },
    [
      isEnabled,
      itemCount,
      focusNext,
      focusPrevious,
      focusFirst,
      focusLast,
      onEnter,
      onSpace,
      onDelete,
    ]
  );

  // Track focus changes
  const handleFocusIn = useCallback(
    (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.hasAttribute('data-todo-item')) {
        const items = getFocusableItems();
        const index = items.indexOf(target);
        if (index >= 0) {
          focusedIndexRef.current = index;
        }
      }
    },
    [getFocusableItems]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isEnabled) return;

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusin', handleFocusIn);

    // Set initial focus attributes
    container.setAttribute('role', 'list');
    container.setAttribute('aria-label', 'Todo items');

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusin', handleFocusIn);
    };
  }, [isEnabled, handleKeyDown, handleFocusIn]);

  return {
    containerRef,
    focusedIndex: focusedIndexRef.current,
    focusItem,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
  };
}
