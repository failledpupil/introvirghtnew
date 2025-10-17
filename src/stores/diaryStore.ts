import { create } from 'zustand';
import type { DiaryEntry, DiaryStore } from '../types';
import { db } from '../utils/database';
// import { generateEntryId } from '../utils/id'; // Removed during optimization
const generateEntryId = () => `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
import { startOfDay } from 'date-fns';
import { astraServiceDirect } from '../services';

export const useDiaryStore = create<DiaryStore>((set, get) => ({
  entries: [],
  currentEntry: null,
  isLoading: false,
  error: null,

  createEntry: async (date = new Date()) => {
    set({ isLoading: true, error: null });

    try {
      const entryDate = startOfDay(date);

      // Check if entry already exists for this date
      const existingEntry = get().entries.find(
        entry => startOfDay(entry.date).getTime() === entryDate.getTime()
      );

      if (existingEntry) {
        set({ currentEntry: existingEntry, isLoading: false });
        return existingEntry;
      }

      const newEntry: DiaryEntry = {
        id: generateEntryId(),
        date: entryDate,
        content: '',
        emotions: [],
        tags: [],
        wordCount: 0,
        writingTime: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        encrypted: false,
      };

      await db.add('entries', newEntry);

      // Sync to AstraDB (async, don't block UI) - only if entry has content
      if (newEntry.content.trim().length > 0) {
        astraServiceDirect.saveEntry(newEntry).catch((error) => {
          console.error('Failed to sync entry to AstraDB:', error);
        });
      }

      set(state => ({
        entries: [...state.entries, newEntry],
        currentEntry: newEntry,
        isLoading: false,
      }));

      return newEntry;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create entry',
        isLoading: false
      });
      throw error;
    }
  },

  updateEntry: async (id, updates) => {
    set({ isLoading: true, error: null });

    try {
      const entry = get().entries.find(e => e.id === id);
      if (!entry) {
        throw new Error('Entry not found');
      }

      const updatedEntry: DiaryEntry = {
        ...entry,
        ...updates,
        updatedAt: new Date(),
      };

      await db.update('entries', updatedEntry);

      // Sync to AstraDB (async, don't block UI) - only if entry has content
      if (updatedEntry.content.trim().length > 0) {
        astraServiceDirect.updateEntry(updatedEntry).catch((error) => {
          console.error('Failed to sync entry update to AstraDB:', error);
        });
      }

      set(state => ({
        entries: state.entries.map(e => e.id === id ? updatedEntry : e),
        currentEntry: state.currentEntry?.id === id ? updatedEntry : state.currentEntry,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update entry',
        isLoading: false
      });
      throw error;
    }
  },

  deleteEntry: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await db.delete('entries', id);

      // Sync to AstraDB (async, don't block UI)
      astraServiceDirect.deleteEntry(id).catch((error) => {
        console.error('Failed to sync entry deletion to AstraDB:', error);
      });

      set(state => ({
        entries: state.entries.filter(e => e.id !== id),
        currentEntry: state.currentEntry?.id === id ? null : state.currentEntry,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete entry',
        isLoading: false
      });
      throw error;
    }
  },

  getEntry: (id) => {
    return get().entries.find(e => e.id === id) || null;
  },

  getEntriesByDateRange: (start, end) => {
    return get().entries.filter(entry => {
      const entryDate = entry.date.getTime();
      return entryDate >= start.getTime() && entryDate <= end.getTime();
    });
  },

  searchEntries: (query) => {
    const lowercaseQuery = query.toLowerCase();
    return get().entries.filter(entry => {
      const contentMatch = entry.content.toLowerCase().includes(lowercaseQuery);
      const tagMatch = entry.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));
      const emotionMatch = entry.emotions.some(emotion => emotion.name.toLowerCase().includes(lowercaseQuery));
      return contentMatch || tagMatch || emotionMatch;
    });
  },

  setCurrentEntry: (entry) => {
    set({ currentEntry: entry });
  },
}));

// Initialize store with data from IndexedDB
export async function initializeDiaryStore() {
  try {
    const entries = await db.getAll('entries');

    // Convert date strings back to Date objects
    const processedEntries = entries.map(entry => ({
      ...entry,
      date: new Date(entry.date),
      createdAt: new Date(entry.createdAt),
      updatedAt: new Date(entry.updatedAt),
    }));

    // Sort entries by date (newest first)
    processedEntries.sort((a, b) => b.date.getTime() - a.date.getTime());

    useDiaryStore.setState({ entries: processedEntries });
  } catch (error) {
    console.error('Failed to initialize diary store:', error);
    useDiaryStore.setState({
      error: 'Failed to load diary entries'
    });
  }
}

// Helper functions for common operations
export function getTodaysEntry(): DiaryEntry | null {
  const today = startOfDay(new Date());
  return useDiaryStore.getState().entries.find(
    entry => startOfDay(entry.date).getTime() === today.getTime()
  ) || null;
}

export async function getOrCreateTodaysEntry(): Promise<DiaryEntry> {
  const existingEntry = getTodaysEntry();
  if (existingEntry) {
    return existingEntry;
  }

  return useDiaryStore.getState().createEntry(new Date());
}

export function getEntriesForMonth(year: number, month: number): DiaryEntry[] {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return useDiaryStore.getState().getEntriesByDateRange(start, end);
}

export function getWritingStreak(): number {
  const entries = useDiaryStore.getState().entries;
  if (entries.length === 0) return 0;

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());

  let streak = 0;
  let currentDate = startOfDay(new Date());

  for (const entry of sortedEntries) {
    const entryDate = startOfDay(entry.date);

    if (entryDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000); // Previous day
    } else if (entryDate.getTime() < currentDate.getTime()) {
      // Gap in entries, streak is broken
      break;
    }
  }

  return streak;
}