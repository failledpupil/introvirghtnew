/**
 * Micro-interaction Animation Utilities
 * Pre-configured classes and utilities for common UI micro-interactions
 */

import { cn } from '../cn';

/**
 * Button interaction classes
 */
export const buttonAnimations = {
  // Hover effect with lift
  hover: 'transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg',
  
  // Press effect with scale
  press: 'active:scale-95 transition-transform duration-100',
  
  // Combined hover and press
  interactive: 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95',
  
  // Subtle glow on hover
  glow: 'transition-shadow duration-300 hover:shadow-[0_0_15px_rgba(30,58,138,0.3)]',
  
  // Ripple effect (requires additional JS)
  ripple: 'relative overflow-hidden',
} as const;

/**
 * Input focus animations
 */
export const inputAnimations = {
  // Focus ring with smooth transition
  focusRing: 'transition-all duration-200 focus:ring-2 focus:ring-fountain-pen-blue focus:ring-opacity-50 focus:outline-none',
  
  // Animated border on focus
  focusBorder: 'transition-colors duration-200 border-2 border-transparent focus:border-fountain-pen-blue',
  
  // Scale up slightly on focus
  focusScale: 'transition-transform duration-200 focus:scale-[1.02]',
  
  // Combined focus effects
  focusInteractive: 'transition-all duration-200 focus:ring-2 focus:ring-fountain-pen-blue focus:ring-opacity-50 focus:scale-[1.01] focus:outline-none',
} as const;

/**
 * Tooltip animations
 */
export const tooltipAnimations = {
  // Fade in from top
  fadeInTop: 'animate-slide-in-from-top-4',
  
  // Fade in from bottom
  fadeInBottom: 'animate-slide-in-from-bottom-4',
  
  // Fade in from right
  fadeInRight: 'animate-slide-in-from-right-4',
  
  // Simple fade in
  fadeIn: 'animate-fade-in',
} as const;

/**
 * Icon state change animations
 */
export const iconAnimations = {
  // Rotate on hover
  rotateHover: 'transition-transform duration-300 hover:rotate-12',
  
  // Scale on hover
  scaleHover: 'transition-transform duration-200 hover:scale-110',
  
  // Bounce on click
  bounceClick: 'active:animate-bounce-in',
  
  // Spin animation
  spin: 'animate-spin',
  
  // Pulse animation
  pulse: 'animate-pulse-gentle',
} as const;

/**
 * Get button animation classes
 */
export function getButtonClasses(
  variant: keyof typeof buttonAnimations = 'interactive',
  additionalClasses?: string
): string {
  return cn(buttonAnimations[variant], additionalClasses);
}

/**
 * Get input animation classes
 */
export function getInputClasses(
  variant: keyof typeof inputAnimations = 'focusInteractive',
  additionalClasses?: string
): string {
  return cn(inputAnimations[variant], additionalClasses);
}

/**
 * Get tooltip animation classes
 */
export function getTooltipClasses(
  variant: keyof typeof tooltipAnimations = 'fadeIn',
  additionalClasses?: string
): string {
  return cn(tooltipAnimations[variant], additionalClasses);
}

/**
 * Get icon animation classes
 */
export function getIconClasses(
  variant: keyof typeof iconAnimations = 'scaleHover',
  additionalClasses?: string
): string {
  return cn(iconAnimations[variant], additionalClasses);
}

export default {
  buttonAnimations,
  inputAnimations,
  tooltipAnimations,
  iconAnimations,
  getButtonClasses,
  getInputClasses,
  getTooltipClasses,
  getIconClasses,
};
