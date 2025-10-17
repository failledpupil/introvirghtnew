import { useMemo, useState } from 'react';
import { format, endOfWeek, eachDayOfInterval, isSameDay, subDays, startOfMonth, endOfMonth, eachWeekOfInterval } from 'date-fns';
import { cn } from '../utils/cn';
import type { DiaryEntry } from '../types';

interface MoodVisualizationProps {
    entries: DiaryEntry[];
    className?: string;
}

type ViewMode = 'timeline' | 'calendar' | 'insights';

interface EmotionTrend {
    emotion: string;
    color: string;
    category: 'positive' | 'negative' | 'neutral';
    frequency: number;
    averageIntensity: number;
    trend: 'increasing' | 'decreasing' | 'stable';
}

export function MoodVisualization({ entries, className }: MoodVisualizationProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('timeline');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Calculate emotion trends and patterns
    const emotionAnalysis = useMemo(() => {
        if (entries.length === 0) return { trends: [], insights: [] };

        const emotionMap = new Map<string, { intensities: number[], dates: Date[], color: string, category: string }>();

        // Collect all emotions from entries
        entries.forEach(entry => {
            entry.emotions.forEach(emotion => {
                if (!emotionMap.has(emotion.name)) {
                    emotionMap.set(emotion.name, {
                        intensities: [],
                        dates: [],
                        color: emotion.color,
                        category: emotion.category
                    });
                }
                const data = emotionMap.get(emotion.name)!;
                data.intensities.push(emotion.intensity);
                data.dates.push(entry.date);
            });
        });

        // Calculate trends
        const trends: EmotionTrend[] = Array.from(emotionMap.entries()).map(([name, data]) => {
            const frequency = data.intensities.length;
            const averageIntensity = data.intensities.reduce((sum, intensity) => sum + intensity, 0) / frequency;

            // Simple trend calculation based on recent vs older entries
            const recentEntries = data.intensities.slice(-Math.ceil(frequency / 2));
            const olderEntries = data.intensities.slice(0, Math.floor(frequency / 2));

            const recentAvg = recentEntries.reduce((sum, intensity) => sum + intensity, 0) / recentEntries.length;
            const olderAvg = olderEntries.length > 0
                ? olderEntries.reduce((sum, intensity) => sum + intensity, 0) / olderEntries.length
                : recentAvg;

            let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
            const difference = recentAvg - olderAvg;
            if (Math.abs(difference) > 0.5) {
                trend = difference > 0 ? 'increasing' : 'decreasing';
            }

            return {
                emotion: name,
                color: data.color,
                category: data.category as 'positive' | 'negative' | 'neutral',
                frequency,
                averageIntensity,
                trend
            };
        }).sort((a, b) => b.frequency - a.frequency);

        // Generate insights
        const insights = generateInsights(trends, entries);

        return { trends, insights };
    }, [entries]);

    // Timeline view data
    const timelineData = useMemo(() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i)).reverse();

        return last30Days.map(date => {
            const dayEntries = entries.filter(entry => isSameDay(entry.date, date));
            const emotions = dayEntries.flatMap(entry => entry.emotions);

            const moodScore = emotions.length > 0
                ? emotions.reduce((sum, emotion) => {
                    const multiplier = emotion.category === 'positive' ? 1 : emotion.category === 'negative' ? -1 : 0;
                    return sum + (emotion.intensity * multiplier);
                }, 0) / emotions.length
                : 0;

            return {
                date,
                emotions,
                moodScore,
                hasEntry: dayEntries.length > 0
            };
        });
    }, [entries]);

    // Calendar view data
    const calendarData = useMemo(() => {
        const today = new Date();
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });

        return weeks.map(weekStart => {
            const weekEnd = endOfWeek(weekStart);
            const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

            return days.map(date => {
                const dayEntries = entries.filter(entry => isSameDay(entry.date, date));
                const emotions = dayEntries.flatMap(entry => entry.emotions);

                const dominantEmotion = emotions.length > 0
                    ? emotions.reduce((prev, current) =>
                        current.intensity > prev.intensity ? current : prev
                    )
                    : null;

                return {
                    date,
                    emotions,
                    dominantEmotion,
                    hasEntry: dayEntries.length > 0
                };
            });
        });
    }, [entries]);

    return (
        <div className={cn('mood-visualization', className)}>
            {/* Header */}
            <div className="mb-6">
                <h2 className="font-script text-xl text-fountain-pen-blue mb-2">Mood Insights</h2>
                <p className="text-sm text-pencil-graphite/70">Discover patterns in your emotional journey</p>
            </div>

            {/* View Mode Selector */}
            <div className="mb-6">
                <div className="flex rounded-lg bg-notebook-lines/20 p-1">
                    {([
                        { key: 'timeline', label: 'Timeline', icon: '📈' },
                        { key: 'calendar', label: 'Calendar', icon: '📅' },
                        { key: 'insights', label: 'Insights', icon: '💡' }
                    ] as const).map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setViewMode(key)}
                            className={cn(
                                'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                                'flex items-center justify-center gap-2',
                                viewMode === key
                                    ? 'bg-cream-paper text-fountain-pen-blue shadow-sm'
                                    : 'text-pencil-graphite/70 hover:text-pencil-graphite'
                            )}
                        >
                            <span>{icon}</span>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline View */}
            {viewMode === 'timeline' && (
                <div className="space-y-4">
                    <h3 className="font-medium text-pencil-graphite">30-Day Mood Timeline</h3>

                    <div className="bg-aged-paper rounded-lg p-4 border border-notebook-lines">
                        <div className="flex items-end justify-between h-32 gap-1">
                            {timelineData.map((day, index) => {
                                const height = Math.abs(day.moodScore) * 4 + 8; // Min height of 8px
                                const isPositive = day.moodScore >= 0;

                                return (
                                    <div
                                        key={index}
                                        className="flex-1 flex flex-col items-center justify-end"
                                    >
                                        <div
                                            className={cn(
                                                'w-full rounded-t transition-all duration-200 cursor-pointer',
                                                day.hasEntry
                                                    ? isPositive
                                                        ? 'bg-green-400 hover:bg-green-500'
                                                        : 'bg-red-400 hover:bg-red-500'
                                                    : 'bg-gray-200 hover:bg-gray-300',
                                                'hover:scale-110'
                                            )}
                                            style={{ height: `${height}px` }}
                                            title={`${format(day.date, 'MMM d')}: ${day.emotions.length} emotions`}
                                        />
                                        {index % 5 === 0 && (
                                            <span className="text-xs text-pencil-graphite/50 mt-1">
                                                {format(day.date, 'M/d')}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-center items-center gap-4 mt-4 text-xs text-pencil-graphite/70">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-400 rounded"></div>
                                <span>Positive mood</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-red-400 rounded"></div>
                                <span>Negative mood</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                                <span>No entry</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar View */}
            {viewMode === 'calendar' && (
                <div className="space-y-4">
                    <h3 className="font-medium text-pencil-graphite">Mood Calendar</h3>

                    <div className="bg-aged-paper rounded-lg p-4 border border-notebook-lines">
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-xs font-medium text-pencil-graphite/70 p-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {calendarData.map((week, weekIndex) => (
                            <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-1">
                                {week.map((day, dayIndex) => (
                                    <button
                                        key={dayIndex}
                                        onClick={() => setSelectedDate(day.date)}
                                        className={cn(
                                            'aspect-square p-1 rounded text-xs transition-all duration-200',
                                            'flex flex-col items-center justify-center gap-1',
                                            day.hasEntry
                                                ? 'bg-cream-paper border border-fountain-pen-blue/30 hover:border-fountain-pen-blue'
                                                : 'hover:bg-notebook-lines/20',
                                            selectedDate && isSameDay(selectedDate, day.date) && 'ring-2 ring-fountain-pen-blue'
                                        )}
                                    >
                                        <span className="text-pencil-graphite">{format(day.date, 'd')}</span>
                                        {day.dominantEmotion && (
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: day.dominantEmotion.color }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Selected Date Details */}
                    {selectedDate && (
                        <div className="bg-cream-paper rounded-lg p-4 border border-notebook-lines">
                            <h4 className="font-medium text-pencil-graphite mb-2">
                                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                            </h4>

                            {(() => {
                                const dayEntries = entries.filter(entry => isSameDay(entry.date, selectedDate));
                                const emotions = dayEntries.flatMap(entry => entry.emotions);

                                if (emotions.length === 0) {
                                    return <p className="text-sm text-pencil-graphite/70">No emotions recorded for this day</p>;
                                }

                                return (
                                    <div className="space-y-2">
                                        <p className="text-sm text-pencil-graphite/70">{emotions.length} emotions recorded</p>
                                        <div className="flex flex-wrap gap-2">
                                            {emotions.map((emotion, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-aged-paper"
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
                                );
                            })()}
                        </div>
                    )}
                </div>
            )}

            {/* Insights View */}
            {viewMode === 'insights' && (
                <div className="space-y-6">
                    {/* Top Emotions */}
                    <div>
                        <h3 className="font-medium text-pencil-graphite mb-3">Most Frequent Emotions</h3>
                        <div className="space-y-2">
                            {emotionAnalysis.trends.slice(0, 5).map((trend) => (
                                <div key={trend.emotion} className="flex items-center gap-3 p-3 bg-aged-paper rounded-lg border border-notebook-lines">
                                    <div className="flex items-center gap-2 flex-1">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: trend.color }}
                                        />
                                        <span className="font-medium text-pencil-graphite">{trend.emotion}</span>
                                        <span className="text-xs text-pencil-graphite/70">
                                            ({trend.frequency} times, avg {trend.averageIntensity.toFixed(1)}/10)
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {trend.trend === 'increasing' && (
                                            <span className="text-green-600 text-xs">↗️ Rising</span>
                                        )}
                                        {trend.trend === 'decreasing' && (
                                            <span className="text-red-600 text-xs">↘️ Declining</span>
                                        )}
                                        {trend.trend === 'stable' && (
                                            <span className="text-gray-600 text-xs">→ Stable</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gentle Insights */}
                    <div>
                        <h3 className="font-medium text-pencil-graphite mb-3">Gentle Insights</h3>
                        <div className="space-y-3">
                            {emotionAnalysis.insights.map((insight, index) => (
                                <div key={index} className="p-4 bg-cream-paper rounded-lg border border-notebook-lines">
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg">{insight.icon}</span>
                                        <div>
                                            <p className="text-sm text-pencil-graphite mb-1">{insight.message}</p>
                                            {insight.suggestion && (
                                                <p className="text-xs text-pencil-graphite/70 italic">{insight.suggestion}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper function to generate insights
function generateInsights(trends: EmotionTrend[], entries: DiaryEntry[]) {
    const insights: Array<{ icon: string; message: string; suggestion?: string }> = [];

    if (entries.length === 0) {
        return [{
            icon: '🌱',
            message: 'Start your emotional journey by writing your first entry.',
            suggestion: 'Even a few words about your day can help you understand your feelings better.'
        }];
    }

    // Positive trend insight
    const positiveTrends = trends.filter(t => t.category === 'positive' && t.trend === 'increasing');
    if (positiveTrends.length > 0) {
        insights.push({
            icon: '🌟',
            message: `Your ${positiveTrends[0].emotion.toLowerCase()} feelings have been growing stronger lately.`,
            suggestion: 'This positive trend suggests you\'re finding more moments of joy in your daily life.'
        });
    }

    // Emotional diversity insight
    const uniqueEmotions = trends.length;
    if (uniqueEmotions >= 10) {
        insights.push({
            icon: '🎨',
            message: `You've expressed ${uniqueEmotions} different emotions in your entries.`,
            suggestion: 'Your emotional vocabulary shows great self-awareness and depth of feeling.'
        });
    }

    // Consistency insight
    const recentEntries = entries.filter(entry => {
        const daysDiff = (new Date().getTime() - entry.date.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
    });

    if (recentEntries.length >= 5) {
        insights.push({
            icon: '📝',
            message: 'You\'ve been consistently journaling this week.',
            suggestion: 'Regular reflection is a powerful tool for emotional growth and self-understanding.'
        });
    }

    // Balance insight
    const positiveCount = trends.filter(t => t.category === 'positive').reduce((sum, t) => sum + t.frequency, 0);
    const negativeCount = trends.filter(t => t.category === 'negative').reduce((sum, t) => sum + t.frequency, 0);

    if (positiveCount > negativeCount * 1.5) {
        insights.push({
            icon: '☀️',
            message: 'Your entries show more positive emotions than negative ones.',
            suggestion: 'This suggests you\'re finding good balance and reasons for optimism in your life.'
        });
    }

    // Default encouraging message if no specific insights
    if (insights.length === 0) {
        insights.push({
            icon: '💙',
            message: 'Every emotion you record is a step toward better self-understanding.',
            suggestion: 'Keep exploring your feelings through writing - you\'re building valuable emotional awareness.'
        });
    }

    return insights.slice(0, 3); // Limit to 3 insights to avoid overwhelming
}