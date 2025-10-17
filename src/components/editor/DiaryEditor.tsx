import { useCallback, useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { cn } from '../../utils/cn';
import { useThemeStore } from '../../stores/themeStore';

interface DiaryEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  onWordCountChange?: (count: number) => void;
  onWritingTimeChange?: (minutes: number) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function DiaryEditor({
  content,
  onUpdate,
  onWordCountChange,
  onWritingTimeChange,
  placeholder = "Dear Diary...",
  className,
  autoFocus = true,
}: DiaryEditorProps) {
  const { currentTheme } = useThemeStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const [startTime] = useState(Date.now());
  const [writingTime, setWritingTime] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState(Date.now());

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount.configure({
        limit: 50000, // Reasonable limit for diary entries
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-lg max-w-none',
          'focus:outline-none',
          'diary-entry-editor',
          'min-h-[400px] p-6'
        ),
        style: `
          font-family: ${currentTheme.fontFamily};
          font-size: ${currentTheme.fontSize}px;
          line-height: ${currentTheme.lineHeight};
          color: ${currentTheme.inkColor};
        `,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate(html);
      
      // Update word count
      const wordCount = editor.storage.characterCount.words();
      onWordCountChange?.(wordCount);

      // Typing animation
      setIsTyping(true);
      setLastTypingTime(Date.now());
      
      // Stop typing animation after delay
      setTimeout(() => {
        const now = Date.now();
        if (now - lastTypingTime > 1000) {
          setIsTyping(false);
        }
      }, 1000);
    },
    autofocus: autoFocus,
  });

  // Enhanced writing time tracking with visual feedback
  useEffect(() => {
    const interval = setInterval(() => {
      if (editor?.isFocused) {
        const newWritingTime = Math.floor((Date.now() - startTime) / 60000);
        setWritingTime(newWritingTime);
        onWritingTimeChange?.(newWritingTime);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [editor, startTime, onWritingTimeChange]);

  // Typing animation cleanup
  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    return () => clearTimeout(typingTimeout);
  }, [lastTypingTime]);

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editor styles when theme changes
  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom as HTMLElement;
      editorElement.style.fontFamily = currentTheme.fontFamily;
      editorElement.style.fontSize = `${currentTheme.fontSize}px`;
      editorElement.style.lineHeight = currentTheme.lineHeight.toString();
      editorElement.style.color = currentTheme.inkColor;
    }
  }, [currentTheme, editor]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Handle markdown shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'b':
          event.preventDefault();
          editor?.chain().focus().toggleBold().run();
          break;
        case 'i':
          event.preventDefault();
          editor?.chain().focus().toggleItalic().run();
          break;
        case 'u':
          event.preventDefault();
          editor?.chain().focus().toggleUnderline().run();
          break;
        case 's':
          event.preventDefault();
          // Auto-save is handled elsewhere
          break;
      }
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-notebook-lines rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-notebook-lines rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-notebook-lines rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <div 
      ref={editorRef}
      className={cn(
        'diary-editor-container relative',
        isTyping && 'animate-writing-flow',
        className
      )}
      onKeyDown={handleKeyDown}
    >
      <EditorContent 
        editor={editor}
        className={cn(
          "diary-editor-content transition-all duration-300",
          isTyping && "animate-ink-spread"
        )}
      />
      
      {/* Typing indicator */}
      {isTyping && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-fountain-pen-blue rounded-full animate-pulse-gentle opacity-60" />
      )}
      
      {/* Enhanced Editor stats */}
      <div className="flex justify-between items-center mt-4 text-xs text-pencil-graphite/70 animate-text-appear">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <span className="animate-counter">{editor.storage.characterCount.words()}</span>
            <span>words</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="animate-counter">{editor.storage.characterCount.characters()}</span>
            <span>characters</span>
          </div>
          {writingTime > 0 && (
            <div className="flex items-center gap-1">
              <span className="animate-counter">{writingTime}</span>
              <span>min{writingTime !== 1 ? 's' : ''} writing</span>
            </div>
          )}
        </div>
        
        {editor.storage.characterCount.characters() > 45000 && (
          <span className="text-red-pen animate-pulse">
            {50000 - editor.storage.characterCount.characters()} characters remaining
          </span>
        )}
      </div>
    </div>
  );
}