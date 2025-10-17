// Local emotional analysis service for privacy-first emotion detection

import type { DiaryEntry, Emotion } from '../types';
import type { 
  EmotionalAnalysis,
  SentimentScore,
  ConcernLevel,
  EmotionalPatterns,
  EmotionalTrend,
  EmotionalTrigger,
  ResilienceMetrics,
  GrowthIndicators
} from '../types/emotional-companion';

// Emotion lexicon for local analysis
const EMOTION_LEXICON = {
  positive: {
    joy: ['happy', 'joyful', 'elated', 'cheerful', 'delighted', 'ecstatic', 'blissful', 'content', 'pleased', 'glad'],
    love: ['love', 'adore', 'cherish', 'affection', 'caring', 'devoted', 'passionate', 'romantic', 'tender', 'warm'],
    gratitude: ['grateful', 'thankful', 'appreciative', 'blessed', 'fortunate', 'lucky', 'indebted', 'obliged'],
    excitement: ['excited', 'thrilled', 'enthusiastic', 'eager', 'pumped', 'energized', 'animated', 'exhilarated'],
    peace: ['peaceful', 'calm', 'serene', 'tranquil', 'relaxed', 'centered', 'balanced', 'harmonious', 'zen'],
    pride: ['proud', 'accomplished', 'successful', 'achieved', 'triumphant', 'victorious', 'satisfied'],
    hope: ['hopeful', 'optimistic', 'confident', 'positive', 'encouraged', 'inspired', 'motivated', 'uplifted']
  },
  negative: {
    sadness: ['sad', 'depressed', 'melancholy', 'gloomy', 'downhearted', 'dejected', 'despondent', 'sorrowful', 'blue', 'low'],
    anger: ['angry', 'furious', 'mad', 'irritated', 'annoyed', 'frustrated', 'enraged', 'livid', 'irate', 'resentful'],
    anxiety: ['anxious', 'worried', 'nervous', 'stressed', 'panicked', 'fearful', 'apprehensive', 'uneasy', 'tense'],
    fear: ['afraid', 'scared', 'terrified', 'frightened', 'alarmed', 'intimidated', 'petrified', 'horrified'],
    guilt: ['guilty', 'ashamed', 'regretful', 'remorseful', 'sorry', 'apologetic', 'repentant', 'contrite'],
    loneliness: ['lonely', 'isolated', 'alone', 'abandoned', 'disconnected', 'excluded', 'rejected', 'solitary'],
    disappointment: ['disappointed', 'let down', 'disillusioned', 'discouraged', 'deflated', 'crushed']
  },
  neutral: {
    confusion: ['confused', 'puzzled', 'perplexed', 'bewildered', 'uncertain', 'unclear', 'mixed up'],
    curiosity: ['curious', 'interested', 'intrigued', 'wondering', 'questioning', 'inquisitive'],
    acceptance: ['accepting', 'resigned', 'okay', 'fine', 'neutral', 'indifferent', 'detached']
  }
};

// Crisis indicators for safety monitoring
const CRISIS_INDICATORS = {
  self_harm: ['hurt myself', 'self harm', 'cut myself', 'harm myself', 'self-harm', 'self injury'],
  suicidal: ['kill myself', 'end it all', 'suicide', 'suicidal', 'want to die', 'better off dead', 'not worth living'],
  severe_depression: ['can\'t go on', 'no point', 'hopeless', 'worthless', 'nothing matters', 'empty inside'],
  panic: ['can\'t breathe', 'heart racing', 'panic attack', 'losing control', 'going crazy'],
  substance: ['drinking too much', 'using drugs', 'getting high', 'need a drink', 'substance abuse']
};

// Positive indicators for growth tracking
const POSITIVE_INDICATORS = {
  coping: ['taking care of myself', 'self care', 'meditation', 'exercise', 'therapy', 'talking to friends'],
  growth: ['learning', 'growing', 'improving', 'progress', 'better than yesterday', 'moving forward'],
  resilience: ['bouncing back', 'overcoming', 'persevering', 'staying strong', 'getting through'],
  insight: ['realized', 'understanding', 'perspective', 'clarity', 'awareness', 'reflection']
};

export class LocalEmotionalAnalyzer {
  /**
   * Analyze a single diary entry for emotional content
   */
  async analyzeEntry(entry: DiaryEntry): Promise<EmotionalAnalysis> {
    const content = entry.content.toLowerCase();
    const words = this.tokenizeText(content);
    
    // Detect emotions using lexicon
    const detectedEmotions = this.detectEmotions(words, content);
    
    // Calculate sentiment scores
    const sentiment = this.calculateSentiment(words, content);
    
    // Identify themes and concerns
    const themes = this.extractThemes(content, words);
    const concerns = this.detectConcerns(content);
    const positiveIndicators = this.detectPositiveIndicators(content);
    const copingMechanisms = this.detectCopingMechanisms(content);
    
    // Calculate overall intensity
    const intensity = this.calculateIntensity(detectedEmotions, sentiment);
    
    return {
      id: `analysis-${entry.id}-${Date.now()}`,
      entryId: entry.id,
      primaryEmotions: detectedEmotions,
      sentiment,
      intensity,
      themes,
      concerns,
      positiveIndicators,
      copingMechanisms,
      analyzedAt: new Date(),
      confidence: this.calculateConfidence(detectedEmotions, content.length)
    };
  }

  /**
   * Detect emotional patterns across multiple entries
   */
  async detectEmotionalPatterns(entries: DiaryEntry[]): Promise<EmotionalPatterns> {
    const analyses = await Promise.all(entries.map(entry => this.analyzeEntry(entry)));
    
    const trends = this.calculateEmotionalTrends(analyses);
    const triggers = this.identifyEmotionalTriggers(analyses, entries);
    const resilience = this.calculateResilienceMetrics(analyses);
    const growth = this.assessGrowthIndicators(analyses);
    
    return {
      userId: 'current-user', // TODO: Get from user context
      trends,
      cycles: [], // TODO: Implement cycle detection
      triggers,
      resilience,
      growth,
      lastUpdated: new Date()
    };
  }

  /**
   * Tokenize text into words for analysis
   */
  private tokenizeText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  /**
   * Detect emotions using lexicon matching
   */
  private detectEmotions(_words: string[], content: string): Emotion[] {
    const emotionScores: Record<string, { count: number; intensity: number }> = {};
    
    // Check each emotion category
    Object.entries(EMOTION_LEXICON).forEach(([_category, emotions]) => {
      Object.entries(emotions).forEach(([emotion, keywords]) => {
        let count = 0;
        let totalIntensity = 0;
        
        keywords.forEach(keyword => {
          const matches = content.split(keyword).length - 1;
          if (matches > 0) {
            count += matches;
            // Calculate intensity based on context and modifiers
            totalIntensity += this.calculateKeywordIntensity(keyword, content) * matches;
          }
        });
        
        if (count > 0) {
          emotionScores[emotion] = {
            count,
            intensity: totalIntensity / count
          };
        }
      });
    });
    
    // Convert to Emotion objects and sort by relevance
    return Object.entries(emotionScores)
      .map(([name, data]) => ({
        id: `emotion-${name}-${Date.now()}`,
        name,
        intensity: Math.min(10, Math.round(data.intensity)),
        color: this.getEmotionColor(name),
        category: this.getEmotionCategory(name),
        custom: false
      }))
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 5); // Return top 5 emotions
  }

  /**
   * Calculate sentiment scores
   */
  private calculateSentiment(_words: string[], content: string): SentimentScore {
    let positiveScore = 0;
    let negativeScore = 0;
    let totalWords = 0;
    
    // Count positive and negative words
    Object.values(EMOTION_LEXICON.positive).flat().forEach(word => {
      const count = content.split(word).length - 1;
      positiveScore += count;
      totalWords += count;
    });
    
    Object.values(EMOTION_LEXICON.negative).flat().forEach(word => {
      const count = content.split(word).length - 1;
      negativeScore += count;
      totalWords += count;
    });
    
    const total = positiveScore + negativeScore;
    const positive = total > 0 ? positiveScore / total : 0;
    const negative = total > 0 ? negativeScore / total : 0;
    const neutral = 1 - positive - negative;
    const compound = positive - negative;
    
    return { positive, negative, neutral, compound };
  }

  /**
   * Extract themes from content
   */
  private extractThemes(content: string, _words: string[]): string[] {
    const themes: string[] = [];
    
    // Common life themes
    const themeKeywords = {
      work: ['work', 'job', 'career', 'office', 'boss', 'colleague', 'project', 'meeting'],
      relationships: ['friend', 'family', 'partner', 'relationship', 'love', 'dating', 'marriage'],
      health: ['health', 'doctor', 'exercise', 'diet', 'sleep', 'tired', 'energy', 'sick'],
      personal_growth: ['learning', 'growth', 'development', 'goal', 'achievement', 'progress'],
      creativity: ['creative', 'art', 'music', 'writing', 'painting', 'design', 'inspiration'],
      spirituality: ['spiritual', 'meditation', 'prayer', 'faith', 'meaning', 'purpose'],
      finance: ['money', 'financial', 'budget', 'savings', 'debt', 'income', 'expenses']
    };
    
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      const matches = keywords.filter(keyword => content.includes(keyword));
      if (matches.length >= 2) {
        themes.push(theme);
      }
    });
    
    return themes;
  }

  /**
   * Detect mental health concerns
   */
  private detectConcerns(content: string): ConcernLevel[] {
    const concerns: ConcernLevel[] = [];
    
    Object.entries(CRISIS_INDICATORS).forEach(([type, indicators]) => {
      const matches = indicators.filter(indicator => content.includes(indicator));
      if (matches.length > 0) {
        concerns.push({
          type: type as any,
          severity: matches.length > 2 ? 'high' : matches.length > 1 ? 'moderate' : 'low',
          indicators: matches,
          confidence: Math.min(0.9, matches.length * 0.3)
        });
      }
    });
    
    return concerns;
  }

  /**
   * Detect positive indicators
   */
  private detectPositiveIndicators(content: string): string[] {
    const indicators: string[] = [];
    
    Object.entries(POSITIVE_INDICATORS).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          indicators.push(`${category}: ${keyword}`);
        }
      });
    });
    
    return indicators;
  }

  /**
   * Detect coping mechanisms
   */
  private detectCopingMechanisms(content: string): string[] {
    const copingKeywords = [
      'meditation', 'exercise', 'therapy', 'talking to friends', 'journaling',
      'deep breathing', 'music', 'reading', 'walking', 'yoga', 'prayer',
      'self care', 'taking a break', 'getting help', 'seeking support'
    ];
    
    return copingKeywords.filter(keyword => content.includes(keyword));
  }

  /**
   * Calculate keyword intensity based on context
   */
  private calculateKeywordIntensity(keyword: string, content: string): number {
    let intensity = 5; // Base intensity
    
    // Check for intensity modifiers
    const intensifiers = ['very', 'extremely', 'incredibly', 'really', 'so', 'quite', 'absolutely'];
    const diminishers = ['slightly', 'somewhat', 'a bit', 'kind of', 'sort of', 'maybe'];
    
    const keywordIndex = content.indexOf(keyword);
    if (keywordIndex > -1) {
      const contextBefore = content.substring(Math.max(0, keywordIndex - 50), keywordIndex);
      const contextAfter = content.substring(keywordIndex, Math.min(content.length, keywordIndex + 50));
      const context = contextBefore + contextAfter;
      
      intensifiers.forEach(intensifier => {
        if (context.includes(intensifier)) intensity += 2;
      });
      
      diminishers.forEach(diminisher => {
        if (context.includes(diminisher)) intensity -= 2;
      });
    }
    
    return Math.max(1, Math.min(10, intensity));
  }

  /**
   * Calculate overall emotional intensity
   */
  private calculateIntensity(emotions: Emotion[], sentiment: SentimentScore): number {
    if (emotions.length === 0) return 0;
    
    const avgEmotionIntensity = emotions.reduce((sum, emotion) => sum + emotion.intensity, 0) / emotions.length;
    const sentimentIntensity = Math.abs(sentiment.compound) * 10;
    
    return Math.round((avgEmotionIntensity + sentimentIntensity) / 2);
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(emotions: Emotion[], contentLength: number): number {
    const emotionConfidence = emotions.length > 0 ? Math.min(1, emotions.length * 0.2) : 0;
    const lengthConfidence = Math.min(1, contentLength / 500); // More confident with longer content
    
    return (emotionConfidence + lengthConfidence) / 2;
  }

  /**
   * Get emotion color for visualization
   */
  private getEmotionColor(emotion: string): string {
    const colorMap: Record<string, string> = {
      joy: '#FFD700',
      love: '#FF69B4',
      gratitude: '#32CD32',
      excitement: '#FF4500',
      peace: '#87CEEB',
      pride: '#9370DB',
      hope: '#00CED1',
      sadness: '#4169E1',
      anger: '#DC143C',
      anxiety: '#FF6347',
      fear: '#8B0000',
      guilt: '#696969',
      loneliness: '#2F4F4F',
      disappointment: '#708090'
    };
    
    return colorMap[emotion] || '#808080';
  }

  /**
   * Get emotion category
   */
  private getEmotionCategory(emotion: string): 'positive' | 'negative' | 'neutral' {
    const positiveEmotions = Object.keys(EMOTION_LEXICON.positive);
    const negativeEmotions = Object.keys(EMOTION_LEXICON.negative);
    
    if (positiveEmotions.includes(emotion)) return 'positive';
    if (negativeEmotions.includes(emotion)) return 'negative';
    return 'neutral';
  }

  /**
   * Calculate emotional trends over time
   */
  private calculateEmotionalTrends(analyses: EmotionalAnalysis[]): EmotionalTrend[] {
    const emotionData: Record<string, Array<{ date: Date; value: number }>> = {};
    
    // Group emotions by type
    analyses.forEach(analysis => {
      analysis.primaryEmotions.forEach(emotion => {
        if (!emotionData[emotion.name]) {
          emotionData[emotion.name] = [];
        }
        emotionData[emotion.name].push({
          date: analysis.analyzedAt,
          value: emotion.intensity
        });
      });
    });
    
    // Calculate trends
    return Object.entries(emotionData).map(([emotion, dataPoints]) => {
      const sortedPoints = dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
      const direction = this.calculateTrendDirection(sortedPoints);
      const strength = this.calculateTrendStrength(sortedPoints);
      
      return {
        emotion,
        direction,
        strength,
        timeframe: 'weekly',
        dataPoints: sortedPoints
      };
    });
  }

  /**
   * Calculate trend direction
   */
  private calculateTrendDirection(dataPoints: Array<{ date: Date; value: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (dataPoints.length < 2) return 'stable';
    
    const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
    const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, point) => sum + point.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, point) => sum + point.value, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (Math.abs(difference) < 0.5) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Calculate trend strength
   */
  private calculateTrendStrength(dataPoints: Array<{ date: Date; value: number }>): number {
    if (dataPoints.length < 2) return 0;
    
    const values = dataPoints.map(point => point.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.min(1, variance / 10); // Normalize to 0-1 scale
  }

  /**
   * Identify emotional triggers
   */
  private identifyEmotionalTriggers(analyses: EmotionalAnalysis[], entries: DiaryEntry[]): EmotionalTrigger[] {
    const triggers: Record<string, EmotionalTrigger> = {};
    
    analyses.forEach((analysis, index) => {
      const entry = entries[index];
      if (!entry) return;
      
      analysis.themes.forEach(theme => {
        const negativeEmotions = analysis.primaryEmotions
          .filter(emotion => emotion.category === 'negative')
          .map(emotion => emotion.name);
        
        if (negativeEmotions.length > 0) {
          if (!triggers[theme]) {
            triggers[theme] = {
              trigger: theme,
              emotions: [],
              frequency: 0,
              intensity: 0,
              context: [],
              lastOccurrence: new Date()
            };
          }
          
          triggers[theme].emotions = [...new Set([...triggers[theme].emotions, ...negativeEmotions])];
          triggers[theme].frequency += 1;
          triggers[theme].intensity += analysis.intensity;
          triggers[theme].lastOccurrence = analysis.analyzedAt;
          
          if (!triggers[theme].context.includes(theme)) {
            triggers[theme].context.push(theme);
          }
        }
      });
    });
    
    // Calculate average intensity
    Object.values(triggers).forEach(trigger => {
      trigger.intensity = trigger.intensity / trigger.frequency;
    });
    
    return Object.values(triggers);
  }

  /**
   * Calculate resilience metrics
   */
  private calculateResilienceMetrics(analyses: EmotionalAnalysis[]): ResilienceMetrics {
    // Simple resilience calculation - can be enhanced
    const recoverySpeed = this.calculateRecoverySpeed(analyses);
    const copingEffectiveness = this.calculateCopingEffectiveness(analyses);
    const emotionalRange = this.calculateEmotionalRange(analyses);
    const stabilityScore = this.calculateStabilityScore(analyses);
    
    return {
      recoverySpeed,
      copingEffectiveness,
      emotionalRange,
      stabilityScore
    };
  }

  /**
   * Calculate recovery speed from negative emotions
   */
  private calculateRecoverySpeed(analyses: EmotionalAnalysis[]): number {
    // Simplified calculation - measures how quickly sentiment improves after negative periods
    let recoverySum = 0;
    let recoveryCount = 0;
    
    for (let i = 1; i < analyses.length; i++) {
      const prev = analyses[i - 1];
      const curr = analyses[i];
      
      if (prev.sentiment.compound < -0.3 && curr.sentiment.compound > prev.sentiment.compound) {
        recoverySum += curr.sentiment.compound - prev.sentiment.compound;
        recoveryCount++;
      }
    }
    
    return recoveryCount > 0 ? Math.min(10, (recoverySum / recoveryCount) * 10) : 5;
  }

  /**
   * Calculate coping effectiveness
   */
  private calculateCopingEffectiveness(analyses: EmotionalAnalysis[]): number {
    const copingAnalyses = analyses.filter(analysis => analysis.copingMechanisms.length > 0);
    if (copingAnalyses.length === 0) return 5;
    
    const avgSentiment = copingAnalyses.reduce((sum, analysis) => sum + analysis.sentiment.compound, 0) / copingAnalyses.length;
    return Math.max(0, Math.min(10, (avgSentiment + 1) * 5));
  }

  /**
   * Calculate emotional range
   */
  private calculateEmotionalRange(analyses: EmotionalAnalysis[]): number {
    const allEmotions = new Set();
    analyses.forEach(analysis => {
      analysis.primaryEmotions.forEach(emotion => allEmotions.add(emotion.name));
    });
    
    return Math.min(10, allEmotions.size);
  }

  /**
   * Calculate emotional stability
   */
  private calculateStabilityScore(analyses: EmotionalAnalysis[]): number {
    if (analyses.length < 2) return 5;
    
    const sentiments = analyses.map(analysis => analysis.sentiment.compound);
    const mean = sentiments.reduce((sum, val) => sum + val, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sentiments.length;
    
    // Lower variance = higher stability
    return Math.max(0, Math.min(10, 10 - variance * 5));
  }

  /**
   * Assess growth indicators
   */
  private assessGrowthIndicators(analyses: EmotionalAnalysis[]): GrowthIndicators {
    const selfAwareness = this.calculateSelfAwareness(analyses);
    const emotionalVocabulary = this.calculateEmotionalVocabulary(analyses);
    const copingSkills = this.calculateCopingSkills(analyses);
    const positivePatterns = this.identifyPositivePatterns(analyses);
    const areasForGrowth = this.identifyGrowthAreas(analyses);
    
    return {
      selfAwareness,
      emotionalVocabulary,
      copingSkills,
      positivePatterns,
      areasForGrowth
    };
  }

  /**
   * Calculate self-awareness score
   */
  private calculateSelfAwareness(analyses: EmotionalAnalysis[]): number {
    // Based on emotional complexity and insight indicators
    const insightCount = analyses.reduce((sum, analysis) => 
      sum + analysis.positiveIndicators.filter(indicator => indicator.includes('insight')).length, 0
    );
    
    const emotionalComplexity = analyses.reduce((sum, analysis) => 
      sum + analysis.primaryEmotions.length, 0
    ) / analyses.length;
    
    return Math.min(10, (insightCount + emotionalComplexity) * 2);
  }

  /**
   * Calculate emotional vocabulary score
   */
  private calculateEmotionalVocabulary(analyses: EmotionalAnalysis[]): number {
    const uniqueEmotions = new Set();
    analyses.forEach(analysis => {
      analysis.primaryEmotions.forEach(emotion => uniqueEmotions.add(emotion.name));
    });
    
    return Math.min(10, uniqueEmotions.size * 0.5);
  }

  /**
   * Calculate coping skills score
   */
  private calculateCopingSkills(analyses: EmotionalAnalysis[]): number {
    const copingMechanisms = new Set();
    analyses.forEach(analysis => {
      analysis.copingMechanisms.forEach(mechanism => copingMechanisms.add(mechanism));
    });
    
    return Math.min(10, copingMechanisms.size);
  }

  /**
   * Identify positive patterns
   */
  private identifyPositivePatterns(analyses: EmotionalAnalysis[]): string[] {
    const patterns: string[] = [];
    
    // Check for consistent positive indicators
    const positiveIndicatorCounts: Record<string, number> = {};
    analyses.forEach(analysis => {
      analysis.positiveIndicators.forEach(indicator => {
        positiveIndicatorCounts[indicator] = (positiveIndicatorCounts[indicator] || 0) + 1;
      });
    });
    
    Object.entries(positiveIndicatorCounts).forEach(([indicator, count]) => {
      if (count >= Math.max(2, analyses.length * 0.3)) {
        patterns.push(`Consistent ${indicator}`);
      }
    });
    
    return patterns;
  }

  /**
   * Identify areas for growth
   */
  private identifyGrowthAreas(analyses: EmotionalAnalysis[]): string[] {
    const areas: string[] = [];
    
    // Check for recurring concerns
    const concernCounts: Record<string, number> = {};
    analyses.forEach(analysis => {
      analysis.concerns.forEach(concern => {
        concernCounts[concern.type] = (concernCounts[concern.type] || 0) + 1;
      });
    });
    
    Object.entries(concernCounts).forEach(([concern, count]) => {
      if (count >= Math.max(2, analyses.length * 0.2)) {
        areas.push(`Managing ${concern}`);
      }
    });
    
    // Check for low coping mechanism usage
    const avgCopingMechanisms = analyses.reduce((sum, analysis) => 
      sum + analysis.copingMechanisms.length, 0
    ) / analyses.length;
    
    if (avgCopingMechanisms < 1) {
      areas.push('Developing coping strategies');
    }
    
    return areas;
  }
}

// Export singleton instance
export const localEmotionalAnalyzer = new LocalEmotionalAnalyzer();