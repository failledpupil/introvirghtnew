import React from 'react';
import { cn } from '../../utils/cn';
import { useVAPITheme } from '../../hooks/useVAPITheme';
import { isVAPIThemeActive } from '../../utils/vapiThemeUtils';
import logoIconLight from '../../assets/branding/brain-logo.png';
import logoIconDark from '../../assets/branding/brain-logo.png';
import logoWordmarkLight from '../../assets/branding/brain-logo.png';
import logoWordmarkDark from '../../assets/branding/brain-logo.png';
import logoFullLight from '../../assets/branding/brain-logo.png';
import logoFullDark from '../../assets/branding/brain-logo.png';

export interface LogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark' | 'auto';
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  xs: { icon: 'h-12 w-12', wordmark: 'h-8 w-auto', full: 'h-12 w-auto' },
  sm: { icon: 'h-16 w-16', wordmark: 'h-12 w-auto', full: 'h-16 w-auto' },
  md: { icon: 'h-20 w-20', wordmark: 'h-16 w-auto', full: 'h-20 w-auto' },
  lg: { icon: 'h-24 w-24', wordmark: 'h-20 w-auto', full: 'h-24 w-auto' },
  xl: { icon: 'h-32 w-32', wordmark: 'h-24 w-auto', full: 'h-32 w-auto' },
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'auto',
  animated = false,
  className,
}) => {
  const vapi = useVAPITheme();
  const [isDark, setIsDark] = React.useState(false);
  const [isVAPIActive, setIsVAPIActive] = React.useState(false);

  React.useEffect(() => {
    if (theme === 'auto') {
      // Check system preference, document class, and VAPI theme
      const checkThemeMode = () => {
        const vapiActive = isVAPIThemeActive() || vapi.isActive;
        const hasDarkClass = document.documentElement.classList.contains('dark');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        setIsVAPIActive(vapiActive);
        // VAPI themes are always dark, so use dark logo variant
        setIsDark(vapiActive || hasDarkClass || prefersDark);
      };

      checkThemeMode();

      // Watch for changes
      const observer = new MutationObserver(checkThemeMode);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme'],
      });

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', checkThemeMode);

      return () => {
        observer.disconnect();
        mediaQuery.removeEventListener('change', checkThemeMode);
      };
    } else {
      setIsDark(theme === 'dark');
      setIsVAPIActive(vapi.isActive);
    }
  }, [theme, vapi.isActive]);

  // Select the appropriate logo based on variant and theme
  const getLogoSrc = () => {
    const isDarkMode = theme === 'dark' || (theme === 'auto' && isDark);

    switch (variant) {
      case 'icon':
        return isDarkMode ? logoIconDark : logoIconLight;
      case 'wordmark':
        return isDarkMode ? logoWordmarkDark : logoWordmarkLight;
      case 'full':
      default:
        return isDarkMode ? logoFullDark : logoFullLight;
    }
  };

  const logoSrc = getLogoSrc();
  const sizeClass = sizeMap[size][variant];

  // Use the complete logo PNG for all variants - it's already perfectly designed
  return (
    <div className={cn(
      'logo-container relative flex items-center justify-start w-full',
      'px-2 py-1', // Add proper padding
      animated && 'transition-all duration-300 ease-out hover:scale-105',
      className
    )}>
      <img
        src={logoSrc}
        alt="Introvirght - Digital Diary for Deep Thinkers"
        className={cn(
          sizeClass,
          'object-contain logo select-none relative z-10',
          'transition-all duration-300 ease-out',
          'min-h-16 min-w-48', // Force minimum size
          animated && 'hover:brightness-110',
          isVAPIActive && 'brightness-110 contrast-110',
          'drop-shadow-sm',
        )}
        draggable={false}
        loading="eager"
        style={{
          imageRendering: 'crisp-edges',
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))',
          width: '100%',
          maxWidth: '240px', // Allow it to be much wider
          height: 'auto',
        }}
      />
    </div>
  );


};

export default Logo;
