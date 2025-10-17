# 🎨 Animation Guide - See Your Enhancements in Action!

## 🚀 Quick Start - View Animations

### Option 1: Add Demo Route (Recommended)
Add this to your router to see all animations:

```tsx
// In your App.tsx or router file
import { DemoPage } from './src/components/DemoPage';

// Add this route
<Route path="/demo" element={<DemoPage />} />
```

Then visit: `http://localhost:5173/demo`

### Option 2: Individual Components
Use components anywhere in your app:

```tsx
import { 
  AnimatedLogo, 
  LogoShowcase, 
  AnimationDemo,
  AnimatedButton 
} from './src/enhancements';

// Animated logo in header
<AnimatedLogo variant="full" size="md" animation="entrance" />

// Interactive button
<AnimatedButton variant="interactive">Click Me!</AnimatedButton>

// Full showcase
<LogoShowcase />
<AnimationDemo />
```

## 🎭 Available Animations

### Logo Animations
- **entrance** - Dramatic scale + rotate entrance
- **bounce** - Bouncy scale animation  
- **glow** - Pulsing glow effect (loops)
- **paper-turn** - 3D paper flip effect
- **fade-in** - Simple fade entrance
- **ink-spread** - Ink bleeding effect

### Button Animations
- **interactive** - Hover lift + press scale
- **hover** - Lift on hover
- **press** - Scale on press
- **glow** - Glowing shadow effect

### Page Transitions
- **paper-turn** - 3D page flip
- **fade** - Simple fade
- **slide** - Slide with blur

### Writing Animations
- **Typewriter Effect** - Character-by-character reveal
- **Word Count Celebration** - Milestone animations
- **Breathing Cursor** - Calm pulsing cursor
- **Ink Spread** - Text appearance with blur

## 🎨 CSS Animation Classes

You can also use CSS classes directly:

```css
/* Logo animations */
.animate-logo-entrance
.animate-logo-bounce  
.animate-logo-glow

/* Page transitions */
.animate-page-enter
.animate-modal-enter
.animate-paper-turn

/* Interactive elements */
.animate-button-hover
.animate-breathe
.animate-pulse-gentle
```

## 🎯 Usage Examples

### 1. Animated App Header
```tsx
function AppHeader() {
  return (
    <header className="p-4">
      <AnimatedLogo 
        variant="full" 
        size="md" 
        animation="entrance"
        className="mx-auto"
      />
    </header>
  );
}
```

### 2. Loading Screen
```tsx
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LogoLoader 
        message="Loading your diary..."
        pulseAnimation={true}
      />
    </div>
  );
}
```

### 3. Interactive Form
```tsx
function ContactForm() {
  return (
    <form className="space-y-4">
      <AnimatedInput 
        placeholder="Your name"
        variant="focusRing"
      />
      <AnimatedButton 
        type="submit"
        variant="interactive"
      >
        Submit
      </AnimatedButton>
    </form>
  );
}
```

### 4. Page with Transitions
```tsx
function MyPage() {
  return (
    <PageTransition variant="paper-turn">
      <div className="p-8">
        <h1>My Content</h1>
        <p>This page animates in smoothly!</p>
      </div>
    </PageTransition>
  );
}
```

### 5. AI Writing Prompt
```tsx
function AIPrompt({ prompt }) {
  return (
    <div className="p-4 bg-white rounded-lg">
      <WritingAnimation 
        text={prompt}
        speed={50}
        onComplete={() => console.log('Prompt revealed!')}
      />
    </div>
  );
}
```

## 🎛️ Customization

### Animation Intensity
```tsx
import { useEnhancedThemeStore } from './src/stores/enhancedThemeStore';

function AnimationControls() {
  const { setAnimationSettings } = useEnhancedThemeStore();
  
  return (
    <div>
      <button onClick={() => setAnimationSettings({ intensity: 'minimal' })}>
        Minimal Animations
      </button>
      <button onClick={() => setAnimationSettings({ intensity: 'full' })}>
        Full Animations
      </button>
    </div>
  );
}
```

### Accessibility
All animations automatically respect `prefers-reduced-motion`:

```tsx
import { useReducedMotion } from './src/hooks/useReducedMotion';

function MyComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={prefersReducedMotion ? '' : 'animate-bounce'}>
      Content
    </div>
  );
}
```

## 🎪 Theme Integration

Animations work with all 8 theme presets:

```tsx
import { enhancedThemePresets } from './src/config/themePresets';

// Spring Garden theme with nature sounds + particles
// Summer Sunshine theme with energetic animations
// Focus Mode theme with minimal animations
// Creative Flow theme with full animations
```

## 🔧 Performance Tips

1. **Use CSS animations** for simple effects (better performance)
2. **Limit concurrent animations** to 5-10 max
3. **Respect reduced motion** preferences
4. **Use transform/opacity** instead of layout properties

## 🐛 Troubleshooting

### Animations not showing?
1. Check if `prefers-reduced-motion` is enabled
2. Verify CSS classes are loaded
3. Check animation duration isn't 0

### Performance issues?
1. Reduce animation intensity in theme settings
2. Limit number of animated elements
3. Use `will-change: transform` for heavy animations

## 🎉 What You'll See

When you visit `/demo`, you'll experience:

- ✨ **Logo entrance animations** with dramatic effects
- 🎯 **Interactive buttons** that respond to hover/click
- 📄 **Smooth page transitions** between sections  
- ✍️ **Typewriter effects** for text reveal
- 🎊 **Celebration animations** for milestones
- 🌊 **Breathing effects** for calm focus
- 🎨 **Theme-aware animations** that match your style

All animations are production-ready, accessible, and optimized for 60fps performance!

---

**Ready to see the magic?** Add the demo route and visit `/demo` to experience all your beautiful animations! ✨