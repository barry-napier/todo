import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        // Responsive padding
        'px-4 py-4',
        'sm:px-6 sm:py-6',
        'md:px-8 md:py-8',
        'lg:px-8 lg:py-10',
        // Max width constraints for larger screens
        'max-w-full',
        'sm:max-w-2xl',
        'md:max-w-3xl',
        'lg:max-w-4xl',
        'xl:max-w-5xl',
        className
      )}
    >
      {children}
    </div>
  );
}
