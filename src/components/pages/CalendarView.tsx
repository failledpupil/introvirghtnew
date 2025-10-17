import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useDiaryStore } from '../../stores/diaryStore';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth
} from 'date-fns';
import type { DiaryEntry } from '../../types';

export function CalendarView() {
  const { entries } = useDiaryStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  // Generate calendar days
  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd
    });
    
    setCalendarDays(days);
  }, [currentDate]);

  const getEntryForDate = (date: Date): DiaryEntry | undefined => {
    return entries.find(entry => isSameDay(entry.date, date));
  };

  const getWordCountForDate = (date: Date): number => {
    const entry = getEntryForDate(date);
    return entry?.wordCount || 0;
  };

  // const getEmotionsForDate = (date: Date): string[] => {
  //   const entry = getEntryForDate(date);
  //   return entry?.emotions.map(e => e.name) || [];
  // }; // TODO: Use for emotion-based calendar coloring

  const getDayIntensity = (wordCount: number): string => {
    if (wordCount === 0) return '';
    if (wordCount < 50) return 'bg-blue-100 text-blue-800';
    if (wordCount < 150) return 'bg-blue-200 text-blue-900';
    if (wordCount < 300) return 'bg-blue-300 text-blue-900';
    if (wordCount < 500) return 'bg-blue-400 text-white';
    return 'bg-blue-500 text-white';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
    setSelectedDate(null);
    setSelectedEntry(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const entry = getEntryForDate(date);
    setSelectedEntry(entry || null);
  };

  const monthlyStats = {
    totalEntries: entries.filter(entry => 
      isSameMonth(entry.date, currentDate)
    ).length,
    totalWords: entries
      .filter(entry => isSameMonth(entry.date, currentDate))
      .reduce((sum, entry) => sum + entry.wordCount, 0),
    writingDays: new Set(
      entries
        .filter(entry => isSameMonth(entry.date, currentDate))
        .map(entry => format(entry.date, 'yyyy-MM-dd'))
    ).size
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-script text-fountain-pen-blue mb-2">Writing Calendar</h1>
          <p className="text-pencil-graphite/70">
            Track your writing journey day by day
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-pencil-graphite/70">
            {monthlyStats.totalEntries} entries • {monthlyStats.totalWords.toLocaleString()} words this month
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-pencil-graphite/70 hover:text-fountain-pen-blue transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h2 className="text-2xl font-script text-fountain-pen-blue">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-pencil-graphite/70 hover:text-fountain-pen-blue transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-pencil-graphite/70 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const wordCount = getWordCountForDate(day);
                const hasEntry = wordCount > 0;
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      'aspect-square p-2 rounded-lg border transition-all duration-200 hover:border-fountain-pen-blue/50',
                      isCurrentMonth ? 'text-pencil-graphite' : 'text-pencil-graphite/30',
                      hasEntry ? getDayIntensity(wordCount) : 'border-notebook-lines hover:bg-fountain-pen-blue/5',
                      isSelected && 'ring-2 ring-fountain-pen-blue ring-offset-2',
                      isTodayDate && 'border-fountain-pen-blue border-2'
                    )}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={cn(
                        'text-sm font-medium',
                        isTodayDate && !hasEntry && 'text-fountain-pen-blue'
                      )}>
                        {format(day, 'd')}
                      </span>
                      {hasEntry && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                          {wordCount > 100 && (
                            <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                          )}
                          {wordCount > 300 && (
                            <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-pencil-graphite/70">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-notebook-lines rounded"></div>
                <span>No entry</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded"></div>
                <span>1-49 words</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-300 rounded"></div>
                <span>150-299 words</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>500+ words</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Monthly Stats */}
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
            <h3 className="text-lg font-script text-fountain-pen-blue mb-4">
              {format(currentDate, 'MMMM')} Stats
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-fountain-pen-blue">
                  {monthlyStats.totalEntries}
                </div>
                <div className="text-sm text-pencil-graphite/70">Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-fountain-pen-blue">
                  {monthlyStats.totalWords.toLocaleString()}
                </div>
                <div className="text-sm text-pencil-graphite/70">Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-fountain-pen-blue">
                  {monthlyStats.writingDays}
                </div>
                <div className="text-sm text-pencil-graphite/70">Writing Days</div>
              </div>
            </div>
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
              <h3 className="text-lg font-script text-fountain-pen-blue mb-4">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              
              {selectedEntry ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-fountain-pen-blue">
                        {selectedEntry.wordCount}
                      </div>
                      <div className="text-xs text-pencil-graphite/70">Words</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-fountain-pen-blue">
                        {selectedEntry.writingTime}
                      </div>
                      <div className="text-xs text-pencil-graphite/70">Minutes</div>
                    </div>
                  </div>

                  {selectedEntry.emotions.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-pencil-graphite mb-2">Emotions</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedEntry.emotions.map((emotion) => (
                          <span
                            key={emotion.id}
                            className="px-2 py-1 bg-fountain-pen-blue/10 text-fountain-pen-blue text-xs rounded capitalize"
                          >
                            {emotion.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEntry.content && (
                    <div>
                      <div className="text-sm font-medium text-pencil-graphite mb-2">Preview</div>
                      <p className="text-sm text-pencil-graphite/70 leading-relaxed">
                        {selectedEntry.content.length > 100 
                          ? selectedEntry.content.substring(0, 100) + '...'
                          : selectedEntry.content
                        }
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      // Navigate to write page with this entry
                      window.location.href = '/write';
                    }}
                    className="w-full bg-fountain-pen-blue text-white py-2 px-4 rounded-lg hover:bg-fountain-pen-blue/90 transition-colors text-sm font-medium"
                  >
                    Edit Entry
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-sm text-pencil-graphite/70 mb-4">
                    No entry for this day
                  </p>
                  <button
                    onClick={() => {
                      // Navigate to write page for this date
                      window.location.href = '/write';
                    }}
                    className="w-full bg-fountain-pen-blue text-white py-2 px-4 rounded-lg hover:bg-fountain-pen-blue/90 transition-colors text-sm font-medium"
                  >
                    Write Entry
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
            <h3 className="text-lg font-script text-fountain-pen-blue mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="w-full flex items-center gap-2 p-2 text-left text-pencil-graphite hover:text-fountain-pen-blue hover:bg-fountain-pen-blue/5 rounded-lg transition-colors"
              >
                <span>📅</span>
                <span className="text-sm">Go to Today</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/write'}
                className="w-full flex items-center gap-2 p-2 text-left text-pencil-graphite hover:text-fountain-pen-blue hover:bg-fountain-pen-blue/5 rounded-lg transition-colors"
              >
                <span>✍️</span>
                <span className="text-sm">Write New Entry</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/analytics'}
                className="w-full flex items-center gap-2 p-2 text-left text-pencil-graphite hover:text-fountain-pen-blue hover:bg-fountain-pen-blue/5 rounded-lg transition-colors"
              >
                <span>📊</span>
                <span className="text-sm">View Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}