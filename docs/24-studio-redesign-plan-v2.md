# Studio Page Redesign Plan v2 - Based on AI-Series-Studio UI Reference

## Current Issues

### 1. Wrong Tab Order
Current ecosystem-IP-ai has wrong tab order:
- Current: IP Project, Characters, Story, Universe, Universe Formula, Strategic Plan, Moodboard, Animate, Edit & Mix, Project Team, Materials, Custom Roles, IP Bible
- Correct: IP Project, Strategic Plan, Character Formula, Story Formula, Universe Formula, Moodboard, Animate, Edit & Mix, IP Bible

### 2. Missing Critical Features
- Strategic Plan: Missing Performance Analysis with 15 factors and bar chart comparison
- Character Formula: Missing 4-pose image generation (Portrait, Action, Emotional, Full Body)
- Story Formula: Missing Want/Need Matrix with 12 columns grid
- Moodboard: Missing Story Structure Steps with generate prompt/image per beat
- Animate: Missing Story Structure Steps integration
- Edit & Mix: Missing Canva integration and Asset Library
- IP Bible: Just export button, no generated script display

### 3. Poor Visual Design
- No clear visual hierarchy
- Cluttered horizontal tabs (13 tabs)
- No progress indication
- Generic styling not matching professional SaaS
- Poor mobile experience

## Redesign Goals

### 1. Match AI-Series-Studio UI Exactly
- Same tab order
- Same tab icons
- Same content structure for each tab
- Same color scheme and styling

### 2. Professional SaaS Look
- Clean, modern design inspired by Linear, Figma, Notion
- Consistent color palette with brand colors
- Smooth animations and transitions
- Professional typography
- Proper spacing and visual hierarchy

### 3. Better Navigation
- Horizontal tabs with icons and labels
- Visual indicators for active/inactive states
- Smooth transitions between tabs

### 4. Improved User Experience
- Clear onboarding for new users
- Quick actions for common tasks
- Better error messages with recovery options
- Auto-save with clear feedback
- Loading states with progress

### 5. Responsive Design
- Mobile-friendly layout
- Tablet-optimized interface
- Desktop productivity features

## New Tab Structure (CORRECT ORDER)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Header: Logo | Title | Auto-saved | Settings | Export          │
├─────────────────────────────────────────────────────────────────────────┤
│  Tab Navigation (Horizontal)                                    │
│  [IP Project] [Strategic Plan] [Character Formula]              │
│  [Story Formula] [Universe Formula] [Moodboard]               │
│  [Animate] [Edit & Mix] [IP Bible]                           │
├─────────────────────────────────────────────────────────────────────────┤
│  Main Content Area                                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                                                        │   │
│  │  Content for Active Tab                                │   │
│  │                                                        │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Tab Details

### 1. IP Project Tab (Briefcase icon)
**Content Structure:**
- Studio Logo upload (clickable)
- Studio Name input
- IP Owner input
- IP Title input
- Production Date input
- Description textarea
- **Project Team** - Modo Token Holders Only
  - IP Producer
  - Head of Creative
  - Head of Production
  - Head of Business & Strategic
  - Story Supervisor
  - Character Supervisor
  - Other Role (custom)
- Brand Identity
  - Logos (3 slots)
  - Color Palette (5 colors)

**Features:**
- Team members must be Modo token holders
- Show token amount for each member
- Remove member button
- Select from Modo Community button

### 2. Strategic Plan Tab (Share2 icon)
**Content Structure:**
- Performance Analysis with 15 factors:
  1. Cast
  2. Director
  3. Producer
  4. Executive Producer
  5. Distributor
  6. Publisher
  7. Title Brand Positioning
  8. Theme Stated
  9. Unique Selling
  10. Story Values
  11. Fans Loyalty
  12. Production Budget
  13. Promotion Budget
  14. Social Media Engagements
  15. Teaser Trailer Engagements
- Genre input
- Bar chart comparison (Project vs Competitor)
- Predicted Audience display
- AI Suggestions textarea

**Features:**
- Compare project scores with competitor
- Visual bar chart for each factor
- AI predictions for audience
- Suggestions for improvement

### 3. Character Formula Tab (User icon)
**Content Structure:**
- Character List Sidebar (left side)
  - New Character button
  - Character cards with:
    - Character image
    - Name
    - Role
    - Delete button
- Character Detail Form (right side)
  - Name input
  - Type select (Protagonist/Antagonist/Supporting)
  - Age input
  - Cast Reference input
  - **4 Pose Image Generation**:
    - Portrait 📱
    - Action ⚡
    - Emotional 💫
    - Full Body 🧍
    - Upload button
  - Physiological (accordion)
    - Head, Face, Body, Attribute, Outfit, Hair Style, Birth Signs, Uniqueness
  - Psychological (accordion)
    - Archetype, Fears, Wants, Needs, Alter Ego, Traumatic, Personality Type
  - Emotional (accordion)
    - Logos, Ethos, Pathos, Tone, Style, Mode
  - Family (accordion)
    - Spouse, Children, Parents
  - Sociocultural (accordion)
    - Affiliation, Group Relationship Level, Culture Tradition, Language, Tribe, Economic Class
  - Core Beliefs (accordion)
    - Faith, Religion/Spirituality, Trustworthy, Willingness, Vulnerability, Commitments, Integrity
  - Educational (accordion)
    - Graduate, Achievement, Fellowship
  - Sociopolitics (accordion)
    - Party ID, Nationalism, Citizenship
  - SWOT (accordion)
    - Strength, Weakness, Opportunity, Threat

**Features:**
- 4-pose image generation (Portrait, Action, Emotional, Full Body)
- Character images stored per pose per character
- Accordion sections for organized data entry
- Character list with visual selection

### 4. Story Formula Tab (Wand2 icon)
**Content Structure:**
- **Thumbnail** (left side)
  - Mood visual with hero background
  - Generate Mood Visual button
- **Title** input
- **Premise** textarea
- **Synopsis** textarea with Generate button
- **Global Synopsis** textarea
- **Metadata Grid** (2 columns):
  - Duration input
  - Format select (Feature Film/Series/Short Movie/Short Video)
  - Genre input
  - Sub Genre input
  - Tone input
  - Theme input
- **Want/Need Matrix** (12 columns grid):
  - Want Row:
    - External: "believe that his desires are right"
    - Known: "believe that his desires was wrong"
    - Specific: "believe again that his desires will come true"
    - Achieved: "By end of story"
  - Need Row:
    - Internal: "Personal change for growth"
    - Unknown: "How is this communicated?"
    - Universal: "Make need relatable"
    - Achieved: "By end of story"
  - Ending Type select (Happy/Tragic/Open)
  - Generate from Protagonist button
- **Story Structure**:
  - Structure select (Hero's Journey/Save the Cat/Dan Harmon Circle)
  - Dynamic beat table based on structure
  - Beat description textarea
  - Key Actions textarea per beat
  - Generate Structure button
- **Actions**:
  - Auto-Fill with AI button
  - Generate Script button
  - Save Story Bible button
- **Generated Script Display** (if available)

**Features:**
- Want/Need Matrix with 12 columns (6 want + 6 need)
- Dynamic beat table based on selected structure
- Key Actions per beat with character images
- Auto-fill all fields with AI

### 5. Universe Formula Tab (Globe icon)
**Content Structure:**
- Universe Name input
- Period input
- Era input
- Location input
- World Type input
- Technology Level input
- Magic System input
- Environment textarea
- Society textarea
- Private Life textarea
- Government textarea
- Economy textarea
- Culture textarea

**Features:**
- Simple form layout
- Textarea for longer descriptions
- Input fields for metadata

### 6. Moodboard Tab (LayoutTemplate icon)
**Content Structure:**
- Story Structure Steps (based on selected structure)
- For each step:
  - Beat name
  - Beat description textarea
  - Key Actions textarea
  - Character images for key actions
  - **Generate Prompt** button
  - **Generate Image** button
  - Generated image display

**Features:**
- Generate prompt for each beat
- Generate image for each beat
- Character images for key actions
- Story structure integration

### 7. Animate Tab (Video icon)
**Content Structure:**
- Animation Style select (3D/Sketch/Vector/Realistic/Anime)
- Story Structure Steps
- For each step:
  - Beat name
  - Beat description textarea
  - Key Actions textarea
  - Character images for key actions
  - **Generate Prompt** button
  - **Generate Preview** button
  - Generated preview image display

**Features:**
- Animation style selection
- Generate prompt for each beat
- Generate preview for each beat
- Story structure integration

### 8. Edit & Mix Tab (Film icon)
**Content Structure:**
- Canva Integration section
  - Connect Canva button
  - Create Design button
  - Canva Designs list (if connected)
- Asset Library section
  - Upload Asset button
  - Asset list with:
    - Filename
    - Size
    - Created date
    - Delete button

**Features:**
- Canva OAuth integration
- Create designs in Canva
- Asset library management
- Upload assets for use in other tabs

### 9. IP Bible Tab (Book icon)
**Content Structure:**
- Export button
- Generated Script Display (full page)

**Features:**
- Export complete IP Bible as PDF
- Display generated script with proper formatting
- Download script button

## Color Palette

### Primary Colors
```css
--primary: #2563eb; /* blue-600 */
--primary-hover: #1d4ed8; /* blue-700 */
--primary-light: #3b82f6; /* blue-500 */
```

### Accent Colors (for each section)
```css
--accent-ip-project: #f97316; /* orange */
--accent-strategic: #06b6d4; /* cyan */
--accent-character: #3b82f6; /* blue */
--accent-story: #10b981; /* green */
--accent-universe: #8b5cf6; /* purple */
--accent-moodboard: #f59e0b; /* amber */
--accent-animate: #6366f1; /* indigo */
--accent-edit: #06b6d4; /* cyan */
--accent-bible: #475569; /* slate */
```

### Neutral Colors
```css
--bg-card: #ffffff; /* white */
--bg-secondary: #f9fafb; /* gray-50 */
--bg-tertiary: #f3f4f6; /* gray-100 */
--bg-input: #1f2937; /* gray-800 */
--text-primary: #111827; /* gray-900 */
--text-secondary: #6b7280; /* gray-600 */
--text-muted: #9ca3af; /* gray-400 */
--border: #e5e7eb; /* gray-200 */
```

## Typography

### Font Family
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Sizes
```css
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## Component Design

### 1. Header
```tsx
<header className="border-b border-white/5 bg-card/50 px-6 py-3 flex items-center justify-between">
  <div className="flex items-center gap-4">
    <div className="h-14 w-14 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden group">
      {studioLogo ? (
        <img src={studioLogo} className="w-full h-full object-contain" alt="Studio Logo" />
      ) : (
        <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
      )}
    </div>
    <h2 className="text-lg font-display font-bold text-white">IP Project: {ipTitle || "Untitled Project"}</h2>
    <div className="h-4 w-[1px] bg-white/20" />
    <span className="text-sm text-muted-foreground flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      Auto-saved
    </span>
  </div>
  <div className="flex items-center gap-3">
    <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
      <Settings className="h-4 w-4 mr-2" />
      Settings
    </Button>
    <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_10px_-2px_hsl(var(--primary))]">
      <Save className="h-4 w-4 mr-2" />
      Export
    </Button>
  </div>
</header>
```

### 2. Tab Navigation
```tsx
<div className="w-fit bg-card/50 border border-white/5 p-1 rounded-xl">
  <TabsTrigger value="ip-project" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-6">
    <Briefcase className="h-4 w-4 mr-2" />
    IP Project
  </TabsTrigger>
  <TabsTrigger value="strategy" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-6">
    <Share2 className="h-4 w-4 mr-2" />
    Strategic Plan
  </TabsTrigger>
  <TabsTrigger value="characters" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-6">
    <User className="h-4 w-4 mr-2" />
    Character Formula
  </TabsTrigger>
  <TabsTrigger value="script" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-6">
    <Wand2 className="h-4 w-4 mr-2" />
    Story Formula
  </TabsTrigger>
  <TabsTrigger value="universe" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-6">
    <Globe className="h-4 w-4 mr-2" />
    Universe Formula
  </TabsTrigger>
  <TabsTrigger value="moodboard" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-6">
    <LayoutTemplate className="h-4 w-4 mr-2" />
    Moodboard
  </TabsTrigger>
  <TabsTrigger value="animate" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-6">
    <Video className="h-4 w-4 mr-2" />
    Animate
  </TabsTrigger>
  <TabsTrigger value="edit" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-6">
    <Film className="h-4 w-4 mr-2" />
    Edit & Mix
  </TabsTrigger>
  <TabsTrigger value="ip-bible" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-6">
    <Book className="h-4 w-4 mr-2" />
    IP Bible
  </TabsTrigger>
</div>
```

## Implementation Phases

### Phase 1: Tab Order & Navigation (Week 1)
- Reorder tabs to match AI-Series-Studio
- Update tab icons to match
- Update navigation styling
- Test tab switching

### Phase 2: IP Project Tab (Week 2)
- Implement Studio Logo upload
- Implement Project Team with Modo token holders
- Implement Brand Identity (logos + colors)
- Test all features

### Phase 3: Strategic Plan Tab (Week 3)
- Implement Performance Analysis with 15 factors
- Implement bar chart comparison
- Implement Predicted Audience display
- Implement AI Suggestions
- Test all features

### Phase 4: Character Formula Tab (Week 4)
- Implement 4-pose image generation
- Implement pose selection (Portrait, Action, Emotional, Full Body)
- Implement character images storage per pose
- Test all features

### Phase 5: Story Formula Tab (Week 5)
- Implement Want/Need Matrix (12 columns)
- Implement Thumbnail generation
- Implement dynamic beat table
- Implement Key Actions per beat
- Test all features

### Phase 6: Universe Formula Tab (Week 6)
- Implement all 9 fields
- Use proper input/textarea components
- Test all features

### Phase 7: Moodboard Tab (Week 7)
- Implement Story Structure Steps
- Implement Generate Prompt per beat
- Implement Generate Image per beat
- Test all features

### Phase 8: Animate Tab (Week 8)
- Implement Animation Style select
- Implement Generate Preview per beat
- Test all features

### Phase 9: Edit & Mix Tab (Week 9)
- Implement Canva integration
- Implement Asset Library
- Test all features

### Phase 10: IP Bible Tab (Week 10)
- Implement Export button
- Implement Generated Script Display
- Test all features

### Phase 11: Polish & Animations (Week 11)
- Add smooth transitions
- Add loading states
- Add error handling
- Test responsive design
- Performance optimization

### Phase 12: Testing & Refinement (Week 12)
- User testing
- Bug fixes
- Performance optimization
- Final polish

## Success Metrics

### User Engagement
- Time to first action: < 30 seconds
- Feature discovery rate: > 80%
- Task completion rate: > 90%
- User satisfaction score: > 4.5/5

### Performance
- Page load time: < 2 seconds
- Time to interactive: < 3 seconds
- First contentful paint: < 1 second
- Cumulative layout shift: < 0.1

### Quality
- Accessibility score: > 95
- Performance score: > 90
- Best practices score: > 90
- SEO score: > 90

## Next Steps

1. Reorder tabs in page.tsx to match AI-Series-Studio
2. Update tab icons to match exactly
3. Implement IP Project tab features
4. Implement Strategic Plan with Performance Analysis
5. Implement Character Formula with 4-pose generation
6. Implement Story Formula with Want/Need Matrix
7. Implement Universe Formula
8. Implement Moodboard with Story Structure Steps
9. Implement Animate with Story Structure Steps
10. Implement Edit & Mix with Canva integration
11. Implement IP Bible
12. Test all features
13. Deploy and monitor
