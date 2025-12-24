# Performance Analysis Based on Key Factor - UI/UX Design

## Overview
Performance Analysis is a feature in the Strategic Plan tab that uses AI to predict the commercial success of an IP project based on 15 key factors. It compares the project against competitor averages and provides actionable suggestions.

## Location
- **Tab**: Strategic Plan
- **Section**: Below IP Business Model Canvas
- **Reference**: `https://ai-series-studio--achmadrofiq88.replit.app/studio/new` → Strategic Plan tab

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ STRATEGIC PLAN                                                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ IP Business Model Canvas                                                  │   │
│  │ (9 sections grid layout)                                                   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ Performa Analysis Based on Key Factor                                     │   │
│  ├─────────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                             │   │
│  │  ┌─────────────────────────────┐  ┌───────────────────────────────────┐   │   │
│  │  │ Input Form (15 fields)     │  │ Charts & Predictions            │   │   │
│  │  │                             │  │                                 │   │   │
│  │  │ Cast: [______________]      │  │  ┌───────────────────────────┐  │   │   │
│  │  │ Director: [______________]   │  │  │ Bar Chart (15 factors)   │  │   │   │
│  │  │ Producer: [______________]   │  │  │                         │  │   │   │
│  │  │ Executive Producer: [______] │  │  │ Score vs Competitor       │  │   │   │
│  │  │ Distributor: [______________] │  │  │ (0-100 scale)            │  │   │   │
│  │  │ Publisher: [______________]   │  │  └───────────────────────────┘  │   │   │
│  │  │ Title/Brand Positioning: [] │  │                                 │   │   │
│  │  │ Genre: [______________]      │  │  ┌─────────────┐ ┌──────────┐ │   │   │
│  │  │ Theme Stated: [___________] │  │  │ Predicted   │ │Competitor│ │   │   │
│  │  │ Unique Selling: [_________] │  │  │ Audience    │ │Audience  │ │   │   │
│  │  │ Story Values: [___________] │  │  │ 1,234,567   │ │ 987,654  │ │   │   │
│  │  │ Fans Loyalty: [___________] │  │  │ Your Project │ │Avg       │ │   │   │
│  │  │ Production Budget: [_______] │  │  └─────────────┘ └──────────┘ │   │   │
│  │  │ Promotion Budget: [________] │  │                                 │   │   │
│  │  │ Social Media Engagements: [] │  │  ┌───────────────────────────┐  │   │   │
│  │  │ Teaser/Trailer Engagements:[]│  │  │ AI Suggestions           │  │   │   │
│  │  │                             │  │  │ 1. Improve cast quality  │  │   │   │
│  │  │  [ AI GENERATE ]           │  │  │ 2. Increase promotion    │  │   │   │
│  │  │                             │  │  │ 3. Enhance USP          │  │   │   │
│  │  └─────────────────────────────┘  │  └───────────────────────────┘  │   │   │
│  │                                   │                                 │   │   │
│  └───────────────────────────────────┴─────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 15 Key Factors

| # | Field Key | Label | Description | Input Type |
|---|-----------|-------|-------------|------------|
| 1 | `cast` | Cast | Main actors/voice actors for the project | Text |
| 2 | `director` | Director | Director of the project | Text |
| 3 | `producer` | Producer | Producer of the project | Text |
| 4 | `executiveProducer` | Executive Producer | Executive producer overseeing the project | Text |
| 5 | `distributor` | Distributor | Distribution company/platform | Text |
| 6 | `publisher` | Publisher | Publishing partner | Text |
| 7 | `titleBrandPositioning` | Title/Brand Positioning | How the title is positioned in the market | Text |
| 8 | `themeStated` | Theme Stated | Core theme of the story | Text |
| 9 | `uniqueSelling` | Unique Selling | What makes this project unique | Text |
| 10 | `storyValues` | Story Values | Values conveyed through the story | Text |
| 11 | `fansLoyalty` | Fans Loyalty | Existing fanbase loyalty (if applicable) | Text |
| 12 | `productionBudget` | Production Budget | Total production budget | Text |
| 13 | `promotionBudget` | Promotion Budget | Marketing and promotion budget | Text |
| 14 | `socialMediaEngagements` | Social Media Engagements | Social media metrics/engagement | Text |
| 15 | `teaserTrailerEngagements` | Teaser/Trailer Engagements | Trailer views and engagement | Text |

## State Management

```typescript
interface PerformanceData {
  cast: string;
  director: string;
  producer: string;
  executiveProducer: string;
  distributor: string;
  publisher: string;
  titleBrandPositioning: string;
  themeStated: string;
  uniqueSelling: string;
  storyValues: string;
  fansLoyalty: string;
  productionBudget: string;
  promotionBudget: string;
  socialMediaEngagements: string;
  teaserTrailerEngagements: string;
  genre: string; // Derived from Story Formula
}

interface PerformanceScore {
  name: string;
  score: number; // 0-100
  competitor: number; // 0-100
}

interface PerformancePrediction {
  scores: PerformanceScore[];
  predictedAudience: number;
  competitorAudience: number;
  suggestions: string[];
}
```

## API Endpoint

### POST `/api/ai/predict-performance`

**Request:**
```json
{
  "cast": "Tom Holland, Zendaya",
  "director": "Jon Watts",
  "producer": "Kevin Feige",
  "executiveProducer": "Avi Arad",
  "distributor": "Sony Pictures",
  "publisher": "Marvel Studios",
  "titleBrandPositioning": "Youth superhero with relatable coming-of-age story",
  "themeStated": "Responsibility and growing up",
  "uniqueSelling": "Grounded superhero approach",
  "storyValues": "Friendship, sacrifice, responsibility",
  "fansLoyalty": "High (existing MCU fanbase)",
  "productionBudget": "$200 million",
  "promotionBudget": "$150 million",
  "socialMediaEngagements": "50M followers across platforms",
  "teaserTrailerEngagements": "100M views in 24 hours",
  "genre": "Action/Sci-Fi"
}
```

**Response:**
```json
{
  "scores": [
    { "name": "Cast", "score": 85, "competitor": 72 },
    { "name": "Dir", "score": 78, "competitor": 70 },
    { "name": "Prod", "score": 90, "competitor": 75 },
    { "name": "Exec", "score": 75, "competitor": 68 },
    { "name": "Dist", "score": 82, "competitor": 74 },
    { "name": "Pub", "score": 88, "competitor": 71 },
    { "name": "Brand", "score": 80, "competitor": 73 },
    { "name": "Theme", "score": 76, "competitor": 69 },
    { "name": "USP", "score": 84, "competitor": 72 },
    { "name": "Story", "score": 79, "competitor": 71 },
    { "name": "Fans", "score": 92, "competitor": 65 },
    { "name": "P.Bud", "score": 85, "competitor": 78 },
    { "name": "Pr.Bud", "score": 88, "competitor": 76 },
    { "name": "SocMed", "score": 86, "competitor": 70 },
    { "name": "Teaser", "score": 90, "competitor": 68 }
  ],
  "predictedAudience": 12500000,
  "competitorAudience": 8500000,
  "suggestions": [
    "Leverage existing MCU fanbase with cross-promotion",
    "Focus marketing on relatable coming-of-age narrative",
    "Emphasize the unique grounded approach to superhero genre",
    "Consider international marketing expansion for broader reach"
  ]
}
```

## Chart Visualization

### Bar Chart (Recharts)
- **Type**: Bar Chart
- **Data**: 15 factors comparing project score vs competitor average
- **X-Axis**: Factor names (abbreviated to fit)
- **Y-Axis**: Score (0-100)
- **Colors**:
  - Your Project: `#9B87F5` (Purple)
  - Competitor Avg: `#F97316` (Orange)
- **Tooltip**: Shows exact scores on hover

### Factor Name Abbreviations
| Full Name | Abbreviation |
|-----------|-------------|
| Cast | Cast |
| Director | Dir |
| Producer | Prod |
| Executive Producer | Exec |
| Distributor | Dist |
| Publisher | Pub |
| Title/Brand Positioning | Brand |
| Theme Stated | Theme |
| Unique Selling | USP |
| Story Values | Story |
| Fans Loyalty | Fans |
| Production Budget | P.Bud |
| Promotion Budget | Pr.Bud |
| Social Media Engagements | SocMed |
| Teaser/Trailer Engagements | Teaser |

## Prediction Cards

### Predicted Audience Card
- **Background**: Gradient from purple-900/50 to pink-900/50
- **Content**:
  - Title: "Prediksi Penonton" (Predicted Audience)
  - Subtitle: "Proyek Anda" (Your Project)
  - Value: Formatted number (e.g., "12.500.000")
  - Unit: "penonton" (viewers)

### Competitor Audience Card
- **Background**: Gradient from orange-900/50 to red-900/50
- **Content**:
  - Title: "Penonton Kompetitor" (Competitor Audience)
  - Subtitle: "Rata-rata {Genre}" (Average {Genre})
  - Value: Formatted number (e.g., "8.500.000")
  - Unit: "penonton" (viewers)

## AI Suggestions Panel

- **Background**: Gradient from green-900/30 to emerald-900/30
- **Border**: Green-500/30
- **Icon**: Sparkles (green-400)
- **Title**: "Saran untuk Memenangkan Kompetisi" (Suggestions to Win Competition)
- **Content**: Numbered list of actionable suggestions
- **Visibility**: Only shown when suggestions exist

## AI Generation Button

- **Label**: "ai generate" (with Wand2 icon)
- **Style**: Black background, white text, white border
- **State**: Disabled while generating
- **Loading State**: Shows "Generating..." text

## Integration with Other Tabs

### Genre Source
- Genre is derived from Story Formula tab (`storyData.genre`)
- If not set in Story Formula, user can enter manually in Performance Analysis

### Data Persistence
- All 15 factors should be saved to database
- Associated with the current project
- Auto-save on field change

## Responsive Design

### Desktop (md+)
- Two-column layout: Input form (left) | Charts (right)
- Full bar chart visible

### Mobile
- Stacked layout: Input form (top) | Charts (bottom)
- Bar chart scrolls horizontally if needed

## Accessibility

- All input fields have associated labels
- Color contrast meets WCAG AA standards
- Keyboard navigation support
- Screen reader compatible

## Implementation Notes

1. **AI Model**: Use OpenRouter with default model `google/gemini-2.5-flash`
2. **Validation**: All fields optional, but more data = better predictions
3. **Error Handling**: Show user-friendly error messages if AI generation fails
4. **Caching**: Cache predictions to avoid repeated API calls for same data
5. **Loading States**: Show loading indicators during AI generation

## Future Enhancements

- Export analysis to PDF
- Compare against specific competitor projects
- Historical tracking of predictions
- A/B testing different scenarios
- Integration with box office data APIs
