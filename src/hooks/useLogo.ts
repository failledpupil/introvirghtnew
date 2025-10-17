import { useState, useEffect } from 'react';

export type LogoVariant = 'full' | 'icon' | 'wordmark';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LogoTheme = 'light' | 'dark' | 'auto';

interface UseLogoOptions {
  variant?: LogoVariant;
  size?: LogoSize;
  theme?: LogoTheme;
  animated?: boolean;
}

interface UseLogoReturn {
  variant: LogoVariant;
  size: LogoSize;
  theme: LogoTheme;
  animated: boolean;
  isDarkMode: boolean;
  setVariant: (variant: LogoVariant) => void;
  setSize: (size: LogoSize) => void;
  setTheme: (theme: LogoTheme) => void;
  setAnimated: (animated: boolean) => void;
}

/**
 * Hook for managing logo state and theme detection
 * Provides reactive logo configuration with automatic dark mode detection
 * 
 * @example
 * ```tsx
 * const { variant, size, isDarkMode, setVariant } = useLogo({ 
 *   variant: 'icon', 
 *   size: 'md' 
 * });
 * ```
 */
export function useLogo(options: UseLogoOptions = {}): UseLogoReturn {
  const [variant, setVariant] = useState<LogoVariant>(options.variant || 'full');
  const [size, setSize] = useState<LogoSize>(options.size || 'md');
  const [theme, setTheme] = useState<LogoTheme>(options.theme || 'auto');
  const [animated, setAnimated] = useState<boolean>(options.animated || false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (theme === 'auto') {
      const checkDarkMode = () => {
        const hasDarkClass = document.documentElement.classList.contains('dark');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(hasDarkClass || prefersDark);
      };

      checkDarkMode();

      // Watch for class changes on document element
      const observer = new MutationObserver(checkDarkMode);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });

      // Watch for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', checkDarkMode);

      return () => {
        observer.disconnect();
        mediaQuery.removeEventListener('change', checkDarkMode);
      };
    } else {
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);

  return {
    variant,
    size,
    theme,
    animated,
    isDarkMode,
    setVariant,
    setSize,
    setTheme,
    setAnimated,
  };
}

export default useLogo;
