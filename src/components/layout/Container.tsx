import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
