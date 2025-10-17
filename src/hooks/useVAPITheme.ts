import { useMemo } from 'react';
import { useEnhancedThemeStore } from '../stores/enhancedThemeStore';
import type { VAPIThemeConfig, VAPIColors } from '../types/vapi';

/**
 * Hook for VAPI theme detection and utilities
 */
export function useVAPITheme() {
  const { 
    isVAPIThemeActive, 
    currentVAPIConfig, 
    setVAPITheme, 
    updateVAPIColors, 
    setVAPIAccentColor
  } = useEnhancedThemeStore();

  const vapiUtils = useMemo(() => ({
    // Theme state
    isActive: isVAPIThemeActive,
    config: currentVAPIConfig,
    
    // Theme actions
    enable: (config: VAPIThemeConfig) => setVAPITheme(true, config),
    disable: () => setVAPITheme(false),
    updateColors: (colors: Partial<VAPIColors>) => updateVAPIColors(colors),
    setAccentColor: (color: string) => setVAPIAccentColor(color),
    
    // Utility functions
    getThemeAttribute: () => {
      if (!isVAPIThemeActive || !currentVAPIConfig) return null;
      return `vapi-${currentVAPIConfig.darkMode.variant}`;
    },
    
    getAccentColor: () => {
      return currentVAPIConfig?.colors.accent.primary || '#14b8a6';
    },
    
    getBackgroundColor: (level: 'primary' | 'secondary' | 'tertiary' | 'elevated' = 'primary') => {
      return currentVAPIConfig?.colors.background[level] || '#0a0a0a';
    },
    
    getTextColor: (type: 'primary' | 'secondary' | 'muted' | 'inverse' = 'primary') => {
      return currentVAPIConfig?.colors.text[type] || '#ffffff';
    },
    
    getBorderColor: (type: 'primary' | 'secondary' | 'accent' = 'primary') => {
      return currentVAPIConfig?.colors.border[type] || '#374151';
    },
    
    // CSS class generators
    getCardClasses: () => {
      if (!isVAPIThemeActive) return '';
      return 'vapi-card vapi-theme-transition';
    },
    
    getButtonClasses: (variant: 'primary' | 'secondary' = 'primary') => {
      if (!isVAPIThemeActive) return '';
      return `vapi-button-${variant} vapi-button-hover vapi-theme-transition`;
    },
    
    getInputClasses: () => {
      if (!isVAPIThemeActive) return '';
      return 'vapi-input vapi-theme-transition';
    },
    
    // Layout utilities
    getSidebarStyle: () => {
      return currentVAPIConfig?.layoutPreferences.sidebarStyle || 'expanded';
    },
    
    getHeaderStyle: () => {
      return currentVAPIConfig?.layoutPreferences.headerStyle || 'fixed';
    },
    
    getContentDensity: () => {
      return currentVAPIConfig?.layoutPreferences.contentDensity || 'comfortable';
    },
  }), [
    isVAPIThemeActive, 
    currentVAPIConfig, 
    setVAPITheme, 
    updateVAPIColors, 
    setVAPIAccentColor
  ]);

  return vapiUtils;
}

/**
 * Hook for VAPI theme CSS custom properties
 */
export function useVAPIThemeCSS() {
  const { currentVAPIConfig, isVAPIThemeActive } = useEnhancedThemeStore();

  return useMemo(() => {
    if (!isVAPIThemeActive || !currentVAPIConfig) {
      return {};
    }

    const colors = currentVAPIConfig.colors;
    
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
      
      '--vapi-semantic-success': colors.semantic.success,
      '--vapi-semantic-warning': colors.semantic.warning,
      '--vapi-semantic-error': colors.semantic.error,
      '--vapi-semantic-info': colors.semantic.info,
      
      '--vapi-border-primary': colors.border.primary,
      '--vapi-border-secondary': colors.border.secondary,
      '--vapi-border-accent': colors.border.accent,
    } as React.CSSProperties;
  }, [currentVAPIConfig, isVAPIThemeActive]);
}

export default useVAPITheme;