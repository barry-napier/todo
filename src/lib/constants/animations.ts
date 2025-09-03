export const ANIMATION_DURATIONS = {
  microInteraction: 150,
  transition: 300,
  loadingDelay: 200,
  skeleton: 0,
} as const;

export const EASING = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

import type { Variants } from 'framer-motion';

export const todoItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.transition / 1000,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATIONS.loadingDelay / 1000,
      ease: 'easeIn' as const,
    },
  },
};

export const LoadingPatterns = {
  skeleton: 'immediate',
  spinner: 'delayed',
  progress: 'immediate',
  pulse: 'continuous',
} as const;
