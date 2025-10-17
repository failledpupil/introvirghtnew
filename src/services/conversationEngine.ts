// Conversation engine for AI emotional companion

import type {
  ConversationMessage,
  EmotionalContext,
  CompanionResponse,
  ConversationIntent,
  EmotionalPatterns,
  CompanionPreferences,
  SafetyFlag,
  SessionContext,
  ResponseMetadata,
  EmotionalTone,
  SupportType,
  PersonalizedElement,
  SafetyCheck
} from '../types/emotional-companion';

import { emotionalStorageService } from './emotionalStorage';
import { emotionalCompanionEngine } from './emotionalCompanionEngine';
import { aiContentService } from './aiContentService';

export class ConversationEngine {
  private currentUserId = 'default-user';
  private maxContextWindow = 10; // Number of recent messages to consider
  private sessionContexts = new Map<string, SessionContext>();

  /**
   * Generate a response to user message
   */
  async generateResponse(
    userMessage: string,
    conversationId: string,
    conversationHistory: ConversationMessage[] = []
  ): Promise<CompanionResponse> {
    try {
      const startTime = Date.now();
      
      // Build emotional context
      const emotionalContext = await this.buildEmotionalContext(
        userMessage,
        conversationHistory,
        conversationId
      );
      
      // Detect conversation intent
      const intent = await this.detectConversationIntent(userMessage);
      
      // Check for safety concerns
      const safetyCheck = await this.performSafetyCheck(userMessage, emotionalContext);
      
      // Generate appropriate response based on intent and context
      let response: CompanionResponse;
      
      if (safetyCheck.riskLevel === 'high' || safetyCheck.riskLevel === 'critical') {
        response = await this.generateCrisisResponse(userMessage, safetyCheck, emotionalContext);
      } else {
        response = await this.generateContextualResponse(userMessage, intent, emotionalContext);
      }
      
      // Add metadata
      response.personalizedElements = await this.addPersonalization(response, emotionalContext);
      
      const metadata: ResponseMetadata = {
        generationTime: Date.now() - startTime,
        confidence: response.confidenceLevel,
        responseType: this.getResponseType(intent, emotionalContext),
        supportStrategy: this.getSupportStrategy(intent, emotionalContext),
        fallbackUsed: false,
        personalizedElements: response.personalizedElements.map(p => p.type)
      };
      
      // Update session context
      this.updateSessionContext(conversationId, userMessage, response);
      
      return {
        ...response,
        safetyCheck: safetyCheck.riskLevel !== 'low' ? safetyCheck : undefined
      };
      
    } catch (error) {
      console.error('Failed to generate response:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  /**
   * Build emotional context from recent data
   */
  private async buildEmotionalContext(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    conversationId: string
  ): Promise<EmotionalContext> {
    try {
      // Get recent emotional patterns
      const patterns = await emotionalStorageService.getEmotionalPatterns(this.currentUserId);
      
      // Get user preferences
      const preferences = await emotionalCompanionEngine.getCompanionPreferences();
      
      // Get current mood from recent diary entries (simplified)
      const currentMood = await this.inferCurrentMood();
      
      // Get or create session context
      const sessionContext = this.getSessionContext(conversationId, userMessage);
      
      // Check for safety flags
      const safetyFlags = await this.checkForSafetyFlags(userMessage, conversationHistory);
      
      return {
        currentMood,
        recentPatterns: patterns || this.getDefaultPatterns(),
        conversationHistory: conversationHistory.slice(-this.maxContextWindow),
        userPreferences: preferences,
        safetyFlags,
        sessionContext
      };
      
    } catch (error) {
      console.error('Failed to build emotional context:', error);
      return this.getDefaultEmotionalContext(conversationId);
    }
  }

  /**
   * Detect conversation intent from user message
   */
  async detectConversationIntent(message: string): Promise<ConversationIntent> {
    const lowerMessage = message.toLowerCase();
    
    // Crisis detection patterns
    const crisisPatterns = [
      'help', 'crisis', 'emergency', 'suicide', 'hurt myself', 'end it all',
      'can\'t go on', 'want to die', 'kill myself'
    ];
    
    // Emotional support patterns
    const supportPatterns = [
      'feeling', 'sad', 'depressed', 'anxious', 'worried', 'scared',
      'angry', 'frustrated', 'lonely', 'overwhelmed', 'stressed'
    ];
    
    // Celebration patterns
    const celebrationPatterns = [
      'happy', 'excited', 'proud', 'accomplished', 'achieved', 'success',
      'good news', 'celebration', 'joy', 'grateful'
    ];
    
    // Reflection patterns
    const reflectionPatterns = [
      'thinking', 'wondering', 'confused', 'understand', 'realize',
      'reflection', 'insight', 'perspective', 'meaning'
    ];
    
    // Guidance patterns
    const guidancePatterns = [
      'what should', 'how do', 'advice', 'help me', 'guidance',
      'don\'t know', 'stuck', 'decision', 'choose'
    ];
    
    // Check patterns and assign confidence
    if (crisisPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return {
        primary: 'crisis_help',
        confidence: 0.9,
        entities: this.extractEntities(message, crisisPatterns)
      };
    }
    
    if (celebrationPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return {
        primary: 'celebration',
        confidence: 0.8,
        entities: this.extractEntities(message, celebrationPatterns)
      };
    }
    
    if (guidancePatterns.some(pattern => lowerMessage.includes(pattern))) {
      return {
        primary: 'guidance_request',
        confidence: 0.7,
        entities: this.extractEntities(message, guidancePatterns)
      };
    }
    
    if (supportPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return {
        primary: 'emotional_support',
        confidence: 0.8,
        entities: this.extractEntities(message, supportPatterns)
      };
    }
    
    if (reflectionPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return {
        primary: 'reflection',
        confidence: 0.6,
        entities: this.extractEntities(message, reflectionPatterns)
      };
    }
    
    // Default to casual chat
    return {
      primary: 'casual_chat',
      confidence: 0.5,
      entities: []
    };
  }

  /**
   * Generate contextual response based on intent and emotional context
   */
  private async generateContextualResponse(
    userMessage: string,
    intent: ConversationIntent,
    context: EmotionalContext
  ): Promise<CompanionResponse> {
    
    // Try AI-powered response first if available
    if (aiContentService.isAvailable()) {
      try {
        const aiResponse = await this.generateAIResponse(userMessage, intent, context);
        if (aiResponse) {
          return aiResponse;
        }
      } catch (error) {
        console.error('AI response generation failed, falling back to local responses:', error);
      }
    }
    
    // Fallback to local response generation
    switch (intent.primary) {
      case 'emotional_support':
        return this.generateEmotionalSupportResponse(userMessage, context);
      
      case 'celebration':
        return this.generateCelebrationResponse(userMessage, context);
      
      case 'guidance_request':
        return this.generateGuidanceResponse(userMessage, context);
      
      case 'reflection':
        return this.generateReflectionResponse(userMessage, context);
      
      case 'casual_chat':
      default:
        return this.generateCasualResponse(userMessage, context);
    }
  }

  /**
   * Generate emotional support response
   */
  private generateEmotionalSupportResponse(
    userMessage: string,
    context: EmotionalContext
  ): CompanionResponse {
    const supportResponses = [
      "I hear you, and I want you to know that what you're feeling is completely valid.",
      "It sounds like you're going through something difficult right now. I'm here to listen.",
      "Thank you for sharing that with me. It takes courage to express these feelings.",
      "I can sense that this is weighing on you. You don't have to carry this alone.",
      "Your feelings matter, and I'm glad you felt comfortable sharing them with me."
    ];
    
    const followUpQuestions = [
      "Can you tell me more about what's contributing to these feelings?",
      "How long have you been feeling this way?",
      "What usually helps you when you're going through tough times?",
      "Is there anything specific that triggered these feelings today?"
    ];
    
    const baseResponse = this.selectResponseBasedOnPreferences(
      supportResponses,
      context.userPreferences
    );
    
    return {
      message: baseResponse,
      tone: 'supportive',
      supportType: 'emotional_support',
      followUpSuggestions: this.selectFollowUps(followUpQuestions, context),
      resources: [],
      confidenceLevel: 0.8,
      personalizedElements: []
    };
  }

  /**
   * Generate celebration response
   */
  private generateCelebrationResponse(
    userMessage: string,
    context: EmotionalContext
  ): CompanionResponse {
    const celebrationResponses = [
      "That's wonderful! I'm so happy to hear about this positive moment in your life.",
      "What fantastic news! You should feel proud of yourself.",
      "I love hearing about the good things happening for you. This is worth celebrating!",
      "That's amazing! It's beautiful to see you experiencing joy.",
      "This is such great news! Thank you for sharing this happiness with me."
    ];
    
    const followUpQuestions = [
      "What does this achievement mean to you?",
      "How are you planning to celebrate?",
      "What contributed to this positive outcome?",
      "How does this make you feel about your journey?"
    ];
    
    const baseResponse = this.selectResponseBasedOnPreferences(
      celebrationResponses,
      context.userPreferences
    );
    
    return {
      message: baseResponse,
      tone: 'celebratory',
      supportType: 'celebration',
      followUpSuggestions: this.selectFollowUps(followUpQuestions, context),
      resources: [],
      confidenceLevel: 0.9,
      personalizedElements: []
    };
  }

  /**
   * Generate guidance response
   */
  private generateGuidanceResponse(
    userMessage: string,
    context: EmotionalContext
  ): CompanionResponse {
    const guidanceResponses = [
      "I can hear that you're looking for some direction. Let's explore this together.",
      "It sounds like you're at a crossroads. Sometimes talking through options can help clarify things.",
      "I appreciate you coming to me for guidance. Let's think through this step by step.",
      "Decision-making can be challenging. What aspects of this situation are you most uncertain about?",
      "I'm here to help you think through this. What feels most important to you right now?"
    ];
    
    const followUpQuestions = [
      "What options are you considering?",
      "What would your ideal outcome look like?",
      "What's holding you back from making a decision?",
      "What would you advise a friend in this situation?"
    ];
    
    const baseResponse = this.selectResponseBasedOnPreferences(
      guidanceResponses,
      context.userPreferences
    );
    
    return {
      message: baseResponse,
      tone: 'gentle',
      supportType: 'practical_guidance',
      followUpSuggestions: this.selectFollowUps(followUpQuestions, context),
      resources: [],
      confidenceLevel: 0.7,
      personalizedElements: []
    };
  }

  /**
   * Generate reflection response
   */
  private generateReflectionResponse(
    userMessage: string,
    context: EmotionalContext
  ): CompanionResponse {
    const reflectionResponses = [
      "It sounds like you're doing some deep thinking. Reflection is such a valuable practice.",
      "I appreciate you sharing your thoughts with me. What insights are emerging for you?",
      "It's wonderful that you're taking time to reflect. What's becoming clearer to you?",
      "Self-reflection shows real wisdom. What patterns are you noticing?",
      "Thank you for letting me into your thought process. What's resonating most with you?"
    ];
    
    const followUpQuestions = [
      "What new perspectives are you gaining?",
      "How has your understanding changed?",
      "What patterns are you starting to see?",
      "What would you like to explore further?"
    ];
    
    const baseResponse = this.selectResponseBasedOnPreferences(
      reflectionResponses,
      context.userPreferences
    );
    
    return {
      message: baseResponse,
      tone: 'reflective',
      supportType: 'reflection_prompt',
      followUpSuggestions: this.selectFollowUps(followUpQuestions, context),
      resources: [],
      confidenceLevel: 0.7,
      personalizedElements: []
    };
  }

  /**
   * Generate casual response
   */
  private generateCasualResponse(
    userMessage: string,
    context: EmotionalContext
  ): CompanionResponse {
    const casualResponses = [
      "Thanks for sharing that with me. How are you feeling about everything today?",
      "I'm glad you're here to chat. What's on your mind?",
      "It's nice to connect with you. How has your day been treating you?",
      "I appreciate you taking the time to talk with me. What would you like to explore?",
      "I'm here and listening. What's been going through your thoughts lately?"
    ];
    
    const followUpQuestions = [
      "What's been the highlight of your day?",
      "How are you taking care of yourself lately?",
      "What's been on your mind recently?",
      "Is there anything you'd like to talk through?"
    ];
    
    const baseResponse = this.selectResponseBasedOnPreferences(
      casualResponses,
      context.userPreferences
    );
    
    return {
      message: baseResponse,
      tone: 'warm',
      supportType: 'check_in',
      followUpSuggestions: this.selectFollowUps(followUpQuestions, context),
      resources: [],
      confidenceLevel: 0.6,
      personalizedElements: []
    };
  }

  /**
   * Generate AI-powered response using external service
   */
  private async generateAIResponse(
    userMessage: string,
    intent: ConversationIntent,
    context: EmotionalContext
  ): Promise<CompanionResponse | null> {
    try {
      // Build context for AI
      const emotionalContext = this.buildAIContext(context);
      const systemPrompt = this.buildSystemPrompt(intent, context);
      
      // Call AI service (this would be implemented in aiContentService)
      const aiResponse = await this.callExternalAI(systemPrompt, userMessage, emotionalContext);
      
      if (!aiResponse) return null;
      
      // Parse and format AI response
      return {
        message: aiResponse.message,
        tone: this.inferToneFromResponse(aiResponse.message, intent),
        supportType: this.mapIntentToSupportType(intent.primary),
        followUpSuggestions: aiResponse.followUpQuestions || [],
        resources: [],
        confidenceLevel: aiResponse.confidence || 0.8,
        personalizedElements: []
      };
    } catch (error) {
      console.error('AI response generation failed:', error);
      return null;
    }
  }

  /**
   * Generate crisis response
   */
  private async generateCrisisResponse(
    userMessage: string,
    safetyCheck: SafetyCheck,
    context: EmotionalContext
  ): Promise<CompanionResponse> {
    const crisisResponses = [
      "I'm really concerned about you right now, and I want you to know that you're not alone. Your life has value.",
      "Thank you for trusting me with these difficult feelings. I'm worried about your safety and want to help.",
      "I can hear how much pain you're in right now. Please know that there are people who want to help you through this.",
      "These feelings you're experiencing are temporary, even though they feel overwhelming right now. Let's get you some support."
    ];
    
    const response = crisisResponses[0]; // Use first response for crisis situations
    
    return {
      message: response,
      tone: 'concerned',
      supportType: 'crisis_intervention',
      followUpSuggestions: [
        "Would you like me to provide some crisis support resources?",
        "Can you tell me if you're in a safe place right now?",
        "Have you been able to talk to anyone else about these feelings?"
      ],
      resources: [],
      confidenceLevel: 0.95,
      personalizedElements: []
    };
  }

  /**
   * Perform safety check on user message
   */
  private async performSafetyCheck(
    message: string,
    context: EmotionalContext
  ): Promise<SafetyCheck> {
    const lowerMessage = message.toLowerCase();
    
    // Critical risk indicators
    const criticalIndicators = [
      'kill myself', 'suicide', 'end it all', 'want to die', 'better off dead'
    ];
    
    // High risk indicators
    const highRiskIndicators = [
      'hurt myself', 'self harm', 'can\'t go on', 'no point', 'hopeless'
    ];
    
    // Moderate risk indicators
    const moderateRiskIndicators = [
      'worthless', 'nothing matters', 'empty inside', 'losing control'
    ];
    
    let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    const indicators: any[] = [];
    
    // Check for critical risk
    criticalIndicators.forEach(indicator => {
      if (lowerMessage.includes(indicator)) {
        riskLevel = 'critical';
        indicators.push({
          type: 'suicidal_ideation',
          description: `Message contains: "${indicator}"`,
          severity: 10,
          confidence: 0.9
        });
      }
    });
    
    // Check for high risk
    if (riskLevel === 'low') {
      highRiskIndicators.forEach(indicator => {
        if (lowerMessage.includes(indicator)) {
          riskLevel = 'high';
          indicators.push({
            type: 'self_harm_risk',
            description: `Message contains: "${indicator}"`,
            severity: 8,
            confidence: 0.8
          });
        }
      });
    }
    
    // Check for moderate risk
    if (riskLevel === 'low') {
      moderateRiskIndicators.forEach(indicator => {
        if (lowerMessage.includes(indicator)) {
          riskLevel = 'moderate';
          indicators.push({
            type: 'severe_depression',
            description: `Message contains: "${indicator}"`,
            severity: 6,
            confidence: 0.7
          });
        }
      });
    }
    
    return {
      riskLevel,
      indicators,
      recommendedActions: this.getRecommendedActions(riskLevel),
      resources: riskLevel !== 'low' ? emotionalCompanionEngine.getCrisisResources() : [],
      followUpRequired: riskLevel !== 'low'
    };
  }

  // Helper methods
  
  private selectResponseBasedOnPreferences(
    responses: string[],
    preferences: CompanionPreferences
  ): string {
    // Simple selection based on response length preference
    if (preferences.responseLength === 'brief') {
      return responses.sort((a, b) => a.length - b.length)[0];
    } else if (preferences.responseLength === 'detailed') {
      return responses.sort((a, b) => b.length - a.length)[0];
    }
    
    // Default to middle option
    return responses[Math.floor(responses.length / 2)];
  }
  
  private selectFollowUps(questions: string[], context: EmotionalContext): string[] {
    // Return 2-3 follow-up questions based on preferences
    const count = context.userPreferences.responseLength === 'brief' ? 1 : 
                  context.userPreferences.responseLength === 'detailed' ? 3 : 2;
    
    return questions.slice(0, count);
  }
  
  private extractEntities(message: string, patterns: string[]): any[] {
    return patterns
      .filter(pattern => message.toLowerCase().includes(pattern))
      .map(pattern => ({
        type: 'keyword',
        value: pattern,
        confidence: 0.8
      }));
  }
  
  private getSessionContext(conversationId: string, userMessage: string): SessionContext {
    let session = this.sessionContexts.get(conversationId);
    
    if (!session) {
      session = {
        sessionId: conversationId,
        startTime: new Date(),
        messageCount: 0,
        topicsDiscussed: [],
        emotionalJourney: []
      };
      this.sessionContexts.set(conversationId, session);
    }
    
    session.messageCount++;
    return session;
  }
  
  private updateSessionContext(
    conversationId: string,
    userMessage: string,
    response: CompanionResponse
  ): void {
    const session = this.sessionContexts.get(conversationId);
    if (session) {
      // Add topics and emotional state
      if (response.supportType) {
        session.topicsDiscussed.push(response.supportType);
      }
      
      session.emotionalJourney.push({
        timestamp: new Date(),
        emotion: response.tone,
        intensity: response.confidenceLevel * 10
      });
    }
  }
  
  private async addPersonalization(
    response: CompanionResponse,
    context: EmotionalContext
  ): Promise<PersonalizedElement[]> {
    const elements: PersonalizedElement[] = [];
    
    // Add pattern references if available
    if (context.recentPatterns.trends.length > 0) {
      const trend = context.recentPatterns.trends[0];
      elements.push({
        type: 'pattern_reference',
        content: `I've noticed you've been experiencing ${trend.emotion} more recently`,
        confidence: 0.7
      });
    }
    
    // Add growth acknowledgment
    if (context.recentPatterns.growth.positivePatterns.length > 0) {
      const growth = context.recentPatterns.growth.positivePatterns[0];
      elements.push({
        type: 'growth_acknowledgment',
        content: `I've seen your growth in ${growth}`,
        confidence: 0.8
      });
    }
    
    return elements;
  }
  
  private async inferCurrentMood(): Promise<any[]> {
    // Simplified mood inference - in real implementation, 
    // this would analyze recent diary entries
    return [];
  }
  
  private async checkForSafetyFlags(
    message: string,
    history: ConversationMessage[]
  ): Promise<SafetyFlag[]> {
    // Simplified safety flag checking
    return [];
  }
  
  private getDefaultPatterns(): EmotionalPatterns {
    return {
      userId: this.currentUserId,
      trends: [],
      cycles: [],
      triggers: [],
      resilience: {
        recoverySpeed: 5,
        copingEffectiveness: 5,
        emotionalRange: 5,
        stabilityScore: 5
      },
      growth: {
        selfAwareness: 5,
        emotionalVocabulary: 5,
        copingSkills: 5,
        positivePatterns: [],
        areasForGrowth: []
      },
      lastUpdated: new Date()
    };
  }
  
  private getDefaultEmotionalContext(conversationId: string): EmotionalContext {
    return {
      currentMood: [],
      recentPatterns: this.getDefaultPatterns(),
      conversationHistory: [],
      userPreferences: {
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
      },
      safetyFlags: [],
      sessionContext: this.getSessionContext(conversationId, '')
    };
  }
  
  private getResponseType(intent: ConversationIntent, context: EmotionalContext): any {
    switch (intent.primary) {
      case 'emotional_support': return 'empathetic_listening';
      case 'celebration': return 'celebration';
      case 'guidance_request': return 'gentle_guidance';
      case 'reflection': return 'curiosity_question';
      case 'crisis_help': return 'crisis_support';
      default: return 'check_in';
    }
  }
  
  private getSupportStrategy(intent: ConversationIntent, context: EmotionalContext): any {
    switch (intent.primary) {
      case 'emotional_support': return 'emotional_validation';
      case 'celebration': return 'strength_based';
      case 'guidance_request': return 'solution_focused';
      case 'reflection': return 'mindfulness_based';
      case 'crisis_help': return 'crisis_intervention';
      default: return 'active_listening';
    }
  }
  
  private getRecommendedActions(riskLevel: string): string[] {
    switch (riskLevel) {
      case 'critical':
        return [
          'Contact emergency services immediately',
          'Provide crisis hotline numbers',
          'Encourage immediate professional help',
          'Stay with the person if possible'
        ];
      case 'high':
        return [
          'Provide crisis resources',
          'Encourage professional support',
          'Check in frequently',
          'Develop safety plan'
        ];
      case 'moderate':
        return [
          'Monitor closely',
          'Provide support resources',
          'Encourage self-care',
          'Suggest professional consultation'
        ];
      default:
        return [];
    }
  }
  
  // AI Integration Helper Methods
  
  private buildAIContext(context: EmotionalContext): string {
    const contextParts = [];
    
    // Add emotional patterns
    if (context.recentPatterns.trends.length > 0) {
      const trends = context.recentPatterns.trends.slice(0, 3)
        .map(t => `${t.emotion} trending ${t.direction}`)
        .join(', ');
      contextParts.push(`Recent emotional trends: ${trends}`);
    }
    
    // Add current mood
    if (context.currentMood.length > 0) {
      const moods = context.currentMood.map(m => m.name).join(', ');
      contextParts.push(`Current mood: ${moods}`);
    }
    
    // Add conversation history
    if (context.conversationHistory.length > 0) {
      const recentMessages = context.conversationHistory.slice(-3)
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');
      contextParts.push(`Recent conversation:\n${recentMessages}`);
    }
    
    return contextParts.join('\n\n');
  }
  
  private buildSystemPrompt(intent: ConversationIntent, context: EmotionalContext): string {
    const basePrompt = `You are Alex, a caring AI emotional companion. You provide empathetic, supportive responses that help users process their emotions and feel heard.

Key principles:
- Be warm, genuine, and non-judgmental
- Validate emotions without trying to "fix" everything
- Ask thoughtful follow-up questions
- Offer gentle guidance when appropriate
- Keep responses conversational and human-like
- Adapt your communication style to the user's preferences

User's communication preferences:
- Style: ${context.userPreferences.communicationStyle}
- Response length: ${context.userPreferences.responseLength}
- Empathy style: ${context.userPreferences.empathyStyle}`;

    // Add intent-specific guidance
    const intentGuidance = {
      emotional_support: "Focus on validation and emotional support. Help the user feel heard and understood.",
      celebration: "Share in their joy and help them reflect on positive experiences and growth.",
      guidance_request: "Provide gentle guidance while encouraging the user to find their own answers.",
      reflection: "Ask thoughtful questions that encourage deeper self-reflection and insight.",
      casual_chat: "Engage in warm, friendly conversation while staying attuned to emotional undertones.",
      crisis_help: "Prioritize safety and provide immediate support resources while maintaining a caring tone."
    };
    
    return `${basePrompt}\n\nCurrent situation: ${intentGuidance[intent.primary] || intentGuidance.casual_chat}`;
  }
  
  private async callExternalAI(systemPrompt: string, userMessage: string, context: string): Promise<any> {
    // This would integrate with the actual AI service
    // For now, return null to use fallback responses
    return null;
    
    /* Example implementation:
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Context: ${context}\n\nMessage: ${userMessage}` }
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });
    
    const data = await response.json();
    return {
      message: data.choices[0]?.message?.content || '',
      confidence: 0.8,
      followUpQuestions: [] // Could be extracted from response
    };
    */
  }
  
  private inferToneFromResponse(message: string, intent: ConversationIntent): EmotionalTone {
    // Simple tone inference based on intent and message content
    if (intent.primary === 'celebration') return 'celebratory';
    if (intent.primary === 'crisis_help') return 'concerned';
    if (intent.primary === 'reflection') return 'reflective';
    if (message.includes('!') || message.includes('wonderful') || message.includes('amazing')) return 'encouraging';
    return 'warm';
  }
  
  private mapIntentToSupportType(intent: string): SupportType {
    const mapping: Record<string, SupportType> = {
      'emotional_support': 'emotional_support',
      'celebration': 'celebration',
      'guidance_request': 'practical_guidance',
      'reflection': 'reflection_prompt',
      'crisis_help': 'crisis_intervention',
      'casual_chat': 'check_in'
    };
    
    return mapping[intent] || 'emotional_support';
  }

  private getFallbackResponse(userMessage: string): CompanionResponse {
    return {
      message: "I'm here to listen and support you. Sometimes I might not have the perfect response, but I care about what you're going through. Can you tell me more about how you're feeling?",
      tone: 'supportive',
      supportType: 'emotional_support',
      followUpSuggestions: [
        "How are you feeling right now?",
        "What's been on your mind lately?"
      ],
      resources: [],
      confidenceLevel: 0.5,
      personalizedElements: []
    };
  }
}

// Export singleton instance
export const conversationEngine = new ConversationEngine();