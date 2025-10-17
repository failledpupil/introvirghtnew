import { useState, useEffect } from 'react';

/**
 * Hook to detect user's motion preference for accessibility
 * Returns true if user prefers reduced motion
 * 
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * 
 * return (
 *   <div className={prefersReducedMotion ? '' : 'animate-fade-in'}>
 *     Content
 *   </div>
 * );
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if the browser supports the media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Create event listener for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to get animation duration based on reduced motion preference
 * Returns 0 if user prefers reduced motion, otherwise returns the specified duration
 * 
 * @param duration - Duration in milliseconds
 * @returns Adjusted duration based on user preference
 */
export function useAnimationDuration(duration: number): number {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? 0 : duration;
}

/**
 * Hook to conditionally apply animation class based on reduced motion preference
 * 
 * @param animationClass - CSS class for animation
 * @param fallbackClass - Optional fallback class when animations are disabled
 * @returns The appropriate class based on user preference
 */
export function useAnimationClass(
  animationClass: string,
  fallbackClass: string = ''
): string {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? fallbackClass : animationClass;
}

export default useReducedMotion;
