/**
 * Animation Utilities
 * Helper functions for common animation patterns
 */

import { animationConfig, animationPresets } from '../../config/animations';

/**
 * Stagger animation delays for multiple elements
 * @param index - Element index
 * @param baseDelay - Base delay in ms
 * @param increment - Delay increment per element
 */
export function staggerDelay(
  index: number,
  baseDelay: number = 0,
  increment: number = 50
): number {
  return baseDelay + index * increment;
}

/**
 * Create a staggered animation style object
 */
export function createStaggerStyle(
  index: number,
  baseDelay: number = 0,
  increment: number = 50
): React.CSSProperties {
  return {
    animationDelay: `${staggerDelay(index, baseDelay, increment)}ms`,
  };
}

/**
 * Check if animations should be enabled based on user preference
 */
export function shouldAnimate(): boolean {
  if (!animationConfig.respectMotionPreference) {
    return true;
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return !mediaQuery.matches;
}

/**
 * Get animation class with reduced motion fallback
 */
export function getAnimationClass(
  animationClass: string,
  fallback: string = ''
): string {
  return shouldAnimate() ? animationClass : fallback;
}

/**
 * Create animation style object from preset
 */
export function createAnimationStyle(
  preset: keyof typeof animationPresets,
  additionalStyles?: React.CSSProperties
): React.CSSProperties {
  const config = animationPresets[preset];
  return {
    animationDuration: `${config.duration}ms`,
    animationTimingFunction: config.easing,
    ...additionalStyles,
  };
}

/**
 * Debounce animation triggers to prevent performance issues
 */
export function debounceAnimation<T extends (...args: any[]) => void>(
  func: T,
  wait: number = 100
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle animation updates for better performance
 */
export function throttleAnimation<T extends (...args: any[]) => void>(
  func: T,
  limit: number = 16
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request animation frame with fallback
 */
export function requestAnimationFramePolyfill(
  callback: FrameRequestCallback
): number {
  return (
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    function (cb: FrameRequestCallback) {
      return window.setTimeout(cb, 1000 / 60);
    }
  )(callback);
}

/**
 * Cancel animation frame with fallback
 */
export function cancelAnimationFramePolyfill(id: number): void {
  (
    window.cancelAnimationFrame ||
    (window as any).webkitCancelAnimationFrame ||
    function (id: number) {
      clearTimeout(id);
    }
  )(id);
}

/**
 * Wait for animation to complete
 */
export function waitForAnimation(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

/**
 * Chain multiple animations sequentially
 */
export async function chainAnimations(
  animations: Array<() => Promise<void>>
): Promise<void> {
  for (const animation of animations) {
    await animation();
  }
}

/**
 * Run multiple animations in parallel
 */
export async function parallelAnimations(
  animations: Array<() => Promise<void>>
): Promise<void> {
  await Promise.all(animations.map((anim) => anim()));
}

export default {
  staggerDelay,
  createStaggerStyle,
  shouldAnimate,
  getAnimationClass,
  createAnimationStyle,
  debounceAnimation,
  throttleAnimation,
  requestAnimationFramePolyfill,
  cancelAnimationFramePolyfill,
  waitForAnimation,
  chainAnimations,
  parallelAnimations,
};
