import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface FadeTransitionProps {
  children: React.ReactNode;
  show: boolean;
  duration?: number;
  delay?: number;
  className?: string;
}

/**
 * FadeTransition - Simple fade in/out animation
 * Useful for content that appears/disappears
 */
export const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  show,
  duration = 300,
  delay = 0,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, delay, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        'transition-opacity',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        transitionDuration: prefersReducedMotion ? '0ms' : `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default FadeTransition;
