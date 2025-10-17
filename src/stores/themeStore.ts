// DEPRECATED: This file is kept for backward compatibility
// Use unifiedThemeStore instead

import { useUnifiedThemeStore, initializeUnifiedTheme, defaultThemes as unifiedDefaultThemes } from './unifiedThemeStore';
import type { WritingTheme } from '../types';

// Legacy interface - kept for compatibility
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ThemeStore {
  currentTheme: WritingTheme;
  availableThemes: WritingTheme[];
  darkMode: boolean;
  
  // Actions
  setTheme: (theme: WritingTheme) => void;
  toggleDarkMode: () => void;
  createCustomTheme: (theme: Omit<WritingTheme, 'id'>) => WritingTheme;
  updateTheme: (id: string, updates: Partial<WritingTheme>) => void;
  deleteCustomTheme: (id: string) => void;
}

// Predefined themes inspired by popular journaling apps
const defaultThemes: WritingTheme[] = [
  // Classic Collection
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
  {
    id: 'moleskine-style',
    name: 'Moleskine Style',
    paperTexture: 'dotted',
    paperColor: '#fffef7',
    inkColor: '#2c2c2c',
    fontFamily: 'Source Serif Pro',
    fontSize: 15,
    lineHeight: 1.5,
    marginSize: 40,
  },

  // Modern Collection
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
    id: 'notion-inspired',
    name: 'Notion Inspired',
    paperTexture: 'blank',
    paperColor: '#fefefe',
    inkColor: '#37352f',
    fontFamily: 'Source Serif Pro',
    fontSize: 16,
    lineHeight: 1.5,
    marginSize: 50,
  },
  {
    id: 'grid-engineer',
    name: 'Engineer\'s Grid',
    paperTexture: 'grid',
    paperColor: '#f8fafc',
    inkColor: '#374151',
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    lineHeight: 1.4,
    marginSize: 50,
  },

  // Elegant Collection
  {
    id: 'elegant-script',
    name: 'Elegant Script',
    paperTexture: 'blank',
    paperColor: '#fffef7',
    inkColor: '#1e3a8a',
    fontFamily: 'Dancing Script',
    fontSize: 20,
    lineHeight: 1.7,
    marginSize: 100,
  },
  {
    id: 'calligraphy-gold',
    name: 'Calligraphy Gold',
    paperTexture: 'blank',
    paperColor: '#fdf6e3',
    inkColor: '#b8860b',
    fontFamily: 'Dancing Script',
    fontSize: 18,
    lineHeight: 1.8,
    marginSize: 80,
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    paperTexture: 'ruled',
    paperColor: '#f8f6ff',
    inkColor: '#6b46c1',
    fontFamily: 'Caveat',
    fontSize: 17,
    lineHeight: 1.7,
    marginSize: 75,
  },

  // Dark Collection
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
    id: 'midnight-blue',
    name: 'Midnight Blue',
    paperTexture: 'blank',
    paperColor: '#0f172a',
    inkColor: '#cbd5e1',
    fontFamily: 'Source Serif Pro',
    fontSize: 16,
    lineHeight: 1.6,
    marginSize: 60,
  },
  {
    id: 'forest-night',
    name: 'Forest Night',
    paperTexture: 'dotted',
    paperColor: '#1a2e1a',
    inkColor: '#86efac',
    fontFamily: 'Caveat',
    fontSize: 16,
    lineHeight: 1.7,
    marginSize: 70,
  },

  // Seasonal Collection
  {
    id: 'autumn-leaves',
    name: 'Autumn Leaves',
    paperTexture: 'blank',
    paperColor: '#fef3e2',
    inkColor: '#c2410c',
    fontFamily: 'Caveat',
    fontSize: 17,
    lineHeight: 1.7,
    marginSize: 65,
  },
  {
    id: 'spring-garden',
    name: 'Spring Garden',
    paperTexture: 'dotted',
    paperColor: '#f0fdf4',
    inkColor: '#15803d',
    fontFamily: 'Caveat',
    fontSize: 16,
    lineHeight: 1.6,
    marginSize: 70,
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    paperTexture: 'ruled',
    paperColor: '#f0f9ff',
    inkColor: '#0369a1',
    fontFamily: 'Source Serif Pro',
    fontSize: 15,
    lineHeight: 1.6,
    marginSize: 75,
  },
];

// Re-export unified theme store with compatibility wrapper
export const useThemeStore = useUnifiedThemeStore;

// Re-export initialization function
export const initializeTheme = initializeUnifiedTheme;

// Re-export default themes
export { unifiedDefaultThemes as defaultThemes };