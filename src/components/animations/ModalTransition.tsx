import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface ModalTransitionProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  showBackdrop?: boolean;
  className?: string;
}

/**
 * ModalTransition - Animated modal with backdrop
 * Handles enter/exit animations automatically
 */
export const ModalTransition: React.FC<ModalTransitionProps> = ({
  children,
  isOpen,
  onClose,
  showBackdrop = true,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className={cn(
            'absolute inset-0 bg-black transition-opacity duration-300',
            isVisible ? 'opacity-50' : 'opacity-0'
          )}
          onClick={onClose}
        />
      )}

      {/* Modal Content */}
      <div
        className={cn(
          'relative z-10 max-w-2xl w-full',
          'bg-cream-paper dark:bg-gray-800',
          'rounded-lg shadow-2xl',
          prefersReducedMotion
            ? ''
            : isVisible
            ? 'animate-modal-enter'
            : 'animate-modal-exit',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalTransition;
