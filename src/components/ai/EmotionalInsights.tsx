// Emotional insights display component for diary entries

import React, { useState } from 'react';
import { useEntryAnalysis } from '../../hooks/useEmotionalAnalysis';
import { cn } from '../../utils/cn';
import type { Emotion } from '../../types';

import type {
  EmotionalAnalysis,
  ConcernLevel
} from '../../types/emotional-companion';

export interface EmotionalInsightsProps {
  entryId: string;
  className?: string;
  compact?: boolean;
}

export const EmotionalInsights: React.FC<EmotionalInsightsProps> = ({
  entryId,
  className,
  compact = false
}) => {
  const { analysis, isLoading, error } = useEntryAnalysis(entryId);
  const [showDetails, setShowDetails] = useState(false);

  if (isLoading) {
    return (
      <div className={cn('bg-gray-50 dark:bg-gray-800 rounded-lg p-4', className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return null; // Don't show anything if there's no analysis
  }

  const getSentimentColor = (compound: number) => {
    if (compound > 0.3) return 'text-green-600 dark:text-green-400';
    if (compound < -0.3) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getSentimentLabel = (compound: number) => {
    if (compound > 0.3) return 'Positive';
    if (compound < -0.3) return 'Negative';
    return 'Neutral';
  };

  // Removed unused function - getIntensityColor

  if (compact) {
    return (
      <div className={cn('bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Mood:</span>
              <span className={cn('text-xs font-medium', getSentimentColor(analysis.sentiment.compound))}>
                {getSentimentLabel(analysis.sentiment.compound)}
              </span>
            </div>
            
            {analysis.primaryEmotions.length > 0 && (
              <div className="flex gap-1">
                {analysis.primaryEmotions.slice(0, 3).map((emotion, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                    style={{ backgroundColor: `${emotion.color}20`, color: emotion.color }}
                  >
                    {emotion.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
          >
            {showDetails ? 'Less' : 'More'}
          </button>
        </div>
        
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-purple-200 dark:border-gray-600">
            <EmotionalInsightsDetailed analysis={analysis} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🧠</span>
        <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200">
          Emotional Insights
        </h3>
      </div>
      
      <EmotionalInsightsDetailed analysis={analysis} />
    </div>
  );
};

interface EmotionalInsightsDetailedProps {
  analysis: EmotionalAnalysis;
}

const EmotionalInsightsDetailed: React.FC<EmotionalInsightsDetailedProps> = ({ analysis }) => {
  const getSentimentColor = (compound: number) => {
    if (compound > 0.3) return 'text-green-600 dark:text-green-400';
    if (compound < -0.3) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getSentimentLabel = (compound: number) => {
    if (compound > 0.3) return 'Positive';
    if (compound < -0.3) return 'Negative';
    return 'Neutral';
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity > 7) return 'text-red-500';
    if (intensity > 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-4">
      {/* Overall Sentiment */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Overall Sentiment:
        </span>
        <div className="flex items-center gap-2">
          <span className={cn('font-medium', getSentimentColor(analysis.sentiment.compound))}>
            {getSentimentLabel(analysis.sentiment.compound)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({(analysis.sentiment.compound * 100).toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* Emotional Intensity */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Emotional Intensity:
        </span>
        <div className="flex items-center gap-2">
          <span className={cn('font-medium', getIntensityColor(analysis.intensity))}>
            {analysis.intensity}/10
          </span>
          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', {
                'bg-green-500': analysis.intensity <= 4,
                'bg-yellow-500': analysis.intensity > 4 && analysis.intensity <= 7,
                'bg-red-500': analysis.intensity > 7
              })}
              style={{ width: `${(analysis.intensity / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary Emotions */}
      {analysis.primaryEmotions.length > 0 && (
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Detected Emotions:
          </span>
          <div className="flex flex-wrap gap-2">
            {analysis.primaryEmotions.map((emotion, index) => (
              <EmotionBadge key={index} emotion={emotion} />
            ))}
          </div>
        </div>
      )}

      {/* Themes */}
      {analysis.themes.length > 0 && (
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Key Themes:
          </span>
          <div className="flex flex-wrap gap-2">
            {analysis.themes.map((theme, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Positive Indicators */}
      {analysis.positiveIndicators.length > 0 && (
        <div>
          <span className="text-sm font-medium text-green-700 dark:text-green-300 block mb-2">
            Positive Signs:
          </span>
          <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
            {analysis.positiveIndicators.slice(0, 3).map((indicator, index) => (
              <li key={index} className="flex items-center gap-1">
                <span className="text-green-500">✓</span>
                {indicator}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Coping Mechanisms */}
      {analysis.copingMechanisms.length > 0 && (
        <div>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300 block mb-2">
            Coping Strategies:
          </span>
          <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
            {analysis.copingMechanisms.slice(0, 3).map((mechanism, index) => (
              <li key={index} className="flex items-center gap-1">
                <span className="text-blue-500">💪</span>
                {mechanism}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Concerns (if any) */}
      {analysis.concerns.length > 0 && (
        <div>
          <span className="text-sm font-medium text-orange-700 dark:text-orange-300 block mb-2">
            Areas of Concern:
          </span>
          <div className="space-y-2">
            {analysis.concerns.slice(0, 2).map((concern, index) => (
              <ConcernIndicator key={index} concern={concern} />
            ))}
          </div>
        </div>
      )}

      {/* Analysis Confidence */}
      <div className="pt-3 border-t border-purple-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Analysis Confidence:</span>
          <span>{(analysis.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

interface EmotionBadgeProps {
  emotion: Emotion;
}

const EmotionBadge: React.FC<EmotionBadgeProps> = ({ emotion }) => {
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${emotion.color}20`,
        color: emotion.color,
        border: `1px solid ${emotion.color}40`
      }}
    >
      <span>{emotion.name}</span>
      <span className="text-xs opacity-75">
        {emotion.intensity}/10
      </span>
    </div>
  );
};

interface ConcernIndicatorProps {
  concern: ConcernLevel;
}

const ConcernIndicator: React.FC<ConcernIndicatorProps> = ({ concern }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900';
      case 'high': return 'text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900';
      case 'moderate': return 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900';
      default: return 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900';
    }
  };

  return (
    <div className={cn('p-2 rounded text-xs', getSeverityColor(concern.severity))}>
      <div className="flex items-center gap-1 mb-1">
        <span className="font-medium capitalize">{concern.type.replace('_', ' ')}</span>
        <span className="text-xs opacity-75">({concern.severity})</span>
      </div>
      {concern.indicators.length > 0 && (
        <div className="text-xs opacity-90">
          {concern.indicators.slice(0, 2).join(', ')}
        </div>
      )}
    </div>
  );
};

export default EmotionalInsights;