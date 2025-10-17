import { useState, type ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { AnimatedLogo } from '../branding/AnimatedLogo';
import { ThemeSelector } from '../ui';
import { CompanionWidget } from '../ai/CompanionWidget';
import { useDiaryStore } from '../../stores/diaryStore';

import { useVAPITheme } from '../../hooks/useSimpleVAPITheme';

interface MainLayoutProps {
  children: ReactNode;
  userPreferences: { name: string } | null;
}

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  description: string;
}

export function MainLayout({ children, userPreferences }: MainLayoutProps) {
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const { entries } = useDiaryStore();

  const vapi = useVAPITheme();

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: '🏠',
      description: 'Your writing home'
    },
    {
      id: 'write',
      label: 'Write',
      path: '/write',
      icon: '✍️',
      description: 'Start writing'
    },
    {
      id: 'entries',
      label: 'My Entries',
      path: '/entries',
      icon: '📖',
      description: 'Read past entries'
    },
    {
      id: 'analytics',
      label: 'Insights',
      path: '/analytics',
      icon: '📊',
      description: 'View your patterns'
    },
    {
      id: 'search',
      label: 'Search',
      path: '/search',
      icon: '🔍',
      description: 'Find something'
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      path: '/assistant',
      icon: '🤖',
      description: 'Chat with your AI'
    }
  ];

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    return currentItem?.label || 'Introvirght';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userPreferences?.name || 'Writer';
    
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500",
      vapi.isActive 
        ? "bg-vapi-bg-primary" 
        : "bg-cream-paper"
    )}>
      {/* Enhanced Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 h-full transition-all duration-500 z-40 shadow-lg',
        vapi.isActive 
          ? 'bg-vapi-bg-secondary border-r border-vapi-border-secondary' 
          : 'bg-aged-paper border-r border-notebook-lines',
        showSidebar ? 'w-80' : 'w-16'
      )}>
        <div className="p-6 animate-page-enter">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-8">
            <div className={cn('transition-all duration-500', showSidebar ? 'opacity-100 translate-x-0' : 'opacity-100 translate-x-0')}>
              {showSidebar ? (
                <div className="space-y-2">
                  <h1 className="text-xl font-semibold text-fountain-pen-blue">
                    Introvirght
                  </h1>
                  <p className={cn(
                    "text-sm animate-text-appear pl-1",
                    vapi.isActive ? "text-vapi-text-secondary" : "text-pencil-graphite/70"
                  )}>{getGreeting()}</p>
                </div>
              ) : (
                <div className="flex justify-center w-full">
                  <div className="text-2xl font-bold text-fountain-pen-blue mx-auto">
                    I
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={cn(
                "p-2 transition-all duration-200 hover:scale-110 rounded-lg",
                vapi.isActive 
                  ? "text-vapi-text-secondary hover:text-vapi-accent-primary hover:bg-vapi-accent-primary/10" 
                  : "text-pencil-graphite/70 hover:text-fountain-pen-blue hover:bg-fountain-pen-blue/10"
              )}
              title={showSidebar ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <svg className={cn('w-5 h-5 transition-transform duration-300', showSidebar ? 'rotate-0' : 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Enhanced Navigation */}
          <nav className="space-y-2">
            {navigationItems.map((item, index) => (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group relative overflow-hidden',
                  location.pathname === item.path
                    ? vapi.isActive 
                      ? 'bg-vapi-accent-primary text-vapi-text-inverse shadow-lg animate-focus-ring'
                      : 'bg-fountain-pen-blue text-white shadow-lg animate-focus-ring'
                    : vapi.isActive
                      ? 'text-vapi-text-primary hover:bg-vapi-accent-primary/10 hover:text-vapi-accent-primary hover:translate-x-1'
                      : 'text-pencil-graphite hover:bg-fountain-pen-blue/10 hover:text-fountain-pen-blue hover:translate-x-1'
                )}
                title={!showSidebar ? item.label : undefined}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Ripple effect background */}
                <div className={cn(
                  "absolute inset-0 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg",
                  vapi.isActive ? "bg-vapi-accent-primary/20" : "bg-fountain-pen-blue/20"
                )} />
                
                <span className="text-xl flex-shrink-0 relative z-10 transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
                <div className={cn(
                  'transition-all duration-300 min-w-0 relative z-10',
                  showSidebar ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                )}>
                  <div className="font-medium transition-colors duration-200">{item.label}</div>
                  <div className={cn(
                    'text-xs opacity-70 transition-colors duration-200',
                    location.pathname === item.path 
                      ? vapi.isActive ? 'text-vapi-text-inverse/70' : 'text-white/70'
                      : vapi.isActive ? 'text-vapi-text-muted' : 'text-pencil-graphite/50'
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </nav>

          {/* Enhanced Actions */}
          {showSidebar && (
            <div className={cn(
              "mt-8 pt-6 animate-text-appear",
              vapi.isActive ? "border-t border-vapi-border-secondary" : "border-t border-notebook-lines"
            )}>
              <div className="space-y-2">
                <button
                  onClick={() => setShowThemeSelector(true)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left rounded-lg transition-all duration-200 text-sm group hover:translate-x-1",
                    vapi.isActive 
                      ? "text-vapi-text-secondary hover:text-vapi-accent-primary hover:bg-vapi-accent-primary/5"
                      : "text-pencil-graphite/70 hover:text-fountain-pen-blue hover:bg-fountain-pen-blue/5"
                  )}
                >
                  <span className="text-lg transition-transform duration-200 group-hover:scale-110">🎨</span>
                  <span className="font-medium">Themes</span>
                  <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                

              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        {showSidebar && userPreferences && (
          <div className="absolute bottom-6 left-6 right-6 animate-slide-in-from-bottom-4">
            <div className={cn(
              "rounded-lg p-4 text-center shadow-lg",
              vapi.isActive 
                ? "bg-vapi-accent-primary/10 border border-vapi-accent-primary/20"
                : "bg-fountain-pen-blue/10 border border-fountain-pen-blue/20"
            )}>
              <div className={cn(
                "text-sm font-medium animate-text-appear",
                vapi.isActive ? "text-vapi-accent-primary" : "text-fountain-pen-blue"
              )}>
                Happy writing, {userPreferences.name}! ✨
              </div>
              <div className={cn(
                "text-xs mt-1 animate-fade-in",
                vapi.isActive ? "text-vapi-accent-primary/70" : "text-fountain-pen-blue/70"
              )}>
                Keep exploring your thoughts
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Enhanced Main Content */}
      <main className={cn(
        'transition-all duration-500',
        showSidebar ? 'ml-80' : 'ml-16'
      )}>
        {/* Enhanced Top Bar */}
        <header className={cn(
          "backdrop-blur-sm sticky top-0 z-30 shadow-sm",
          vapi.isActive 
            ? "bg-vapi-bg-primary/90 border-b border-vapi-border-secondary"
            : "bg-cream-paper/90 border-b border-notebook-lines"
        )}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 animate-text-appear">
                {!showSidebar && (
                  <div className="text-lg font-bold text-fountain-pen-blue">
                    I
                  </div>
                )}
                <div>
                  <h2 className={cn(
                    "text-xl font-script animate-handwriting",
                    vapi.isActive ? "text-vapi-accent-primary" : "text-fountain-pen-blue"
                  )}>{getCurrentPageTitle()}</h2>
                  <p className={cn(
                    "text-sm animate-fade-in",
                    vapi.isActive ? "text-vapi-text-secondary" : "text-pencil-graphite/70"
                  )}>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {location.pathname !== '/write' && (
                  <Link
                    to="/write"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg animate-bounce-in",
                      vapi.isActive 
                        ? "bg-vapi-accent-primary text-vapi-text-inverse hover:bg-vapi-accent-hover"
                        : "bg-fountain-pen-blue text-white hover:bg-fountain-pen-blue/90"
                    )}
                  >
                    <span className="transition-transform duration-200 hover:scale-110">✍️</span>
                    <span className="font-medium">Write</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Page Content */}
        <div className="p-6 animate-page-enter">
          {children}
        </div>
      </main>

      {/* Enhanced Theme Selector Modal */}
      {showThemeSelector && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-modal-enter">
          <div className={cn(
            "rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-modal-enter",
            vapi.isActive ? "bg-vapi-bg-secondary" : "bg-cream-paper"
          )}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={cn(
                  "text-xl font-serif animate-handwriting",
                  vapi.isActive ? "text-vapi-accent-primary" : "text-fountain-pen-blue"
                )}>Choose Your Theme</h2>
                <button
                  onClick={() => setShowThemeSelector(false)}
                  className={cn(
                    "p-2 transition-all duration-200 hover:scale-110 rounded-lg",
                    vapi.isActive 
                      ? "text-vapi-text-secondary hover:text-vapi-semantic-error hover:bg-vapi-semantic-error/10"
                      : "text-pencil-graphite/70 hover:text-red-pen hover:bg-red-pen/10"
                  )}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ThemeSelector onThemeSelect={() => setShowThemeSelector(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Companion Widget - Only show if user has entries and not on assistant page */}
      {entries.length > 0 && location.pathname !== '/assistant' && (
        <CompanionWidget />
      )}

    </div>
  );
}