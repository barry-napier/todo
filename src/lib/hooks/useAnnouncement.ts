import { useEffect, useRef, useCallback } from 'react';

type AnnouncementPriority = 'polite' | 'assertive';

interface UseAnnouncementOptions {
  clearDelay?: number; // Delay before clearing announcement (ms)
}

export function useAnnouncement(options: UseAnnouncementOptions = {}) {
  const { clearDelay = 1000 } = options;
  const announcerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Create announcer element on mount
  useEffect(() => {
    const announcer = document.createElement('div');
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('role', 'status');
    document.body.appendChild(announcer);
    announcerRef.current = announcer;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, []);

  const announce = useCallback(
    (message: string, priority: AnnouncementPriority = 'polite') => {
      if (!announcerRef.current) return;

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Update aria-live based on priority
      announcerRef.current.setAttribute('aria-live', priority);

      // Clear and set new message for screen readers to pick up
      announcerRef.current.textContent = '';

      // Use requestAnimationFrame to ensure the clear is processed before new message
      requestAnimationFrame(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message;

          // Clear after delay
          timeoutRef.current = setTimeout(() => {
            if (announcerRef.current) {
              announcerRef.current.textContent = '';
            }
          }, clearDelay);
        }
      });
    },
    [clearDelay]
  );

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (announcerRef.current) {
      announcerRef.current.textContent = '';
    }
  }, []);

  return { announce, clear };
}

// Helper hook for common todo announcements
export function useTodoAnnouncements() {
  const { announce } = useAnnouncement();

  const announceAdd = useCallback(
    (todoText: string) => {
      announce(`Added todo: ${todoText}`, 'polite');
    },
    [announce]
  );

  const announceToggle = useCallback(
    (todoText: string, completed: boolean) => {
      const status = completed ? 'completed' : 'marked as active';
      announce(`Todo ${status}: ${todoText}`, 'polite');
    },
    [announce]
  );

  const announceDelete = useCallback(
    (todoText: string) => {
      announce(`Deleted todo: ${todoText}`, 'polite');
    },
    [announce]
  );

  const announceEdit = useCallback(
    (oldText: string, newText: string) => {
      announce(`Updated todo from "${oldText}" to "${newText}"`, 'polite');
    },
    [announce]
  );

  const announceError = useCallback(
    (error: string) => {
      announce(error, 'assertive');
    },
    [announce]
  );

  const announceCount = useCallback(
    (total: number, active: number, completed: number) => {
      const todoWord = total === 1 ? 'todo' : 'todos';
      announce(`${total} ${todoWord} total, ${active} active, ${completed} completed`, 'polite');
    },
    [announce]
  );

  return {
    announceAdd,
    announceToggle,
    announceDelete,
    announceEdit,
    announceError,
    announceCount,
  };
}
