import { useState } from 'react';
import { cn } from '../utils/cn';
import type { Emotion } from '../types';

interface MoodTrackerProps {
  selectedEmotions: Emotion[];
  onEmotionChange: (emotions: Emotion[]) => void;
  className?: string;
}

// Predefined emotions with colors and categories
const defaultEmotions: Omit<Emotion, 'id' | 'custom'>[] = [
  // Positive emotions
  { name: 'Happy', intensity: 7, color: '#fbbf24', category: 'positive' },
  { name: 'Excited', intensity: 8, color: '#f59e0b', category: 'positive' },
  { name: 'Grateful', intensity: 6, color: '#ec4899', category: 'positive' },
  { name: 'Peaceful', intensity: 5, color: '#10b981', category: 'positive' },
  { name: 'Confident', intensity: 7, color: '#8b5cf6', category: 'positive' },
  { name: 'Loved', intensity: 8, color: '#ef4444', category: 'positive' },
  { name: 'Proud', intensity: 6, color: '#f97316', category: 'positive' },
  { name: 'Hopeful', intensity: 6, color: '#06b6d4', category: 'positive' },

  // Negative emotions
  { name: 'Sad', intensity: 4, color: '#3b82f6', category: 'negative' },
  { name: 'Angry', intensity: 6, color: '#dc2626', category: 'negative' },
  { name: 'Anxious', intensity: 5, color: '#7c3aed', category: 'negative' },
  { name: 'Frustrated', intensity: 5, color: '#ea580c', category: 'negative' },
  { name: 'Lonely', intensity: 4, color: '#6366f1', category: 'negative' },
  { name: 'Overwhelmed', intensity: 6, color: '#be123c', category: 'negative' },
  { name: 'Disappointed', intensity: 4, color: '#0891b2', category: 'negative' },
  { name: 'Stressed', intensity: 7, color: '#c2410c', category: 'negative' },

  // Neutral emotions
  { name: 'Calm', intensity: 4, color: '#059669', category: 'neutral' },
  { name: 'Curious', intensity: 5, color: '#7c2d12', category: 'neutral' },
  { name: 'Focused', intensity: 6, color: '#374151', category: 'neutral' },
  { name: 'Tired', intensity: 3, color: '#6b7280', category: 'neutral' },
  { name: 'Confused', intensity: 4, color: '#9333ea', category: 'neutral' },
  { name: 'Nostalgic', intensity: 5, color: '#be185d', category: 'neutral' },
];

export function MoodTracker({ selectedEmotions, onEmotionChange, className }: MoodTrackerProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [customEmotion, setCustomEmotion] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const filteredEmotions = activeCategory === 'all' 
    ? defaultEmotions 
    : defaultEmotions.filter(emotion => emotion.category === activeCategory);

  const handleEmotionToggle = (emotionData: Omit<Emotion, 'id' | 'custom'>) => {
    const existingIndex = selectedEmotions.findIndex(e => e.name === emotionData.name);
    
    if (existingIndex >= 0) {
      // Remove emotion
      const newEmotions = selectedEmotions.filter((_, index) => index !== existingIndex);
      onEmotionChange(newEmotions);
    } else {
      // Add emotion
      const newEmotion: Emotion = {
        id: `emotion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...emotionData,
        custom: false,
      };
      onEmotionChange([...selectedEmotions, newEmotion]);
    }
  };

  const handleCustomEmotion = () => {
    if (customEmotion.trim()) {
      const newEmotion: Emotion = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: customEmotion.trim(),
        intensity: 5,
        color: '#6b7280',
        category: 'neutral',
        custom: true,
      };
      onEmotionChange([...selectedEmotions, newEmotion]);
      setCustomEmotion('');
      setShowCustomInput(false);
    }
  };

  const isSelected = (emotionName: string) => {
    return selectedEmotions.some(e => e.name === emotionName);
  };



  const updateEmotionIntensity = (emotionName: string, intensity: number) => {
    const updatedEmotions = selectedEmotions.map(emotion => 
      emotion.name === emotionName 
        ? { ...emotion, intensity }
        : emotion
    );
    onEmotionChange(updatedEmotions);
  };

  return (
    <div className={cn('mood-tracker', className)}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-script text-lg text-fountain-pen-blue mb-2">How are you feeling?</h3>
        <p className="text-sm text-pencil-graphite/70">Select emotions that describe your current mood</p>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex rounded-lg bg-notebook-lines/20 p-1">
          {(['all', 'positive', 'negative', 'neutral'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                'flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors capitalize',
                activeCategory === category
                  ? 'bg-cream-paper text-fountain-pen-blue shadow-sm'
                  : 'text-pencil-graphite/70 hover:text-pencil-graphite'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Emotions Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {filteredEmotions.map((emotion) => {
          const selected = isSelected(emotion.name);
          return (
            <button
              key={emotion.name}
              onClick={() => handleEmotionToggle(emotion)}
              className={cn(
                'p-3 rounded-lg border-2 transition-all duration-200',
                'flex flex-col items-center gap-2 text-center',
                'hover:scale-105 hover:shadow-sm',
                selected
                  ? 'border-fountain-pen-blue bg-fountain-pen-blue/10'
                  : 'border-notebook-lines hover:border-pencil-graphite/30'
              )}
            >
              <div
                className="w-6 h-6 rounded-full shadow-sm"
                style={{ backgroundColor: emotion.color }}
              />
              <span className="text-xs font-medium text-pencil-graphite">
                {emotion.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Emotions with Intensity Sliders */}
      {selectedEmotions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-pencil-graphite mb-3">Adjust Intensity</h4>
          <div className="space-y-3">
            {selectedEmotions.map((emotion) => (
              <div key={emotion.id} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: emotion.color }}
                />
                <span className="text-sm text-pencil-graphite min-w-0 flex-1">
                  {emotion.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-pencil-graphite/70 w-8">
                    {emotion.intensity}/10
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={emotion.intensity}
                    onChange={(e) => updateEmotionIntensity(emotion.name, parseInt(e.target.value))}
                    className="w-20 h-2 bg-notebook-lines rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, ${emotion.color} 0%, ${emotion.color} ${emotion.intensity * 10}%, #e8e3d8 ${emotion.intensity * 10}%, #e8e3d8 100%)`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Emotion Input */}
      <div className="border-t border-notebook-lines pt-4">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className={cn(
              'w-full p-2 rounded-lg border border-dashed border-notebook-lines',
              'text-pencil-graphite/70 hover:text-fountain-pen-blue hover:border-fountain-pen-blue',
              'transition-colors text-sm flex items-center justify-center gap-2'
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add custom emotion
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={customEmotion}
              onChange={(e) => setCustomEmotion(e.target.value)}
              placeholder="Enter custom emotion..."
              className={cn(
                'flex-1 px-3 py-2 rounded-lg border border-notebook-lines',
                'bg-cream-paper text-pencil-graphite placeholder-pencil-graphite/50',
                'focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue/20 focus:border-fountain-pen-blue'
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCustomEmotion();
                } else if (e.key === 'Escape') {
                  setShowCustomInput(false);
                  setCustomEmotion('');
                }
              }}
              autoFocus
            />
            <button
              onClick={handleCustomEmotion}
              disabled={!customEmotion.trim()}
              className={cn(
                'px-3 py-2 rounded-lg bg-fountain-pen-blue text-white',
                'hover:bg-fountain-pen-blue/90 disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomEmotion('');
              }}
              className="px-3 py-2 rounded-lg border border-notebook-lines text-pencil-graphite hover:bg-notebook-lines/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Mood Summary */}
      {selectedEmotions.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-aged-paper border border-notebook-lines">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-fountain-pen-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium text-pencil-graphite">Mood Summary</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedEmotions.map((emotion) => (
              <span
                key={emotion.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-cream-paper"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: emotion.color }}
                />
                {emotion.name} ({emotion.intensity}/10)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}