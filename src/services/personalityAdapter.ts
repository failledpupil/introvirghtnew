// Personality adaptation system for AI emotional companion

import type {
  CompanionPreferences,
  UserFeedback,
  SupportPreference,
  TopicSensitivity,
  ConversationMessage,
  CompanionResponse,
  CommunicationStyle,
  EmpathyStyle,
  ResponseLength
} from '../types/emotional-companion';

import { emotionalStorageService } from './emotionalStorage';

export interface InteractionHistory {
  messages: ConversationMessage[];
  responses: CompanionResponse[];
  feedback: UserFeedback[];
  engagementMetrics: EngagementMetrics;
}

export interface EngagementMetrics {
  averageResponseTime: number;
  conversationLength: number;
  positiveReactions: number;
  negativeReactions: number;
  topicsEngaged: string[];
  preferredResponseTypes: string[];
}

export class PersonalityAdapter {
  private currentUserId = 'default-user';
  private learningRate = 0.1; // How quickly to adapt to new feedback
  private minInteractionsForLearning = 5; // Minimum interactions before adapting

  /**
   * Learn from user interactions and update preferences
   */
  async learnFromInteractions(
    interactions: InteractionHistory,
    currentPreferences: CompanionPreferences
  ): Promise<CompanionPreferences> {
    try {
      if (interactions.feedback.length < this.minInteractionsForLearning) {
        return currentPreferences; // Not enough data to learn from
      }

      let updatedPreferences = { ...currentPreferences };

      // Learn communication style preferences
      updatedPreferences = this.adaptCommunicationStyle(updatedPreferences, interactions);

      // Learn support preferences
      updatedPreferences = this.adaptSupportPreferences(updatedPreferences, interactions);

      // Learn response length preferences
      updatedPreferences = this.adaptResponseLength(updatedPreferences, interactions);

      // Learn empathy style preferences
      updatedPreferences = this.adaptEmpathyStyle(updatedPreferences, interactions);

      // Learn topic sensitivities
      updatedPreferences = this.adaptTopicSensitivities(updatedPreferences, interactions);

      // Update humor and directness levels
      updatedPreferences = this.adaptPersonalityTraits(updatedPreferences, interactions);

      return updatedPreferences;
    } catch (error) {
      console.error('Failed to learn from interactions:', error);
      return currentPreferences;
    }
  }

  /**
   * Adapt response style based on user preferences
   */
  adaptResponseStyle(
    baseResponse: string,
    preferences: CompanionPreferences,
    context?: any
  ): string {
    let adaptedResponse = baseResponse;

    // Adjust for communication style
    adaptedResponse = this.adjustForCommunicationStyle(adaptedResponse, preferences.communicationStyle);

    // Adjust for response length preference
    adaptedResponse = this.adjustForResponseLength(adaptedResponse, preferences.responseLength);

    // Adjust for directness level
    adaptedResponse = this.adjustForDirectness(adaptedResponse, preferences.directnessLevel);

    // Adjust for humor level
    adaptedResponse = this.adjustForHumor(adaptedResponse, preferences.humorLevel);

    return adaptedResponse;
  }

  /**
   * Update preferences based on explicit user feedback
   */
  async updatePreferencesFromFeedback(
    feedback: UserFeedback,
    currentPreferences: CompanionPreferences
  ): Promise<CompanionPreferences> {
    const updatedPreferences = { ...currentPreferences };

    // Update support preferences based on feedback
    if (feedback.categories.includes('tone')) {
      updatedPreferences.communicationStyle = this.adjustCommunicationStyleFromFeedback(
        updatedPreferences.communicationStyle,
        feedback
      );
    }

    if (feedback.categories.includes('length')) {
      updatedPreferences.responseLength = this.adjustResponseLengthFromFeedback(
        updatedPreferences.responseLength,
        feedback
      );
    }

    if (feedback.categories.includes('helpfulness')) {
      // Update support preferences based on what was helpful
      updatedPreferences.supportPreferences = this.updateSupportPreferencesFromFeedback(
        updatedPreferences.supportPreferences,
        feedback
      );
    }

    return updatedPreferences;
  }

  /**
   * Generate personalized greeting based on preferences and history
   */
  generatePersonalizedGreeting(
    preferences: CompanionPreferences,
    interactionHistory?: InteractionHistory
  ): string {
    const baseGreetings = {
      casual: [
        "Hey there! How's it going?",
        "Hi! What's on your mind today?",
        "Hello! How are you feeling right now?"
      ],
      formal: [
        "Good day. How may I assist you today?",
        "Hello. I'm here to support you. How are you doing?",
        "Greetings. What would you like to discuss today?"
      ],
      warm: [
        "Hello, friend! I'm so glad you're here. How are you feeling today?",
        "Hi there! It's wonderful to see you. What's been on your heart lately?",
        "Hello! I've been thinking about you. How has your day been treating you?"
      ],
      direct: [
        "Hi. What's going on with you today?",
        "Hello. What do you need to talk about?",
        "Hi there. How can I help you right now?"
      ],
      gentle: [
        "Hello, dear. I'm here for you. How are you feeling in this moment?",
        "Hi. I hope you're being kind to yourself today. What's on your mind?",
        "Hello. Take a deep breath. I'm here to listen. How are you?"
      ]
    };

    const greetings = baseGreetings[preferences.communicationStyle] || baseGreetings.warm;
    let greeting = greetings[Math.floor(Math.random() * greetings.length)];

    // Adjust based on response length preference
    if (preferences.responseLength === 'brief') {
      greeting = greeting.split('.')[0] + '.'; // Take first sentence only
    } else if (preferences.responseLength === 'detailed' && interactionHistory) {
      // Add personalized context for detailed responses
      if (interactionHistory.engagementMetrics.topicsEngaged.length > 0) {
        const lastTopic = interactionHistory.engagementMetrics.topicsEngaged.slice(-1)[0];
        greeting += ` I remember we were talking about ${lastTopic} last time.`;
      }
    }

    return greeting;
  }

  // Private helper methods for learning and adaptation

  private adaptCommunicationStyle(
    preferences: CompanionPreferences,
    interactions: InteractionHistory
  ): CompanionPreferences {
    const styleFeedback = interactions.feedback.filter(f => 
      f.categories.includes('tone') && f.helpful
    );

    if (styleFeedback.length === 0) return preferences;

    // Analyze which communication styles received positive feedback
    const styleScores = {
      casual: 0,
      formal: 0,
      warm: 0,
      direct: 0,
      gentle: 0
    };

    styleFeedback.forEach(feedback => {
      if (feedback.rating && feedback.rating >= 4) {
        // Infer style from feedback comment or response metadata
        const style = this.inferCommunicationStyleFromFeedback(feedback);
        if (style && styleScores.hasOwnProperty(style)) {
          styleScores[style as keyof typeof styleScores]++;
        }
      }
    });

    // Find the most positively received style
    const bestStyle = Object.entries(styleScores).reduce((a, b) => 
      styleScores[a[0] as keyof typeof styleScores] > styleScores[b[0] as keyof typeof styleScores] ? a : b
    )[0] as CommunicationStyle;

    // Gradually adapt towards the preferred style
    if (styleScores[bestStyle] > 0 && bestStyle !== preferences.communicationStyle) {
      preferences.communicationStyle = bestStyle;
    }

    return preferences;
  }

  private adaptSupportPreferences(
    preferences: CompanionPreferences,
    interactions: InteractionHistory
  ): CompanionPreferences {
    const supportFeedback = interactions.feedback.filter(f => 
      f.categories.includes('helpfulness')
    );

    supportFeedback.forEach(feedback => {
      const supportType = this.inferSupportTypeFromFeedback(feedback);
      if (supportType) {
        let existingPref = preferences.supportPreferences.find(p => p.type === supportType);
        
        if (!existingPref) {
          existingPref = {
            type: supportType,
            effectiveness: 5,
            frequency: 0,
            lastUsed: new Date(),
            userFeedback: []
          };
          preferences.supportPreferences.push(existingPref);
        }

        // Update effectiveness based on feedback
        const newEffectiveness = feedback.helpful ? 
          Math.min(10, existingPref.effectiveness + this.learningRate * 2) :
          Math.max(1, existingPref.effectiveness - this.learningRate * 2);

        existingPref.effectiveness = newEffectiveness;
        existingPref.userFeedback.push(feedback);
        existingPref.frequency++;
        existingPref.lastUsed = feedback.timestamp;
      }
    });

    return preferences;
  }

  private adaptResponseLength(
    preferences: CompanionPreferences,
    interactions: InteractionHistory
  ): CompanionPreferences {
    const lengthFeedback = interactions.feedback.filter(f => 
      f.categories.includes('length')
    );

    if (lengthFeedback.length === 0) return preferences;

    // Analyze feedback about response length
    let briefScore = 0;
    let moderateScore = 0;
    let detailedScore = 0;

    lengthFeedback.forEach(feedback => {
      if (feedback.helpful && feedback.rating && feedback.rating >= 4) {
        const inferredLength = this.inferResponseLengthFromFeedback(feedback);
        switch (inferredLength) {
          case 'brief': briefScore++; break;
          case 'moderate': moderateScore++; break;
          case 'detailed': detailedScore++; break;
        }
      }
    });

    // Update preference based on highest scoring length
    const scores = { brief: briefScore, moderate: moderateScore, detailed: detailedScore };
    const preferredLength = Object.entries(scores).reduce((a, b) => 
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
    )[0] as ResponseLength;

    if (scores[preferredLength] > 0) {
      preferences.responseLength = preferredLength;
    }

    return preferences;
  }

  private adaptEmpathyStyle(
    preferences: CompanionPreferences,
    interactions: InteractionHistory
  ): CompanionPreferences {
    const empathyFeedback = interactions.feedback.filter(f => 
      f.categories.includes('helpfulness') || f.categories.includes('tone')
    );

    if (empathyFeedback.length === 0) return preferences;

    // Analyze which empathy styles work best
    const styleScores = {
      validating: 0,
      solution_focused: 0,
      exploratory: 0,
      strength_based: 0
    };

    empathyFeedback.forEach(feedback => {
      if (feedback.helpful && feedback.rating && feedback.rating >= 4) {
        const style = this.inferEmpathyStyleFromFeedback(feedback);
        if (style && styleScores.hasOwnProperty(style)) {
          styleScores[style as keyof typeof styleScores]++;
        }
      }
    });

    const bestStyle = Object.entries(styleScores).reduce((a, b) => 
      styleScores[a[0] as keyof typeof styleScores] > styleScores[b[0] as keyof typeof styleScores] ? a : b
    )[0] as EmpathyStyle;

    if (styleScores[bestStyle] > 0) {
      preferences.empathyStyle = bestStyle;
    }

    return preferences;
  }

  private adaptTopicSensitivities(
    preferences: CompanionPreferences,
    interactions: InteractionHistory
  ): CompanionPreferences {
    const topicFeedback = interactions.feedback.filter(f => 
      !f.helpful && f.type === 'inappropriate'
    );

    topicFeedback.forEach(feedback => {
      const topic = this.extractTopicFromFeedback(feedback);
      if (topic) {
        let sensitivity = preferences.topicSensitivities.find(s => s.topic === topic);
        
        if (!sensitivity) {
          sensitivity = {
            topic,
            sensitivity: 'moderate',
            setAt: new Date()
          };
          preferences.topicSensitivities.push(sensitivity);
        }

        // Increase sensitivity level
        if (sensitivity.sensitivity === 'low') {
          sensitivity.sensitivity = 'moderate';
        } else if (sensitivity.sensitivity === 'moderate') {
          sensitivity.sensitivity = 'high';
        }
      }
    });

    return preferences;
  }

  private adaptPersonalityTraits(
    preferences: CompanionPreferences,
    interactions: InteractionHistory
  ): CompanionPreferences {
    const traitFeedback = interactions.feedback.filter(f => 
      f.categories.includes('tone')
    );

    traitFeedback.forEach(feedback => {
      if (feedback.comment) {
        const comment = feedback.comment.toLowerCase();
        
        // Adjust humor level
        if (comment.includes('funny') || comment.includes('humor')) {
          preferences.humorLevel = feedback.helpful ? 
            Math.min(10, preferences.humorLevel + 1) :
            Math.max(0, preferences.humorLevel - 1);
        }
        
        // Adjust directness level
        if (comment.includes('direct') || comment.includes('straight')) {
          preferences.directnessLevel = feedback.helpful ? 
            Math.min(10, preferences.directnessLevel + 1) :
            Math.max(0, preferences.directnessLevel - 1);
        }
      }
    });

    return preferences;
  }

  // Response adaptation methods

  private adjustForCommunicationStyle(response: string, style: CommunicationStyle): string {
    switch (style) {
      case 'casual':
        return response.replace(/\b(Hello|Good day)\b/g, 'Hey')
                      .replace(/\b(How are you)\b/g, 'How\'s it going');
      
      case 'formal':
        return response.replace(/\b(Hey|Hi)\b/g, 'Hello')
                      .replace(/contractions/g, 'full forms'); // Simplified
      
      case 'warm':
        return response + ' 💙'; // Add warmth indicator
      
      case 'direct':
        return response.split('.')[0] + '.'; // Keep it concise
      
      case 'gentle':
        return response.replace(/\b(you should|you need to)\b/g, 'you might consider');
      
      default:
        return response;
    }
  }

  private adjustForResponseLength(response: string, length: ResponseLength): string {
    switch (length) {
      case 'brief':
        return response.split('.').slice(0, 1).join('.') + '.';
      
      case 'detailed':
        return response + ' Would you like to explore this further?';
      
      default:
        return response;
    }
  }

  private adjustForDirectness(response: string, directnessLevel: number): string {
    if (directnessLevel > 7) {
      // More direct
      return response.replace(/might|perhaps|maybe/g, 'will')
                    .replace(/I think/g, 'I know');
    } else if (directnessLevel < 3) {
      // Less direct
      return response.replace(/will|should/g, 'might')
                    .replace(/I know/g, 'I think');
    }
    return response;
  }

  private adjustForHumor(response: string, humorLevel: number): string {
    if (humorLevel > 7) {
      // Add light humor (simplified)
      const humorPhrases = [' 😊', ' (in the best way!)', ' - life\'s funny like that'];
      return response + humorPhrases[Math.floor(Math.random() * humorPhrases.length)];
    }
    return response;
  }

  // Inference methods for learning

  private inferCommunicationStyleFromFeedback(feedback: UserFeedback): CommunicationStyle | null {
    if (!feedback.comment) return null;
    
    const comment = feedback.comment.toLowerCase();
    if (comment.includes('casual') || comment.includes('relaxed')) return 'casual';
    if (comment.includes('formal') || comment.includes('professional')) return 'formal';
    if (comment.includes('warm') || comment.includes('caring')) return 'warm';
    if (comment.includes('direct') || comment.includes('straight')) return 'direct';
    if (comment.includes('gentle') || comment.includes('soft')) return 'gentle';
    
    return null;
  }

  private inferSupportTypeFromFeedback(feedback: UserFeedback): any {
    if (!feedback.comment) return null;
    
    const comment = feedback.comment.toLowerCase();
    if (comment.includes('listen') || comment.includes('hear')) return 'emotional_support';
    if (comment.includes('advice') || comment.includes('guidance')) return 'practical_guidance';
    if (comment.includes('celebrate') || comment.includes('happy')) return 'celebration';
    if (comment.includes('reflect') || comment.includes('think')) return 'reflection_prompt';
    
    return 'emotional_support'; // Default
  }

  private inferResponseLengthFromFeedback(feedback: UserFeedback): ResponseLength {
    if (!feedback.comment) return 'moderate';
    
    const comment = feedback.comment.toLowerCase();
    if (comment.includes('short') || comment.includes('brief')) return 'brief';
    if (comment.includes('long') || comment.includes('detailed')) return 'detailed';
    
    return 'moderate';
  }

  private inferEmpathyStyleFromFeedback(feedback: UserFeedback): EmpathyStyle | null {
    if (!feedback.comment) return null;
    
    const comment = feedback.comment.toLowerCase();
    if (comment.includes('validate') || comment.includes('understand')) return 'validating';
    if (comment.includes('solution') || comment.includes('fix')) return 'solution_focused';
    if (comment.includes('explore') || comment.includes('deeper')) return 'exploratory';
    if (comment.includes('strength') || comment.includes('positive')) return 'strength_based';
    
    return null;
  }

  private extractTopicFromFeedback(feedback: UserFeedback): string | null {
    // Simplified topic extraction - in real implementation, 
    // this would use NLP to extract topics from feedback
    if (feedback.comment) {
      const sensitiveTopics = ['work', 'family', 'relationships', 'health', 'money'];
      const comment = feedback.comment.toLowerCase();
      
      for (const topic of sensitiveTopics) {
        if (comment.includes(topic)) {
          return topic;
        }
      }
    }
    return null;
  }

  private adjustCommunicationStyleFromFeedback(
    currentStyle: CommunicationStyle,
    feedback: UserFeedback
  ): CommunicationStyle {
    const inferredStyle = this.inferCommunicationStyleFromFeedback(feedback);
    return inferredStyle || currentStyle;
  }

  private adjustResponseLengthFromFeedback(
    currentLength: ResponseLength,
    feedback: UserFeedback
  ): ResponseLength {
    return this.inferResponseLengthFromFeedback(feedback);
  }

  private updateSupportPreferencesFromFeedback(
    currentPreferences: SupportPreference[],
    feedback: UserFeedback
  ): SupportPreference[] {
    const supportType = this.inferSupportTypeFromFeedback(feedback);
    if (!supportType) return currentPreferences;

    let pref = currentPreferences.find(p => p.type === supportType);
    if (!pref) {
      pref = {
        type: supportType,
        effectiveness: 5,
        frequency: 0,
        lastUsed: new Date(),
        userFeedback: []
      };
      currentPreferences.push(pref);
    }

    // Update effectiveness based on feedback
    pref.effectiveness = feedback.helpful ? 
      Math.min(10, pref.effectiveness + 1) :
      Math.max(1, pref.effectiveness - 1);
    
    pref.userFeedback.push(feedback);
    pref.frequency++;
    pref.lastUsed = feedback.timestamp;

    return currentPreferences;
  }
}

// Export singleton instance
export const personalityAdapter = new PersonalityAdapter();