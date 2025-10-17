import type { DiaryEntry } from '../types';

export interface PromptContext {
  recentEntries?: DiaryEntry[];
  currentMood?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  writingGoals?: string[];
  preferences?: {
    style: 'reflective' | 'creative' | 'gratitude' | 'problem-solving';
    length: 'short' | 'medium' | 'long';
  };
}

export interface WritingPrompt {
  id: string;
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'challenging';
  estimatedTime: number;
  tags: string[];
}

export interface AIInsights {
  emotionalTrends: {
    dominant: string[];
    emerging: string[];
    declining: string[];
  };
  writingPatterns: {
    bestTimes: string[];
    averageLength: number;
    consistency: number;
  };
  themes: {
    name: string;
    frequency: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
  suggestions: string[];
}

class AIContentService {
  private apiKey: string | null = null;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  /**
   * Generate a single writing prompt
   */
  async generatePrompt(context: PromptContext = {}): Promise<WritingPrompt> {
    if (!this.isAvailable()) {
      return this.getFallbackPrompt();
    }

    try {
      const response = await this.callOpenAI({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a thoughtful journaling assistant. Generate a single, meaningful writing prompt.',
          },
          {
            role: 'user',
            content: this.buildPromptRequest(context),
          },
        ],
        max_tokens: 100,
        temperature: 0.8,
      });

      const promptText = response.choices[0]?.message?.content || '';
      
      return {
        id: `prompt-${Date.now()}`,
        text: promptText,
        category: context.preferences?.style || 'reflection',
        difficulty: 'medium',
        estimatedTime: 10,
        tags: [],
      };
    } catch (error) {
      console.error('Failed to generate AI prompt:', error);
      return this.getFallbackPrompt();
    }
  }

  /**
   * Generate multiple prompts at once
   */
  async generatePromptBatch(count: number = 5): Promise<WritingPrompt[]> {
    const prompts: WritingPrompt[] = [];
    
    for (let i = 0; i < count; i++) {
      const prompt = await this.generatePrompt();
      prompts.push(prompt);
    }
    
    return prompts;
  }

  /**
   * Analyze diary entries for insights
   */
  async analyzeEntries(entries: DiaryEntry[]): Promise<AIInsights> {
    if (!this.isAvailable() || entries.length === 0) {
      return this.getFallbackInsights();
    }

    try {
      const recentEntries = entries.slice(0, 10).map(entry => ({
        date: entry.date.toDateString(),
        content: entry.content.substring(0, 500),
        emotions: entry.emotions.map(e => e.name),
        wordCount: entry.wordCount,
      }));

      const response = await this.callOpenAI({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a diary analysis assistant. Analyze entries and provide insights in JSON format.',
          },
          {
            role: 'user',
            content: `Analyze these diary entries: ${JSON.stringify(recentEntries)}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      // Parse response and return insights
      return this.parseInsights(response.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Failed to analyze entries:', error);
      return this.getFallbackInsights();
    }
  }

  /**
   * Generate summary for a time period
   */
  async generateSummary(entries: DiaryEntry[], period: string): Promise<string> {
    if (!this.isAvailable() || entries.length === 0) {
      return `You wrote ${entries.length} entries during this period.`;
    }

    try {
      const response = await this.callOpenAI({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a thoughtful diary summarizer. Create a brief, encouraging summary.',
          },
          {
            role: 'user',
            content: `Summarize these ${entries.length} diary entries from ${period}.`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'Summary unavailable.';
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return `You wrote ${entries.length} entries during this period.`;
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(payload: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Build prompt request from context
   */
  private buildPromptRequest(context: PromptContext): string {
    const parts = ['Generate a writing prompt'];
    
    if (context.preferences?.style) {
      parts.push(`for ${context.preferences.style} journaling`);
    }
    
    if (context.timeOfDay) {
      parts.push(`suitable for ${context.timeOfDay}`);
    }
    
    return parts.join(' ') + '.';
  }

  /**
   * Parse insights from AI response
   */
  private parseInsights(content: string): AIInsights {
    try {
      return JSON.parse(content);
    } catch {
      return this.getFallbackInsights();
    }
  }

  /**
   * Get fallback prompt when AI is unavailable
   */
  private getFallbackPrompt(): WritingPrompt {
    const fallbackPrompts = [
      'What made you smile today?',
      'Describe a moment of peace you experienced recently.',
      'What are you grateful for right now?',
      'What challenge are you currently facing?',
      'Write about a person who influenced you today.',
    ];

    return {
      id: `fallback-${Date.now()}`,
      text: fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)],
      category: 'reflection',
      difficulty: 'easy',
      estimatedTime: 5,
      tags: ['fallback'],
    };
  }

  /**
   * Get fallback insights when AI is unavailable
   */
  private getFallbackInsights(): AIInsights {
    return {
      emotionalTrends: {
        dominant: [],
        emerging: [],
        declining: [],
      },
      writingPatterns: {
        bestTimes: [],
        averageLength: 0,
        consistency: 0,
      },
      themes: [],
      suggestions: ['Keep writing regularly to see insights!'],
    };
  }
}

export const aiContentService = new AIContentService();
export default aiContentService;
