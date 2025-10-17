// Simplified VAPI theme types for the unified theme system

export interface VAPIColors {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  accent: {
    primary: string;
    hover: string;
    light: string;
    dark: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  border: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface VAPIThemeConfig {
  darkMode: {
    variant: 'standard' | 'soft';
  };
  colors: VAPIColors;
}