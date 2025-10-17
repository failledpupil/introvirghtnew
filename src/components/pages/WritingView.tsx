import { useState, useEffect } from 'react';
import { useDiaryStore } from '../../stores/diaryStore';
import { astraServiceDirect } from '../../services/astraServiceDirect';
import { VAPICard, VAPIText, VAPIButton } from '../ui';
import { useVAPITheme } from '../../hooks/useVAPITheme';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../animations/AnimatedCounter';
import { TypewriterText } from '../animations/TypewriterText';
import { fadeInUp } from '../../utils/animations/motionVariants';
import type { DiaryEntry } from '../../types';

export function WritingView() {
  const { createEntry, updateEntry } = useDiaryStore();
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState('');
  const [syncStatus, setSyncStatus] = useState<string>('');
  const vapi = useVAPITheme();

  // Initialize today's entry
  useEffect(() => {
    const initializeEntry = async () => {
      setIsLoading(true);
      try {
        const todaysEntry = await createEntry(new Date());
        setCurrentEntry(todaysEntry);
        setContent(todaysEntry.content);
      } catch (error) {
        console.error('Failed to initialize entry:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeEntry();
  }, [createEntry]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Auto-save after 1 second of no typing
    const timeoutId = setTimeout(async () => {
      if (currentEntry) {
        const wordCount = newContent.trim() === '' ? 0 : newContent.trim().split(/\s+/).length;
        console.log(`🔄 Updating entry ${currentEntry.id} with ${wordCount} words`);
        console.log(`📝 Content preview: "${newContent.substring(0, 100)}..."`);
        
        await updateEntry(currentEntry.id, { content: newContent, wordCount });
        
        console.log(`✅ Entry updated locally. AstraDB sync should happen automatically.`);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className={cn(
            "animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4",
            vapi.isActive ? "border-vapi-accent-primary" : "border-blue-600"
          )}></div>
          <VAPIText type="secondary">Preparing your writing space...</VAPIText>
        </div>
      </div>
    );
  }

  if (!currentEntry) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <VAPIText as="h2" type="accent" className="text-2xl font-bold mb-4">
            Ready to Write?
          </VAPIText>
          <VAPIText type="secondary" className="mb-6">
            Something went wrong loading your entry.
          </VAPIText>
        </div>
      </div>
    );
  }

  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;

  const manualSyncToAstra = async () => {
    if (!currentEntry || !content.trim()) {
      setSyncStatus('❌ No content to sync');
      return;
    }

    setSyncStatus('🔄 Syncing to AstraDB...');
    try {
      await astraServiceDirect.saveEntry(currentEntry);
      setSyncStatus('✅ Synced to AstraDB successfully!');
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (error) {
      setSyncStatus(`❌ Sync failed: ${(error as Error).message}`);
      setTimeout(() => setSyncStatus(''), 5000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <VAPIText as="h1" type="accent" className="text-3xl font-bold mb-2">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}
        </VAPIText>
        <VAPIText type="secondary" className="mb-4">
          What's on your mind today?
        </VAPIText>
      </div>

      {/* Writing Area */}
      <VAPICard className="p-8 min-h-[500px]">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing your thoughts..."
          className={cn(
            "w-full min-h-[400px] p-4 border-none outline-none resize-none text-lg leading-relaxed",
            vapi.isActive 
              ? "bg-transparent text-vapi-text-primary placeholder:text-vapi-text-muted"
              : "bg-white text-gray-900 placeholder:text-gray-500"
          )}
          style={{
            fontFamily: vapi.isActive ? 'Inter, sans-serif' : 'Georgia, serif',
            lineHeight: '1.8'
          }}
        />
        
        {/* Stats */}
        <div className={cn(
          "mt-6 pt-4 border-t",
          vapi.isActive ? "border-vapi-border-secondary" : "border-gray-200"
        )}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <VAPIText type="muted" className="text-sm">
                {wordCount} words
              </VAPIText>
              <VAPIText type="muted" className="text-sm">
                Created {currentEntry.createdAt.toLocaleDateString()}
              </VAPIText>
            </div>
            <div className="flex items-center gap-3">
              <VAPIText 
                type="accent" 
                className={cn(
                  "text-sm",
                  vapi.isActive ? "" : "text-green-600"
                )}
              >
                ✓ Auto-saved
              </VAPIText>
              <VAPIButton
                size="sm"
                onClick={manualSyncToAstra}
                disabled={!content.trim()}
                className="text-xs"
              >
                🔄 Sync to AstraDB
              </VAPIButton>
            </div>
          </div>
          {syncStatus && (
            <VAPIText type="muted" className="mt-2 text-xs">
              {syncStatus}
            </VAPIText>
          )}
        </div>
      </VAPICard>
    </div>
  );
}