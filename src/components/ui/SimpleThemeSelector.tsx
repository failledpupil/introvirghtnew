import { useUnifiedThemeStore } from '../../stores/unifiedThemeStore';
import { VAPICard, VAPIText } from './index';

interface SimpleThemeSelectorProps {
  onThemeSelect?: () => void;
}

export function SimpleThemeSelector({ onThemeSelect }: SimpleThemeSelectorProps) {
  const { availableThemes, currentTheme, setTheme } = useUnifiedThemeStore();

  const handleThemeSelect = (theme: any) => {
    setTheme(theme);
    onThemeSelect?.();
  };

  return (
    <VAPICard className="p-6">
      <VAPIText as="h3" type="accent" className="text-lg font-semibold mb-4">
        Choose Your Theme
      </VAPIText>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme)}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              currentTheme.id === theme.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold mb-2">{theme.name}</div>
            <div className="text-sm text-gray-600 mb-2">
              {theme.fontFamily} • {theme.fontSize}px
            </div>
            <div 
              className="w-full h-8 rounded border"
              style={{ backgroundColor: theme.paperColor }}
            />
          </button>
        ))}
      </div>
    </VAPICard>
  );
}