/**
 * Framer Motion Lazy Loading Wrapper
 * Dynamically imports framer-motion only when needed to reduce bundle size
 * Note: framer-motion is optional and not required for basic animations
 */

/**
 * Lazy load framer-motion components
 * This reduces the initial bundle size significantly
 * Returns null if framer-motion is not installed
 */
export const loadFramerMotion = async (): Promise<any | null> => {
  try {
    // Dynamic import - only loads if framer-motion is installed
    // Using any type since framer-motion is optional dependency
    const framerMotion = await import('framer-motion' as any);
    return framerMotion;
  } catch (error) {
    // Framer Motion is optional - app works without it using CSS animations
    console.info('Framer Motion not installed. Using CSS animations instead.');
    return null;
  }
};

/**
 * Check if framer-motion is available
 */
export const isFramerMotionAvailable = async (): Promise<boolean> => {
  const framerMotion = await loadFramerMotion();
  return framerMotion !== null;
};

/**
 * Get motion component with fallback
 * Returns the motion component if available, otherwise returns a div
 */
export const getMotionComponent = async (component: string = 'div') => {
  const framerMotion = await loadFramerMotion();
  
  if (framerMotion && framerMotion.motion) {
    return (framerMotion.motion as any)[component];
  }
  
  // Fallback to regular HTML element
  return component;
};

/**
 * Animation variants for common patterns
 * These can be used with framer-motion when available
 */
export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  
  paperTurn: {
    initial: { opacity: 0, rotateY: -90, transformPerspective: 1000 },
    animate: { opacity: 1, rotateY: 0, transformPerspective: 1000 },
    exit: { opacity: 0, rotateY: 90, transformPerspective: 1000 },
  },
  
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: [0.3, 1.1, 0.9, 1],
      transition: {
        duration: 0.6,
        times: [0, 0.5, 0.7, 1],
      },
    },
    exit: { opacity: 0, scale: 0.8 },
  },
} as const;

/**
 * Transition presets for framer-motion
 */
export const motionTransitions = {
  smooth: {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
  },
  
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  
  bounce: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },
  
  slow: {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.5,
  },
  
  fast: {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.2,
  },
} as const;

export default {
  loadFramerMotion,
  isFramerMotionAvailable,
  getMotionComponent,
  motionVariants,
  motionTransitions,
};
