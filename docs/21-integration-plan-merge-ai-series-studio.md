# Integration Plan: Merge AI-Series-Studio into ecosystem-IP-ai

## Overview

This document outlines the plan to integrate the AI-Series-Studio reference implementation (located at `D:/AI/AI-Series-Studio`) into the ecosystem-IP-ai project (located at `D:/AI/ecosystem-IP-ai`) with working authentication, database, and credits system.

## Goal

Transform AI-Series-Studio from a standalone Vite + Express application into a fully functional SaaS platform integrated with:
- **Authentication System**: User registration, login, OAuth (Google)
- **Database System**: PostgreSQL with Drizzle ORM
- **Credits System**: Credit-based AI generation with subscription tiers
- **Multi-tenant Architecture**: Separate projects per organization/user

## Architecture Comparison

### AI-Series-Studio (Reference)
| Aspect | Technology | Notes |
|---------|------------|-------|
| Frontend | Vite + React | Standalone SPA |
| Backend | Express.js | REST API |
| State | React useState | Client-side only |
| Auth | None | Mock data only |
| Database | None | In-memory only |
| AI Integration | Mock API endpoints | No real AI calls |
| File Upload | Local filesystem | `/uploads` directory |

### ecosystem-IP-ai (Target)
| Aspect | Technology | Notes |
|---------|------------|-------|
| Frontend | Next.js 15 (App Router) | React 19, Server Components |
| Backend | Next.js API Routes | Server-side rendering |
| State | React + Server Actions | Database-backed |
| Auth | NextAuth.js v5 | Google OAuth, Credentials |
| Database | PostgreSQL + Drizzle ORM | Multi-tenant schema |
| AI Integration | OpenRouter, Modelslab | Real AI API calls |
| File Upload | Cloudinary / Local | Asset management |

## Integration Strategy

### Phase 1: Database Schema Migration

#### 1.1 Create Universe Formula Table

```sql
-- Universe Formula table
CREATE TABLE universe_formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Locations
  working_office TEXT,
  town_district_city TEXT,
  neighborhood_environment TEXT,
  
  -- Systems
  rules_of_work TEXT,
  labor_law TEXT,
  country TEXT,
  government_system TEXT,
  
  -- Identity
  name_of_universe TEXT,
  periode TEXT,
  
  -- Visuals (image URLs)
  environment_landscape TEXT,
  society_system TEXT,
  private_interior TEXT,
  
  -- Systems
  socio_politic_economy TEXT,
  sociocultural_system TEXT,
  
  -- Private Spaces
  house_castle TEXT,
  room_cave TEXT,
  family_inner_circle TEXT,
  kingdom_tribe_communal TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_universe_formulas_project_id ON universe_formulas(project_id);
```

#### 1.2 Create Strategic Plan Table

```sql
-- Strategic Plan table
CREATE TABLE strategic_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- IP Business Model Canvas
  key_creator TEXT,
  licensable_values TEXT,
  segmentation TEXT,
  key_partners TEXT,
  brand_positioning TEXT,
  core_medium TEXT,
  key_activities TEXT,
  ip_foundation TEXT,
  derivatives_product TEXT,
  cost_structure TEXT,
  revenue_streams TEXT,
  
  -- Performance Analysis
  performa_cast TEXT,
  performa_director TEXT,
  performa_producer TEXT,
  performa_executive_producer TEXT,
  performa_distributor TEXT,
  performa_publisher TEXT,
  performa_title_brand_positioning TEXT,
  performa_theme_stated TEXT,
  performa_unique_selling TEXT,
  performa_story_values TEXT,
  performa_fans_loyalty TEXT,
  performa_production_budget TEXT,
  performa_promotion_budget TEXT,
  performa_social_media_engagements TEXT,
  performa_teaser_trailer_engagements TEXT,
  performa_genre TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_strategic_plans_project_id ON strategic_plans(project_id);
```

#### 1.3 Update Projects Table

```sql
-- Add columns to projects table
ALTER TABLE projects ADD COLUMN universe_formula_id UUID REFERENCES universe_formulas(id);
ALTER TABLE projects ADD COLUMN strategic_plan_id UUID REFERENCES strategic_plans(id);

-- Add columns for IP Project
ALTER TABLE projects ADD COLUMN studio_name TEXT;
ALTER TABLE projects ADD COLUMN studio_logo TEXT;
ALTER TABLE projects ADD COLUMN ip_owner TEXT;
ALTER TABLE projects ADD COLUMN ip_title TEXT;
ALTER TABLE projects ADD COLUMN production_date DATE;
ALTER TABLE projects ADD COLUMN brand_identity_logos TEXT[]; -- Array of image URLs
ALTER TABLE projects ADD COLUMN brand_identity_colors TEXT[]; -- Array of hex colors
```

#### 1.4 Create Project Team Table

```sql
-- Project Team table with Modo Community integration
CREATE TABLE project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  modo_member_id UUID REFERENCES modo_members(id),
  role_title TEXT NOT NULL, -- IP Producer, Head of Creative, etc.
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, modo_member_id)
);

CREATE INDEX idx_project_team_members_project_id ON project_team_members(project_id);
CREATE INDEX idx_project_team_members_modo_member_id ON project_team_members(modo_member_id);
```

### Phase 2: API Routes Implementation

#### 2.1 Universe Formula API Routes

```typescript
// src/app/api/projects/[id]/universe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { universeFormulas } from '@/lib/db/schema';
import { auth } from '@/lib/auth';

// GET universe formula
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const universe = await db.query.universeFormulas.findFirst({
    where: eq(universeFormulas.projectId, params.id),
  });

  return NextResponse.json(universe);
}

// POST/PUT universe formula
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  
  // Check if universe exists
  const existing = await db.query.universeFormulas.findFirst({
    where: eq(universeFormulas.projectId, params.id),
  });

  if (existing) {
    // Update
    const updated = await db.update(universeFormulas)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(universeFormulas.id, existing.id))
      .returning();
    return NextResponse.json(updated[0]);
  } else {
    // Create
    const created = await db.insert(universeFormulas)
      .values({ projectId: params.id, ...data })
      .returning();
    return NextResponse.json(created[0]);
  }
}
```

#### 2.2 Strategic Plan API Routes

```typescript
// src/app/api/projects/[id]/strategic-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { strategicPlans } from '@/lib/db/schema';
import { auth } from '@/lib/auth';

// GET strategic plan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const plan = await db.query.strategicPlans.findFirst({
    where: eq(strategicPlans.projectId, params.id),
  });

  return NextResponse.json(plan);
}

// POST/PUT strategic plan
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  
  const existing = await db.query.strategicPlans.findFirst({
    where: eq(strategicPlans.projectId, params.id),
  });

  if (existing) {
    const updated = await db.update(strategicPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(strategicPlans.id, existing.id))
      .returning();
    return NextResponse.json(updated[0]);
  } else {
    const created = await db.insert(strategicPlans)
      .values({ projectId: params.id, ...data })
      .returning();
    return NextResponse.json(created[0]);
  }
}
```

#### 2.3 Performance Prediction API Route

```typescript
// src/app/api/ai/predict-performance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { openRouterClient } from '@/lib/ai/openrouter';
import { deductCredits } from '@/lib/credits';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  
  // Check credits
  const credits = await getUserCredits(session.user.id);
  if (credits < 50) { // 50 credits for performance prediction
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
  }

  try {
    // Call OpenRouter API
    const prompt = `Analyze the performance potential of this film project:
    
    Cast: ${data.cast}
    Director: ${data.director}
    Producer: ${data.producer}
    Executive Producer: ${data.executiveProducer}
    Distributor: ${data.distributor}
    Publisher: ${data.publisher}
    Title/Brand Positioning: ${data.titleBrandPositioning}
    Genre: ${data.genre}
    Theme Stated: ${data.themeStated}
    Unique Selling: ${data.uniqueSelling}
    Story Values: ${data.storyValues}
    Fans Loyalty: ${data.fansLoyalty}
    Production Budget: ${data.productionBudget}
    Promotion Budget: ${data.promotionBudget}
    Social Media Engagements: ${data.socialMediaEngagements}
    Teaser/Trailer Engagements: ${data.teaserTrailerEngagements}

    Provide:
    1. Scores (0-100) for each factor: Cast, Director, Producer, Executive Producer, Distributor, Publisher, Brand, Theme, USP, Story, Fans, Production Budget, Promotion Budget, Social Media, Teaser
    2. Predicted cinema audience for this project
    3. Average audience for similar competitor projects
    4. 3-5 suggestions to win competition

    Return as JSON with format:
    {
      "scores": [{"name": "Cast", "score": 85, "competitor": 70}, ...],
      "predictedAudience": 1500000,
      "competitorAudience": 1200000,
      "suggestions": ["suggestion 1", "suggestion 2", ...]
    }`;

    const completion = await openRouterClient.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    // Deduct credits
    await deductCredits(session.user.id, 50, 'performance-prediction');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Performance prediction error:', error);
    return NextResponse.json({ error: 'Failed to predict performance' }, { status: 500 });
  }
}
```

### Phase 3: Frontend Component Implementation

#### 3.1 Universe Formula Component

```typescript
// src/app/(dashboard)/projects/[id]/universe/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Globe, User, ImageIcon, Wand2, Save } from 'lucide-react';

interface UniverseData {
  // Locations
  workingOffice: string;
  townDistrictCity: string;
  neighborhoodEnvironment: string;
  
  // Systems
  rulesOfWork: string;
  laborLaw: string;
  country: string;
  governmentSystem: string;
  
  // Identity
  nameOfUniverse: string;
  periode: string;
  
  // Visuals
  environmentLandscape: string;
  societySystem: string;
  privateInterior: string;
  
  // Systems
  socioPoliticEconomy: string;
  socioculturalSystem: string;
  
  // Private Spaces
  houseCastle: string;
  roomCave: string;
  familyInnerCircle: string;
  kingdomTribeCommunal: string;
}

export default function UniverseFormulaPage({ params }: { params: { id: string } }) {
  const [universeData, setUniverseData] = useState<UniverseData>({
    workingOffice: '',
    townDistrictCity: '',
    neighborhoodEnvironment: '',
    rulesOfWork: '',
    laborLaw: '',
    country: '',
    governmentSystem: '',
    nameOfUniverse: '',
    periode: '',
    environmentLandscape: '',
    societySystem: '',
    privateInterior: '',
    socioPoliticEconomy: '',
    socioculturalSystem: '',
    houseCastle: '',
    roomCave: '',
    familyInnerCircle: '',
    kingdomTribeCommunal: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load universe data
  useEffect(() => {
    fetch(`/api/projects/${params.id}/universe`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setUniverseData(data);
        }
        setLoading(false);
      })
      .catch(console.error);
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${params.id}/universe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(universeData),
      });
      
      if (response.ok) {
        alert('Universe Formula saved!');
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="bg-yellow-400 px-3 py-2 text-black font-bold text-lg rounded-sm">
        UNIVERSE & SYSTEM
      </div>

      {/* Top Row: Locations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 bg-orange-100/10 p-4 rounded-lg border border-orange-100/20">
          <Label className="text-xs font-bold text-orange-200">WORKING OFFICE/SCHOOL</Label>
          <Textarea 
            className="bg-black/20 border-white/10 resize-none h-24 text-sm" 
            placeholder="Describe the daily grind..."
            value={universeData.workingOffice}
            onChange={(e) => setUniverseData({ ...universeData, workingOffice: e.target.value })}
          />
        </div>
        <div className="space-y-2 bg-orange-100/10 p-4 rounded-lg border border-orange-100/20">
          <Label className="text-xs font-bold text-orange-200">TOWN/DISTRICT/CITY</Label>
          <Textarea 
            className="bg-black/20 border-white/10 resize-none h-24 text-sm" 
            placeholder="Describe the urban setting..."
            value={universeData.townDistrictCity}
            onChange={(e) => setUniverseData({ ...universeData, townDistrictCity: e.target.value })}
          />
        </div>
        <div className="space-y-2 bg-orange-100/10 p-4 rounded-lg border border-orange-100/20">
          <Label className="text-xs font-bold text-orange-200">NEIGHBORHOOD/ENVIRONMENT</Label>
          <Textarea 
            className="bg-black/20 border-white/10 resize-none h-24 text-sm" 
            placeholder="Describe the local vibe..."
            value={universeData.neighborhoodEnvironment}
            onChange={(e) => setUniverseData({ ...universeData, neighborhoodEnvironment: e.target.value })}
          />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Systems */}
        <div className="md:col-span-3 space-y-4">
          <div className="space-y-2 bg-orange-100/10 p-4 rounded-lg border border-orange-100/20">
            <Label className="text-xs font-bold text-orange-200">RULES OF WORK</Label>
            <Textarea 
              className="bg-black/20 border-white/10 resize-none h-24 text-sm"
              value={universeData.rulesOfWork}
              onChange={(e) => setUniverseData({ ...universeData, rulesOfWork: e.target.value })}
            />
          </div>
          <div className="space-y-2 bg-pink-500/10 p-4 rounded-lg border border-pink-500/20">
            <Label className="text-xs font-bold text-pink-400">LABOR LAW</Label>
            <Textarea 
              className="bg-black/20 border-white/10 resize-none h-24 text-sm"
              value={universeData.laborLaw}
              onChange={(e) => setUniverseData({ ...universeData, laborLaw: e.target.value })}
            />
          </div>
          <div className="space-y-2 bg-pink-500/10 p-4 rounded-lg border border-pink-500/20">
            <Label className="text-xs font-bold text-pink-400">COUNTRY</Label>
            <Textarea 
              className="bg-black/20 border-white/10 resize-none h-12 text-sm"
              value={universeData.country}
              onChange={(e) => setUniverseData({ ...universeData, country: e.target.value })}
            />
          </div>
          <div className="space-y-2 bg-pink-500/10 p-4 rounded-lg border border-pink-500/20">
            <Label className="text-xs font-bold text-pink-400">GOVERNMENT SYSTEM</Label>
            <Textarea 
              className="bg-black/20 border-white/10 resize-none h-24 text-sm"
              value={universeData.governmentSystem}
              onChange={(e) => setUniverseData({ ...universeData, governmentSystem: e.target.value })}
            />
          </div>
        </div>

        {/* Center Column: Identity & Image */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="bg-yellow-400 px-2 py-1 text-black font-bold text-xs rounded-sm text-center">NAME OF UNIVERSE</div>
              <Input 
                className="bg-black/20 border-white/10 text-center font-display font-bold text-lg h-12" 
                placeholder="e.g. Neo-Tokyo 2099"
                value={universeData.nameOfUniverse}
                onChange={(e) => setUniverseData({ ...universeData, nameOfUniverse: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="bg-yellow-400 px-2 py-1 text-black font-bold text-xs rounded-sm text-center">PERIODE</div>
              <Input 
                className="bg-black/20 border-white/10 text-center font-display text-lg h-12" 
                placeholder="e.g. 22nd Century"
                value={universeData.periode}
                onChange={(e) => setUniverseData({ ...universeData, periode: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 h-[350px]">
            {/* Environment - Top */}
            <div className="col-span-2 h-[200px] bg-yellow-400/10 border-2 border-yellow-400/30 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group">
              {universeData.environmentLandscape ? (
                <img src={universeData.environmentLandscape} className="w-full h-full object-cover" alt="Environment" />
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-yellow-400 mb-2 z-10" />
                  <span className="text-sm font-bold text-yellow-400 z-10">ENVIRONMENT / LANDSCAPE</span>
                </>
              )}
            </div>

            {/* Society - Bottom Left */}
            <div className="h-[135px] bg-pink-500/10 border-2 border-pink-500/30 rounded-lg flex flex-col items-center justify-center">
              <Globe className="h-6 w-6 text-pink-400 mb-2 z-10" />
              <span className="text-xs font-bold text-pink-400 z-10 text-center px-2">SOCIETY & SYSTEM</span>
            </div>

            {/* Private - Bottom Right */}
            <div className="h-[135px] bg-blue-500/10 border-2 border-blue-500/30 rounded-lg flex flex-col items-center justify-center">
              <User className="h-6 w-6 text-blue-400 mb-2 z-10" />
              <span className="text-xs font-bold text-blue-400 z-10 text-center px-2">PRIVATE / INTERIOR</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 bg-pink-500/10 p-4 rounded-lg border border-pink-500/20">
              <Label className="text-xs font-bold text-pink-400">SOCIO POLITIC & ECONOMY</Label>
              <Textarea 
                className="bg-black/20 border-white/10 resize-none h-24 text-sm"
                value={universeData.socioPoliticEconomy}
                onChange={(e) => setUniverseData({ ...universeData, socioPoliticEconomy: e.target.value })}
              />
            </div>
            <div className="space-y-2 bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
              <Label className="text-xs font-bold text-blue-400">SOCIOCULTURAL SYSTEM</Label>
              <Textarea 
                className="bg-black/20 border-white/10 resize-none h-24 text-sm"
                value={universeData.socioculturalSystem}
                onChange={(e) => setUniverseData({ ...universeData, socioculturalSystem: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Private Life */}
        <div className="md:col-span-3 space-y-4">
          <div className="space-y-2 bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <Label className="text-xs font-bold text-blue-400">HOUSE/CASTLE</Label>
            <Textarea 
              className="bg-black/20 border-white/10 resize-none h-24 text-sm"
              value={universeData.houseCastle}
              onChange={(e) => setUniverseData({ ...universeData, houseCastle: e.target.value })}
            />
          </div>
          <div className="space-y-2 bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <Label className="text-xs font-bold text-blue-400">ROOM/CAVE</Label>
            <Textarea 
              className="bg-black/20 border-white/10 resize-none h-24 text-sm"
              value={universeData.roomCave}
              onChange={(e) => setUniverseData({ ...universeData, roomCave: e.target.value })}
            />
          </div>
          <div className="space-y-2 bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <Label className="text-xs font-bold text-blue-400">FAMILY/INNER CIRCLE</Label>
            <Textarea 
              className="bg-black/20 border-white/10 resize-none h-24 text-sm"
              value={universeData.familyInnerCircle}
              onChange={(e) => setUniverseData({ ...universeData, familyInnerCircle: e.target.value })}
            />
          </div>
          <div className="space-y-2 bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <Label className="text-xs font-bold text-blue-400">KINGDOM/TRIBE/COMMUNAL</Label>
            <Textarea 
              className="bg-black/20 border-white/10 resize-none h-24 text-sm"
              value={universeData.kingdomTribeCommunal}
              onChange={(e) => setUniverseData({ ...universeData, kingdomTribeCommunal: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_-5px_hsl(var(--primary))]"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Universe Bible'}
        </Button>
      </div>
    </div>
  );
}
```

#### 3.2 Strategic Plan Component

```typescript
// src/app/(dashboard)/projects/[id]/strategic-plan/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wand2, Save } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StrategicPlanData {
  // IP Business Model Canvas
  keyCreator: string;
  licensableValues: string;
  segmentation: string;
  keyPartners: string;
  brandPositioning: string;
  coreMedium: string;
  keyActivities: string;
  ipFoundation: string;
  derivativesProduct: string;
  costStructure: string;
  revenueStreams: string;
  
  // Performance Analysis
  performaCast: string;
  performaDirector: string;
  performaProducer: string;
  performaExecutiveProducer: string;
  performaDistributor: string;
  performaPublisher: string;
  performaTitleBrandPositioning: string;
  performaThemeStated: string;
  performaUniqueSelling: string;
  performaStoryValues: string;
  performaFansLoyalty: string;
  performaProductionBudget: string;
  performaPromotionBudget: string;
  performaSocialMediaEngagements: string;
  performaTeaserTrailerEngagements: string;
  performaGenre: string;
}

export default function StrategicPlanPage({ params }: { params: { id: string } }) {
  const [planData, setPlanData] = useState<StrategicPlanData>({
    keyCreator: '',
    licensableValues: '',
    segmentation: '',
    keyPartners: '',
    brandPositioning: '',
    coreMedium: '',
    keyActivities: '',
    ipFoundation: '',
    derivativesProduct: '',
    costStructure: '',
    revenueStreams: '',
    performaCast: '',
    performaDirector: '',
    performaProducer: '',
    performaExecutiveProducer: '',
    performaDistributor: '',
    performaPublisher: '',
    performaTitleBrandPositioning: '',
    performaThemeStated: '',
    performaUniqueSelling: '',
    performaStoryValues: '',
    performaFansLoyalty: '',
    performaProductionBudget: '',
    performaPromotionBudget: '',
    performaSocialMediaEngagements: '',
    performaTeaserTrailerEngagements: '',
    performaGenre: '',
  });

  const [scores, setScores] = useState<any[]>([]);
  const [predictedAudience, setPredictedAudience] = useState<number | null>(null);
  const [competitorAudience, setCompetitorAudience] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePredict = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/ai/predict-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cast: planData.performaCast,
          director: planData.performaDirector,
          producer: planData.performaProducer,
          executiveProducer: planData.performaExecutiveProducer,
          distributor: planData.performaDistributor,
          publisher: planData.performaPublisher,
          titleBrandPositioning: planData.performaTitleBrandPositioning,
          themeStated: planData.performaThemeStated,
          uniqueSelling: planData.performaUniqueSelling,
          storyValues: planData.performaStoryValues,
          fansLoyalty: planData.performaFansLoyalty,
          productionBudget: planData.performaProductionBudget,
          promotionBudget: planData.performaPromotionBudget,
          socialMediaEngagements: planData.performaSocialMediaEngagements,
          teaserTrailerEngagements: planData.performaTeaserTrailerEngagements,
          genre: planData.performaGenre,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setScores(data.scores || []);
        setPredictedAudience(data.predictedAudience);
        setCompetitorAudience(data.competitorAudience);
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${params.id}/strategic-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });

      if (response.ok) {
        alert('Strategic Plan saved!');
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-8 pb-6">
      {/* IP Business Model Canvas */}
      <div>
        <h2 className="text-xl font-bold mb-4">IP Business Model Canvas</h2>
        <div className="grid grid-cols-3 gap-3">
          {/* Row 1 */}
          <div className="border border-white/20 rounded-lg p-4 bg-card/30">
            <Label className="text-xs font-bold text-muted-foreground mb-2 block">Key Creator/ Owner</Label>
            <Textarea 
              className="bg-black/20 border-white/10 min-h-[80px] text-sm" 
              placeholder="Enter key creator/owner..."
              value={planData.keyCreator}
              onChange={(e) => setPlanData({ ...planData, keyCreator: e.target.value })}
            />
          </div>
          <div className="border border-white/20 rounded-lg p-4 bg-card/30">
            <Label className="text-xs font-bold text-muted-foreground mb-2 block">Licensable & Unique Values</Label>
            <Textarea 
              className="bg-black/20 border-white/10 min-h-[80px] text-sm" 
              placeholder="Enter licensable & unique values..."
              value={planData.licensableValues}
              onChange={(e) => setPlanData({ ...planData, licensableValues: e.target.value })}
            />
          </div>
          <div className="border border-white/20 rounded-lg p-4 bg-card/30">
            <Label className="text-xs font-bold text-muted-foreground mb-2 block">Segmentation</Label>
            <Textarea 
              className="bg-black/20 border-white/10 min-h-[80px] text-sm" 
              placeholder="Enter segmentation..."
              value={planData.segmentation}
              onChange={(e) => setPlanData({ ...planData, segmentation: e.target.value })}
            />
          </div>
          
          {/* Row 2 */}
          <div className="border border-white/20 rounded-lg p-4 bg-card/30">
            <Label className="text-xs font-bold text-muted-foreground mb-2 block">Key Partners</Label>
            <Textarea 
              className="bg-black/20 border-white/10 min-h-[80px] text-sm" 
              placeholder="Enter key partners..."
              value={planData.keyPartners}
              onChange={(e) => setPlanData({ ...planData, keyPartners: e.target.value })}
            />
          </div>
          <div className="border border-white/20 rounded-lg p-4 bg-card/30">
            <Label className="text-xs font-bold text-muted-foreground mb-2 block">Brand Positioning/ Archetype</Label>
            <Textarea 
              className="bg-black/20 border-white/10 min-h-[80px] text-sm" 
              placeholder="Enter brand positioning/archetype..."
              value={planData.brandPositioning}
              onChange={(e) => setPlanData({ ...planData, brandPositioning: e.target.value })}
            />
          </div>
          <div className="border border-white/20 rounded-lg p-4 bg-card/30">
            <Label className="text-xs font-bold text-muted-foreground mb-2 block">Core Medium/ Core Franchise</Label>
            <Textarea 
              className="bg-black/20 border-white/10 min-h-[80px] text-sm" 
              placeholder="Enter core medium/franchise..."
              value={planData.coreMedium}
              onChange={(e) => setPlanData({ ...planData, coreMedium: e.target.value })}
            />
          </div>
          
          {/* Row 3 */}
          <div className="border border-white/20 rounded-lg p-4 bg-card/30">
            <Label className="text-xs font-bold text-muted-foreground mb-2 block">Key Activities</Label>
            <Textarea 
              className="bg-black/20 border-white/10 min-h-[120px] text-sm" 
              placeholder="Enter key activities..."
              value={planData.keyActivities}
              onChange={(e) => setPlanData({ ...planData, keyActivities: e.target.value })}
            />
          </div>
          <div className="border border-white/20 rounded-lg p-4 bg-card/30 row-span-2">
            <Label className="text-xs font-bold text-muted-foreground mb-2 block">IP Foundation</Label>
            <Textarea 
              className="bg-black/20 border-white/10 min-h-[200px] text-sm" 
              placeholder="Enter IP foundation..."
              value={planData.ipFoundation}
              onChange={(e) => setPlanData({ ...planData, ipFoundation: e.target.value })}
            />
          </div>
          <div className="border border-white/20 rounded-lg p-4 bg-card/30">
            <Label className="text-xs font-bold text-muted-foreground mb-2 block">Derivatives Product</Label>
            <Textarea 
              className="bg-black/20 border-white/10 min-h-[120px] text-sm" 
              placeholder="Enter derivatives product..."
              value={planData.derivativesProduct}
              onChange={(e) => setPlanData({ ...planData, derivativesProduct: e.target.value })}
            />
          </div>
          
          {/* Row 4 */}
          <div className="border border-white/20 rounded-lg p-4 bg-card/30">
            <Label className="text-xs font-bold text-muted-foreground mb-2 block">Cost Structure</Label>
            <Textarea 
              className="bg-black/20 border-white/10 min-h-[80px] text-sm" 
              placeholder="Enter cost structure..."
              value={planData.costStructure}
              onChange={(e) => setPlanData({ ...planData, costStructure: e.target.value })}
            />
          </div>
          <div className="border border-white/20 rounded-lg p-4 bg-card/30">
            <Label className="text-xs font-bold text-muted-foreground mb-2 block">Revenue Streams</Label>
            <Textarea 
              className="bg-black/20 border-white/10 min-h-[80px] text-sm" 
              placeholder="Enter revenue streams..."
              value={planData.revenueStreams}
              onChange={(e) => setPlanData({ ...planData, revenueStreams: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Performa Analysis Based on Key Factor */}
      <div>
        <h2 className="text-xl font-bold mb-4">Performa Analysis Based on Key Factor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Fields */}
          <div className="space-y-3">
            {[
              { key: 'performaCast', label: 'Cast' },
              { key: 'performaDirector', label: 'Director' },
              { key: 'performaProducer', label: 'Producer' },
              { key: 'performaExecutiveProducer', label: 'Executive Producer' },
              { key: 'performaDistributor', label: 'Distributor' },
              { key: 'performaPublisher', label: 'Publisher' },
              { key: 'performaTitleBrandPositioning', label: 'Title/ Brand Positioning' },
              { key: 'performaGenre', label: 'Genre' },
              { key: 'performaThemeStated', label: 'Theme Stated' },
              { key: 'performaUniqueSelling', label: 'Unique Selling' },
              { key: 'performaStoryValues', label: 'Story Values' },
              { key: 'performaFansLoyalty', label: 'Fans Loyalty' },
              { key: 'performaProductionBudget', label: 'Production Budget' },
              { key: 'performaPromotionBudget', label: 'Promotion Budget' },
              { key: 'performaSocialMediaEngagements', label: 'Social Media Engagements' },
              { key: 'performaTeaserTrailerEngagements', label: 'Teaser/ Trailer Engagements' },
            ].map((field) => (
              <div key={field.key} className="flex items-center gap-4">
                <Label className="text-sm w-40 shrink-0">{field.label}</Label>
                <Input 
                  className="bg-black/20 border-white/10 flex-1" 
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  value={planData[field.key as keyof StrategicPlanData] as string}
                  onChange={(e) => setPlanData({ ...planData, [field.key]: e.target.value })}
                />
              </div>
            ))}
            
            <div className="pt-4 flex gap-2">
              <Button 
                className="flex-1 bg-black text-white border border-white/20 hover:bg-white/10"
                disabled={generating}
                onClick={handlePredict}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {generating ? 'Generating...' : 'AI Generate'}
              </Button>
              <Button 
                className="flex-1 bg-primary text-white hover:bg-primary/90"
                disabled={saving}
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
          
          {/* Chart and Prediction */}
          <div className="space-y-4">
            <Card className="bg-black border-white/10">
              <CardContent className="p-4 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scores.length > 0 ? scores : []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" fontSize={8} angle={-45} textAnchor="end" height={50} />
                    <YAxis stroke="#666" fontSize={10} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="score" fill="#9B87F5" name="Your Project" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="competitor" fill="#F97316" name="Competitor Avg" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Predicted Cinema Audience */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white/80">Prediksi Penonton</h4>
                      <p className="text-xs text-white/50">Proyek Anda</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#9B87F5]">
                        {predictedAudience !== null 
                          ? predictedAudience.toLocaleString('id-ID')
                          : "---"}
                      </div>
                      <div className="text-xs text-white/50">penonton</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white/80">Penonton Kompetitor</h4>
                      <p className="text-xs text-white/50">Rata-rata {planData.performaGenre}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#F97316]">
                        {competitorAudience !== null 
                          ? competitorAudience.toLocaleString('id-ID')
                          : "---"}
                      </div>
                      <div className="text-xs text-white/50">penonton</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Suggestions to Win Competition */}
            {suggestions.length > 0 && (
              <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-green-400 mb-3">Saran untuk Memenangkan Kompetisi</h4>
                  <ul className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                        <span className="text-green-400 font-bold shrink-0">{index + 1}.</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Phase 4: Credits System Integration

#### 4.1 Credit Costs

| Feature | Credits Required |
|---------|-----------------|
| Performance Prediction | 50 credits |
| Universe Environment Image | 100 credits |
| Universe Society Image | 100 credits |
| Universe Private Interior Image | 100 credits |
| Character Image (per pose) | 50 credits |
| Moodboard Image | 75 credits |
| Animation Preview | 150 credits |
| Full Animation Video | 500 credits |

#### 4.2 Credit Deduction Function

```typescript
// src/lib/credits.ts
import { db } from '@/lib/db';
import { users, creditTransactions } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function getUserCredits(userId: string): Promise<number> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { credits: true },
  });
  return user?.credits || 0;
}

export async function deductCredits(
  userId: string,
  amount: number,
  description: string
): Promise<boolean> {
  try {
    await db.transaction(async (tx) => {
      // Deduct from user balance
      await tx.execute(sql`
        UPDATE users 
        SET credits = credits - ${amount} 
        WHERE id = ${userId} AND credits >= ${amount}
      `);
      
      // Record transaction
      await tx.insert(creditTransactions).values({
        userId,
        amount: -amount,
        description,
        balanceAfter: sql`(SELECT credits FROM users WHERE id = ${userId})`,
      });
    });
    return true;
  } catch (error) {
    console.error('Credit deduction error:', error);
    return false;
  }
}

export async function addCredits(
  userId: string,
  amount: number,
  description: string
): Promise<void> {
  await db.transaction(async (tx) => {
    // Add to user balance
    await tx.execute(sql`
      UPDATE users 
      SET credits = credits + ${amount} 
      WHERE id = ${userId}
    `);
    
    // Record transaction
    await tx.insert(creditTransactions).values({
      userId,
      amount,
      description,
      balanceAfter: sql`(SELECT credits FROM users WHERE id = ${userId})`,
    });
  });
}
```

### Phase 5: File Upload Integration

#### 5.1 Asset Library API

```typescript
// src/app/api/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { assets } from '@/lib/db/schema';
import { uploadToCloudinary } from '@/lib/cloudinary';

// GET assets
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userAssets = await db.query.assets.findMany({
    where: eq(assets.userId, session.user.id),
    orderBy: (assets, { desc }) => [desc(assets.createdAt)],
  });

  return NextResponse.json(userAssets);
}

// POST upload asset
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(file);
    
    // Save to database
    const asset = await db.insert(assets).values({
      userId: session.user.id,
      url: result.secure_url,
      filename: result.public_id,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
    }).returning();

    return NextResponse.json(asset[0]);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

## Implementation Timeline

| Week | Tasks |
|------|--------|
| Week 1 | Database schema migration, create tables |
| Week 2 | API routes for Universe Formula and Strategic Plan |
| Week 3 | Frontend components for Universe Formula |
| Week 4 | Frontend components for Strategic Plan |
| Week 5 | Credits system integration |
| Week 6 | File upload integration (Asset Library) |
| Week 7 | AI integration (OpenRouter, Modelslab) |
| Week 8 | Testing and bug fixes |

## Testing Checklist

- [ ] Universe Formula saves and loads correctly
- [ ] Strategic Plan saves and loads correctly
- [ ] Performance prediction works with credits deduction
- [ ] Asset upload works
- [ ] Credits are deducted correctly
- [ ] Auth protects all routes
- [ ] Multi-tenant isolation works
- [ ] Responsive design on mobile
- [ ] AI generation works with real APIs

## Deployment

1. Run database migrations
2. Set environment variables (OpenRouter API key, Modelslab API key, Cloudinary)
3. Deploy to Vercel
4. Monitor logs and performance
