import { cn } from './cn';
import type { VAPIThemeConfig } from '../types/vapi';

/**
 * VAPI Theme utility functions for CSS class generation and styling
 */

/**
 * Generate VAPI-aware CSS classes
 */
export function getVAPIClasses(
  baseClasses: string,
  vapiClasses: string,
  isVAPIActive: boolean
): string {
  if (!isVAPIActive) return baseClasses;
  return cn(baseClasses, vapiClasses);
}

/**
 * Generate button classes for VAPI theme
 */
export function getVAPIButtonClasses(
  variant: 'primary' | 'secondary' | 'ghost' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md',
  isVAPIActive: boolean,
  additionalClasses?: string
): string {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    {
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
    }
  );

  if (!isVAPIActive) {
    // Default theme classes
    const defaultClasses = cn(baseClasses, {
      'bg-fountain-pen-blue hover:bg-blue-700 text-white rounded-md': variant === 'primary',
      'bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md': variant === 'secondary',
      'hover:bg-gray-100 text-gray-700': variant === 'ghost',
    });
    return cn(defaultClasses, additionalClasses);
  }

  // VAPI theme classes
  const vapiClasses = cn(baseClasses, {
    'vapi-button-primary': variant === 'primary',
    'vapi-button-secondary': variant === 'secondary',
    'hover:bg-vapi-bg-tertiary text-vapi-text-primary': variant === 'ghost',
  }, 'vapi-button-hover vapi-theme-transition');

  return cn(vapiClasses, additionalClasses);
}

/**
 * Generate card classes for VAPI theme
 */
export function getVAPICardClasses(
  isVAPIActive: boolean,
  hoverable: boolean = false,
  additionalClasses?: string
): string {
  const baseClasses = 'rounded-lg border shadow-sm';

  if (!isVAPIActive) {
    const defaultClasses = cn(
      baseClasses,
      'bg-white border-gray-200',
      {
        'hover:shadow-md transition-shadow': hoverable,
      }
    );
    return cn(defaultClasses, additionalClasses);
  }

  const vapiClasses = cn(
    'vapi-card',
    {
      'vapi-card-hover': hoverable,
    }
  );

  return cn(vapiClasses, additionalClasses);
}

/**
 * Generate input classes for VAPI theme
 */
export function getVAPIInputClasses(
  isVAPIActive: boolean,
  hasError: boolean = false,
  additionalClasses?: string
): string {
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors';

  if (!isVAPIActive) {
    const defaultClasses = cn(
      baseClasses,
      'bg-white border-gray-300 focus:border-fountain-pen-blue focus:ring-fountain-pen-blue/20',
      {
        'border-red-500 focus:border-red-500 focus:ring-red-500/20': hasError,
      }
    );
    return cn(defaultClasses, additionalClasses);
  }

  const vapiClasses = cn(
    'vapi-input',
    {
      'border-vapi-semantic-error focus:border-vapi-semantic-error': hasError,
    }
  );

  return cn(vapiClasses, additionalClasses);
}

/**
 * Generate text classes for VAPI theme
 */
export function getVAPITextClasses(
  type: 'primary' | 'secondary' | 'muted' | 'accent' = 'primary',
  isVAPIActive: boolean,
  additionalClasses?: string
): string {
  if (!isVAPIActive) {
    const defaultClasses = cn({
      'text-gray-900': type === 'primary',
      'text-gray-600': type === 'secondary',
      'text-gray-500': type === 'muted',
      'text-fountain-pen-blue': type === 'accent',
    });
    return cn(defaultClasses, additionalClasses);
  }

  const vapiClasses = cn({
    'text-vapi-text-primary': type === 'primary',
    'text-vapi-text-secondary': type === 'secondary',
    'text-vapi-text-muted': type === 'muted',
    'text-vapi-accent-primary': type === 'accent',
  }, 'vapi-theme-transition');

  return cn(vapiClasses, additionalClasses);
}

/**
 * Generate background classes for VAPI theme
 */
export function getVAPIBackgroundClasses(
  level: 'primary' | 'secondary' | 'tertiary' | 'elevated' = 'primary',
  isVAPIActive: boolean,
  additionalClasses?: string
): string {
  if (!isVAPIActive) {
    const defaultClasses = cn({
      'bg-white': level === 'primary',
      'bg-gray-50': level === 'secondary',
      'bg-gray-100': level === 'tertiary',
      'bg-gray-200': level === 'elevated',
    });
    return cn(defaultClasses, additionalClasses);
  }

  const vapiClasses = cn({
    'bg-vapi-bg-primary': level === 'primary',
    'bg-vapi-bg-secondary': level === 'secondary',
    'bg-vapi-bg-tertiary': level === 'tertiary',
    'bg-vapi-bg-elevated': level === 'elevated',
  }, 'vapi-theme-transition');

  return cn(vapiClasses, additionalClasses);
}

/**
 * Generate border classes for VAPI theme
 */
export function getVAPIBorderClasses(
  type: 'primary' | 'secondary' | 'accent' = 'primary',
  isVAPIActive: boolean,
  additionalClasses?: string
): string {
  if (!isVAPIActive) {
    const defaultClasses = cn({
      'border-gray-300': type === 'primary',
      'border-gray-200': type === 'secondary',
      'border-fountain-pen-blue': type === 'accent',
    });
    return cn(defaultClasses, additionalClasses);
  }

  const vapiClasses = cn({
    'border-vapi-border-primary': type === 'primary',
    'border-vapi-border-secondary': type === 'secondary',
    'border-vapi-border-accent': type === 'accent',
  }, 'vapi-theme-transition');

  return cn(vapiClasses, additionalClasses);
}

/**
 * Get VAPI theme data attributes for components
 */
export function getVAPIDataAttributes(config: VAPIThemeConfig | null) {
  if (!config) return {};

  return {
    'data-vapi-theme': true,
    'data-vapi-variant': config.darkMode.variant,
    'data-vapi-sidebar': config.layoutPreferences.sidebarStyle,
    'data-vapi-header': config.layoutPreferences.headerStyle,
    'data-vapi-density': config.layoutPreferences.contentDensity,
  };
}

/**
 * Generate CSS custom properties object for inline styles
 */
export function getVAPICustomProperties(config: VAPIThemeConfig | null): React.CSSProperties {
  if (!config) return {};

  const colors = config.colors;
  
  return {
    '--vapi-bg-primary': colors.background.primary,
    '--vapi-bg-secondary': colors.background.secondary,
    '--vapi-bg-tertiary': colors.background.tertiary,
    '--vapi-bg-elevated': colors.background.elevated,
    
    '--vapi-text-primary': colors.text.primary,
    '--vapi-text-secondary': colors.text.secondary,
    '--vapi-text-muted': colors.text.muted,
    '--vapi-text-inverse': colors.text.inverse,
    
    '--vapi-accent-primary': colors.accent.primary,
    '--vapi-accent-hover': colors.accent.hover,
    '--vapi-accent-light': colors.accent.light,
    '--vapi-accent-dark': colors.accent.dark,
    
    '--vapi-border-primary': colors.border.primary,
    '--vapi-border-secondary': colors.border.secondary,
    '--vapi-border-accent': colors.border.accent,
  } as React.CSSProperties;
}

/**
 * Check if current theme is VAPI theme by checking document attributes
 */
export function isVAPIThemeActive(): boolean {
  if (typeof document === 'undefined') return false;
  const theme = document.documentElement.getAttribute('data-theme');
  return theme?.startsWith('vapi-') || false;
}

/**
 * Get current VAPI theme variant from document
 */
export function getCurrentVAPIVariant(): 'standard' | 'soft' | null {
  if (typeof document === 'undefined') return null;
  const theme = document.documentElement.getAttribute('data-theme');
  
  if (theme === 'vapi-standard') return 'standard';
  if (theme === 'vapi-soft') return 'soft';
  return null;
}