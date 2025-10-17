import React, { useState, useEffect, useRef } from 'react';
import { useDiaryStore } from '../../stores/diaryStore';
import { aiContentService } from '../../services/aiContentService';
import { cn } from '../../utils/cn';

interface ChatMessage {
  id: string;
  role: 'user' | 'alex';
  content: string;
  timestamp: Date;
  emotion?: string;
}

export interface SimpleAIAssistantProps {
  className?: string;
}

export const SimpleAIAssistant: React.FC<SimpleAIAssistantProps> = ({ className }) => {
  const { entries } = useDiaryStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAIAvailable = aiContentService.isAvailable();

  useEffect(() => {
    // Initialize with a greeting message
    if (messages.length === 0) {
      const greeting = getPersonalizedGreeting();
      setMessages([{
        id: 'greeting',
        role: 'alex',
        content: greeting,
        timestamp: new Date()
      }]);
    }
  }, [entries.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPersonalizedGreeting = () => {
    if (entries.length === 0) {
      return "Hi there! I'm Alex, your AI companion. I'm here to listen, understand, and support you on your journaling journey. Start by writing some diary entries, and I'll get to know you better so we can have meaningful conversations! 😊";
    }

    const recentEntry = entries[0];
    const daysSinceLastEntry = Math.floor((new Date().getTime() - recentEntry.date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastEntry === 0) {
      return `Hello! I see you wrote in your diary today. I've been learning about you through your ${entries.length} entries. How are you feeling right now? I'm here to listen and chat about whatever's on your mind. 💙`;
    } else if (daysSinceLastEntry === 1) {
      return `Welcome back! I noticed you wrote yesterday. I've been reflecting on your ${entries.length} diary entries and I'm getting to know your unique voice and emotions. What's been on your mind lately? 🌟`;
    } else {
      return `Hey there! It's been ${daysSinceLastEntry} days since your last entry. I've been learning from your ${entries.length} diary entries and I understand you better now. I'm here whenever you need someone to talk to. How have you been? 🤗`;
    }
  };

  const generateAlexResponse = async (userMessage: string): Promise<string> => {
    if (!isAIAvailable) {
      return getFallbackResponse(userMessage);
    }

    try {
      // Build context from diary entries
      const recentEntries = entries.slice(0, 10).map(entry => ({
        date: entry.date.toDateString(),
        content: entry.content.substring(0, 300),
        emotions: entry.emotions.map(e => e.name).join(', '),
        wordCount: entry.wordCount
      }));

      const contextPrompt = `You are Alex, a caring AI friend and emotional companion. You have been learning about the user through their diary entries. 

User's diary context:
${recentEntries.map(entry => `${entry.date}: ${entry.content} (emotions: ${entry.emotions})`).join('\n')}

Based on this context, respond as a supportive friend who:
- Shows empathy and understanding
- References their diary patterns when relevant
- Asks thoughtful follow-up questions
- Offers gentle encouragement
- Keeps the conversation engaging and personal
- Acts like someone who truly knows and cares about them

User just said: "${userMessage}"

Respond as Alex in a warm, conversational way (2-3 sentences max):`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: contextPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 150,
          temperature: 0.8,
        }),
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || getFallbackResponse(userMessage);
    } catch (error) {
      console.error('Failed to generate Alex response:', error);
      return getFallbackResponse(userMessage);
    }
  };

  const getFallbackResponse = (_userMessage: string): string => {
    const responses = [
      "I hear you. Even though I can't access my full AI capabilities right now, I want you to know that I'm here for you. How are you feeling about that?",
      "Thank you for sharing that with me. I wish I could give you a more personalized response, but I care about what you're going through. Tell me more?",
      "I'm listening. While my AI features are limited without an API key, I still want to be here for you. What's been on your mind lately?",
      "That sounds important to you. I'd love to understand better - can you tell me more about how that makes you feel?",
      "I appreciate you opening up to me. Even in this limited mode, I want you to know that your thoughts and feelings matter. What else would you like to talk about?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(async () => {
      const alexResponse = await generateAlexResponse(userMessage.content);
      
      const alexMessage: ChatMessage = {
        id: `alex-${Date.now()}`,
        role: 'alex',
        content: alexResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, alexMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // 1-3 second delay
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (entries.length === 0) {
    return (
      <div className={cn('bg-cream-paper dark:bg-gray-800 rounded-lg p-8 text-center', className)}>
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-xl font-script text-fountain-pen-blue dark:text-gray-100 mb-3">
          Meet Alex, Your AI Friend
        </h3>
        <p className="text-pencil-graphite dark:text-gray-400 mb-6">
          Alex learns from your diary entries to become your personal AI companion. Write a few entries first, and Alex will get to know your emotions, patterns, and personality to have meaningful conversations with you.
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
    <div className={cn('bg-cream-paper dark:bg-gray-800 rounded-lg overflow-hidden', className)}>
      {/* AI Status Banner */}
      {!isAIAvailable && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                Limited AI Mode
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Alex is running in basic mode. Add your OpenAI API key for full conversational AI.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg">
            🤖
          </div>
          <div>
            <h3 className="font-medium text-fountain-pen-blue dark:text-gray-100">
              Alex - Your AI Companion
            </h3>
            <p className="text-sm text-pencil-graphite dark:text-gray-400">
              {isAIAvailable ? 'Online and learning from your entries' : 'Basic mode - Limited responses'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'alex' && (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                🤖
              </div>
            )}
            <div
              className={cn(
                'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                message.role === 'user'
                  ? 'bg-fountain-pen-blue text-white'
                  : 'bg-white dark:bg-gray-700 text-pencil-graphite dark:text-gray-200 border border-gray-200 dark:border-gray-600'
              )}
            >
              <p className="text-sm">{message.content}</p>
              <p className={cn(
                'text-xs mt-1',
                message.role === 'user' 
                  ? 'text-blue-100' 
                  : 'text-gray-500 dark:text-gray-400'
              )}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
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
              🤖
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your thoughts with Alex..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-pencil-graphite dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue"
            rows={2}
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-2 bg-fountain-pen-blue text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send • Alex learns from your diary entries to understand you better
        </p>
      </div>
    </div>
  );
};

export default SimpleAIAssistant;