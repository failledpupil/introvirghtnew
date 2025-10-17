import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '../utils/cn';
import { useDiaryStore, getTodaysEntry, getOrCreateTodaysEntry } from '../stores/diaryStore';
import type { DiaryEntry } from '../types';

interface TodaysEntryProps {
  onEntryClick?: (entry: DiaryEntry) => void;
  className?: string;
  compact?: boolean;
}

export function TodaysEntry({ onEntryClick, className, compact = false }: TodaysEntryProps) {
  const { entries } = useDiaryStore();
  const [todaysEntry, setTodaysEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const loadTodaysEntry = async () => {
      setIsLoading(true);
      try {
        const entry = getTodaysEntry();
        setTodaysEntry(entry);
      } catch (error) {
        console.error('Failed to load today\'s entry:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodaysEntry();
  }, [entries]);

  const handleCreateTodaysEntry = async () => {
    setIsCreating(true);
    try {
      const newEntry = await getOrCreateTodaysEntry();
      setTodaysEntry(newEntry);
      onEntryClick?.(newEntry);
    } catch (error) {
      console.error('Failed to create today\'s entry:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEntryClick = () => {
    if (todaysEntry) {
      onEntryClick?.(todaysEntry);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('todays-entry', className)}>
        <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-notebook-lines rounded mb-4"></div>
            <div className="h-4 bg-notebook-lines rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-notebook-lines rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn('todays-entry-compact', className)}>
        {todaysEntry ? (
          <button
            onClick={handleEntryClick}
            className="w-full text-left bg-aged-paper border border-notebook-lines rounded-lg p-4 hover:border-fountain-pen-blue/50 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-script text-lg text-fountain-pen-blue">Today's Entry</h3>
              <div className="flex items-center gap-2 text-xs text-pencil-graphite/70">
                <span>{todaysEntry.wordCount} words</span>
                {todaysEntry.emotions.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{todaysEntry.emotions.length} emotions</span>
                  </>
                )}
              </div>
            </div>
            
            {todaysEntry.content ? (
              <p className="text-sm text-pencil-graphite/80 leading-relaxed line-clamp-2">
                {todaysEntry.content.length > 100 
                  ? todaysEntry.content.substring(0, 100) + '...'
                  : todaysEntry.content
                }
              </p>
            ) : (
              <p className="text-sm text-pencil-graphite/50 italic">
                Click to start writing...
              </p>
            )}
          </button>
        ) : (
          <button
            onClick={handleCreateTodaysEntry}
            disabled={isCreating}
            className="w-full text-left bg-aged-paper border-2 border-dashed border-notebook-lines rounded-lg p-4 hover:border-fountain-pen-blue/50 hover:bg-fountain-pen-blue/5 transition-all duration-200 disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-script text-lg text-fountain-pen-blue">Today's Entry</h3>
              <div className="text-xs text-pencil-graphite/70">
                {format(new Date(), 'MMM d')}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-pencil-graphite/70">
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-fountain-pen-blue border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating entry...</span>
                </>
              ) : (
                <>
                  <span>✍️</span>
                  <span>Start writing today's thoughts...</span>
                </>
              )}
            </div>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('todays-entry', className)}>
      <div className="bg-aged-paper border border-notebook-lines rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-fountain-pen-blue/5 to-purple-600/5 px-6 py-4 border-b border-notebook-lines">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-script text-fountain-pen-blue mb-1">
                Today's Entry
              </h2>
              <p className="text-sm text-pencil-graphite/70">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl mb-1">
                {todaysEntry ? '📝' : '📖'}
              </div>
              <div className="text-xs text-pencil-graphite/70">
                {todaysEntry ? 'In Progress' : 'Not Started'}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {todaysEntry ? (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-fountain-pen-blue">
                    {todaysEntry.wordCount}
                  </div>
                  <div className="text-xs text-pencil-graphite/70">Words</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-fountain-pen-blue">
                    {todaysEntry.writingTime}
                  </div>
                  <div className="text-xs text-pencil-graphite/70">Minutes</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-fountain-pen-blue">
                    {todaysEntry.emotions.length}
                  </div>
                  <div className="text-xs text-pencil-graphite/70">Emotions</div>
                </div>
              </div>

              {/* Emotions Preview */}
              {todaysEntry.emotions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-pencil-graphite mb-2">Today's Emotions</h4>
                  <div className="flex flex-wrap gap-2">
                    {todaysEntry.emotions.slice(0, 4).map((emotion) => (
                      <span
                        key={emotion.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-fountain-pen-blue/10 text-fountain-pen-blue rounded text-xs"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: emotion.color }}
                        />
                        {emotion.name}
                      </span>
                    ))}
                    {todaysEntry.emotions.length > 4 && (
                      <span className="text-xs text-pencil-graphite/70">
                        +{todaysEntry.emotions.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Content Preview */}
              {todaysEntry.content ? (
                <div>
                  <h4 className="text-sm font-medium text-pencil-graphite mb-2">Preview</h4>
                  <div className="bg-cream-paper rounded-lg p-4 border border-notebook-lines">
                    <p className="text-sm text-pencil-graphite leading-relaxed">
                      {todaysEntry.content.length > 200 
                        ? todaysEntry.content.substring(0, 200) + '...'
                        : todaysEntry.content
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-pencil-graphite/70 mb-3">
                    You've started today's entry but haven't written anything yet.
                  </p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleEntryClick}
                className="w-full bg-fountain-pen-blue text-white py-3 px-4 rounded-lg hover:bg-fountain-pen-blue/90 transition-colors font-medium"
              >
                {todaysEntry.content ? 'Continue Writing' : 'Start Writing'}
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-script text-fountain-pen-blue mb-2">
                Ready to Start Today?
              </h3>
              <p className="text-pencil-graphite/70 mb-6">
                Begin your daily reflection and capture your thoughts.
              </p>
              
              <button
                onClick={handleCreateTodaysEntry}
                disabled={isCreating}
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200',
                  'bg-fountain-pen-blue text-white hover:bg-fountain-pen-blue/90',
                  'hover:scale-105 hover:shadow-lg',
                  isCreating && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Entry...</span>
                  </>
                ) : (
                  <>
                    <span>✍️</span>
                    <span>Start Today's Entry</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}