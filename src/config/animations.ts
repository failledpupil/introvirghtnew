/**
 * Animation Configuration
 * Centralized animation settings matching paper/ink physics
 */

export const animationConfig = {
  // Easing curves inspired by physical paper and ink behavior
  easing: {
    natural: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    paper: 'cubic-bezier(0.23, 1, 0.32, 1)',
    gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    dramatic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // Duration scales in milliseconds
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
    slowest: 1200,
  },

  // Delay scales for staggered animations
  delay: {
    none: 0,
    short: 50,
    medium: 100,
    long: 200,
  },

  // Respect user's motion preferences
  respectMotionPreference: true,

  // Performance mode settings
  performance: {
    high: {
      enableComplexAnimations: true,
      enableParticles: true,
      maxConcurrentAnimations: 10,
    },
    balanced: {
      enableComplexAnimations: true,
      enableParticles: false,
      maxConcurrentAnimations: 5,
    },
    low: {
      enableComplexAnimations: false,
      enableParticles: false,
      maxConcurrentAnimations: 3,
    },
  },
} as const;

/**
 * Animation presets for common use cases
 */
export const animationPresets = {
  // Page transitions
  pageEnter: {
    duration: animationConfig.duration.slow,
    easing: animationConfig.easing.paper,
  },
  pageExit: {
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.smooth,
  },

  // Modal animations
  modalEnter: {
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.dramatic,
  },
  modalExit: {
    duration: animationConfig.duration.fast,
    easing: animationConfig.easing.smooth,
  },

  // Micro-interactions
  buttonPress: {
    duration: animationConfig.duration.fast,
    easing: animationConfig.easing.bounce,
  },
  buttonHover: {
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.smooth,
  },

  // Writing animations
  typewriter: {
    duration: animationConfig.duration.slower,
    easing: animationConfig.easing.smooth,
  },
  inkSpread: {
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.natural,
  },

  // Celebration animations
  confetti: {
    duration: animationConfig.duration.slowest,
    easing: animationConfig.easing.natural,
  },
  bounce: {
    duration: animationConfig.duration.slow,
    easing: animationConfig.easing.bounce,
  },
} as const;

/**
 * Get animation CSS string for inline styles
 */
export function getAnimationStyle(
  preset: keyof typeof animationPresets
): string {
  const config = animationPresets[preset];
  return `${config.duration}ms ${config.easing}`;
}

/**
 * Get easing function CSS value
 */
export function getEasing(easing: keyof typeof animationConfig.easing): string {
  return animationConfig.easing[easing];
}

/**
 * Get duration in milliseconds
 */
export function getDuration(
  duration: keyof typeof animationConfig.duration
): number {
  return animationConfig.duration[duration];
}

/**
 * Check if complex animations should be enabled based on performance mode
 */
export function shouldEnableComplexAnimations(
  mode: keyof typeof animationConfig.performance
): boolean {
  return animationConfig.performance[mode].enableComplexAnimations;
}

export default animationConfig;
