# UI/UX Design Guidelines

## Design Philosophy

### Core Principles
1. **Cinematic Feel** - Dark theme dengan accent colors yang dramatic
2. **Creator-First** - Workflow yang intuitif untuk content creators
3. **AI-Assisted** - AI suggestions tanpa mengganggu creative flow
4. **Progressive Disclosure** - Complexity tersembunyi, simplicity di depan
5. **Trial-Aware UI** - Locked features jelas terlihat, upgrade prompts strategis

---

## Locked Feature UI Pattern (CRITICAL)

### Trial User Experience
```
┌─────────────────────────────────────────────────────────────────────────┐
│  STUDIO - Story Tab                                       [2/2 used]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Premise                                                                │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ A young filmmaker discovers...                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  🔒 Generate Synopsis                                    LOCKED   │ │
│  │     ─────────────────────────────────────────────────────────     │ │
│  │     Trial limit reached (2/2 generations used)                    │ │
│  │                                                                   │ │
│  │     [⭐ Upgrade to Premium - Rp 349.000/bln]                      │ │
│  │     ✓ 400 AI credits/bulan                                       │ │
│  │     ✓ Unlimited generations                                      │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░ [Blurred Preview of Feature] ░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Locked Feature Component
```tsx
// Contoh implementasi
<LockedFeature 
  feature="synopsis_generation"
  tier="premium"
  reason="trial_limit" // or "subscription_required"
>
  <SynopsisGenerator />
</LockedFeature>
```

### Credit Balance Display (Always Visible)
```
┌─────────────────────────────────┐
│  💳 Credits: 245/400            │
│  ████████████░░░░░ 61%          │
│  Resets in 12 days              │
│  [+ Buy More]                   │
└─────────────────────────────────┘
```

### Upgrade Prompts Placement
1. **Header** - Credit balance + upgrade button
2. **Locked Features** - Inline dengan feature
3. **Empty States** - Saat tidak ada data
4. **Settings** - Billing page link
5. **After Generation** - "X credits remaining"

---

## Visual Identity

### Color Palette

#### Primary Colors
```css
/* Dark Background */
--bg-primary: #0A0A0B;      /* Main background */
--bg-secondary: #111113;     /* Card background */
--bg-tertiary: #18181B;      /* Elevated surfaces */

/* Accent Colors */
--accent-purple: #9B87F5;    /* Primary accent */
--accent-cyan: #33C3F0;      /* Secondary accent */
--accent-gold: #F2C94C;      /* Premium/highlight */
--accent-orange: #F2994A;    /* Warning/attention */
--accent-pink: #EC4899;      /* Creative/fun */

/* Text Colors */
--text-primary: #FAFAFA;     /* Main text */
--text-secondary: #A1A1AA;   /* Muted text */
--text-tertiary: #71717A;    /* Disabled/hint */

/* Status Colors */
--success: #22C55E;
--warning: #EAB308;
--error: #EF4444;
--info: #3B82F6;
```

#### Gradients
```css
/* Hero gradient */
--gradient-hero: linear-gradient(135deg, #9B87F5 0%, #33C3F0 50%, #EC4899 100%);

/* Card hover */
--gradient-card: linear-gradient(180deg, rgba(155, 135, 245, 0.1) 0%, transparent 100%);

/* Button gradient */
--gradient-button: linear-gradient(135deg, #9B87F5 0%, #7C3AED 100%);
```

### Typography

#### Font Stack
```css
/* Display/Headings */
--font-display: 'Cal Sans', 'Inter', system-ui, sans-serif;

/* Body */
--font-body: 'Inter', system-ui, sans-serif;

/* Monospace (code/scripts) */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

#### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 48px / 3rem | 700 | 1.1 |
| H2 | 36px / 2.25rem | 700 | 1.2 |
| H3 | 24px / 1.5rem | 600 | 1.3 |
| H4 | 20px / 1.25rem | 600 | 1.4 |
| Body | 16px / 1rem | 400 | 1.5 |
| Small | 14px / 0.875rem | 400 | 1.5 |
| Caption | 12px / 0.75rem | 400 | 1.4 |

---

## Layout System

### Grid System
```
Desktop (1280px+):  12 columns, 24px gutter
Tablet (768-1279px): 8 columns, 20px gutter
Mobile (< 768px):    4 columns, 16px gutter
```

### Spacing Scale
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

---

## Component Patterns

### Card Styles

#### Default Card
```jsx
<Card className="
  bg-card/40 
  backdrop-blur-sm 
  border border-white/10 
  hover:border-primary/50 
  transition-all
">
```

#### Elevated Card (Active/Selected)
```jsx
<Card className="
  bg-card/60
  backdrop-blur-md
  border border-primary/30
  shadow-[0_0_30px_-10px_hsl(var(--primary))]
">
```

#### Glass Card
```jsx
<Card className="
  bg-white/5
  backdrop-blur-xl
  border border-white/10
  shadow-2xl
">
```

### Button Hierarchy

#### Primary (CTA)
```jsx
<Button className="
  bg-primary 
  hover:bg-primary/90 
  text-white 
  shadow-[0_0_20px_-5px_hsl(var(--primary))]
">
  Generate Script
</Button>
```

#### Secondary
```jsx
<Button variant="secondary" className="
  bg-white/10 
  hover:bg-white/20 
  border border-white/10
">
  Save Draft
</Button>
```

#### Ghost
```jsx
<Button variant="ghost" className="
  hover:bg-white/5
">
  Cancel
</Button>
```

#### Destructive
```jsx
<Button variant="destructive" className="
  bg-red-500/20 
  text-red-400 
  hover:bg-red-500/30
">
  Delete Project
</Button>
```

### Input Styles
```jsx
<Input className="
  bg-white/5
  border-white/10
  focus:border-primary/50
  focus:ring-2
  focus:ring-primary/20
  placeholder:text-white/30
"/>
```

### Tab Navigation
```jsx
<Tabs className="w-full">
  <TabsList className="
    bg-white/5 
    border border-white/10 
    p-1 
    rounded-xl
  ">
    <TabsTrigger className="
      data-[state=active]:bg-primary
      data-[state=active]:text-white
      rounded-lg
      transition-all
    ">
      Story
    </TabsTrigger>
  </TabsList>
</Tabs>
```

---

## Page Layouts

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Navbar (fixed top)                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Page Header                                         │   │
│  │  Title + Actions                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                          │
│  │Card │ │Card │ │Card │ │Card │  (Project Grid)          │
│  └─────┘ └─────┘ └─────┘ └─────┘                          │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                          │
│  │Card │ │Card │ │Card │ │ +   │                          │
│  └─────┘ └─────┘ └─────┘ └─────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Studio Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Navbar (Project Title + Save Status)                       │
├────────┬────────────────────────────────────────────────────┤
│        │  ┌────────────────────────────────────────────┐   │
│        │  │  Tab Navigation                             │   │
│ Side   │  └────────────────────────────────────────────┘   │
│ bar    │                                                    │
│        │  ┌────────────────────┐ ┌────────────────────┐    │
│ (opt)  │  │                    │ │                    │    │
│        │  │   Main Content     │ │   Properties/      │    │
│        │  │   Area             │ │   Preview Panel    │    │
│        │  │                    │ │                    │    │
│        │  │                    │ │                    │    │
│        │  └────────────────────┘ └────────────────────┘    │
│        │                                                    │
│        │  ┌────────────────────────────────────────────┐   │
│        │  │  Bottom Panel (Timeline/Actions)           │   │
│        │  └────────────────────────────────────────────┘   │
└────────┴────────────────────────────────────────────────────┘
```

### Story Editor Layout
```
┌─────────────────────────────────────────────────────────────┐
│  [Story] [Characters] [Universe] [Moodboard] [Animation]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Premise                                             │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ One-line premise...                           │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │  [✨ Generate Idea]                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────┐ ┌────────────────────────────┐   │
│  │ Synopsis             │ │ Story Details              │   │
│  │ ┌──────────────────┐ │ │ Genre: [Dropdown]          │   │
│  │ │                  │ │ │ Tone: [Dropdown]           │   │
│  │ │                  │ │ │ Theme: [Input]             │   │
│  │ └──────────────────┘ │ │ Duration: [Select]         │   │
│  │ [✨ Generate]        │ │ Format: [Select]           │   │
│  └──────────────────────┘ └────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Story Structure                                     │   │
│  │  [Hero's Journey ▾] [Cat Save ▾] [Harmon ▾]         │   │
│  │                                                      │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │ Beat 1  │ │ Beat 2  │ │ Beat 3  │ │ Beat 4  │   │   │
│  │  │ Ordinary│ │ Call to │ │ Refusal │ │ Mentor  │   │   │
│  │  │ World   │ │ Advent  │ │         │ │         │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  │                                                      │   │
│  │  [✨ Generate All Beats]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Interaction Patterns

### AI Generation Flow
```
1. User Input → [Button Click]
                    ↓
2. Loading State → "✨ Generating..." (pulse animation)
                    ↓
3. Streaming → Progressive text reveal (optional)
                    ↓
4. Complete → Success toast + field populated
                    ↓
5. Edit Mode → User can modify AI output
```

### Loading States

#### Skeleton Loading
```jsx
<Skeleton className="h-4 w-full bg-white/5" />
<Skeleton className="h-4 w-3/4 bg-white/5" />
```

#### AI Generation Loading
```jsx
<Button disabled>
  <Sparkles className="animate-pulse" />
  Generating...
</Button>
```

#### Progress Indicator
```jsx
<Progress value={progress} className="bg-white/10">
  <ProgressIndicator className="bg-primary" />
</Progress>
```

### Toast Notifications
```jsx
// Success
toast.success("Script generated successfully!")

// Error
toast.error("Failed to generate. Please try again.")

// Info
toast.info("You have 10 AI credits remaining")

// Warning
toast.warning("Unsaved changes will be lost")
```

### Modal Patterns

#### Confirmation Dialog
```jsx
<AlertDialog>
  <AlertDialogContent className="bg-card border-white/10">
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Project?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction className="bg-red-500">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Animation Guidelines

### Transitions
```css
/* Default transition */
transition: all 0.2s ease;

/* Smooth entrance */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Bouncy */
transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Framer Motion Presets
```jsx
// Fade In
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

// Slide Up
const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

// Scale
const scale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

// Stagger Children
const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.05 }
  }
}
```

### Micro-interactions
- Button hover: Scale 1.02 + glow
- Card hover: Border color change + subtle lift
- Input focus: Border glow + ring
- Tab change: Smooth slide indicator
- Toggle: Smooth slide with color transition

---

## Responsive Breakpoints

### Mobile (< 768px)
- Single column layout
- Bottom sheet modals
- Collapsed navigation
- Touch-optimized buttons (min 44px)
- Simplified tabs (scrollable)

### Tablet (768px - 1024px)
- Two column layouts
- Side drawer navigation
- Modal dialogs
- Hybrid touch/mouse

### Desktop (> 1024px)
- Multi-column layouts
- Persistent sidebar
- Hover states
- Keyboard shortcuts
- Context menus

---

## Accessibility Checklist

### Color Contrast
- [x] Text: 4.5:1 minimum
- [x] Large text: 3:1 minimum
- [x] UI components: 3:1 minimum
- [x] Focus indicators: clearly visible

### Keyboard Navigation
- [x] All interactive elements focusable
- [x] Logical tab order
- [x] Skip links for main content
- [x] Escape closes modals

### Screen Readers
- [x] Semantic HTML
- [x] ARIA labels where needed
- [x] Live regions for dynamic content
- [x] Alt text for images

### Motion
- [x] Respect prefers-reduced-motion
- [x] No content-blocking animations
- [x] Pausable auto-play

---

## Dark Mode Only

This application is **dark mode only** by design:

**Rationale:**
1. Cinematic/creative industry expectation
2. Reduced eye strain for long editing sessions
3. Better visual focus on content/images
4. Premium aesthetic

**Implementation:**
```jsx
// Force dark mode
<html className="dark">
  <body className="bg-background text-foreground">
```
