import React from 'react';
import { cn } from '../../utils/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface CursorBreathingProps {
  className?: string;
}

/**
 * CursorBreathing - Animated cursor with breathing effect
 * Provides a calming, rhythmic visual cue
 */
export const CursorBreathing: React.FC<CursorBreathingProps> = ({
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span
      className={cn(
        'inline-block w-0.5 h-5 bg-fountain-pen-blue dark:bg-blue-400',
        prefersReducedMotion ? 'opacity-100' : 'animate-breathe',
        className
      )}
    />
  );
};

export default CursorBreathing;
