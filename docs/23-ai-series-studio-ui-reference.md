# AI-Series-Studio UI Reference

## Tab Structure (Urutan yang BENAR)

Berdasarkan file `D:/AI/AI-Series-Studio/client/src/pages/studio.tsx`, berikut adalah urutan tab yang BENAR:

1. **IP Project** - Briefcase icon
2. **Strategic Plan** - Share2 icon
3. **Character Formula** - User icon
4. **Story Formula** - Wand2 icon
5. **Universe Formula** - Globe icon
6. **Moodboard** - LayoutTemplate icon
7. **Animate** - Video icon
8. **Edit & Mix** - Film icon
9. **IP Bible** - Book icon

## Tab Content Structure

### 1. IP Project Tab
- Studio Logo upload
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

### 2. Strategic Plan Tab
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
- AI Suggestions

### 3. Character Formula Tab
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

### 4. Story Formula Tab
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
  - Want: External, Known, Specific, Achieved
  - Need: Internal, Unknown, Universal, Achieved
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

### 5. Universe Formula Tab
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

### 6. Moodboard Tab
- Story Structure Steps (based on selected structure)
- For each step:
  - Beat name
  - Beat description textarea
  - Key Actions textarea
  - Character images for key actions
  - **Generate Prompt** button
  - **Generate Image** button
  - Generated image display

### 7. Animate Tab
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

### 8. Edit & Mix Tab
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

### 9. IP Bible Tab
- Export button
- Generated Script Display (full page)
- Download button

## Key UI Patterns

### Header
- Studio Logo (clickable to upload)
- Project Title
- Auto-saved indicator with green dot
- Settings button (outline)
- Export button (default)

### Tab Navigation
- Horizontal tabs on left side
- Active tab: bg-primary with white text
- Inactive tab: transparent with text-muted-foreground
- Icons for each tab

### Color Scheme
- Primary: blue-600 (#2563eb)
- Secondary: various colors (yellow-400, cyan-400, orange-500, etc.)
- Background: dark with card/30, black/20, black/40
- Text: white/90, zinc-300, etc.

### Layout Pattern
- Left sidebar for navigation (tabs)
- Right side for content
- Content in Card with ScrollArea
- Responsive grid layouts (grid-cols-1 md:grid-cols-2 lg:grid-cols-3, etc.)

### Components Used
- Tabs, TabsContent, TabsList, TabsTrigger
- Card, CardContent, CardHeader
- Input, Textarea, Label
- Button (default, outline, ghost)
- Select, SelectContent, SelectItem, SelectTrigger
- ScrollArea
- Separator
- Slider, Switch
- Accordion (implied with sections)

## Important Notes

1. **Tab Order MUST BE EXACTLY AS ABOVE** - This is critical for user satisfaction
2. **Character Formula** has 4-pose image generation (Portrait, Action, Emotional, Full Body)
3. **Story Formula** has Want/Need Matrix with 12 columns
4. **Strategic Plan** has Performance Analysis with bar chart
5. **Moodboard** and **Animate** use Story Structure Steps
6. **Edit & Mix** has Canva integration and Asset Library
7. **IP Bible** is just export + generated script display
8. All forms use dark theme with specific background colors
9. Generate buttons use Wand2 icon
10. Auto-save indicator in header
