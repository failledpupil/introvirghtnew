// Main emotional companion engine that orchestrates all emotional analysis components

import type { DiaryEntry } from '../types';
import type {
  EmotionalAnalysis,
  EmotionalPatterns,
  EmotionalProfile,
  CompanionPreferences,
  SafetyFlag,
  EmotionalInsights,
  CrisisResource
} from '../types/emotional-companion';

import { localEmotionalAnalyzer } from './emotionalAnalysis';
import { emotionalStorageService } from './emotionalStorage';

export class EmotionalCompanionEngine {
  private currentUserId = 'default-user'; // TODO: Get from auth context

  /**
   * Analyze a diary entry and store the results
   */
  async analyzeEntry(entry: DiaryEntry): Promise<EmotionalAnalysis> {
    try {
      // Perform local emotional analysis
      const analysis = await localEmotionalAnalyzer.analyzeEntry(entry);
      
      // Store the analysis
      await emotionalStorageService.storeEmotionalAnalysis(analysis);
      
      // Update emotional patterns
      await this.updateEmotionalPatterns();
      
      // Check for safety concerns
      await this.checkSafetyConcerns(analysis);
      
      return analysis;
    } catch (error) {
      console.error('Failed to analyze entry:', error);
      throw new Error('Failed to analyze diary entry');
    }
  }

  /**
   * Get emotional analysis for a specific entry
   */
  async getEntryAnalysis(entryId: string): Promise<EmotionalAnalysis | null> {
    try {
      const analyses = await emotionalStorageService.getAnalysesForEntry(entryId);
      return analyses.length > 0 ? analyses[0] : null;
    } catch (error) {
      console.error('Failed to get entry analysis:', error);
      return null;
    }
  }

  /**
   * Update emotional patterns based on recent analyses
   */
  async updateEmotionalPatterns(): Promise<void> {
    try {
      // Get recent diary entries (this would come from the diary store)
      // For now, we'll simulate this
      const recentEntries: DiaryEntry[] = []; // TODO: Get from diary store
      
      if (recentEntries.length === 0) return;
      
      // Detect patterns
      const patterns = await localEmotionalAnalyzer.detectEmotionalPatterns(recentEntries);
      
      // Store patterns
      await emotionalStorageService.storeEmotionalPatterns(this.currentUserId, patterns);
      
      // Update emotional profile
      await this.updateEmotionalProfile(patterns);
      
    } catch (error) {
      console.error('Failed to update emotional patterns:', error);
    }
  }

  /**
   * Update the user's emotional profile
   */
  async updateEmotionalProfile(patterns: EmotionalPatterns): Promise<void> {
    try {
      let profile = await emotionalStorageService.getEmotionalProfile(this.currentUserId);
      
      if (!profile) {
        profile = this.createDefaultEmotionalProfile();
      }
      
      // Update profile based on patterns
      profile = this.updateProfileFromPatterns(profile, patterns);
      profile.lastUpdated = new Date();
      profile.version += 1;
      
      await emotionalStorageService.storeEmotionalProfile(this.currentUserId, profile);
    } catch (error) {
      console.error('Failed to update emotional profile:', error);
    }
  }

  /**
   * Check for safety concerns in analysis
   */
  async checkSafetyConcerns(analysis: EmotionalAnalysis): Promise<void> {
    try {
      const safetyFlags: SafetyFlag[] = [];
      
      // Check for crisis indicators
      analysis.concerns.forEach(concern => {
        if (concern.severity === 'high' || concern.severity === 'critical') {
          safetyFlags.push({
            type: concern.type as any,
            severity: concern.severity,
            indicators: concern.indicators,
            detectedAt: new Date(),
            resolved: false
          });
        }
      });
      
      // If we have safety flags, we would trigger appropriate responses
      if (safetyFlags.length > 0) {
        console.warn('Safety concerns detected:', safetyFlags);
        // TODO: Implement crisis response system
      }
      
    } catch (error) {
      console.error('Failed to check safety concerns:', error);
    }
  }

  /**
   * Get emotional insights for the user
   */
  async getEmotionalInsights(timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<EmotionalInsights | null> {
    try {
      const insights = await emotionalStorageService.getEmotionalInsights(this.currentUserId);
      
      if (!insights || this.shouldRegenerateInsights(insights, timeframe)) {
        return await this.generateEmotionalInsights(timeframe);
      }
      
      return insights;
    } catch (error) {
      console.error('Failed to get emotional insights:', error);
      return null;
    }
  }

  /**
   * Generate new emotional insights
   */
  async generateEmotionalInsights(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<EmotionalInsights> {
    try {
      const patterns = await emotionalStorageService.getEmotionalPatterns(this.currentUserId);
      // const profile = await emotionalStorageService.getEmotionalProfile(this.currentUserId);
      
      const insights: EmotionalInsights = {
        userId: this.currentUserId,
        generatedAt: new Date(),
        timeframe,
        insights: [],
        patterns: [],
        recommendations: [],
        celebratedGrowth: []
      };
      
      if (patterns) {
        // Generate pattern insights
        insights.patterns = patterns.trends.map(trend => ({
          pattern: `${trend.emotion} trend`,
          description: `Your ${trend.emotion} levels have been ${trend.direction} over the ${trend.timeframe}`,
          strength: trend.strength,
          trend: trend.direction === 'increasing' && this.isPositiveEmotion(trend.emotion) ? 'improving' : 
                 trend.direction === 'decreasing' && !this.isPositiveEmotion(trend.emotion) ? 'improving' : 'stable',
          timeframe: trend.timeframe,
          recommendations: this.generatePatternRecommendations(trend)
        }));
        
        // Generate growth celebrations
        if (patterns.growth.positivePatterns.length > 0) {
          insights.celebratedGrowth = patterns.growth.positivePatterns.map(pattern => ({
            achievement: pattern,
            description: `You've been consistently showing ${pattern}`,
            evidence: [pattern],
            significance: 7,
            celebratedAt: new Date()
          }));
        }
      }
      
      await emotionalStorageService.storeEmotionalInsights(this.currentUserId, insights);
      return insights;
      
    } catch (error) {
      console.error('Failed to generate emotional insights:', error);
      throw new Error('Failed to generate insights');
    }
  }

  /**
   * Get companion preferences for the user
   */
  async getCompanionPreferences(): Promise<CompanionPreferences> {
    try {
      let preferences = await emotionalStorageService.getCompanionPreferences(this.currentUserId);
      
      if (!preferences) {
        preferences = this.createDefaultCompanionPreferences();
        await emotionalStorageService.storeCompanionPreferences(this.currentUserId, preferences);
      }
      
      return preferences;
    } catch (error) {
      console.error('Failed to get companion preferences:', error);
      return this.createDefaultCompanionPreferences();
    }
  }

  /**
   * Update companion preferences
   */
  async updateCompanionPreferences(updates: Partial<CompanionPreferences>): Promise<void> {
    try {
      const current = await this.getCompanionPreferences();
      const updated = { ...current, ...updates };
      await emotionalStorageService.storeCompanionPreferences(this.currentUserId, updated);
    } catch (error) {
      console.error('Failed to update companion preferences:', error);
    }
  }

  /**
   * Get crisis resources
   */
  getCrisisResources(): CrisisResource[] {
    return [
      {
        type: 'hotline',
        name: 'National Suicide Prevention Lifeline',
        contact: '988',
        availability: '24/7',
        specialization: ['suicide prevention', 'crisis support'],
        language: ['English', 'Spanish'],
        description: 'Free and confidential emotional support for people in suicidal crisis or emotional distress',
        priority: 10
      },
      {
        type: 'chat',
        name: 'Crisis Text Line',
        contact: 'Text HOME to 741741',
        availability: '24/7',
        specialization: ['crisis support', 'mental health'],
        language: ['English'],
        description: 'Free, 24/7 support for those in crisis via text message',
        priority: 9
      },
      {
        type: 'hotline',
        name: 'SAMHSA National Helpline',
        contact: '1-800-662-4357',
        availability: '24/7',
        specialization: ['mental health', 'substance abuse'],
        language: ['English', 'Spanish'],
        description: 'Treatment referral and information service for mental health and substance use disorders',
        priority: 8
      }
    ];
  }

  /**
   * Export all user data
   */
  async exportUserData(): Promise<any> {
    try {
      return await emotionalStorageService.exportUserData(this.currentUserId);
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw new Error('Failed to export emotional companion data');
    }
  }

  /**
   * Delete all user data
   */
  async deleteUserData(): Promise<void> {
    try {
      await emotionalStorageService.deleteUserData(this.currentUserId);
    } catch (error) {
      console.error('Failed to delete user data:', error);
      throw new Error('Failed to delete emotional companion data');
    }
  }

  // Private helper methods

  private createDefaultEmotionalProfile(): EmotionalProfile {
    return {
      userId: this.currentUserId,
      baselineEmotions: [],
      emotionalRange: {
        typical: { min: 3, max: 7 },
        positive: { min: 5, max: 9 },
        negative: { min: 2, max: 6 },
        volatility: 0.3
      },
      copingStrategies: [],
      supportNeeds: [],
      communicationPreferences: this.createDefaultCompanionPreferences(),
      growthAreas: [],
      strengths: [],
      lastUpdated: new Date(),
      version: 1
    };
  }

  private createDefaultCompanionPreferences(): CompanionPreferences {
    return {
      communicationStyle: 'warm',
      supportPreferences: [],
      topicSensitivities: [],
      responseLength: 'moderate',
      humorLevel: 5,
      directnessLevel: 5,
      empathyStyle: 'validating',
      boundarySettings: {
        topicsToAvoid: [],
        maxSessionLength: 30,
        crisisInterventionEnabled: true,
        dataRetentionPeriod: 365,
        shareInsightsWithUser: true
      }
    };
  }

  private updateProfileFromPatterns(profile: EmotionalProfile, patterns: EmotionalPatterns): EmotionalProfile {
    // Update baseline emotions from trends
    const updatedProfile = { ...profile };
    
    // Update emotional range based on recent patterns
    if (patterns.trends.length > 0) {
      const intensities = patterns.trends.flatMap(trend => 
        trend.dataPoints.map(point => point.value)
      );
      
      if (intensities.length > 0) {
        updatedProfile.emotionalRange.typical.min = Math.min(...intensities);
        updatedProfile.emotionalRange.typical.max = Math.max(...intensities);
      }
    }
    
    // Update strengths from growth indicators
    if (patterns.growth.positivePatterns.length > 0) {
      updatedProfile.strengths = patterns.growth.positivePatterns.map(pattern => ({
        strength: pattern,
        evidence: [pattern],
        frequency: 1,
        growth: 1,
        lastObserved: new Date()
      }));
    }
    
    // Update growth areas
    if (patterns.growth.areasForGrowth.length > 0) {
      updatedProfile.growthAreas = patterns.growth.areasForGrowth.map(area => ({
        area,
        priority: 5,
        progress: 3,
        strategies: [],
        milestones: [],
        lastAssessed: new Date()
      }));
    }
    
    return updatedProfile;
  }

  private shouldRegenerateInsights(insights: EmotionalInsights, timeframe: string): boolean {
    const now = new Date();
    const lastGenerated = new Date(insights.generatedAt);
    const hoursSinceGenerated = (now.getTime() - lastGenerated.getTime()) / (1000 * 60 * 60);
    
    switch (timeframe) {
      case 'daily':
        return hoursSinceGenerated > 24;
      case 'weekly':
        return hoursSinceGenerated > 168; // 7 days
      case 'monthly':
        return hoursSinceGenerated > 720; // 30 days
      default:
        return hoursSinceGenerated > 168;
    }
  }

  private isPositiveEmotion(emotion: string): boolean {
    const positiveEmotions = ['joy', 'love', 'gratitude', 'excitement', 'peace', 'pride', 'hope'];
    return positiveEmotions.includes(emotion.toLowerCase());
  }

  private generatePatternRecommendations(trend: any): string[] {
    const recommendations: string[] = [];
    
    if (trend.direction === 'increasing' && this.isPositiveEmotion(trend.emotion)) {
      recommendations.push(`Continue the activities that bring you ${trend.emotion}`);
      recommendations.push(`Reflect on what's contributing to this positive trend`);
    } else if (trend.direction === 'decreasing' && !this.isPositiveEmotion(trend.emotion)) {
      recommendations.push(`Great progress in managing ${trend.emotion}`);
      recommendations.push(`Consider what coping strategies have been most helpful`);
    } else if (trend.direction === 'increasing' && !this.isPositiveEmotion(trend.emotion)) {
      recommendations.push(`Consider reaching out for support with ${trend.emotion}`);
      recommendations.push(`Practice self-care and stress management techniques`);
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const emotionalCompanionEngine = new EmotionalCompanionEngine();