import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface InkSpreadEffectProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * InkSpreadEffect - Simulates ink spreading on paper
 * Adds a subtle blur-to-sharp transition
 */
export const InkSpreadEffect: React.FC<InkSpreadEffectProps> = ({
  children,
  delay = 0,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        prefersReducedMotion ? '' : 'animate-ink-spread',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
};

export default InkSpreadEffect;
