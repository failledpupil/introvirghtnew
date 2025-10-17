import { useState } from 'react';
import { cn } from '../../utils/cn';
import { useThemeStore } from '../../stores/themeStore';
// import { getVAPIThemes, isVAPITheme } from '../../config/themePresets'; // Removed during optimization
import { useVAPITheme } from '../../hooks/useSimpleVAPITheme';
import type { WritingTheme } from '../../types';
// import type { EnhancedTheme } from '../../types/enhancedTheme'; // Removed during optimization

interface ThemeSelectorProps {
  className?: string;
  onThemeSelect?: (theme: WritingTheme) => void;
}

export function ThemeSelector({ className, onThemeSelect }: ThemeSelectorProps) {
  const { currentTheme, availableThemes, setTheme } = useThemeStore();
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof themeCategories | 'vapi'>('classic');
  const vapi = useVAPITheme();
  const vapiThemes = getVAPIThemes();

  const handleThemeSelect = (theme: WritingTheme) => {
    setTheme(theme);
    
    // If it's a VAPI theme, enable VAPI mode
    const enhancedTheme = theme as EnhancedTheme;
    if (isVAPITheme(enhancedTheme) && enhancedTheme.vapi) {
      vapi.enable(enhancedTheme.vapi);
    } else {
      // Disable VAPI mode for non-VAPI themes
      vapi.disable();
    }
    
    onThemeSelect?.(theme);
  };

  const categoryThemes = selectedCategory === 'vapi' ? vapiThemes : getThemesByCategory(selectedCategory as keyof typeof themeCategories);
  const customThemes = availableThemes.filter(theme => theme.id.startsWith('custom-'));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Category Tabs */}
      <div className={cn(
        "flex space-x-1 rounded-lg p-1",
        vapi.isActive ? "bg-vapi-bg-tertiary" : "bg-aged-paper"
      )}>
        {/* VAPI Themes Tab */}
        <button
          onClick={() => setSelectedCategory('vapi')}
          className={cn(
            'px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2',
            selectedCategory === 'vapi'
              ? vapi.isActive 
                ? 'bg-vapi-bg-secondary text-vapi-accent-primary shadow-sm'
                : 'bg-cream-paper text-fountain-pen-blue shadow-sm'
              : vapi.isActive
                ? 'text-vapi-text-secondary hover:text-vapi-accent-primary'
                : 'text-pencil-graphite hover:text-fountain-pen-blue'
          )}
        >
          <span>🌙</span>
          VAPI
          {vapi.isActive && <span className="w-2 h-2 bg-vapi-accent-primary rounded-full animate-pulse"></span>}
        </button>
        
        {Object.keys(themeCategories).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as keyof typeof themeCategories)}
            className={cn(
              'px-3 py-2 text-sm font-medium rounded-md transition-colors',
              selectedCategory === category
                ? vapi.isActive 
                  ? 'bg-vapi-bg-secondary text-vapi-accent-primary shadow-sm'
                  : 'bg-cream-paper text-fountain-pen-blue shadow-sm'
                : vapi.isActive
                  ? 'text-vapi-text-secondary hover:text-vapi-accent-primary'
                  : 'text-pencil-graphite hover:text-fountain-pen-blue'
            )}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
        
        {customThemes.length > 0 && (
          <button
            onClick={() => setSelectedCategory('custom' as keyof typeof themeCategories)}
            className={cn(
              'px-3 py-2 text-sm font-medium rounded-md transition-colors',
              selectedCategory === ('custom' as keyof typeof themeCategories)
                ? vapi.isActive 
                  ? 'bg-vapi-bg-secondary text-vapi-accent-primary shadow-sm'
                  : 'bg-cream-paper text-fountain-pen-blue shadow-sm'
                : vapi.isActive
                  ? 'text-vapi-text-secondary hover:text-vapi-accent-primary'
                  : 'text-pencil-graphite hover:text-fountain-pen-blue'
            )}
          >
            Custom
          </button>
        )}
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(selectedCategory === ('custom' as keyof typeof themeCategories) ? customThemes : categoryThemes).map((theme) => (
          <ThemePreview
            key={theme.id}
            theme={theme}
            isSelected={currentTheme.id === theme.id}
            onSelect={() => handleThemeSelect(theme)}
            isVAPITheme={isVAPITheme(theme)}
          />
        ))}
      </div>
    </div>
  );
}

interface ThemePreviewProps {
  theme: WritingTheme;
  isSelected: boolean;
  onSelect: () => void;
  isVAPITheme?: boolean;
}

function ThemePreview({ theme, isSelected, onSelect, isVAPITheme: isVAPI }: ThemePreviewProps) {
  const getTexturePattern = () => {
    switch (theme.paperTexture) {
      case 'ruled':
        return 'bg-ruled-paper';
      case 'dotted':
        return 'bg-dotted-paper';
      case 'grid':
        return 'bg-grid-paper';
      default:
        return '';
    }
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative w-full h-32 rounded-lg border-2 transition-all duration-200',
        'hover:scale-105 hover:shadow-lg',
        isSelected
          ? isVAPI 
            ? 'border-vapi-accent-primary shadow-md shadow-vapi-accent-primary/20'
            : 'border-fountain-pen-blue shadow-md'
          : isVAPI
            ? 'border-vapi-border-secondary hover:border-vapi-accent-primary'
            : 'border-notebook-lines hover:border-pencil-graphite',
        isVAPI && 'vapi-glow'
      )}
      style={{ backgroundColor: theme.paperColor }}
    >
      {/* Paper texture */}
      <div className={cn('absolute inset-0 rounded-lg', getTexturePattern())} />
      
      {/* Margin line for ruled paper */}
      {theme.paperTexture === 'ruled' && (
        <div 
          className="absolute top-0 bottom-0 w-px bg-margin-red opacity-60"
          style={{ left: `${(theme.marginSize / 200) * 100}%` }}
        />
      )}
      
      {/* Sample text */}
      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        <div
          className="text-left text-sm leading-relaxed"
          style={{
            color: theme.inkColor,
            fontFamily: theme.fontFamily,
            fontSize: `${theme.fontSize * 0.75}px`,
            lineHeight: theme.lineHeight,
          }}
        >
          Dear Diary,
          <br />
          Today was...
        </div>
        
        <div className={cn(
          "text-xs font-medium flex items-center gap-2",
          isVAPI ? "text-vapi-text-secondary" : "text-pencil-graphite/70"
        )}>
          {isVAPI && <span className="text-vapi-accent-primary">🌙</span>}
          {theme.name}
        </div>
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className={cn(
          "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center",
          isVAPI ? "bg-vapi-accent-primary" : "bg-fountain-pen-blue"
        )}>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
}