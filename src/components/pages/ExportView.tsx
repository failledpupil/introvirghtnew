import { useState } from 'react';
import { cn } from '../../utils/cn';
import { useDiaryStore } from '../../stores/diaryStore';
import { format } from 'date-fns';

interface ExportOptions {
  format: 'json' | 'txt' | 'pdf' | 'html';
  dateRange: 'all' | 'year' | 'month' | 'custom';
  includeEmotions: boolean;
  includeStats: boolean;
  customStartDate?: string;
  customEndDate?: string;
}

export function ExportView() {
  const { entries } = useDiaryStore();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'txt',
    dateRange: 'all',
    includeEmotions: true,
    includeStats: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const formatOptions = [
    {
      id: 'txt' as const,
      name: 'Plain Text',
      description: 'Simple text file, easy to read anywhere',
      icon: '📄',
      extension: '.txt'
    },
    {
      id: 'json' as const,
      name: 'JSON Data',
      description: 'Structured data with all metadata',
      icon: '🔧',
      extension: '.json'
    },
    {
      id: 'pdf' as const,
      name: 'PDF Document',
      description: 'Formatted document, perfect for printing',
      icon: '📋',
      extension: '.pdf'
    },
    {
      id: 'html' as const,
      name: 'Web Page',
      description: 'Styled HTML page with navigation',
      icon: '🌐',
      extension: '.html'
    }
  ];

  const dateRangeOptions = [
    { id: 'all' as const, name: 'All Entries', description: `${entries.length} entries` },
    { id: 'year' as const, name: 'Past Year', description: 'Last 365 days' },
    { id: 'month' as const, name: 'Past Month', description: 'Last 30 days' },
    { id: 'custom' as const, name: 'Custom Range', description: 'Choose specific dates' }
  ];

  const getFilteredEntries = () => {
    let filtered = [...entries];
    const now = new Date();

    switch (exportOptions.dateRange) {
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(entry => entry.date >= yearAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(entry => entry.date >= monthAgo);
        break;
      case 'custom':
        if (exportOptions.customStartDate) {
          const startDate = new Date(exportOptions.customStartDate);
          filtered = filtered.filter(entry => entry.date >= startDate);
        }
        if (exportOptions.customEndDate) {
          const endDate = new Date(exportOptions.customEndDate);
          filtered = filtered.filter(entry => entry.date <= endDate);
        }
        break;
    }

    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const generateTextExport = (entries: any[]) => {
    let content = 'Introvirght Export\n';
    content += '================\n\n';
    content += `Exported on: ${format(new Date(), 'MMMM d, yyyy')}\n`;
    content += `Total entries: ${entries.length}\n\n`;

    if (exportOptions.includeStats) {
      const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
      const avgWords = Math.round(totalWords / entries.length);
      content += 'Statistics:\n';
      content += `-----------\n`;
      content += `Total words: ${totalWords.toLocaleString()}\n`;
      content += `Average words per entry: ${avgWords}\n`;
      content += `Date range: ${format(entries[0]?.date || new Date(), 'MMM d, yyyy')} - ${format(entries[entries.length - 1]?.date || new Date(), 'MMM d, yyyy')}\n\n`;
    }

    entries.forEach((entry, index) => {
      content += `Entry ${index + 1}\n`;
      content += `Date: ${format(entry.date, 'MMMM d, yyyy • h:mm a')}\n`;
      content += `Words: ${entry.wordCount}\n`;
      
      if (exportOptions.includeEmotions && entry.emotions.length > 0) {
        content += `Emotions: ${entry.emotions.map((e: any) => e.name).join(', ')}\n`;
      }
      
      content += '\n';
      content += entry.content || '(Empty entry)';
      content += '\n\n' + '='.repeat(50) + '\n\n';
    });

    return content;
  };

  const generateJSONExport = (entries: any[]) => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalEntries: entries.length,
      dateRange: {
        start: entries[0]?.date || null,
        end: entries[entries.length - 1]?.date || null
      },
      entries: entries.map(entry => ({
        id: entry.id,
        date: entry.date.toISOString(),
        content: entry.content,
        wordCount: entry.wordCount,
        writingTime: entry.writingTime,
        emotions: exportOptions.includeEmotions ? entry.emotions : [],
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt?.toISOString() || entry.createdAt.toISOString()
      }))
    };

    if (exportOptions.includeStats) {
      const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
      (exportData as any).statistics = {
        totalWords,
        averageWordsPerEntry: Math.round(totalWords / entries.length),
        longestEntry: Math.max(...entries.map(e => e.wordCount)),
        writingDays: new Set(entries.map(e => format(e.date, 'yyyy-MM-dd'))).size
      };
    }

    return JSON.stringify(exportData, null, 2);
  };

  const generateHTMLExport = (entries: any[]) => {
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Introvirght Export</title>
    <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
        .entry { margin-bottom: 40px; padding: 20px; border-left: 4px solid #1e3a8a; background: #f8f9fa; }
        .entry-date { color: #1e3a8a; font-weight: bold; margin-bottom: 10px; }
        .entry-meta { font-size: 0.9em; color: #666; margin-bottom: 15px; }
        .entry-content { white-space: pre-wrap; }
        .emotions { margin-top: 10px; }
        .emotion-tag { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; margin-right: 5px; }
        .stats { background: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Introvirght</h1>
        <p>Exported on ${format(new Date(), 'MMMM d, yyyy')}</p>
        <p>${entries.length} entries</p>
    </div>
`;

    if (exportOptions.includeStats) {
      const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
      html += `
    <div class="stats">
        <h2>Statistics</h2>
        <p><strong>Total words:</strong> ${totalWords.toLocaleString()}</p>
        <p><strong>Average words per entry:</strong> ${Math.round(totalWords / entries.length)}</p>
        <p><strong>Date range:</strong> ${format(entries[0]?.date || new Date(), 'MMM d, yyyy')} - ${format(entries[entries.length - 1]?.date || new Date(), 'MMM d, yyyy')}</p>
    </div>
`;
    }

    entries.forEach((entry) => {
      html += `
    <div class="entry">
        <div class="entry-date">${format(entry.date, 'MMMM d, yyyy')}</div>
        <div class="entry-meta">
            ${format(entry.date, 'h:mm a')} • ${entry.wordCount} words
        </div>
        <div class="entry-content">${entry.content || '(Empty entry)'}</div>
`;
      
      if (exportOptions.includeEmotions && entry.emotions.length > 0) {
        html += `
        <div class="emotions">
            ${entry.emotions.map((e: any) => `<span class="emotion-tag">${e.name}</span>`).join('')}
        </div>
`;
      }
      
      html += `    </div>`;
    });

    html += `
</body>
</html>`;

    return html;
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const filteredEntries = getFilteredEntries();
      let content = '';
      let filename = '';
      let mimeType = '';

      switch (exportOptions.format) {
        case 'txt':
          content = generateTextExport(filteredEntries);
          filename = `diary-export-${format(new Date(), 'yyyy-MM-dd')}.txt`;
          mimeType = 'text/plain';
          break;
        case 'json':
          content = generateJSONExport(filteredEntries);
          filename = `diary-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
          mimeType = 'application/json';
          break;
        case 'html':
          content = generateHTMLExport(filteredEntries);
          filename = `diary-export-${format(new Date(), 'yyyy-MM-dd')}.html`;
          mimeType = 'text/html';
          break;
        case 'pdf':
          // For PDF, we'd typically use a library like jsPDF or html2pdf
          // For now, we'll export as HTML and suggest printing to PDF
          content = generateHTMLExport(filteredEntries);
          filename = `diary-export-${format(new Date(), 'yyyy-MM-dd')}.html`;
          mimeType = 'text/html';
          break;
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredEntries = getFilteredEntries();
  const totalWords = filteredEntries.reduce((sum, entry) => sum + entry.wordCount, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-script text-fountain-pen-blue mb-2">Export Your Diary</h1>
        <p className="text-pencil-graphite/70">
          Create a backup of your writing or share your journey in various formats.
        </p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Format Selection */}
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
            <h3 className="text-xl font-script text-fountain-pen-blue mb-6">Choose Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formatOptions.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setExportOptions(prev => ({ ...prev, format: format.id }))}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all duration-200 hover:scale-105',
                    exportOptions.format === format.id
                      ? 'border-fountain-pen-blue bg-fountain-pen-blue/10'
                      : 'border-notebook-lines hover:border-fountain-pen-blue/50'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{format.icon}</span>
                    <div>
                      <h4 className="font-medium text-pencil-graphite">{format.name}</h4>
                      <span className="text-xs text-pencil-graphite/70">{format.extension}</span>
                    </div>
                  </div>
                  <p className="text-sm text-pencil-graphite/70">{format.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
            <h3 className="text-xl font-script text-fountain-pen-blue mb-6">Date Range</h3>
            <div className="space-y-4">
              {dateRangeOptions.map((range) => (
                <label key={range.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="dateRange"
                    value={range.id}
                    checked={exportOptions.dateRange === range.id}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    className="text-fountain-pen-blue focus:ring-fountain-pen-blue"
                  />
                  <div>
                    <div className="font-medium text-pencil-graphite">{range.name}</div>
                    <div className="text-sm text-pencil-graphite/70">{range.description}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Custom Date Range */}
            {exportOptions.dateRange === 'custom' && (
              <div className="mt-4 p-4 bg-fountain-pen-blue/5 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-pencil-graphite mb-2">Start Date</label>
                    <input
                      type="date"
                      value={exportOptions.customStartDate || ''}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, customStartDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-notebook-lines rounded bg-cream-paper text-pencil-graphite focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-pencil-graphite mb-2">End Date</label>
                    <input
                      type="date"
                      value={exportOptions.customEndDate || ''}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, customEndDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-notebook-lines rounded bg-cream-paper text-pencil-graphite focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6">
            <h3 className="text-xl font-script text-fountain-pen-blue mb-6">Additional Options</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeEmotions}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeEmotions: e.target.checked }))}
                  className="text-fountain-pen-blue focus:ring-fountain-pen-blue"
                />
                <div>
                  <div className="font-medium text-pencil-graphite">Include Emotions</div>
                  <div className="text-sm text-pencil-graphite/70">Export emotion data with each entry</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeStats}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeStats: e.target.checked }))}
                  className="text-fountain-pen-blue focus:ring-fountain-pen-blue"
                />
                <div>
                  <div className="font-medium text-pencil-graphite">Include Statistics</div>
                  <div className="text-sm text-pencil-graphite/70">Add writing statistics to the export</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Export Preview & Action */}
        <div className="lg:col-span-1">
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-6 sticky top-8">
            <h3 className="text-xl font-script text-fountain-pen-blue mb-6">Export Preview</h3>
            
            {/* Preview Stats */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-pencil-graphite/70">Format:</span>
                <span className="font-medium text-pencil-graphite">
                  {formatOptions.find(f => f.id === exportOptions.format)?.name}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-pencil-graphite/70">Entries:</span>
                <span className="font-medium text-pencil-graphite">{filteredEntries.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-pencil-graphite/70">Total Words:</span>
                <span className="font-medium text-pencil-graphite">{totalWords.toLocaleString()}</span>
              </div>
              
              {filteredEntries.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-pencil-graphite/70">Date Range:</span>
                  <span className="font-medium text-pencil-graphite text-right text-sm">
                    {format(filteredEntries[0].date, 'MMM d, yyyy')}
                    <br />
                    to {format(filteredEntries[filteredEntries.length - 1].date, 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting || filteredEntries.length === 0}
              className={cn(
                'w-full py-3 px-6 rounded-lg font-medium transition-colors',
                isExporting || filteredEntries.length === 0
                  ? 'bg-notebook-lines text-pencil-graphite/50 cursor-not-allowed'
                  : 'bg-fountain-pen-blue text-white hover:bg-fountain-pen-blue/90'
              )}
            >
              {isExporting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Exporting...</span>
                </div>
              ) : filteredEntries.length === 0 ? (
                'No Entries to Export'
              ) : (
                `Export ${filteredEntries.length} Entries`
              )}
            </button>

            {/* Success Message */}
            {exportComplete && (
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Export Complete!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">Your diary has been downloaded successfully.</p>
              </div>
            )}

            {/* Export Tips */}
            <div className="mt-6 p-4 bg-fountain-pen-blue/5 rounded-lg">
              <h4 className="font-medium text-pencil-graphite mb-2">💡 Export Tips</h4>
              <ul className="text-sm text-pencil-graphite/70 space-y-1">
                <li>• Text format is most compatible</li>
                <li>• JSON preserves all metadata</li>
                <li>• HTML can be printed as PDF</li>
                <li>• Regular backups protect your writing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}