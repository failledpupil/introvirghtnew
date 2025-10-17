// Enhanced AI Emotional Companion with full emotional intelligence

import React, { useState, useEffect, useRef } from 'react';
import { useDiaryStore } from '../../stores/diaryStore';
import { useEmotionalAnalysis } from '../../hooks/useEmotionalAnalysis';
import { conversationEngine } from '../../services/conversationEngine';
import { personalityAdapter } from '../../services/personalityAdapter';
import { emotionalStorageService } from '../../services/emotionalStorage';
import { cn } from '../../utils/cn';

import type {
  ConversationMessage,
  Conversation,
  CrisisResource,
  UserFeedback,
  EmotionalTone
} from '../../types/emotional-companion';

export interface EmotionalCompanionProps {
  className?: string;
  conversationId?: string;
}

export const EmotionalCompanion: React.FC<EmotionalCompanionProps> = ({ 
  className,
  conversationId: propConversationId 
}) => {
  const { entries } = useDiaryStore();
  const { preferences, updatePreferences } = useEmotionalAnalysis();
  
  // State
  const [conversationId] = useState(propConversationId || `conv-${Date.now()}`);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSafetyResources, setShowSafetyResources] = useState(false);
  const [safetyResources, setSafetyResources] = useState<CrisisResource[]>([]);
  const [companionMood, setCompanionMood] = useState<EmotionalTone>('warm');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize conversation
  useEffect(() => {
    initializeConversation();
  }, [conversationId, entries.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeConversation = async () => {
    try {
      // Load existing conversation or create new one
      const existingConversation = await emotionalStorageService.getConversation(conversationId);
      
      if (existingConversation) {
        setMessages(existingConversation.messages);
      } else {
        // Create greeting message
        const greeting = await generatePersonalizedGreeting();
        const greetingMessage: ConversationMessage = {
          id: `msg-${Date.now()}`,
          conversationId,
          role: 'companion',
          content: greeting,
          timestamp: new Date()
        };
        
        setMessages([greetingMessage]);
        await saveConversation([greetingMessage]);
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      // Fallback greeting
      const fallbackGreeting: ConversationMessage = {
        id: `msg-${Date.now()}`,
        conversationId,
        role: 'companion',
        content: "Hello! I'm Alex, your AI companion. I'm here to listen, understand, and support you. How are you feeling today?",
        timestamp: new Date()
      };
      setMessages([fallbackGreeting]);
    }
  };

  const generatePersonalizedGreeting = async (): Promise<string> => {
    if (!preferences) {
      return "Hello! I'm Alex, your AI companion. I'm here to listen and support you. How are you feeling today?";
    }

    // Use personality adapter to generate personalized greeting
    return personalityAdapter.generatePersonalizedGreeting(preferences);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Generate companion response
      const response = await conversationEngine.generateResponse(
        userMessage.content,
        conversationId,
        messages
      );

      // Handle safety concerns
      if (response.safetyCheck && response.safetyCheck.riskLevel !== 'low') {
        setSafetyResources(response.safetyCheck.resources);
        setShowSafetyResources(true);
      }

      // Update companion mood based on response tone
      setCompanionMood(response.tone);

      // Create companion message
      const companionMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        conversationId,
        role: 'companion',
        content: response.message,
        timestamp: new Date(),
        responseMetadata: {
          generationTime: 0,
          confidence: response.confidenceLevel,
          responseType: 'empathetic_listening',
          supportStrategy: 'emotional_validation',
          fallbackUsed: false,
          personalizedElements: response.personalizedElements.map(p => p.type)
        }
      };

      const finalMessages = [...updatedMessages, companionMessage];
      setMessages(finalMessages);
      
      // Save conversation
      await saveConversation(finalMessages);

    } catch (error) {
      console.error('Failed to generate response:', error);
      
      // Fallback response
      const fallbackMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        conversationId,
        role: 'companion',
        content: "I'm here for you, even when I'm having technical difficulties. Can you tell me more about how you're feeling?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const saveConversation = async (messages: ConversationMessage[]) => {
    try {
      const conversation: Conversation = {
        id: conversationId,
        userId: 'default-user',
        messages,
        startedAt: messages[0]?.timestamp || new Date(),
        lastMessageAt: messages[messages.length - 1]?.timestamp || new Date(),
        tags: [],
        archived: false
      };

      await emotionalStorageService.storeConversation(conversation);
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageFeedback = async (messageId: string, helpful: boolean, comment?: string) => {
    try {
      const feedback: UserFeedback = {
        id: `feedback-${Date.now()}`,
        messageId,
        type: helpful ? 'helpful' : 'not_helpful',
        rating: helpful ? 5 : 2,
        comment,
        timestamp: new Date(),
        helpful,
        categories: ['helpfulness']
      };

      // Update preferences based on feedback
      if (preferences) {
        const updatedPreferences = await personalityAdapter.updatePreferencesFromFeedback(
          feedback,
          preferences
        );
        await updatePreferences(updatedPreferences);
      }
    } catch (error) {
      console.error('Failed to process feedback:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCompanionAvatar = () => {
    const moodEmojis = {
      warm: '🤗',
      supportive: '💙',
      curious: '🤔',
      celebratory: '🎉',
      gentle: '🌸',
      concerned: '😟',
      encouraging: '✨',
      reflective: '🧘'
    };
    
    return moodEmojis[companionMood] || '🤖';
  };

  const getMessageTone = (message: ConversationMessage): string => {
    if (message.role === 'companion' && message.responseMetadata) {
      return message.responseMetadata.responseType.replace('_', ' ');
    }
    return '';
  };

  if (entries.length === 0) {
    return (
      <div className={cn('bg-cream-paper dark:bg-gray-800 rounded-lg p-8 text-center', className)}>
        <div className="text-6xl mb-4">🤗</div>
        <h3 className="text-xl font-script text-fountain-pen-blue dark:text-gray-100 mb-3">
          Meet Alex, Your Emotional Companion
        </h3>
        <p className="text-pencil-graphite dark:text-gray-400 mb-6">
          Alex is an AI companion who learns from your diary entries to understand your emotions and provide personalized support. 
          Write a few entries first, and Alex will get to know your unique emotional patterns and communication style.
        </p>
        <a 
          href="/write" 
          className="inline-flex items-center gap-2 bg-fountain-pen-blue text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
        >
          <span>📝</span>
          Write Your First Entry
        </a>
      </div>
    );
  }

  return (
    <div className={cn('bg-cream-paper dark:bg-gray-800 rounded-lg overflow-hidden flex flex-col h-96', className)}>
      {/* Safety Resources Modal */}
      {showSafetyResources && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              Crisis Support Resources
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              I'm concerned about your safety. Here are some resources that can provide immediate help:
            </p>
            <div className="space-y-3 mb-4">
              {safetyResources.slice(0, 3).map((resource, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded p-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{resource.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{resource.contact}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{resource.availability}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSafetyResources(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
              <a
                href="tel:988"
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-center"
              >
                Call 988
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg">
            {getCompanionAvatar()}
          </div>
          <div>
            <h3 className="font-medium text-fountain-pen-blue dark:text-gray-100">
              Alex - Your Emotional Companion
            </h3>
            <p className="text-sm text-pencil-graphite dark:text-gray-400">
              Understanding your emotions • Learning your preferences • Here to support you
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'companion' && (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                {getCompanionAvatar()}
              </div>
            )}
            
            <div className="flex flex-col max-w-xs lg:max-w-md">
              <div
                className={cn(
                  'px-4 py-2 rounded-lg',
                  message.role === 'user'
                    ? 'bg-fountain-pen-blue text-white'
                    : 'bg-white dark:bg-gray-700 text-pencil-graphite dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Message metadata */}
                {message.role === 'companion' && message.responseMetadata && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {getMessageTone(message)} • {message.responseMetadata.confidence.toFixed(1)} confidence
                  </div>
                )}
              </div>
              
              {/* Timestamp */}
              <p className={cn(
                'text-xs mt-1',
                message.role === 'user' 
                  ? 'text-right text-blue-100' 
                  : 'text-gray-500 dark:text-gray-400'
              )}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              
              {/* Feedback buttons for companion messages */}
              {message.role === 'companion' && (
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => handleMessageFeedback(message.id, true)}
                    className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    title="This was helpful"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => handleMessageFeedback(message.id, false)}
                    className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    title="This wasn't helpful"
                  >
                    👎
                  </button>
                </div>
              )}
            </div>
            
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm flex-shrink-0">
                👤
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm">
              {getCompanionAvatar()}
            </div>
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share your thoughts and feelings with Alex..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-pencil-graphite dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue"
            rows={2}
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-2 bg-fountain-pen-blue text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>💙</span>
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send • Alex learns from your diary entries and adapts to your communication style
        </p>
      </div>
    </div>
  );
};

export default EmotionalCompanion;