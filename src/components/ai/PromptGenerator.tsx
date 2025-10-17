import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { aiContentService, type WritingPrompt, type PromptContext } from '../../services/aiContentService';
import { WritingAnimation } from '../animations/WritingAnimation';

export interface PromptGeneratorProps {
  onSelectPrompt: (prompt: WritingPrompt) => void;
  context?: PromptContext;
  className?: string;
}

export const PromptGenerator: React.FC<PromptGeneratorProps> = ({
  onSelectPrompt,
  context: _context,
  className,
}) => {
  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'reflective', 'creative', 'gratitude', 'problem-solving'];

  const generatePrompts = async () => {
    setIsLoading(true);
    try {
      const newPrompts = await aiContentService.generatePromptBatch(5);
      setPrompts(newPrompts);
    } catch (error) {
      console.error('Failed to generate prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPrompts = selectedCategory === 'all'
    ? prompts
    : prompts.filter(p => p.category === selectedCategory);

  return (
    <div className={cn('bg-cream-paper dark:bg-gray-800 rounded-lg p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-script text-fountain-pen-blue dark:text-gray-100">
          Writing Prompts
        </h3>
        <button
          onClick={generatePrompts}
          disabled={isLoading}
          className="px-4 py-2 bg-fountain-pen-blue text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate New'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-colors',
              selectedCategory === category
                ? 'bg-fountain-pen-blue text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-12 text-pencil-graphite dark:text-gray-400">
            <p>Click "Generate New" to get writing prompts</p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => onSelectPrompt(prompt)}
              className="w-full text-left p-4 bg-white dark:bg-gray-700 rounded-lg hover:shadow-lg transition-shadow"
            >
              <WritingAnimation text={prompt.text} speed={30} />
              <div className="flex items-center gap-4 mt-2 text-sm text-pencil-graphite dark:text-gray-400">
                <span className="capitalize">{prompt.difficulty}</span>
                <span>•</span>
                <span>{prompt.estimatedTime} min</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default PromptGenerator;
