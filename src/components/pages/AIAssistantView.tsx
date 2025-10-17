import { useState, useEffect } from 'react';
import { SimpleAIAssistant } from '../ai/SimpleAIAssistant';
import { EmotionalCompanion } from '../ai/EmotionalCompanion';
import { CompanionOnboarding } from '../ai/CompanionOnboarding';
import { CompanionPrivacySettings } from '../ai/CompanionPrivacySettings';
import { useDiaryStore } from '../../stores/diaryStore';
import { useEmotionalAnalysis } from '../../hooks/useEmotionalAnalysis';
import { cn } from '../../utils/cn';

type AIMode = 'simple' | 'emotional' | 'onboarding' | 'settings';

export function AIAssistantView() {
  const { entries } = useDiaryStore();
  const { preferences, updatePreferences } = useEmotionalAnalysis();
  const [currentMode, setCurrentMode] = useState<AIMode>('simple');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user has completed emotional companion setup
  useEffect(() => {
    const hasCompletedSetup = localStorage.getItem('emotional-companion-setup');
    if (!hasCompletedSetup && entries.length > 0) {
      setShowOnboarding(true);
    }
  }, [entries.length]);

  const handleOnboardingComplete = async (newPreferences: any) => {
    try {
      await updatePreferences(newPreferences);
      localStorage.setItem('emotional-companion-setup', 'true');
      setShowOnboarding(false);
      setCurrentMode('emotional');
    } catch (error) {
      console.error('Failed to save companion preferences:', error);
    }
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('emotional-companion-setup', 'skipped');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <CompanionOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </div>
    );
  }

  if (currentMode === 'settings') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <CompanionPrivacySettings
          onClose={() => setCurrentMode('emotional')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl shadow-lg mx-auto mb-4">
          🤖
        </div>
        <h1 className="text-4xl font-script text-fountain-pen-blue mb-3">Meet Alex</h1>
        <p className="text-lg text-pencil-graphite/80 mb-2">
          Your AI companion
        </p>
        <p className="text-pencil-graphite/60 max-w-2xl mx-auto mb-6">
          {entries.length > 0 
            ? `Alex has analyzed ${entries.length} diary entries to provide personalized support, insights, and emotional understanding tailored to your unique journey.`
            : "Alex will help you with writing prompts, emotional support, and insights as you begin your journaling journey."
          }
        </p>

        {/* Mode Selection */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setCurrentMode('simple')}
            className={cn(
              'px-4 py-2 rounded-lg transition-all',
              currentMode === 'simple'
                ? 'bg-fountain-pen-blue text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            📝 Writing Assistant
          </button>
          
          <button
            onClick={() => setCurrentMode('emotional')}
            className={cn(
              'px-4 py-2 rounded-lg transition-all',
              currentMode === 'emotional'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            💙 Emotional Companion
          </button>

          {preferences && (
            <button
              onClick={() => setCurrentMode('settings')}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
            >
              ⚙️ Settings
            </button>
          )}
        </div>

        {/* Feature Descriptions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
          <div className={cn(
            'p-4 rounded-lg border-2 transition-all',
            currentMode === 'simple' 
              ? 'border-fountain-pen-blue bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-200 dark:border-gray-600'
          )}>
            <h3 className="font-medium text-fountain-pen-blue dark:text-blue-300 mb-2">
              📝 Writing Assistant
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get writing prompts, summaries, and general assistance with your diary entries. 
              Perfect for creative inspiration and productivity.
            </p>
          </div>

          <div className={cn(
            'p-4 rounded-lg border-2 transition-all',
            currentMode === 'emotional' 
              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' 
              : 'border-gray-200 dark:border-gray-600'
          )}>
            <h3 className="font-medium text-purple-700 dark:text-purple-300 mb-2">
              💙 Emotional Companion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive empathetic support, emotional insights, and personalized conversations. 
              Alex understands your feelings and provides caring guidance.
            </p>
          </div>
        </div>
      </div>

      {/* AI Interface */}
      {currentMode === 'simple' && <SimpleAIAssistant />}
      {currentMode === 'emotional' && <EmotionalCompanion />}
    </div>
  );
}

export default AIAssistantView;