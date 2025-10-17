import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide' | 'paper-turn' | 'flip';
  duration?: number;
  className?: string;
}

const variantClasses = {
  fade: 'animate-fade-in',
  slide: 'animate-page-enter',
  'paper-turn': 'animate-paper-turn',
  flip: 'animate-paper-flip',
};

/**
 * PageTransition - Animated wrapper for page content
 * Provides smooth transitions when content changes
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'fade',
  duration = 500,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
  }, []);

  const animationClass = prefersReducedMotion ? '' : variantClasses[variant];

  return (
    <div
      className={cn(
        'w-full',
        isVisible && animationClass,
        className
      )}
      style={{
        animationDuration: prefersReducedMotion ? '0ms' : `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
