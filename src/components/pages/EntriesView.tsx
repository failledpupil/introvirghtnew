import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useDiaryStore } from '../../stores/diaryStore';
import { EmotionalInsights } from '../ai/EmotionalInsights';
import { format, isToday, isYesterday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import type { DiaryEntry } from '../../types';

type ViewMode = 'all' | 'recent' | 'favorites' | 'drafts';
type SortMode = 'newest' | 'oldest' | 'longest' | 'shortest';

export function EntriesView() {
  const { entries } = useDiaryStore();
  const [viewMode] = useState<ViewMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);

  // Filter and sort entries
  useEffect(() => {
    let filtered = [...entries];

    // Apply view mode filter
    switch (viewMode) {
      case 'recent':
        const weekStart = startOfWeek(new Date());
        const weekEnd = endOfWeek(new Date());
        filtered = filtered.filter(entry =>
          isWithinInterval(entry.date, { start: weekStart, end: weekEnd })
        );
        break;
      case 'favorites':
        // For now, consider entries with high word count as favorites
        filtered = filtered.filter(entry => entry.wordCount > 300);
        break;
      case 'drafts':
        // Consider short entries as drafts
        filtered = filtered.filter(entry => entry.wordCount < 50);
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.content.toLowerCase().includes(query) ||
        entry.emotions.some(emotion => emotion.name.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    switch (sortMode) {
      case 'newest':
        filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
        break;
      case 'longest':
        filtered.sort((a, b) => b.wordCount - a.wordCount);
        break;
      case 'shortest':
        filtered.sort((a, b) => a.wordCount - b.wordCount);
        break;
    }

    setFilteredEntries(filtered);
  }, [entries, viewMode, sortMode, searchQuery]);

  const getDateLabel = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const getEntryPreview = (content: string): string => {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  };

  const getWordCountLabel = (count: number): string => {
    if (count === 0) return 'Empty';
    if (count < 50) return 'Brief';
    if (count < 200) return 'Short';
    if (count < 500) return 'Medium';
    return 'Long';
  };

  // Simplified - removed complex filtering options

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-script text-fountain-pen-blue mb-2">My Thoughts</h1>
          <p className="text-pencil-graphite/70">
            {entries.length} entries written
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search your entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 border border-notebook-lines rounded-lg bg-aged-paper focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue focus:border-transparent"
          />
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pencil-graphite/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Simple Sort */}
        <div className="flex items-center justify-end">
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="px-3 py-2 border border-notebook-lines rounded-lg bg-aged-paper text-pencil-graphite focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Enhanced Entries Grid */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-12 animate-text-appear">
          <div className="text-6xl mb-4 animate-bounce-in">📖</div>
          <h3 className="text-xl font-script text-fountain-pen-blue mb-2 animate-handwriting">
            {searchQuery ? 'No matching entries found' : 'No entries yet'}
          </h3>
          <p className="text-pencil-graphite/70 mb-6 animate-fade-in">
            {searchQuery
              ? 'Try adjusting your search terms or filters'
              : 'Start your writing journey by creating your first entry'
            }
          </p>
          {!searchQuery && (
            <Link
              to="/write"
              className="inline-flex items-center gap-2 bg-fountain-pen-blue text-white px-6 py-3 rounded-lg hover:bg-fountain-pen-blue/90 transition-all duration-200 hover:scale-105 hover:shadow-lg font-medium animate-bounce-in"
            >
              <span className="transition-transform duration-200 hover:scale-110">✍️</span>
              <span>Write Your First Entry</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry, index) => (
            <div
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className={cn(
                "bg-aged-paper border border-notebook-lines rounded-lg p-6 hover:shadow-lg hover:border-fountain-pen-blue/50 transition-all duration-300 cursor-pointer group relative overflow-hidden animate-entry-appear",
                "hover:scale-105 hover:-translate-y-1"
              )}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Ripple effect on hover */}
              <div className="absolute inset-0 bg-fountain-pen-blue/5 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg" />
              {/* Enhanced Entry Header */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="text-sm text-pencil-graphite/70 animate-text-appear">
                  {getDateLabel(entry.date)}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full transition-all duration-200',
                    entry.wordCount === 0 ? 'bg-gray-100 text-gray-600' :
                      entry.wordCount < 50 ? 'bg-yellow-100 text-yellow-700' :
                        entry.wordCount < 200 ? 'bg-blue-100 text-blue-700' :
                          entry.wordCount < 500 ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                  )}>
                    {getWordCountLabel(entry.wordCount)}
                  </span>
                  <span className="text-xs text-pencil-graphite/50">
                    <span className="animate-counter">{entry.wordCount}</span> words
                  </span>
                </div>
              </div>

              {/* Enhanced Entry Preview */}
              <div className="mb-4 relative z-10">
                {entry.content ? (
                  <p className="text-pencil-graphite leading-relaxed animate-text-appear">
                    {getEntryPreview(entry.content)}
                  </p>
                ) : (
                  <p className="text-pencil-graphite/50 italic animate-fade-in">
                    Empty entry - click to start writing
                  </p>
                )}
              </div>

              {/* Enhanced Emotions */}
              {entry.emotions.length > 0 && (
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <span className="text-xs text-pencil-graphite/70">Mood:</span>
                  <div className="flex gap-1">
                    {entry.emotions.slice(0, 3).map((emotion, emotionIndex) => (
                      <span
                        key={emotion.id}
                        className="text-xs bg-fountain-pen-blue/10 text-fountain-pen-blue px-2 py-1 rounded capitalize transition-all duration-200 hover:scale-110 animate-text-appear"
                        style={{
                          animationDelay: `${emotionIndex * 100}ms`
                        }}
                      >
                        {emotion.name}
                      </span>
                    ))}
                    {entry.emotions.length > 3 && (
                      <span className="text-xs text-pencil-graphite/50 animate-fade-in">
                        +{entry.emotions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Compact Emotional Insights */}
              {entry.content && entry.wordCount > 50 && (
                <div className="mb-4 relative z-10">
                  <EmotionalInsights entryId={entry.id} compact={true} />
                </div>
              )}

              {/* Enhanced Entry Footer */}
              <div className="flex items-center justify-between text-xs text-pencil-graphite/50 relative z-10">
                <span className="animate-text-appear">
                  {format(entry.date, 'h:mm a')}
                </span>
                <span className="group-hover:text-fountain-pen-blue transition-all duration-200 group-hover:translate-x-1">
                  Click to read →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-modal-enter">
          <div className="bg-aged-paper rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-modal-enter">
            <div className="p-8">
              {/* Enhanced Modal Header */}
              <div className="flex items-center justify-between mb-6 animate-text-appear">
                <div>
                  <h2 className="text-2xl font-script text-fountain-pen-blue mb-1 animate-handwriting">
                    {getDateLabel(selectedEntry.date)}
                  </h2>
                  <p className="text-sm text-pencil-graphite/70 animate-fade-in">
                    {format(selectedEntry.date, 'EEEE, MMMM d, yyyy • h:mm a')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 text-pencil-graphite/70 hover:text-red-pen transition-all duration-200 hover:scale-110 hover:bg-red-pen/10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Enhanced Entry Stats */}
              <div className="flex items-center gap-6 mb-6 p-4 bg-fountain-pen-blue/5 rounded-lg animate-text-appear">
                <div className="text-center">
                  <div className="text-lg font-bold text-fountain-pen-blue animate-counter">{selectedEntry.wordCount}</div>
                  <div className="text-xs text-pencil-graphite/70">Words</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-fountain-pen-blue animate-counter">{selectedEntry.writingTime}</div>
                  <div className="text-xs text-pencil-graphite/70">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-fountain-pen-blue animate-counter">{selectedEntry.emotions.length}</div>
                  <div className="text-xs text-pencil-graphite/70">Emotions</div>
                </div>
              </div>

              {/* Emotions */}
              {selectedEntry.emotions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-pencil-graphite mb-2">Emotions</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.emotions.map((emotion) => (
                      <span
                        key={emotion.id}
                        className="px-3 py-1 bg-fountain-pen-blue/10 text-fountain-pen-blue rounded-full text-sm capitalize"
                      >
                        {emotion.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Emotional Insights */}
              {selectedEntry.content && selectedEntry.wordCount > 50 && (
                <div className="mb-6">
                  <EmotionalInsights entryId={selectedEntry.id} />
                </div>
              )}

              {/* Entry Content */}
              <div className="prose prose-lg max-w-none">
                {selectedEntry.content ? (
                  <div className="text-pencil-graphite leading-relaxed whitespace-pre-wrap font-serif">
                    {selectedEntry.content}
                  </div>
                ) : (
                  <div className="text-center py-12 text-pencil-graphite/50">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="italic">This entry is empty</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-notebook-lines">
                <div className="text-sm text-pencil-graphite/70">
                  Created {format(selectedEntry.createdAt, 'MMM d, yyyy')}
                  {selectedEntry.updatedAt && selectedEntry.updatedAt.getTime() !== selectedEntry.createdAt.getTime() && (
                    <span> • Updated {format(selectedEntry.updatedAt, 'MMM d, yyyy')}</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="px-4 py-2 border border-notebook-lines rounded-lg text-pencil-graphite hover:bg-fountain-pen-blue/5 transition-colors"
                  >
                    Close
                  </button>
                  <Link
                    to="/write"
                    className="px-4 py-2 bg-fountain-pen-blue text-white rounded-lg hover:bg-fountain-pen-blue/90 transition-colors"
                    onClick={() => setSelectedEntry(null)}
                  >
                    Edit Entry
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}