import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface SidebarTransitionProps {
  children: React.ReactNode;
  isOpen: boolean;
  side?: 'left' | 'right';
  onClose?: () => void;
  className?: string;
}

/**
 * SidebarTransition - Animated sidebar with slide animation
 */
export const SidebarTransition: React.FC<SidebarTransitionProps> = ({
  children,
  isOpen,
  side = 'left',
  onClose,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const slideClass = side === 'left' ? 'left-0' : 'right-0';
  const transformClass = side === 'left'
    ? isVisible ? 'translate-x-0' : '-translate-x-full'
    : isVisible ? 'translate-x-0' : 'translate-x-full';

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black transition-opacity duration-300',
          isVisible ? 'opacity-50' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 bottom-0 z-50 w-80',
          'bg-cream-paper dark:bg-gray-800',
          'shadow-2xl',
          slideClass,
          prefersReducedMotion ? '' : 'transition-transform duration-300 ease-smooth',
          transformClass,
          className
        )}
      >
        {children}
      </div>
    </>
  );
};

export default SidebarTransition;
