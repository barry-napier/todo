import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ANIMATION_DURATIONS } from '@/lib/constants/animations';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
} as const;

export function LoadingSpinner({
  size = 'md',
  delay = ANIMATION_DURATIONS.loadingDelay,
  className,
}: LoadingSpinnerProps) {
  const [show, setShow] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) {
      setShow(true);
      return;
    }

    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400',
        sizeClasses[size],
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
