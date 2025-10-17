import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WritingTheme } from '../types';
import type { VAPIThemeConfig } from '../types/vapi';

interface UnifiedThemeStore {
  // Basic theme
  currentTheme: WritingTheme;
  availableThemes: WritingTheme[];
  darkMode: boolean;
  
  // VAPI theme
  isVAPIThemeActive: boolean;
  currentVAPIConfig: VAPIThemeConfig | null;
  
  // Actions
  setTheme: (theme: WritingTheme) => void;
  toggleDarkMode: () => void;
  setVAPITheme: (enabled: boolean, config?: VAPIThemeConfig) => void;
  setVAPIAccentColor: (color: string) => void;
  
  // Utilities
  isVAPITheme: () => boolean;
  getVAPIConfig: () => VAPIThemeConfig | null;
}

// Simplified default themes - keeping only the most popular ones
const defaultThemes: WritingTheme[] = [
  {
    id: 'classic-notebook',
    name: 'Classic Notebook',
    paperTexture: 'ruled',
    paperColor: '#faf7f0',
    inkColor: '#1e3a8a',
    fontFamily: 'Caveat',
    fontSize: 16,
    lineHeight: 1.6,
    marginSize: 80,
  },
  {
    id: 'minimalist-white',
    name: 'Minimalist White',
    paperTexture: 'blank',
    paperColor: '#ffffff',
    inkColor: '#1a1a1a',
    fontFamily: 'Source Serif Pro',
    fontSize: 16,
    lineHeight: 1.6,
    marginSize: 60,
  },
  {
    id: 'dark-mood',
    name: 'Dark Mood',
    paperTexture: 'ruled',
    paperColor: '#1f2937',
    inkColor: '#f3f4f6',
    fontFamily: 'Caveat',
    fontSize: 16,
    lineHeight: 1.6,
    marginSize: 80,
  },
  {
    id: 'vintage-leather',
    name: 'Vintage Leather',
    paperTexture: 'blank',
    paperColor: '#f4f1e8',
    inkColor: '#8b4513',
    fontFamily: 'Caveat',
    fontSize: 18,
    lineHeight: 1.8,
    marginSize: 60,
  },
];

export const useUnifiedThemeStore = create<UnifiedThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: defaultThemes[0],
      availableThemes: defaultThemes,
      darkMode: false,
      isVAPIThemeActive: false,
      currentVAPIConfig: null,

      setTheme: (theme) => {
        set({ currentTheme: theme });
        applyThemeToDocument(theme, get().darkMode);
      },

      toggleDarkMode: () => {
        const newDarkMode = !get().darkMode;
        set({ darkMode: newDarkMode });
        applyThemeToDocument(get().currentTheme, newDarkMode);
      },

      setVAPITheme: (enabled, config) => {
        set({
          isVAPIThemeActive: enabled,
          currentVAPIConfig: enabled ? config || null : null,
        });
        
        if (enabled && config) {
          applyVAPITheme(config);
        } else {
          removeVAPITheme();
        }
      },

      setVAPIAccentColor: (color) => {
        const state = get();
        if (state.currentVAPIConfig) {
          const updatedConfig = {
            ...state.currentVAPIConfig,
            colors: {
              ...state.currentVAPIConfig.colors,
              accent: {
                ...state.currentVAPIConfig.colors.accent,
                primary: color,
              },
            },
          };
          
          set({ currentVAPIConfig: updatedConfig });
          applyVAPITheme(updatedConfig);
        }
      },

      isVAPITheme: () => get().isVAPIThemeActive,
      getVAPIConfig: () => get().currentVAPIConfig,
    }),
    {
      name: 'unified-theme-store',
    }
  )
);

// Apply theme to document
function applyThemeToDocument(theme: WritingTheme, darkMode: boolean) {
  const root = document.documentElement;
  
  root.style.setProperty('--theme-paper-color', theme.paperColor);
  root.style.setProperty('--theme-ink-color', theme.inkColor);
  root.style.setProperty('--theme-font-family', theme.fontFamily);
  root.style.setProperty('--theme-font-size', `${theme.fontSize}px`);
  root.style.setProperty('--theme-line-height', theme.lineHeight.toString());
  root.style.setProperty('--theme-margin-size', `${theme.marginSize}px`);
  
  if (darkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  root.setAttribute('data-paper-texture', theme.paperTexture);
}

// Apply VAPI theme to document
function applyVAPITheme(config: VAPIThemeConfig) {
  const root = document.documentElement;
  root.setAttribute('data-theme', `vapi-${config.darkMode.variant}`);
  
  const colors = config.colors;
  
  // Background colors
  root.style.setProperty('--vapi-bg-primary', colors.background.primary);
  root.style.setProperty('--vapi-bg-secondary', colors.background.secondary);
  root.style.setProperty('--vapi-bg-tertiary', colors.background.tertiary);
  root.style.setProperty('--vapi-bg-elevated', colors.background.elevated);
  
  // Text colors
  root.style.setProperty('--vapi-text-primary', colors.text.primary);
  root.style.setProperty('--vapi-text-secondary', colors.text.secondary);
  root.style.setProperty('--vapi-text-muted', colors.text.muted);
  root.style.setProperty('--vapi-text-inverse', colors.text.inverse);
  
  // Accent colors
  root.style.setProperty('--vapi-accent-primary', colors.accent.primary);
  root.style.setProperty('--vapi-accent-hover', colors.accent.hover);
  root.style.setProperty('--vapi-accent-light', colors.accent.light);
  root.style.setProperty('--vapi-accent-dark', colors.accent.dark);
  
  // Semantic colors
  root.style.setProperty('--vapi-semantic-success', colors.semantic.success);
  root.style.setProperty('--vapi-semantic-warning', colors.semantic.warning);
  root.style.setProperty('--vapi-semantic-error', colors.semantic.error);
  root.style.setProperty('--vapi-semantic-info', colors.semantic.info);
  
  // Border colors
  root.style.setProperty('--vapi-border-primary', colors.border.primary);
  root.style.setProperty('--vapi-border-secondary', colors.border.secondary);
  root.style.setProperty('--vapi-border-accent', colors.border.accent);
}

// Remove VAPI theme from document
function removeVAPITheme() {
  const root = document.documentElement;
  root.removeAttribute('data-theme');
}

// Initialize theme on app start
export function initializeUnifiedTheme() {
  const { currentTheme, darkMode, isVAPIThemeActive, currentVAPIConfig } = useUnifiedThemeStore.getState();
  applyThemeToDocument(currentTheme, darkMode);
  
  if (isVAPIThemeActive && currentVAPIConfig) {
    applyVAPITheme(currentVAPIConfig);
  }
}

// Export default themes for use in components
export { defaultThemes };
