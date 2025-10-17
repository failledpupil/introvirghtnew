import { useMemo } from 'react';
import { useUnifiedThemeStore } from '../stores/unifiedThemeStore';

/**
 * Simplified VAPI theme hook for the unified theme system
 */
export function useVAPITheme() {
  const { 
    isVAPIThemeActive, 
    currentVAPIConfig, 
    setVAPITheme, 
    setVAPIAccentColor
  } = useUnifiedThemeStore();

  const vapiUtils = useMemo(() => ({
    // Theme state
    isActive: isVAPIThemeActive,
    config: currentVAPIConfig,
    
    // Theme actions
    enable: (config: any) => setVAPITheme(true, config),
    disable: () => setVAPITheme(false),
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
  }), [
    isVAPIThemeActive, 
    currentVAPIConfig, 
    setVAPITheme, 
    setVAPIAccentColor
  ]);

  return vapiUtils;
}

export default useVAPITheme;