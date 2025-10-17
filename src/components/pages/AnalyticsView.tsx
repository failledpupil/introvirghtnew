import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useDiaryStore } from '../../stores/diaryStore';
import { format, endOfWeek, eachDayOfInterval, isSameDay, subDays, startOfMonth, endOfMonth, eachWeekOfInterval } from 'date-fns';
import { MoodVisualization } from '../MoodVisualization';

interface WritingStats {
  totalEntries: number;
  totalWords: number;
  averageWordsPerEntry: number;
  longestEntry: number;
  currentStreak: number;
  longestStreak: number;
  writingDays: number;
  averageWordsPerDay: number;
}

interface TimePattern {
  hour: number;
  count: number;
  percentage: number;
}

interface EmotionAnalysis {
  emotion: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface WeeklyData {
  week: string;
  entries: number;
  words: number;
}

export function AnalyticsView() {
  const { entries } = useDiaryStore();
  // const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month'); // TODO: Add time range filter
  const [stats, setStats] = useState<WritingStats | null>(null);
  const [timePatterns, setTimePatterns] = useState<TimePattern[]>([]);
  const [emotionAnalysis, setEmotionAnalysis] = useState<EmotionAnalysis[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [dailyWordCounts, setDailyWordCounts] = useState<{ date: string; words: number }[]>([]);

  // Calculate comprehensive statistics
  useEffect(() => {
    if (entries.length === 0) return;

    const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
    const totalEntries = entries.length;
    const longestEntry = Math.max(...entries.map(e => e.wordCount));
    
    // Calculate streaks
    const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Current streak calculation
    let checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const hasEntry = sortedEntries.some(entry => 
        isSameDay(entry.date, checkDate)
      );
      
      if (hasEntry) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    // Longest streak calculation
    const uniqueDates = [...new Set(entries.map(e => format(e.date, 'yyyy-MM-dd')))].sort();
    for (let i = 0; i < uniqueDates.length; i++) {
      tempStreak++;
      const currentDate = new Date(uniqueDates[i]);
      const nextDate = i < uniqueDates.length - 1 ? new Date(uniqueDates[i + 1]) : null;
      
      if (!nextDate || (nextDate.getTime() - currentDate.getTime()) > 24 * 60 * 60 * 1000) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    const writingDays = new Set(entries.map(e => format(e.date, 'yyyy-MM-dd'))).size;

    setStats({
      totalEntries,
      totalWords,
      averageWordsPerEntry: Math.round(totalWords / totalEntries),
      longestEntry,
      currentStreak,
      longestStreak,
      writingDays,
      averageWordsPerDay: Math.round(totalWords / writingDays)
    });
  }, [entries]);

  // Analyze writing time patterns
  useEffect(() => {
    if (entries.length === 0) return;

    const hourCounts = entries.reduce((acc, entry) => {
      const hour = entry.date.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const patterns = Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        percentage: (count / entries.length) * 100
      }))
      .sort((a, b) => b.count - a.count);

    setTimePatterns(patterns);
  }, [entries]);

  // Analyze emotions
  useEffect(() => {
    if (entries.length === 0) return;

    const emotionCounts = entries.reduce((acc, entry) => {
      entry.emotions.forEach(emotion => {
        acc[emotion.name] = (acc[emotion.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const totalEmotions = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);
    
    const analysis = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: (count / totalEmotions) * 100,
        trend: 'stable' as const // Simplified - could analyze trends over time
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setEmotionAnalysis(analysis);
  }, [entries]);

  // Generate weekly data for charts
  useEffect(() => {
    if (entries.length === 0) return;

    const weeks = eachWeekOfInterval({
      start: startOfMonth(subDays(new Date(), 90)), // Last 3 months
      end: endOfMonth(new Date())
    });

    const weeklyStats = weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart);
      const weekEntries = entries.filter(entry =>
        entry.date >= weekStart && entry.date <= weekEnd
      );

      return {
        week: format(weekStart, 'MMM d'),
        entries: weekEntries.length,
        words: weekEntries.reduce((sum, entry) => sum + entry.wordCount, 0)
      };
    });

    setWeeklyData(weeklyStats);
  }, [entries]);

  // Generate daily word counts for heatmap
  useEffect(() => {
    if (entries.length === 0) return;

    const last90Days = eachDayOfInterval({
      start: subDays(new Date(), 90),
      end: new Date()
    });

    const dailyData = last90Days.map(date => {
      const dayEntries = entries.filter(entry => isSameDay(entry.date, date));
      const words = dayEntries.reduce((sum, entry) => sum + entry.wordCount, 0);
      
      return {
        date: format(date, 'yyyy-MM-dd'),
        words
      };
    });

    setDailyWordCounts(dailyData);
  }, [entries]);

  const getTimeLabel = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const getHeatmapColor = (words: number): string => {
    if (words === 0) return 'bg-gray-100';
    if (words < 50) return 'bg-blue-100';
    if (words < 150) return 'bg-blue-200';
    if (words < 300) return 'bg-blue-300';
    if (words < 500) return 'bg-blue-400';
    return 'bg-blue-500';
  };

  if (entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-6xl mb-6">📊</div>
        <h2 className="text-2xl font-script text-fountain-pen-blue mb-4">No Data Yet</h2>
        <p className="text-pencil-graphite/70 mb-8">
          Start writing to see insights about your writing patterns and progress.
        </p>
        <a
          href="/write"
          className="inline-flex items-center gap-2 bg-fountain-pen-blue text-white px-6 py-3 rounded-lg hover:bg-fountain-pen-blue/90 transition-colors font-medium"
        >
          <span>✍️</span>
          <span>Start Writing</span>
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-script text-fountain-pen-blue mb-2">Writing Insights</h1>
        <p className="text-pencil-graphite/70">
          Discover patterns in your writing journey and track your progress over time.
        </p>
      </div>

      {/* Key Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-fountain-pen-blue mb-2">
              {stats.totalEntries}
            </div>
            <div className="text-sm text-pencil-graphite/70">Total Entries</div>
          </div>
          
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-fountain-pen-blue mb-2">
              {stats.totalWords.toLocaleString()}
            </div>
            <div className="text-sm text-pencil-graphite/70">Words Written</div>
          </div>
          
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-fountain-pen-blue mb-2">
              {stats.currentStreak}
            </div>
            <div className="text-sm text-pencil-graphite/70">Current Streak</div>
          </div>
          
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-fountain-pen-blue mb-2">
              {stats.averageWordsPerEntry}
            </div>
            <div className="text-sm text-pencil-graphite/70">Avg Words/Entry</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Writing Time Patterns */}
        <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
          <h3 className="text-xl font-script text-fountain-pen-blue mb-6">Writing Time Patterns</h3>
          <div className="space-y-3">
            {timePatterns.slice(0, 8).map((pattern) => (
              <div key={pattern.hour} className="flex items-center gap-4">
                <div className="w-16 text-sm text-pencil-graphite/70">
                  {getTimeLabel(pattern.hour)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-notebook-lines rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-fountain-pen-blue to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${pattern.percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-pencil-graphite/70 w-12">
                      {pattern.count}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emotion Analysis */}
        <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
          <h3 className="text-xl font-script text-fountain-pen-blue mb-6">Emotional Themes</h3>
          <div className="space-y-3">
            {emotionAnalysis.slice(0, 8).map((emotion) => (
              <div key={emotion.emotion} className="flex items-center gap-4">
                <div className="w-20 text-sm text-pencil-graphite capitalize">
                  {emotion.emotion}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-notebook-lines rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${emotion.percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-pencil-graphite/70 w-12">
                      {emotion.count}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Writing Activity Heatmap */}
      <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6 mb-8">
        <h3 className="text-xl font-script text-fountain-pen-blue mb-6">Writing Activity (Last 90 Days)</h3>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs text-pencil-graphite/70 text-center p-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {dailyWordCounts.map((day) => (
            <div
              key={day.date}
              className={cn(
                'aspect-square rounded text-xs flex items-center justify-center text-white font-medium',
                getHeatmapColor(day.words)
              )}
              title={`${format(new Date(day.date), 'MMM d, yyyy')}: ${day.words} words`}
            >
              {day.words > 0 && (
                <span className="text-xs">
                  {day.words > 999 ? '1k+' : day.words > 99 ? '99+' : day.words}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-pencil-graphite/70">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <div className="w-3 h-3 bg-blue-200 rounded"></div>
            <div className="w-3 h-3 bg-blue-300 rounded"></div>
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6 mb-8">
        <h3 className="text-xl font-script text-fountain-pen-blue mb-6">Weekly Progress</h3>
        <div className="space-y-4">
          {weeklyData.slice(-12).map((week) => (
            <div key={week.week} className="flex items-center gap-4">
              <div className="w-16 text-sm text-pencil-graphite/70">
                {week.week}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-pencil-graphite/70">Words</span>
                      <span className="text-xs text-fountain-pen-blue font-medium">
                        {week.words.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-notebook-lines rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-fountain-pen-blue to-purple-600 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((week.words / Math.max(...weeklyData.map(w => w.words))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-pencil-graphite/70 w-16 text-right">
                    {week.entries} entries
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mood Visualization */}
      <div className="mb-8">
        <MoodVisualization entries={entries} />
      </div>

      {/* Additional Insights */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
            <h3 className="text-xl font-script text-fountain-pen-blue mb-4">Writing Consistency</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-pencil-graphite/70">Writing Days</span>
                <span className="font-medium text-pencil-graphite">{stats.writingDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pencil-graphite/70">Longest Streak</span>
                <span className="font-medium text-pencil-graphite">{stats.longestStreak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pencil-graphite/70">Avg Words/Day</span>
                <span className="font-medium text-pencil-graphite">{stats.averageWordsPerDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pencil-graphite/70">Longest Entry</span>
                <span className="font-medium text-pencil-graphite">{stats.longestEntry} words</span>
              </div>
            </div>
          </div>

          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
            <h3 className="text-xl font-script text-fountain-pen-blue mb-4">Personal Insights</h3>
            <div className="space-y-3 text-sm text-pencil-graphite">
              {stats.currentStreak > 7 && (
                <div className="flex items-start gap-2">
                  <span className="text-green-600">🔥</span>
                  <span>You're on a {stats.currentStreak}-day writing streak! Keep it up!</span>
                </div>
              )}
              
              {stats.averageWordsPerEntry > 300 && (
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">📝</span>
                  <span>Your entries average {stats.averageWordsPerEntry} words - you're a detailed writer!</span>
                </div>
              )}
              
              {timePatterns.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-purple-600">⏰</span>
                  <span>
                    You write most often at {getTimeLabel(timePatterns[0].hour)} 
                    ({Math.round(timePatterns[0].percentage)}% of entries)
                  </span>
                </div>
              )}
              
              {emotionAnalysis.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-pink-600">💭</span>
                  <span>
                    Your most explored emotion is "{emotionAnalysis[0].emotion}" 
                    ({emotionAnalysis[0].count} times)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsView;