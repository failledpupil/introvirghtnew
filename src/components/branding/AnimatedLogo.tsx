import React, { useState, useEffect } from 'react';
import { Logo, type LogoProps } from './Logo';
import { cn } from '../../utils/cn';

export interface AnimatedLogoProps extends Omit<LogoProps, 'animated'> {
  animation?: 'fade-in' | 'slide-up' | 'scale' | 'bounce' | 'paper-turn' | 'ink-spread' | 'entrance' | 'glow';
  delay?: number;
  duration?: number;
  loop?: boolean;
  onAnimationComplete?: () => void;
}

const animationClasses = {
  'fade-in': 'animate-fade-in',
  'slide-up': 'animate-entry-appear',
  'scale': 'animate-bounce-in',
  'bounce': 'animate-logo-bounce',
  'paper-turn': 'animate-paper-turn',
  'ink-spread': 'animate-ink-spread',
  'entrance': 'animate-logo-entrance',
  'glow': 'animate-logo-glow',
};

/**
 * AnimatedLogo - Logo component with entrance animations
 * Supports multiple animation types and can trigger on mount or on demand
 */
export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  animation = 'fade-in',
  delay = 0,
  duration = 600,
  loop = false,
  onAnimationComplete,
  className,
  ...logoProps
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Start animation after delay
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, animationKey]);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        onAnimationComplete?.();
        
        if (loop) {
          setIsAnimating(false);
          // Restart animation after a brief pause
          setTimeout(() => {
            setAnimationKey(prev => prev + 1);
          }, 1000);
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isAnimating, duration, loop, onAnimationComplete]);

  const animationClass = animationClasses[animation];

  return (
    <div
      key={animationKey}
      className={cn(
        'inline-block',
        isAnimating && animationClass,
        className
      )}
      style={{
        animationDuration: `${duration}ms`,
      }}
    >
      <Logo {...logoProps} animated />
    </div>
  );
};

export default AnimatedLogo;
