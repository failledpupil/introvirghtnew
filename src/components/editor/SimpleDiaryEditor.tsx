import { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

interface SimpleDiaryEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  onWordCountChange?: (count: number) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SimpleDiaryEditor({
  content,
  onUpdate,
  onWordCountChange,
  placeholder = "Dear Diary...",
  className,
  autoFocus = true,
}: SimpleDiaryEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Update local content when prop changes
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Calculate word count
  const getWordCount = (text: string): number => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  // Handle content changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    
    // Update word count
    const wordCount = getWordCount(newContent);
    onWordCountChange?.(wordCount);
    
    // Debounced update to parent
    const timeoutId = setTimeout(() => {
      onUpdate(newContent);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Auto-resize textarea
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  return (
    <div className={cn('simple-diary-editor', className)}>
      <textarea
        ref={textareaRef}
        value={localContent}
        onChange={handleChange}
        onInput={handleInput}
        placeholder={placeholder}
        className={cn(
          'w-full min-h-[400px] p-4 border-none outline-none resize-none',
          'bg-transparent text-pencil-graphite placeholder-pencil-graphite/50',
          'font-serif text-lg leading-relaxed',
          'focus:ring-0 focus:outline-none'
        )}
        style={{
          fontFamily: 'Caveat, cursive',
          lineHeight: '1.8',
          letterSpacing: '0.5px'
        }}
      />
      
      {/* Word Count Display */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-notebook-lines text-sm text-pencil-graphite/70">
        <div>
          {getWordCount(localContent)} words
        </div>
        <div>
          {localContent.length} characters
        </div>
      </div>
    </div>
  );
}