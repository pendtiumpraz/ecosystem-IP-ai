# CineGenesis - AI Series Studio: Current App Overview

## Executive Summary
CineGenesis adalah platform **AI Content Creation Studio** yang memungkinkan kreator untuk membuat, mengembangkan, dan mengelola IP (Intellectual Property) untuk film, series, atau konten animasi menggunakan teknologi AI.

---

## Teknologi Stack Saat Ini

### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | 19.2.0 | UI Framework |
| TypeScript | 5.6.3 | Type Safety |
| Vite | 7.1.9 | Build Tool & Dev Server |
| Tailwind CSS | 4.1.14 | Styling |
| shadcn/ui (Radix) | Latest | Component Library |
| TanStack React Query | 5.60.5 | Server State Management |
| Wouter | 3.3.5 | Client-side Routing |
| Framer Motion | 12.23.24 | Animations |
| Recharts | 2.15.4 | Data Visualization |

### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Node.js + Express | 4.21.2 | HTTP Server |
| TypeScript | 5.6.3 | Type Safety |
| Drizzle ORM | 0.39.3 | Database ORM |
| PostgreSQL | - | Database |
| Multer | 2.0.2 | File Upload |
| OpenAI SDK | 6.10.0 | AI Integration |

### Database Schema (7 Tables)
1. **users** - Authentication & user data
2. **projects** - Main IP project container
3. **stories** - Story formula (premise, synopsis, genre, structure)
4. **characters** - Character details & profiles
5. **universes** - World-building data
6. **moodboards** - Visual references per beat
7. **animations** - Animation renders

---

## Fitur Lengkap Aplikasi

### 1. IP Project Management
- Create/Edit IP Project
- Studio branding (logo, name)
- Team assignment (Producer, Creative, Production, Business heads)
- Brand identity (multiple logos, color palette)
- Production date tracking

### 2. Story Formula Tab
- **Premise Input** - One-line story concept
- **AI Synopsis Generation** - Generate synopsis dari premise
- **Global Synopsis** - Detailed story overview
- **Genre & Sub-genre** selection
- **Tone & Intensity** settings
- **Theme & Sub-theme** definition
- **Moral Values** & Local Values
- **Target Audience** & Market
- **Story Structure** selection:
  - Hero's Journey (12 beats)
  - Save the Cat (15 beats)
  - Dan Harmon Story Circle (8 beats)
- **AI Structure Generation** - Generate story beats
- **Key Actions per Character per Beat**
- **Want/Need Matrix** - Character arc development
- **Ending Type** selection (Happy/Tragic/Open)
- **AI Script Generation** - Full screenplay

### 3. Character Development Tab
- Character list management (Create/Edit/Delete)
- **Physiological Details**:
  - Head, Face, Body, Attribute, Outfit
  - Hair Style, Birth Signs, Uniqueness
- **Psychological Profile**:
  - Archetype, Fears, Wants, Needs
  - Alter Ego, Traumatic events, Personality Type
- **Emotional Intelligence**:
  - Logos, Ethos, Pathos
  - Tone, Style, Mode
- **Family Background**:
  - Spouse, Children, Parents
- **Sociocultural Context**:
  - Affiliation, Group Relationships
  - Culture/Tradition, Language, Tribe, Economic Class
- **Core Beliefs**:
  - Faith, Religion/Spirituality, Trustworthy
  - Willingness, Vulnerability, Commitments, Integrity
- **Educational Background**:
  - Graduate, Achievement, Fellowship
- **Sociopolitics**:
  - Party ID, Nationalism, Citizenship
- **SWOT Analysis**:
  - Strengths, Weaknesses, Opportunities, Threats
- **AI Character Generation** - Auto-generate profile
- **AI Character Image Generation** - Multiple poses:
  - Portrait, Action, Emotional, Full-body
- Cast Reference input

### 4. Universe/World-Building Tab
- **Environment Settings**:
  - Landscape, Climate, Architecture
- **Public Systems**:
  - Government, Politics, Economy
- **Private Systems**:
  - Family structure, Social life, Culture
- Visual references for each aspect

### 5. Moodboard Tab
- Beat-by-beat visual representation
- **AI Moodboard Prompt Generation**
- **AI Image Generation** (DALL-E/gpt-image-1)
- Gallery view of all beats
- Animation style selection:
  - Cartoon, Sketch, 3D, Vector, Realistic

### 6. Animation Tab
- Beat-by-beat animation preview
- **AI Animation Prompt Generation**
- **AI Animation Preview Generation**
- Video style selection
- Status tracking (pending/processing/completed/failed)

### 7. Performance Analysis (Distribution Tab)
- **15 Key Performance Factors**:
  - Cast, Director, Producer, Executive Producer
  - Distributor, Publisher, Brand Positioning
  - Theme, USP, Story Values, Fans Loyalty
  - Production Budget, Promotion Budget
  - Social Media Engagement, Teaser Engagement
- **AI Performance Prediction**:
  - Score per factor (0-100)
  - Competitor comparison
  - Predicted audience
  - Actionable suggestions
- Radar chart visualization

### 8. Canva Integration
- OAuth 2.0 authentication
- Create IP Bible designs
- List team designs
- Export to PDF
- Session-based token storage

### 9. Asset Library
- Image upload (JPEG, PNG, GIF, WebP)
- Asset management (list/delete)
- Multi-file upload support
- Size limit: 10MB per file

### 10. AI Thumbnail Generation
- Generate mood-based thumbnail
- Based on title, genre, tone, theme

---

## API Endpoints Summary

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project

### Stories
- `GET /api/projects/:projectId/story` - Get story
- `POST /api/projects/:projectId/story` - Create story
- `PATCH /api/stories/:id` - Update story

### Characters
- `GET /api/projects/:projectId/characters` - List characters
- `POST /api/projects/:projectId/characters` - Create character
- `PATCH /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character
- `POST /api/characters/:id/generate` - AI generate character

### Universe
- `GET /api/projects/:projectId/universe` - Get universe
- `POST /api/projects/:projectId/universe` - Create universe
- `PATCH /api/universes/:id` - Update universe

### Moodboards & Animations
- `GET /api/projects/:projectId/moodboards` - List moodboards
- `GET /api/projects/:projectId/animations` - List animations

### AI Endpoints
- `POST /api/ai/generate-story-idea` - Generate from idea
- `POST /api/ai/generate-synopsis` - Generate synopsis
- `POST /api/ai/generate-story-structure` - Generate beats
- `POST /api/ai/generate-want-need` - Generate want/need matrix
- `POST /api/ai/generate-script` - Generate screenplay
- `POST /api/ai/generate-moodboard-prompt` - Generate image prompt
- `POST /api/ai/generate-moodboard-image` - Generate image
- `POST /api/ai/generate-animation-prompt` - Generate video prompt
- `POST /api/ai/generate-animation-preview` - Generate preview
- `POST /api/ai/generate-character-image` - Generate character art
- `POST /api/ai/generate-thumbnail-mood` - Generate thumbnail
- `POST /api/ai/predict-performance` - Predict performance

### Assets
- `POST /api/assets/upload` - Single upload
- `POST /api/assets/upload-multiple` - Multi upload
- `GET /api/assets` - List assets
- `DELETE /api/assets/:filename` - Delete asset

### Canva
- `GET /api/canva/auth-url` - Get OAuth URL
- `GET /api/canva/callback` - OAuth callback
- `GET /api/canva/connection` - Check connection
- `POST /api/canva/disconnect` - Disconnect
- `POST /api/canva/designs` - Create design
- `GET /api/canva/designs` - List designs
- `GET /api/canva/designs/:designId` - Get design
- `POST /api/canva/designs/:designId/export` - Export design
- `GET /api/canva/status` - Check config status

---

## Arsitektur Monorepo

```
AI-Series-Studio/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── layout/    # Navbar, etc.
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── context/       # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   └── pages/         # Page components
│   └── public/            # Static assets
├── server/                 # Backend Express app
│   ├── lib/               # Business logic
│   │   ├── openai.ts      # AI functions
│   │   └── canva.ts       # Canva integration
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry
├── shared/                 # Shared code
│   └── schema.ts          # Database schema & types
├── uploads/               # Uploaded files
└── docs/                  # Documentation
```

---

## Environment Variables Required

```env
DATABASE_URL=postgresql://...
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
CANVA_CLIENT_ID=...
CANVA_CLIENT_SECRET=...
CANVA_REDIRECT_URI=https://your-app.com/api/canva/callback
```
