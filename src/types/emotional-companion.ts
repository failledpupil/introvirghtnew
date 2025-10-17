// Core types for AI Emotional Companion feature

import type { DiaryEntry, Emotion } from './index';

// Emotional Analysis Types
export interface EmotionalAnalysis {
  id: string;
  entryId: string;
  primaryEmotions: Emotion[];
  sentiment: SentimentScore;
  intensity: number; // 0-10 scale
  themes: string[];
  concerns: ConcernLevel[];
  positiveIndicators: string[];
  copingMechanisms: string[];
  analyzedAt: Date;
  confidence: number; // 0-1 scale
}

export interface SentimentScore {
  positive: number; // 0-1 scale
  negative: number; // 0-1 scale
  neutral: number; // 0-1 scale
  compound: number; // -1 to 1 scale
}

export interface ConcernLevel {
  type: 'anxiety' | 'depression' | 'stress' | 'isolation' | 'crisis' | 'other';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  indicators: string[];
  confidence: number;
}

// Emotional Pattern Types
export interface EmotionalPatterns {
  userId: string;
  trends: EmotionalTrend[];
  cycles: EmotionalCycle[];
  triggers: EmotionalTrigger[];
  resilience: ResilienceMetrics;
  growth: GrowthIndicators;
  lastUpdated: Date;
}

export interface EmotionalTrend {
  emotion: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: number; // 0-1 scale
  timeframe: 'daily' | 'weekly' | 'monthly';
  dataPoints: Array<{ date: Date; value: number }>;
}

export interface EmotionalCycle {
  pattern: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  strength: number;
  predictedNext: Date;
  description: string;
}

export interface EmotionalTrigger {
  trigger: string;
  emotions: string[];
  frequency: number;
  intensity: number;
  context: string[];
  lastOccurrence: Date;
}

export interface ResilienceMetrics {
  recoverySpeed: number; // How quickly user bounces back from negative emotions
  copingEffectiveness: number; // How well coping strategies work
  emotionalRange: number; // Breadth of emotional expression
  stabilityScore: number; // Overall emotional stability
}

export interface GrowthIndicators {
  selfAwareness: number;
  emotionalVocabulary: number;
  copingSkills: number;
  positivePatterns: string[];
  areasForGrowth: string[];
}

// Conversation Types
export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'companion';
  content: string;
  timestamp: Date;
  emotionalContext?: EmotionalContext;
  responseMetadata?: ResponseMetadata;
  edited?: boolean;
  editedAt?: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  messages: ConversationMessage[];
  startedAt: Date;
  lastMessageAt: Date;
  emotionalSummary?: EmotionalSummary;
  tags: string[];
  archived: boolean;
}

export interface EmotionalContext {
  currentMood: Emotion[];
  recentPatterns: EmotionalPatterns;
  conversationHistory: ConversationMessage[];
  userPreferences: CompanionPreferences;
  safetyFlags: SafetyFlag[];
  sessionContext: SessionContext;
}

export interface SessionContext {
  sessionId: string;
  startTime: Date;
  messageCount: number;
  topicsDiscussed: string[];
  emotionalJourney: Array<{ timestamp: Date; emotion: string; intensity: number }>;
}

export interface ResponseMetadata {
  generationTime: number;
  confidence: number;
  responseType: ResponseType;
  supportStrategy: SupportStrategy;
  fallbackUsed: boolean;
  personalizedElements: string[];
}

export type ResponseType = 
  | 'empathetic_listening'
  | 'validation'
  | 'gentle_guidance'
  | 'curiosity_question'
  | 'strength_recognition'
  | 'crisis_support'
  | 'celebration'
  | 'check_in';

export type SupportStrategy = 
  | 'active_listening'
  | 'cognitive_reframing'
  | 'emotional_validation'
  | 'solution_focused'
  | 'mindfulness_based'
  | 'strength_based'
  | 'crisis_intervention';

// Companion Response Types
export interface CompanionResponse {
  message: string;
  tone: EmotionalTone;
  supportType: SupportType;
  followUpSuggestions: string[];
  resources?: Resource[];
  confidenceLevel: number;
  personalizedElements: PersonalizedElement[];
  safetyCheck?: SafetyCheck;
}

export type EmotionalTone = 
  | 'warm'
  | 'supportive'
  | 'curious'
  | 'celebratory'
  | 'gentle'
  | 'concerned'
  | 'encouraging'
  | 'reflective';

export type SupportType = 
  | 'emotional_support'
  | 'practical_guidance'
  | 'crisis_intervention'
  | 'celebration'
  | 'check_in'
  | 'reflection_prompt'
  | 'coping_strategy';

export interface PersonalizedElement {
  type: 'name_reference' | 'pattern_reference' | 'strength_highlight' | 'growth_acknowledgment';
  content: string;
  confidence: number;
}

// Personality and Preferences Types
export interface CompanionPreferences {
  communicationStyle: CommunicationStyle;
  supportPreferences: SupportPreference[];
  topicSensitivities: TopicSensitivity[];
  responseLength: ResponseLength;
  humorLevel: number; // 0-10 scale
  directnessLevel: number; // 0-10 scale
  empathyStyle: EmpathyStyle;
  boundarySettings: BoundarySettings;
}

export type CommunicationStyle = 'casual' | 'formal' | 'warm' | 'direct' | 'gentle';
export type ResponseLength = 'brief' | 'moderate' | 'detailed';
export type EmpathyStyle = 'validating' | 'solution_focused' | 'exploratory' | 'strength_based';

export interface SupportPreference {
  type: SupportType;
  effectiveness: number; // 0-10 scale based on user feedback
  frequency: number; // How often this type has been used
  lastUsed: Date;
  userFeedback: UserFeedback[];
}

export interface TopicSensitivity {
  topic: string;
  sensitivity: 'low' | 'moderate' | 'high' | 'avoid';
  notes?: string;
  setAt: Date;
}

export interface BoundarySettings {
  topicsToAvoid: string[];
  maxSessionLength: number; // in minutes
  crisisInterventionEnabled: boolean;
  dataRetentionPeriod: number; // in days
  shareInsightsWithUser: boolean;
}

// Safety and Crisis Types
export interface SafetyFlag {
  type: SafetyFlagType;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  indicators: string[];
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  notes?: string;
}

export type SafetyFlagType = 
  | 'self_harm_risk'
  | 'suicidal_ideation'
  | 'severe_depression'
  | 'panic_attack'
  | 'substance_abuse'
  | 'eating_disorder'
  | 'domestic_violence'
  | 'other_crisis';

export interface SafetyCheck {
  riskLevel: RiskLevel;
  indicators: RiskIndicator[];
  recommendedActions: string[];
  resources: CrisisResource[];
  followUpRequired: boolean;
}

export interface RiskAssessment {
  level: RiskLevel;
  indicators: RiskIndicator[];
  immediateActions: string[];
  monitoringRecommendations: string[];
}

export interface SafetyResponse {
  message: string;
  resources: CrisisResource[];
  followUpActions: string[];
  escalationTriggers: string[];
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface RiskIndicator {
  type: string;
  description: string;
  severity: number; // 0-10 scale
  confidence: number; // 0-1 scale
}

export interface CrisisResource {
  type: 'hotline' | 'chat' | 'text' | 'local_service' | 'emergency';
  name: string;
  contact: string;
  availability: string;
  specialization: string[];
  location?: string;
  language: string[];
  description: string;
  priority: number; // 1-10, higher is more urgent
}

// User Feedback Types
export interface UserFeedback {
  id: string;
  messageId: string;
  type: FeedbackType;
  rating?: number; // 1-5 scale
  comment?: string;
  timestamp: Date;
  helpful: boolean;
  categories: FeedbackCategory[];
}

export type FeedbackType = 'helpful' | 'not_helpful' | 'inappropriate' | 'too_clinical' | 'too_casual' | 'perfect';

export type FeedbackCategory = 
  | 'tone'
  | 'accuracy'
  | 'helpfulness'
  | 'personalization'
  | 'timing'
  | 'length'
  | 'safety';

// Emotional Profile Types
export interface EmotionalProfile {
  userId: string;
  baselineEmotions: Emotion[];
  emotionalRange: EmotionalRange;
  copingStrategies: CopingStrategy[];
  supportNeeds: SupportNeed[];
  communicationPreferences: CompanionPreferences;
  growthAreas: GrowthArea[];
  strengths: PersonalStrength[];
  lastUpdated: Date;
  version: number; // For schema versioning
}

export interface EmotionalRange {
  typical: { min: number; max: number };
  positive: { min: number; max: number };
  negative: { min: number; max: number };
  volatility: number; // How much emotions fluctuate
}

export interface CopingStrategy {
  name: string;
  effectiveness: number; // 0-10 scale
  frequency: number; // How often used
  context: string[]; // When it's most effective
  lastUsed: Date;
  userReported: boolean; // Whether user explicitly mentioned it
}

export interface SupportNeed {
  type: string;
  priority: number; // 1-10 scale
  frequency: number; // How often needed
  effectiveness: number; // How well it's been addressed
  notes: string;
}

export interface GrowthArea {
  area: string;
  priority: number;
  progress: number; // 0-10 scale
  strategies: string[];
  milestones: string[];
  lastAssessed: Date;
}

export interface PersonalStrength {
  strength: string;
  evidence: string[];
  frequency: number; // How often it's demonstrated
  growth: number; // How much it's grown over time
  lastObserved: Date;
}

// Insights and Analytics Types
export interface EmotionalInsights {
  userId: string;
  generatedAt: Date;
  timeframe: InsightTimeframe;
  insights: Insight[];
  patterns: PatternInsight[];
  recommendations: Recommendation[];
  celebratedGrowth: GrowthCelebration[];
}

export type InsightTimeframe = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  supportingData: any[];
  actionable: boolean;
  priority: number;
}

export type InsightType = 
  | 'emotional_pattern'
  | 'growth_observation'
  | 'coping_effectiveness'
  | 'trigger_identification'
  | 'resilience_building'
  | 'relationship_pattern'
  | 'self_care_pattern';

export interface PatternInsight {
  pattern: string;
  description: string;
  strength: number;
  trend: 'improving' | 'stable' | 'concerning';
  timeframe: string;
  recommendations: string[];
}

export interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  priority: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  estimatedImpact: number; // 0-10 scale
  resources: Resource[];
}

export type RecommendationType = 
  | 'coping_strategy'
  | 'self_care_practice'
  | 'professional_support'
  | 'lifestyle_change'
  | 'mindfulness_practice'
  | 'social_connection'
  | 'creative_expression';

export interface GrowthCelebration {
  achievement: string;
  description: string;
  evidence: string[];
  significance: number; // 0-10 scale
  celebratedAt: Date;
}

export interface Resource {
  type: ResourceType;
  title: string;
  description: string;
  url?: string;
  content?: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number; // in minutes
}

export type ResourceType = 
  | 'article'
  | 'exercise'
  | 'meditation'
  | 'breathing_technique'
  | 'journaling_prompt'
  | 'professional_service'
  | 'app_recommendation'
  | 'book_recommendation';

// Storage and Encryption Types
export interface EncryptedData<T = unknown> {
  data: string; // Encrypted JSON string
  iv: string; // Initialization vector
  salt: string; // Salt for key derivation
  timestamp: Date;
  version: number; // Encryption version
}

export interface EmotionalDataStore {
  profiles: Record<string, EncryptedData<EmotionalProfile>>;
  conversations: Record<string, EncryptedData<Conversation>>;
  analyses: Record<string, EncryptedData<EmotionalAnalysis>>;
  patterns: Record<string, EncryptedData<EmotionalPatterns>>;
  preferences: Record<string, EncryptedData<CompanionPreferences>>;
  insights: Record<string, EncryptedData<EmotionalInsights>>;
}

// API and Service Types
export interface EmotionalAnalysisEngine {
  analyzeEntry(entry: DiaryEntry): Promise<EmotionalAnalysis>;
  detectEmotionalPatterns(entries: DiaryEntry[]): Promise<EmotionalPatterns>;
  assessMentalHealthIndicators(analyses: EmotionalAnalysis[]): Promise<SafetyFlag[]>;
  generateEmotionalInsights(patterns: EmotionalPatterns): Promise<EmotionalInsights>;
}

export interface ConversationEngine {
  generateResponse(
    userMessage: string,
    emotionalContext: EmotionalContext,
    conversationHistory: ConversationMessage[]
  ): Promise<CompanionResponse>;
  
  adaptCommunicationStyle(
    userPreferences: CompanionPreferences,
    interactionHistory: UserFeedback[]
  ): Promise<CompanionPreferences>;
  
  detectConversationIntent(message: string): Promise<ConversationIntent>;
  generateFollowUpQuestions(context: EmotionalContext): Promise<string[]>;
}

export interface ConversationIntent {
  primary: IntentType;
  secondary?: IntentType;
  confidence: number;
  entities: IntentEntity[];
}

export type IntentType = 
  | 'emotional_support'
  | 'crisis_help'
  | 'celebration'
  | 'reflection'
  | 'guidance_request'
  | 'casual_chat'
  | 'feedback'
  | 'boundary_setting';

export interface IntentEntity {
  type: string;
  value: string;
  confidence: number;
}

// Summary Types
export interface EmotionalSummary {
  dominantEmotions: string[];
  overallSentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  keyThemes: string[];
  supportProvided: SupportType[];
  userSatisfaction?: number; // 0-10 scale if feedback provided
  followUpNeeded: boolean;
}

export interface ConversationHistory {
  conversations: Conversation[];
  totalInteractions: number;
  averageSessionLength: number;
  preferredTopics: string[];
  avoidedTopics: string[];
  effectiveSupport: SupportType[];
  userSatisfactionTrend: Array<{ date: Date; rating: number }>;
}