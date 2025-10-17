// Hook for integrating emotional analysis with diary entries

import { useState, useEffect, useCallback } from 'react';
import type { DiaryEntry } from '../types';
import type { 
  EmotionalAnalysis, 
  EmotionalPatterns, 
  EmotionalInsights,
  CompanionPreferences 
} from '../types/emotional-companion';
import { emotionalCompanionEngine } from '../services/emotionalCompanionEngine';

export interface UseEmotionalAnalysisReturn {
  // Analysis state
  currentAnalysis: EmotionalAnalysis | null;
  patterns: EmotionalPatterns | null;
  insights: EmotionalInsights | null;
  preferences: CompanionPreferences | null;
  
  // Loading states
  isAnalyzing: boolean;
  isLoadingPatterns: boolean;
  isLoadingInsights: boolean;
  
  // Error states
  analysisError: string | null;
  patternsError: string | null;
  insightsError: string | null;
  
  // Actions
  analyzeEntry: (entry: DiaryEntry) => Promise<void>;
  loadPatterns: () => Promise<void>;
  loadInsights: (timeframe?: 'daily' | 'weekly' | 'monthly') => Promise<void>;
  updatePreferences: (updates: Partial<CompanionPreferences>) => Promise<void>;
  clearErrors: () => void;
}

export function useEmotionalAnalysis(): UseEmotionalAnalysisReturn {
  // State
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionalAnalysis | null>(null);
  const [patterns] = useState<EmotionalPatterns | null>(null);
  const [insights, setInsights] = useState<EmotionalInsights | null>(null);
  const [preferences, setPreferences] = useState<CompanionPreferences | null>(null);
  
  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingPatterns, setIsLoadingPatterns] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  // Error states
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [patternsError, setPatternsError] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadPreferences();
    loadPatterns();
    loadInsights();
  }, []);

  // Actions
  const analyzeEntry = useCallback(async (entry: DiaryEntry) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const analysis = await emotionalCompanionEngine.analyzeEntry(entry);
      setCurrentAnalysis(analysis);
      
      // Refresh patterns and insights after new analysis
      await loadPatterns();
      await loadInsights();
    } catch (error) {
      console.error('Failed to analyze entry:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze entry');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const loadPatterns = useCallback(async () => {
    setIsLoadingPatterns(true);
    setPatternsError(null);
    
    try {
      // This would typically get patterns from storage
      // For now, we'll trigger pattern update which will generate them
      await emotionalCompanionEngine.updateEmotionalPatterns();
      
      // In a real implementation, we'd have a method to get patterns
      // const updatedPatterns = await emotionalCompanionEngine.getEmotionalPatterns();
      // setPatterns(updatedPatterns);
    } catch (error) {
      console.error('Failed to load patterns:', error);
      setPatternsError(error instanceof Error ? error.message : 'Failed to load patterns');
    } finally {
      setIsLoadingPatterns(false);
    }
  }, []);

  const loadInsights = useCallback(async (timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
    setIsLoadingInsights(true);
    setInsightsError(null);
    
    try {
      const insights = await emotionalCompanionEngine.getEmotionalInsights(timeframe);
      setInsights(insights);
    } catch (error) {
      console.error('Failed to load insights:', error);
      setInsightsError(error instanceof Error ? error.message : 'Failed to load insights');
    } finally {
      setIsLoadingInsights(false);
    }
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      const prefs = await emotionalCompanionEngine.getCompanionPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<CompanionPreferences>) => {
    try {
      await emotionalCompanionEngine.updateCompanionPreferences(updates);
      await loadPreferences(); // Reload to get updated preferences
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }, [loadPreferences]);

  const clearErrors = useCallback(() => {
    setAnalysisError(null);
    setPatternsError(null);
    setInsightsError(null);
  }, []);

  return {
    // Analysis state
    currentAnalysis,
    patterns,
    insights,
    preferences,
    
    // Loading states
    isAnalyzing,
    isLoadingPatterns,
    isLoadingInsights,
    
    // Error states
    analysisError,
    patternsError,
    insightsError,
    
    // Actions
    analyzeEntry,
    loadPatterns,
    loadInsights,
    updatePreferences,
    clearErrors
  };
}

// Hook for getting analysis of a specific entry
export function useEntryAnalysis(entryId: string | null) {
  const [analysis, setAnalysis] = useState<EmotionalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entryId) {
      setAnalysis(null);
      return;
    }

    const loadAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const analysis = await emotionalCompanionEngine.getEntryAnalysis(entryId);
        setAnalysis(analysis);
      } catch (err) {
        console.error('Failed to load entry analysis:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysis();
  }, [entryId]);

  return { analysis, isLoading, error };
}