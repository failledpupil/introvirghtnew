import type { DiaryEntry } from '../types';

export interface AnonymizedEntry {
  content: string;
  emotions: string[];
  wordCount: number;
  date: string; // Generic date like "Monday" instead of specific date
}

/**
 * Privacy Manager for AI features
 * Handles data anonymization and consent management
 */
export class PrivacyManager {
  private static readonly PII_PATTERNS = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    address: /\b\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|highway|hwy|square|sq|trail|trl|drive|dr|court|ct|parkway|pkwy|circle|cir|boulevard|blvd)\b/gi,
  };

  /**
   * Anonymize diary entry before sending to AI
   */
  static anonymize(entry: DiaryEntry): AnonymizedEntry {
    let content = entry.content;

    // Remove PII
    Object.entries(this.PII_PATTERNS).forEach(([type, pattern]) => {
      content = content.replace(pattern, `[${type}]`);
    });

    // Remove specific names (simple heuristic - capitalized words)
    content = content.replace(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g, '[name]');

    // Genericize date
    const dayOfWeek = entry.date.toLocaleDateString('en-US', { weekday: 'long' });

    return {
      content,
      emotions: entry.emotions.map(e => e.name),
      wordCount: entry.wordCount,
      date: dayOfWeek,
    };
  }

  /**
   * Check if user has consented to AI features
   */
  static hasConsent(feature: 'prompts' | 'insights' | 'analysis'): boolean {
    const consent = localStorage.getItem('ai-consent');
    if (!consent) return false;

    try {
      const consentData = JSON.parse(consent);
      return consentData[feature] === true;
    } catch {
      return false;
    }
  }

  /**
   * Set user consent for AI features
   */
  static setConsent(feature: 'prompts' | 'insights' | 'analysis', granted: boolean): void {
    const consent = localStorage.getItem('ai-consent');
    let consentData: Record<string, boolean> = {};

    if (consent) {
      try {
        consentData = JSON.parse(consent);
      } catch {
        // Invalid JSON, start fresh
      }
    }

    consentData[feature] = granted;
    localStorage.setItem('ai-consent', JSON.stringify(consentData));
  }

  /**
   * Clear all AI consent
   */
  static clearConsent(): void {
    localStorage.removeItem('ai-consent');
  }

  /**
   * Get all consent settings
   */
  static getAllConsent(): Record<string, boolean> {
    const consent = localStorage.getItem('ai-consent');
    if (!consent) return {};

    try {
      return JSON.parse(consent);
    } catch {
      return {};
    }
  }

  /**
   * Validate that content doesn't contain obvious PII
   */
  static validateContent(content: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    Object.entries(this.PII_PATTERNS).forEach(([type, pattern]) => {
      if (pattern.test(content)) {
        issues.push(type);
      }
    });

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

export default PrivacyManager;
