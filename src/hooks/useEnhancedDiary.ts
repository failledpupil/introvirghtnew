// Enhanced diary hook with emotional analysis integration

import { useEffect, useCallback } from 'react';
import { useDiaryStore } from '../stores/diaryStore';
import { useEmotionalAnalysis } from './useEmotionalAnalysis';
import { emotionalCompanionEngine } from '../services/emotionalCompanionEngine';
import type { DiaryEntry } from '../types';
import type { EmotionalAnalysis } from '../types/emotional-companion';

export interface UseEnhancedDiaryReturn {
  // Diary functionality
  entries: DiaryEntry[];
  currentEntry: DiaryEntry | null;
  isLoading: boolean;
  error: string | null;
  
  // Emotional analysis
  currentAnalysis: EmotionalAnalysis | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // Actions
  createEntry: (date?: Date) => Promise<DiaryEntry>;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  analyzeCurrentEntry: () => Promise<void>;
  
  // Enhanced actions
  createEntryWithAnalysis: (date?: Date) => Promise<DiaryEntry>;
  updateEntryWithAnalysis: (id: string, updates: Partial<DiaryEntry>) => Promise<void>;
}

export function useEnhancedDiary(): UseEnhancedDiaryReturn {
  const diaryStore = useDiaryStore();
  const { 
    currentAnalysis, 
    isAnalyzing, 
    analysisError, 
    analyzeEntry,
    clearErrors 
  } = useEmotionalAnalysis();

  // Auto-analyze entries when they're updated with substantial content
  useEffect(() => {
    const autoAnalyzeEntry = async (entry: DiaryEntry) => {
      // Only analyze if entry has substantial content (>50 characters)
      if (entry.content.length > 50 && entry.wordCount > 10) {
        try {
          await analyzeEntry(entry);
        } catch (error) {
          console.error('Auto-analysis failed:', error);
        }
      }
    };

    if (diaryStore.currentEntry) {
      // Debounce auto-analysis to avoid analyzing on every keystroke
      const timeoutId = setTimeout(() => {
        autoAnalyzeEntry(diaryStore.currentEntry!);
      }, 2000); // Wait 2 seconds after last update

      return () => clearTimeout(timeoutId);
    }
  }, [diaryStore.currentEntry?.content, diaryStore.currentEntry?.updatedAt, analyzeEntry]);

  // Enhanced create entry with automatic analysis
  const createEntryWithAnalysis = useCallback(async (date?: Date): Promise<DiaryEntry> => {
    clearErrors();
    const entry = await diaryStore.createEntry(date);
    return entry;
  }, [diaryStore.createEntry, clearErrors]);

  // Enhanced update entry with automatic analysis
  const updateEntryWithAnalysis = useCallback(async (
    id: string, 
    updates: Partial<DiaryEntry>
  ): Promise<void> => {
    clearErrors();
    
    // Update the entry first
    await diaryStore.updateEntry(id, updates);
    
    // Get the updated entry
    const updatedEntry = diaryStore.getEntry(id);
    
    // Analyze if it has substantial content
    if (updatedEntry && updatedEntry.content.length > 50) {
      try {
        await analyzeEntry(updatedEntry);
      } catch (error) {
        console.error('Failed to analyze updated entry:', error);
      }
    }
  }, [diaryStore.updateEntry, diaryStore.getEntry, analyzeEntry, clearErrors]);

  // Manual analysis trigger
  const analyzeCurrentEntry = useCallback(async (): Promise<void> => {
    if (!diaryStore.currentEntry) {
      throw new Error('No current entry to analyze');
    }
    
    await analyzeEntry(diaryStore.currentEntry);
  }, [diaryStore.currentEntry, analyzeEntry]);

  return {
    // Diary functionality
    entries: diaryStore.entries,
    currentEntry: diaryStore.currentEntry,
    isLoading: diaryStore.isLoading,
    error: diaryStore.error,
    
    // Emotional analysis
    currentAnalysis,
    isAnalyzing,
    analysisError,
    
    // Actions
    createEntry: diaryStore.createEntry,
    updateEntry: diaryStore.updateEntry,
    deleteEntry: diaryStore.deleteEntry,
    analyzeCurrentEntry,
    
    // Enhanced actions
    createEntryWithAnalysis,
    updateEntryWithAnalysis
  };
}

// Hook for getting emotional insights for a specific entry
export function useEntryEmotionalInsights(entryId: string | null) {
  const { analyzeEntry } = useEmotionalAnalysis();
  
  const getInsights = useCallback(async () => {
    if (!entryId) return null;
    
    const entry = useDiaryStore.getState().getEntry(entryId);
    if (!entry) return null;
    
    try {
      const analysis = await emotionalCompanionEngine.getEntryAnalysis(entryId);
      
      if (!analysis) {
        // No existing analysis, create one
        return await analyzeEntry(entry);
      }
      
      return analysis;
    } catch (error) {
      console.error('Failed to get entry insights:', error);
      return null;
    }
  }, [entryId, analyzeEntry]);

  return { getInsights };
}

// Hook for emotional patterns across all entries
export function useEmotionalPatterns() {
  const { entries } = useDiaryStore();
  
  const getPatterns = useCallback(async () => {
    try {
      // Get recent entries (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentEntries = entries.filter(entry => 
        entry.date >= thirtyDaysAgo && entry.content.length > 50
      );
      
      if (recentEntries.length === 0) return null;
      
      // Update patterns based on recent entries
      await emotionalCompanionEngine.updateEmotionalPatterns();
      
      // Get insights
      return await emotionalCompanionEngine.getEmotionalInsights('monthly');
    } catch (error) {
      console.error('Failed to get emotional patterns:', error);
      return null;
    }
  }, [entries]);

  return { getPatterns };
}