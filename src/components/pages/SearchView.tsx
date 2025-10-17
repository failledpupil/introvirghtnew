import { useState, useEffect } from 'react';
// import { cn } from '../../utils/cn'; // TODO: Use for conditional styling
import { useDiaryStore } from '../../stores/diaryStore';
import { format } from 'date-fns';
import type { DiaryEntry } from '../../types';

interface SearchFilters {
  dateRange: 'all' | 'week' | 'month' | 'year';
  wordCount: 'all' | 'short' | 'medium' | 'long';
  emotions: string[];
  sortBy: 'relevance' | 'date' | 'wordCount';
}

interface SearchResult extends DiaryEntry {
  relevanceScore: number;
  matchedText: string;
}

export function SearchView() {
  const { entries } = useDiaryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: 'all',
    wordCount: 'all',
    emotions: [],
    sortBy: 'relevance'
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Get all unique emotions for filter
  const allEmotions = Array.from(
    new Set(entries.flatMap(entry => entry.emotions.map(e => e.name)))
  ).sort();

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Save search to history
  const saveSearchToHistory = (query: string) => {
    if (query.trim() && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory.slice(0, 9)]; // Keep last 10 searches
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  };

  // Perform search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay for better UX
    const searchTimeout = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const results: SearchResult[] = [];

      entries.forEach(entry => {
        let relevanceScore = 0;
        let matchedText = '';

        // Search in content
        const contentMatches = entry.content.toLowerCase().includes(query);
        if (contentMatches) {
          relevanceScore += 10;
          
          // Find the matching text snippet
          const index = entry.content.toLowerCase().indexOf(query);
          const start = Math.max(0, index - 50);
          const end = Math.min(entry.content.length, index + query.length + 50);
          matchedText = entry.content.substring(start, end);
          
          // Highlight the match
          const regex = new RegExp(`(${query})`, 'gi');
          matchedText = matchedText.replace(regex, '<mark>$1</mark>');
        }

        // Search in emotions
        const emotionMatches = entry.emotions.some(emotion => 
          emotion.name.toLowerCase().includes(query)
        );
        if (emotionMatches) {
          relevanceScore += 5;
          if (!matchedText) {
            matchedText = `Emotions: ${entry.emotions.map(e => e.name).join(', ')}`;
          }
        }

        // Search in date
        const dateString = format(entry.date, 'MMMM d, yyyy').toLowerCase();
        if (dateString.includes(query)) {
          relevanceScore += 3;
          if (!matchedText) {
            matchedText = `Written on ${format(entry.date, 'MMMM d, yyyy')}`;
          }
        }

        // Apply filters
        if (relevanceScore > 0) {
          // Date range filter
          const now = new Date();
          const entryAge = now.getTime() - entry.date.getTime();
          const dayMs = 24 * 60 * 60 * 1000;
          
          if (filters.dateRange === 'week' && entryAge > 7 * dayMs) return;
          if (filters.dateRange === 'month' && entryAge > 30 * dayMs) return;
          if (filters.dateRange === 'year' && entryAge > 365 * dayMs) return;

          // Word count filter
          if (filters.wordCount === 'short' && entry.wordCount >= 100) return;
          if (filters.wordCount === 'medium' && (entry.wordCount < 100 || entry.wordCount >= 500)) return;
          if (filters.wordCount === 'long' && entry.wordCount < 500) return;

          // Emotion filter
          if (filters.emotions.length > 0) {
            const hasMatchingEmotion = entry.emotions.some(emotion =>
              filters.emotions.includes(emotion.name)
            );
            if (!hasMatchingEmotion) return;
          }

          results.push({
            ...entry,
            relevanceScore,
            matchedText: matchedText || entry.content.substring(0, 100) + '...'
          });
        }
      });

      // Sort results
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case 'relevance':
            return b.relevanceScore - a.relevanceScore;
          case 'date':
            return b.date.getTime() - a.date.getTime();
          case 'wordCount':
            return b.wordCount - a.wordCount;
          default:
            return b.relevanceScore - a.relevanceScore;
        }
      });

      setSearchResults(results);
      setIsSearching(false);
      
      if (results.length > 0) {
        saveSearchToHistory(searchQuery);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, filters, entries]);

  const handleEmotionToggle = (emotion: string) => {
    setFilters(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion]
    }));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const getWordCountLabel = (count: number): string => {
    if (count < 100) return 'Short';
    if (count < 500) return 'Medium';
    return 'Long';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-script text-fountain-pen-blue mb-2">Find Your Thoughts</h1>
        <p className="text-pencil-graphite/70">
          Search through your journal entries
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search your thoughts, emotions, or dates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-6 py-4 pl-14 pr-12 text-lg border border-notebook-lines rounded-lg bg-aged-paper focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue focus:border-transparent"
        />
        <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-pencil-graphite/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-pencil-graphite/50 hover:text-red-pen transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search History */}
          {searchHistory.length > 0 && !searchQuery && (
            <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
              <h3 className="text-lg font-script text-fountain-pen-blue mb-4">Recent Searches</h3>
              <div className="space-y-2">
                {searchHistory.slice(0, 5).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(query)}
                    className="w-full text-left p-2 text-sm text-pencil-graphite hover:text-fountain-pen-blue hover:bg-fountain-pen-blue/5 rounded transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
            <h3 className="text-lg font-script text-fountain-pen-blue mb-4">Filters</h3>
            
            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-pencil-graphite mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                className="w-full px-3 py-2 border border-notebook-lines rounded bg-cream-paper text-pencil-graphite focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>

            {/* Word Count */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-pencil-graphite mb-2">Entry Length</label>
              <select
                value={filters.wordCount}
                onChange={(e) => setFilters(prev => ({ ...prev, wordCount: e.target.value as any }))}
                className="w-full px-3 py-2 border border-notebook-lines rounded bg-cream-paper text-pencil-graphite focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue"
              >
                <option value="all">Any Length</option>
                <option value="short">Short (&lt;100 words)</option>
                <option value="medium">Medium (100-500 words)</option>
                <option value="long">Long (500+ words)</option>
              </select>
            </div>

            {/* Emotions */}
            {allEmotions.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-pencil-graphite mb-2">Emotions</label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {allEmotions.map((emotion) => (
                    <label key={emotion} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.emotions.includes(emotion)}
                        onChange={() => handleEmotionToggle(emotion)}
                        className="rounded border-notebook-lines text-fountain-pen-blue focus:ring-fountain-pen-blue"
                      />
                      <span className="text-sm text-pencil-graphite capitalize">{emotion}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-pencil-graphite mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full px-3 py-2 border border-notebook-lines rounded bg-cream-paper text-pencil-graphite focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="wordCount">Word Count</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3">
          {!searchQuery ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-xl font-script text-fountain-pen-blue mb-4">Start Searching</h3>
              <p className="text-pencil-graphite/70 mb-8">
                Enter keywords, emotions, or dates to find specific entries from your writing journey.
              </p>
              <div className="bg-fountain-pen-blue/5 rounded-lg p-6 max-w-md mx-auto">
                <h4 className="font-medium text-pencil-graphite mb-3">Search Tips:</h4>
                <ul className="text-sm text-pencil-graphite/70 space-y-1 text-left">
                  <li>• Search for specific words or phrases</li>
                  <li>• Look for emotions like "happy" or "anxious"</li>
                  <li>• Search dates like "January 2024"</li>
                  <li>• Use filters to narrow your results</li>
                </ul>
              </div>
            </div>
          ) : isSearching ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-fountain-pen-blue border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-pencil-graphite/70">Searching your entries...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">📭</div>
              <h3 className="text-xl font-script text-fountain-pen-blue mb-4">No Results Found</h3>
              <p className="text-pencil-graphite/70 mb-6">
                No entries match your search for "{searchQuery}". Try different keywords or adjust your filters.
              </p>
              <button
                onClick={clearSearch}
                className="bg-fountain-pen-blue text-white px-6 py-3 rounded-lg hover:bg-fountain-pen-blue/90 transition-colors font-medium"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-pencil-graphite">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </h3>
                </div>
                <button
                  onClick={clearSearch}
                  className="text-sm text-pencil-graphite/70 hover:text-fountain-pen-blue transition-colors"
                >
                  Clear search
                </button>
              </div>

              {/* Results List */}
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => setSelectedEntry(result)}
                    className="bg-aged-paper border border-notebook-lines rounded-lg p-6 hover:shadow-lg hover:border-fountain-pen-blue/50 transition-all duration-200 cursor-pointer"
                  >
                    {/* Result Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-pencil-graphite/70">
                        {format(result.date, 'MMMM d, yyyy • h:mm a')}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-fountain-pen-blue/10 text-fountain-pen-blue px-2 py-1 rounded">
                          {getWordCountLabel(result.wordCount)}
                        </span>
                        <span className="text-xs text-pencil-graphite/50">
                          {result.wordCount} words
                        </span>
                      </div>
                    </div>

                    {/* Matched Text */}
                    <div 
                      className="text-pencil-graphite leading-relaxed mb-3"
                      dangerouslySetInnerHTML={{ __html: result.matchedText }}
                    />

                    {/* Emotions */}
                    {result.emotions.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-pencil-graphite/70">Emotions:</span>
                        <div className="flex gap-1">
                          {result.emotions.slice(0, 3).map((emotion) => (
                            <span
                              key={emotion.id}
                              className="text-xs bg-fountain-pen-blue/10 text-fountain-pen-blue px-2 py-1 rounded capitalize"
                            >
                              {emotion.name}
                            </span>
                          ))}
                          {result.emotions.length > 3 && (
                            <span className="text-xs text-pencil-graphite/50">
                              +{result.emotions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Result Footer */}
                    <div className="flex items-center justify-between text-xs text-pencil-graphite/50">
                      <span>Relevance: {result.relevanceScore}/10</span>
                      <span className="hover:text-fountain-pen-blue transition-colors">
                        Click to read full entry →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-aged-paper rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-script text-fountain-pen-blue mb-1">
                    {format(selectedEntry.date, 'MMMM d, yyyy')}
                  </h2>
                  <p className="text-sm text-pencil-graphite/70">
                    {format(selectedEntry.date, 'EEEE • h:mm a')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 text-pencil-graphite/70 hover:text-red-pen transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Entry Content */}
              <div className="prose prose-lg max-w-none">
                <div className="text-pencil-graphite leading-relaxed whitespace-pre-wrap font-serif">
                  {selectedEntry.content || (
                    <div className="text-center py-12 text-pencil-graphite/50">
                      <div className="text-4xl mb-4">📝</div>
                      <p className="italic">This entry is empty</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-notebook-lines">
                <div className="text-sm text-pencil-graphite/70">
                  {selectedEntry.wordCount} words • {selectedEntry.writingTime} minutes
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="px-4 py-2 border border-notebook-lines rounded-lg text-pencil-graphite hover:bg-fountain-pen-blue/5 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEntry(null);
                      window.location.href = '/write';
                    }}
                    className="px-4 py-2 bg-fountain-pen-blue text-white rounded-lg hover:bg-fountain-pen-blue/90 transition-colors"
                  >
                    Edit Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}