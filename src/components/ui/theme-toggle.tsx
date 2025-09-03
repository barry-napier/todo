'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

// Simple SVG icons for sun and moon
const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="m12 2 0 2" />
    <path d="m12 20 0 2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="m2 12 2 0" />
    <path d="m20 12 2 0" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

export function ThemeToggle({
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
  className,
}: ThemeToggleProps): React.JSX.Element {
  const { effectiveTheme, toggleTheme } = useTheme();

  const handleToggle = (): void => {
    toggleTheme();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    // Support Enter and Space keys for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  const isLightMode = effectiveTheme === 'light';
  const Icon = isLightMode ? SunIcon : MoonIcon;
  const label = isLightMode ? 'Switch to dark mode' : 'Switch to light mode';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={className}
      aria-label={label}
      title={label}
      type="button"
    >
      <Icon className={showLabel ? 'mr-2' : undefined} />
      {showLabel && (
        <span className="sr-only md:not-sr-only">{isLightMode ? 'Dark' : 'Light'}</span>
      )}
    </Button>
  );
}

export default ThemeToggle;
