// Crisis detection and safety system for AI emotional companion

import type {
  SafetyFlag,
  SafetyFlagType,
  RiskAssessment,
  RiskLevel,
  RiskIndicator,
  SafetyResponse,
  CrisisResource,
  EmotionalAnalysis,
  ConversationMessage,
  SafetyCheck
} from '../types/emotional-companion';

export interface CrisisIndicators {
  suicidalIdeation: string[];
  selfHarm: string[];
  severeDepression: string[];
  panicAttack: string[];
  substanceAbuse: string[];
  eatingDisorder: string[];
  domesticViolence: string[];
  psychosis: string[];
}

export interface RiskFactors {
  immediate: string[];
  elevated: string[];
  moderate: string[];
  protective: string[];
}

export class CrisisDetectionSystem {
  private crisisIndicators: CrisisIndicators = {
    suicidalIdeation: [
      'kill myself', 'suicide', 'suicidal', 'end it all', 'want to die',
      'better off dead', 'not worth living', 'end my life', 'take my own life',
      'no reason to live', 'world without me', 'permanent solution',
      'everyone would be better', 'burden to everyone', 'plan to die'
    ],
    selfHarm: [
      'hurt myself', 'self harm', 'self-harm', 'cut myself', 'cutting',
      'burn myself', 'self injury', 'self-injury', 'harm myself',
      'punish myself', 'deserve pain', 'cutting again', 'razor blade',
      'self mutilation', 'hurt my body'
    ],
    severeDepression: [
      'can\'t go on', 'no point', 'hopeless', 'worthless', 'nothing matters',
      'empty inside', 'numb', 'can\'t feel anything', 'lost all hope',
      'no future', 'meaningless', 'pointless', 'can\'t cope', 'giving up',
      'too tired to live', 'exhausted by life'
    ],
    panicAttack: [
      'can\'t breathe', 'heart racing', 'panic attack', 'losing control',
      'going crazy', 'chest tight', 'hyperventilating', 'dizzy',
      'feel like dying', 'terror', 'overwhelming fear', 'can\'t calm down'
    ],
    substanceAbuse: [
      'drinking too much', 'using drugs', 'getting high', 'need a drink',
      'substance abuse', 'addiction', 'can\'t stop drinking', 'overdose',
      'pills to cope', 'numbing the pain', 'escape reality'
    ],
    eatingDisorder: [
      'starving myself', 'binge eating', 'purging', 'hate my body',
      'fat and disgusting', 'restrict calories', 'eating disorder',
      'throwing up food', 'laxatives', 'obsessed with weight'
    ],
    domesticViolence: [
      'partner hits me', 'afraid of him', 'domestic violence', 'abusive relationship',
      'threatens me', 'controls everything', 'isolates me', 'physical abuse',
      'emotional abuse', 'scared to leave'
    ],
    psychosis: [
      'hearing voices', 'seeing things', 'not real', 'hallucinations',
      'delusions', 'paranoid', 'conspiracy', 'people watching me',
      'losing my mind', 'reality distorted'
    ]
  };

  private riskFactors: RiskFactors = {
    immediate: [
      'plan to', 'tonight', 'today', 'right now', 'this moment',
      'have the means', 'pills ready', 'rope', 'gun', 'bridge'
    ],
    elevated: [
      'this week', 'soon', 'can\'t take much more', 'last straw',
      'final decision', 'made up my mind', 'no other way'
    ],
    moderate: [
      'thinking about', 'considering', 'wondering if', 'maybe',
      'sometimes think', 'cross my mind'
    ],
    protective: [
      'but I won\'t', 'family needs me', 'getting help', 'therapy',
      'medication helping', 'support system', 'reasons to live',
      'hope things improve', 'working on it'
    ]
  };

  /**
   * Assess risk level from emotional analysis and conversation context
   */
  assessRiskLevel(
    emotionalAnalysis: EmotionalAnalysis,
    conversationContext: ConversationMessage[]
  ): RiskAssessment {
    const indicators: RiskIndicator[] = [];
    let highestRisk: RiskLevel = 'low';

    // Analyze emotional analysis for risk indicators
    const analysisRisk = this.analyzeEmotionalContent(emotionalAnalysis);
    indicators.push(...analysisRisk.indicators);
    if (this.getRiskLevelValue(analysisRisk.level) > this.getRiskLevelValue(highestRisk)) {
      highestRisk = analysisRisk.level;
    }

    // Analyze conversation messages for risk indicators
    const conversationRisk = this.analyzeConversationContent(conversationContext);
    indicators.push(...conversationRisk.indicators);
    if (this.getRiskLevelValue(conversationRisk.level) > this.getRiskLevelValue(highestRisk)) {
      highestRisk = conversationRisk.level;
    }

    // Check for temporal urgency indicators
    const urgencyRisk = this.assessTemporalUrgency(conversationContext);
    if (urgencyRisk && this.getRiskLevelValue(urgencyRisk) > this.getRiskLevelValue(highestRisk)) {
      highestRisk = urgencyRisk;
    }

    // Check for protective factors
    const protectiveFactors = this.identifyProtectiveFactors(conversationContext);
    if (protectiveFactors.length > 0 && highestRisk !== 'critical') {
      // Reduce risk level if strong protective factors are present
      highestRisk = this.adjustRiskForProtectiveFactors(highestRisk, protectiveFactors);
    }

    return {
      level: highestRisk,
      indicators,
      immediateActions: this.getImmediateActions(highestRisk),
      monitoringRecommendations: this.getMonitoringRecommendations(highestRisk)
    };
  }

  /**
   * Generate safety response based on risk level
   */
  generateSafetyResponse(riskLevel: RiskLevel): SafetyResponse {
    const responses = {
      critical: {
        message: "I'm very concerned about your safety right now. You mentioned some thoughts that worry me deeply. Your life has value, and there are people who want to help you through this crisis. Please reach out to emergency services or a crisis hotline immediately.",
        resources: this.getCrisisResources('critical'),
        followUpActions: [
          "Contact emergency services (911) if you're in immediate danger",
          "Call the National Suicide Prevention Lifeline at 988",
          "Go to your nearest emergency room",
          "Stay with a trusted friend or family member"
        ],
        escalationTriggers: [
          "If you have a specific plan to harm yourself",
          "If you have access to means of self-harm",
          "If you feel you cannot keep yourself safe"
        ]
      },
      high: {
        message: "I'm concerned about some of the things you've shared. It sounds like you're going through an incredibly difficult time. Please know that you don't have to face this alone, and there are people trained to help you through this.",
        resources: this.getCrisisResources('high'),
        followUpActions: [
          "Consider calling a crisis hotline to talk with someone",
          "Reach out to a trusted friend, family member, or therapist",
          "Remove any means of self-harm from your immediate environment",
          "Create a safety plan with specific coping strategies"
        ],
        escalationTriggers: [
          "If thoughts of self-harm become more frequent or intense",
          "If you start making specific plans",
          "If you feel unable to cope or stay safe"
        ]
      },
      moderate: {
        message: "I can hear that you're struggling right now. It's important to take these feelings seriously and reach out for support. You deserve care and help during this difficult time.",
        resources: this.getCrisisResources('moderate'),
        followUpActions: [
          "Consider speaking with a mental health professional",
          "Reach out to supportive friends or family",
          "Practice self-care and stress management techniques",
          "Monitor your mood and seek help if it worsens"
        ],
        escalationTriggers: [
          "If your mood continues to decline",
          "If you start having thoughts of self-harm",
          "If you feel overwhelmed and unable to cope"
        ]
      },
      low: {
        message: "I'm here to support you through whatever you're experiencing. It's okay to have difficult emotions, and I'm glad you're sharing them with me.",
        resources: [],
        followUpActions: [
          "Continue practicing self-care",
          "Stay connected with supportive people",
          "Consider journaling or other healthy coping strategies"
        ],
        escalationTriggers: []
      }
    };

    return responses[riskLevel];
  }

  /**
   * Provide crisis resources based on location and specialization
   */
  provideCrisisResources(userLocation?: string): CrisisResource[] {
    return this.getCrisisResources('high', userLocation);
  }

  /**
   * Check if escalation is needed based on risk assessment
   */
  escalateIfNeeded(riskAssessment: RiskAssessment): { shouldEscalate: boolean; reason: string } {
    if (riskAssessment.level === 'critical') {
      return {
        shouldEscalate: true,
        reason: 'Critical risk level detected - immediate intervention required'
      };
    }

    if (riskAssessment.level === 'high') {
      const suicidalIndicators = riskAssessment.indicators.filter(i => 
        i.type.includes('suicidal') || i.type.includes('self_harm')
      );
      
      if (suicidalIndicators.length > 0) {
        return {
          shouldEscalate: true,
          reason: 'High risk with suicidal indicators detected'
        };
      }
    }

    return { shouldEscalate: false, reason: '' };
  }

  /**
   * Create safety flags from risk assessment
   */
  createSafetyFlags(riskAssessment: RiskAssessment): SafetyFlag[] {
    const flags: SafetyFlag[] = [];

    riskAssessment.indicators.forEach(indicator => {
      const flagType = this.mapIndicatorToFlagType(indicator.type);
      if (flagType) {
        flags.push({
          type: flagType,
          severity: this.mapRiskLevelToSeverity(riskAssessment.level),
          indicators: [indicator.description],
          detectedAt: new Date(),
          resolved: false
        });
      }
    });

    return flags;
  }

  // Private helper methods

  private analyzeEmotionalContent(analysis: EmotionalAnalysis): { level: RiskLevel; indicators: RiskIndicator[] } {
    const indicators: RiskIndicator[] = [];
    let riskLevel: RiskLevel = 'low';

    // Check concerns from emotional analysis
    analysis.concerns.forEach(concern => {
      if (concern.severity === 'critical' || concern.severity === 'high') {
        indicators.push({
          type: concern.type,
          description: `High concern detected: ${concern.type}`,
          severity: concern.severity === 'critical' ? 10 : 8,
          confidence: concern.confidence
        });

        if (concern.severity === 'critical') {
          riskLevel = 'critical';
        } else if (riskLevel !== 'critical' && concern.severity === 'high') {
          riskLevel = 'high';
        }
      }
    });

    // Check sentiment for severe negativity
    if (analysis.sentiment.compound < -0.8 && analysis.intensity > 8) {
      indicators.push({
        type: 'severe_negative_sentiment',
        description: 'Extremely negative emotional state detected',
        severity: 7,
        confidence: 0.8
      });

      if (riskLevel === 'low') {
        riskLevel = 'moderate';
      }
    }

    return { level: riskLevel, indicators };
  }

  private analyzeConversationContent(messages: ConversationMessage[]): { level: RiskLevel; indicators: RiskIndicator[] } {
    const indicators: RiskIndicator[] = [];
    let riskLevel: RiskLevel = 'low';

    // Analyze recent user messages
    const userMessages = messages
      .filter(m => m.role === 'user')
      .slice(-5) // Check last 5 user messages
      .map(m => m.content.toLowerCase());

    const allContent = userMessages.join(' ');

    // Check for crisis indicators
    Object.entries(this.crisisIndicators).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (allContent.includes(keyword.toLowerCase())) {
          const severity = this.getCrisisIndicatorSeverity(category as keyof CrisisIndicators, keyword);
          
          indicators.push({
            type: category,
            description: `Crisis indicator detected: "${keyword}"`,
            severity,
            confidence: 0.9
          });

          const indicatorRisk = this.mapSeverityToRiskLevel(severity);
          if (this.getRiskLevelValue(indicatorRisk) > this.getRiskLevelValue(riskLevel)) {
            riskLevel = indicatorRisk;
          }
        }
      });
    });

    return { level: riskLevel, indicators };
  }

  private assessTemporalUrgency(messages: ConversationMessage[]): RiskLevel | null {
    const recentContent = messages
      .filter(m => m.role === 'user')
      .slice(-3)
      .map(m => m.content.toLowerCase())
      .join(' ');

    // Check for immediate risk factors
    const immediateMatches = this.riskFactors.immediate.filter(factor => 
      recentContent.includes(factor.toLowerCase())
    );

    if (immediateMatches.length > 0) {
      return 'critical';
    }

    // Check for elevated risk factors
    const elevatedMatches = this.riskFactors.elevated.filter(factor => 
      recentContent.includes(factor.toLowerCase())
    );

    if (elevatedMatches.length > 0) {
      return 'high';
    }

    return null;
  }

  private identifyProtectiveFactors(messages: ConversationMessage[]): string[] {
    const recentContent = messages
      .filter(m => m.role === 'user')
      .slice(-5)
      .map(m => m.content.toLowerCase())
      .join(' ');

    return this.riskFactors.protective.filter(factor => 
      recentContent.includes(factor.toLowerCase())
    );
  }

  private adjustRiskForProtectiveFactors(currentRisk: RiskLevel, protectiveFactors: string[]): RiskLevel {
    if (protectiveFactors.length >= 2) {
      // Strong protective factors present
      switch (currentRisk) {
        case 'high': return 'moderate';
        case 'moderate': return 'low';
        default: return currentRisk;
      }
    }
    return currentRisk;
  }

  private getCrisisIndicatorSeverity(category: keyof CrisisIndicators, keyword: string): number {
    const severityMap = {
      suicidalIdeation: 10,
      selfHarm: 9,
      severeDepression: 7,
      panicAttack: 6,
      substanceAbuse: 6,
      eatingDisorder: 6,
      domesticViolence: 8,
      psychosis: 8
    };

    return severityMap[category] || 5;
  }

  private mapSeverityToRiskLevel(severity: number): RiskLevel {
    if (severity >= 9) return 'critical';
    if (severity >= 7) return 'high';
    if (severity >= 5) return 'moderate';
    return 'low';
  }

  private getRiskLevelValue(level: RiskLevel): number {
    const values = { low: 1, moderate: 2, high: 3, critical: 4 };
    return values[level];
  }

  private mapIndicatorToFlagType(indicatorType: string): SafetyFlagType | null {
    const mapping: Record<string, SafetyFlagType> = {
      'suicidalIdeation': 'suicidal_ideation',
      'selfHarm': 'self_harm_risk',
      'severeDepression': 'severe_depression',
      'panicAttack': 'panic_attack',
      'substanceAbuse': 'substance_abuse',
      'eatingDisorder': 'eating_disorder',
      'domesticViolence': 'domestic_violence',
      'psychosis': 'other_crisis'
    };

    return mapping[indicatorType] || null;
  }

  private mapRiskLevelToSeverity(riskLevel: RiskLevel): 'low' | 'moderate' | 'high' | 'critical' {
    return riskLevel;
  }

  private getImmediateActions(riskLevel: RiskLevel): string[] {
    const actions = {
      critical: [
        "Contact emergency services (911) immediately",
        "Call National Suicide Prevention Lifeline (988)",
        "Go to nearest emergency room",
        "Remove means of self-harm",
        "Stay with trusted person"
      ],
      high: [
        "Call crisis hotline for immediate support",
        "Contact mental health professional",
        "Reach out to trusted friend/family",
        "Create safety plan",
        "Remove potential means of harm"
      ],
      moderate: [
        "Schedule appointment with mental health professional",
        "Increase social support",
        "Practice coping strategies",
        "Monitor mood closely"
      ],
      low: [
        "Continue self-care practices",
        "Maintain social connections",
        "Use healthy coping strategies"
      ]
    };

    return actions[riskLevel];
  }

  private getMonitoringRecommendations(riskLevel: RiskLevel): string[] {
    const recommendations = {
      critical: [
        "Continuous supervision required",
        "Immediate professional intervention",
        "Safety plan implementation",
        "Follow-up within 24 hours"
      ],
      high: [
        "Daily check-ins recommended",
        "Professional assessment within 48 hours",
        "Safety planning session",
        "Increased support system activation"
      ],
      moderate: [
        "Regular check-ins (2-3 times per week)",
        "Professional consultation recommended",
        "Mood monitoring",
        "Coping strategy review"
      ],
      low: [
        "Weekly check-ins",
        "Continue current support",
        "Self-monitoring encouraged"
      ]
    };

    return recommendations[riskLevel];
  }

  private getCrisisResources(riskLevel: string, location?: string): CrisisResource[] {
    const resources: CrisisResource[] = [
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
      },
      {
        type: 'emergency',
        name: 'Emergency Services',
        contact: '911',
        availability: '24/7',
        specialization: ['emergency response', 'immediate crisis'],
        language: ['English'],
        description: 'Emergency services for immediate life-threatening situations',
        priority: 10
      }
    ];

    // Filter and sort by priority based on risk level
    if (riskLevel === 'critical') {
      return resources.filter(r => r.priority >= 9).sort((a, b) => b.priority - a.priority);
    } else if (riskLevel === 'high') {
      return resources.filter(r => r.priority >= 8).sort((a, b) => b.priority - a.priority);
    } else {
      return resources.filter(r => r.priority >= 7).sort((a, b) => b.priority - a.priority);
    }
  }
}

// Export singleton instance
export const crisisDetectionSystem = new CrisisDetectionSystem();