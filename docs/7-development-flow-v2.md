# 🚀 DEVELOPMENT FLOW - COMPLETE GUIDE
## MODO Creator Verse - December 2025

---

# 📑 TABLE OF CONTENTS

1. [Tech Stack & Setup](#tech-stack)
2. [Project Structure](#project-structure)
3. [Development Phases](#development-phases)
4. [AI Integration Guide](#ai-integration)
5. [Database & API Patterns](#database-api)
6. [Authentication Flow](#authentication)
7. [Deployment Strategy](#deployment)
8. [Testing Strategy](#testing)

---

# 🛠️ TECH STACK & SETUP

## Core Technologies

```typescript
const techStack = {
  // Frontend
  framework: "Next.js 15 (App Router)",
  language: "TypeScript 5.x",
  styling: "Tailwind CSS 4.x",
  components: "shadcn/ui",
  state: "Zustand + TanStack Query",
  forms: "React Hook Form + Zod",
  
  // Backend
  runtime: "Node.js 22 LTS",
  database: "PostgreSQL 16 (Neon)",
  orm: "Drizzle ORM",
  cache: "Redis (Upstash)",
  storage: "Cloudflare R2",
  
  // AI Integration
  aiSdk: "Vercel AI SDK 4.x",
  providers: ["OpenAI", "Google", "Anthropic", "Replicate"],
  
  // Auth & Payments
  auth: "NextAuth.js v5",
  payments: "Manual (Contact Admin)",
  
  // DevOps
  hosting: "Vercel",
  ci: "GitHub Actions",
  monitoring: "Vercel Analytics + Sentry",
};
```

## Initial Project Setup

```bash
# 1. Create Next.js project
npx create-next-app@latest modo-creator-verse \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

# 2. Install dependencies
cd modo-creator-verse

# UI Components
npx shadcn@latest init
npx shadcn@latest add button card dialog form input label tabs toast

# Database
npm install drizzle-orm postgres
npm install -D drizzle-kit

# AI SDK (Vercel AI SDK - supports multi-provider)
npm install ai @ai-sdk/openai @ai-sdk/google @ai-sdk/anthropic

# Auth
npm install next-auth@beta @auth/drizzle-adapter

# State & Forms
npm install zustand @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod

# Utils
npm install date-fns lucide-react framer-motion
npm install clsx tailwind-merge

# 3. Setup environment
cp .env.example .env.local
```

## Environment Variables

```env
# .env.local (DO NOT COMMIT!)

# Database
DATABASE_URL="postgresql://..."

# AI Providers (Superadmin akan set di database)
# Ini hanya fallback default
OPENAI_API_KEY=""
GOOGLE_AI_API_KEY=""
ANTHROPIC_API_KEY=""

# Auth
AUTH_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# Storage
CLOUDFLARE_R2_ACCESS_KEY=""
CLOUDFLARE_R2_SECRET_KEY=""
CLOUDFLARE_R2_BUCKET=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

# 📁 PROJECT STRUCTURE

```
modo-creator-verse/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public pages (no auth)
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── features/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── studio/page.tsx
│   │   │   │   ├── watch/page.tsx
│   │   │   │   └── ...
│   │   │   ├── pricing/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── showcase/page.tsx
│   │   │
│   │   ├── (auth)/             # Auth pages
│   │   │   ├── auth/page.tsx   # Combined login/register
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/        # Protected dashboard
│   │   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── studio/
│   │   │   │   ├── page.tsx    # Projects list
│   │   │   │   ├── [id]/       # Project detail
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── story/page.tsx
│   │   │   │   │   ├── characters/page.tsx
│   │   │   │   │   └── ...
│   │   │   │   └── new/page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── profile/page.tsx
│   │   │   │   ├── subscription/page.tsx
│   │   │   │   ├── api-keys/page.tsx
│   │   │   │   └── team/page.tsx
│   │   │   └── ...
│   │   │
│   │   ├── (superadmin)/       # Superadmin panel
│   │   │   ├── layout.tsx
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx    # Dashboard overview
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── ai-providers/page.tsx
│   │   │   │   ├── pricing/page.tsx
│   │   │   │   └── analytics/page.tsx
│   │   │   └── ...
│   │   │
│   │   ├── api/                # API Routes
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── ai/
│   │   │   │   ├── generate-text/route.ts
│   │   │   │   ├── generate-image/route.ts
│   │   │   │   ├── generate-video/route.ts
│   │   │   │   └── ...
│   │   │   ├── projects/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/route.ts
│   │   │   │   └── replicate/route.ts
│   │   │   └── ...
│   │   │
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── landing/            # Landing page sections
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── CTA.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthTabs.tsx
│   │   ├── studio/             # Studio module components
│   │   ├── settings/           # Settings components
│   │   └── shared/             # Shared components
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts        # Drizzle client
│   │   │   ├── schema.ts       # Database schema
│   │   │   └── migrations/     # Drizzle migrations
│   │   ├── ai/
│   │   │   ├── providers.ts    # AI provider configuration
│   │   │   ├── router.ts       # Multi-provider router
│   │   │   ├── text.ts         # Text generation
│   │   │   ├── image.ts        # Image generation
│   │   │   └── video.ts        # Video generation
│   │   ├── auth/
│   │   │   ├── config.ts       # NextAuth config
│   │   │   └── middleware.ts   # Auth middleware
│   │   ├── utils/
│   │   │   ├── cn.ts           # className helper
│   │   │   ├── format.ts       # Formatters
│   │   │   └── validation.ts   # Zod schemas
│   │   └── constants.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAI.ts
│   │   ├── useCredits.ts
│   │   └── useProject.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── projectStore.ts
│   │   └── uiStore.ts
│   │
│   └── types/
│       ├── index.ts
│       ├── ai.ts
│       └── project.ts
│
├── public/
│   ├── images/
│   └── fonts/
│
├── drizzle/
│   └── migrations/
│
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

# 📅 DEVELOPMENT PHASES

## Phase 1: Foundation (Week 1-2)
**Priority: Setup core infrastructure**

```typescript
// Tasks
const phase1 = {
  week1: [
    "✓ Setup Next.js 15 project with TypeScript",
    "✓ Configure Tailwind CSS + shadcn/ui",
    "✓ Setup Drizzle ORM + PostgreSQL (Neon)",
    "✓ Create database schema (core tables)",
    "✓ Setup NextAuth.js v5 with Google/GitHub",
    "✓ Create basic auth pages (/auth)",
  ],
  week2: [
    "✓ Build landing page (all sections)",
    "✓ Build public pages (features, pricing, about, contact)",
    "✓ Setup responsive layouts",
    "✓ Configure Vercel deployment",
    "✓ Setup CI/CD with GitHub Actions",
  ],
};
```

### Database Schema (Core Tables)

```typescript
// lib/db/schema.ts

import { pgTable, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Users
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  role: text('role').default('user'), // user, admin, superadmin
  
  // Subscription
  plan: text('plan').default('trial'), // trial, premium, pro, unlimited
  planExpiresAt: timestamp('plan_expires_at'),
  trialUsed: integer('trial_used').default(0), // 0-2 for trial
  credits: integer('credits').default(0),
  
  // Limits
  maxProjects: integer('max_projects').default(1),
  maxCreditsPerMonth: integer('max_credits_per_month').default(0),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// AI Providers (Superadmin configures)
export const aiProviders = pgTable('ai_providers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(), // openai, google, anthropic, replicate
  type: text('type').notNull(), // text, image, video, audio
  apiKey: text('api_key').notNull(), // ENCRYPTED!
  isEnabled: boolean('is_enabled').default(true),
  isDefault: boolean('is_default').default(false),
  config: jsonb('config'), // Model settings, etc.
  createdAt: timestamp('created_at').defaultNow(),
});

// AI Models (Available models per provider)
export const aiModels = pgTable('ai_models', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  providerId: text('provider_id').references(() => aiProviders.id),
  name: text('name').notNull(), // gpt-4, gemini-pro, etc.
  displayName: text('display_name').notNull(),
  type: text('type').notNull(), // text, image, video, audio
  costPerUnit: integer('cost_per_unit').default(0), // Cost in credits
  isEnabled: boolean('is_enabled').default(true),
  config: jsonb('config'),
});

// Projects (IP Bibles)
export const projects = pgTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  genre: text('genre'),
  status: text('status').default('draft'), // draft, in_progress, completed
  coverImage: text('cover_image'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Credit Transactions
export const creditTransactions = pgTable('credit_transactions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id),
  amount: integer('amount').notNull(), // positive = add, negative = deduct
  type: text('type').notNull(), // purchase, usage, refund, bonus
  description: text('description'),
  metadata: jsonb('metadata'), // AI model used, project, etc.
  createdAt: timestamp('created_at').defaultNow(),
});
```

## Phase 2: AI Integration (Week 3-4)
**Priority: Multi-provider AI system**

```typescript
const phase2 = {
  week3: [
    "✓ Setup Vercel AI SDK",
    "✓ Create AI provider router (multi-provider)",
    "✓ Implement text generation (story, characters)",
    "✓ Implement image generation (characters, scenes)",
    "✓ Credit deduction system",
  ],
  week4: [
    "✓ Implement video generation (optional)",
    "✓ Implement audio generation (optional)",
    "✓ Build Superadmin AI provider panel",
    "✓ Cost tracking & alerts",
    "✓ Error handling & refunds",
  ],
};
```

---

# 🤖 AI INTEGRATION GUIDE

## Vercel AI SDK Setup (Multi-Provider)

```typescript
// lib/ai/providers.ts

import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { db } from '@/lib/db';
import { aiProviders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt } from '@/lib/utils/encryption';

// Get provider configuration from database
export async function getAIProvider(type: 'text' | 'image' | 'video', providerId?: string) {
  // Get default or specific provider
  const provider = await db.query.aiProviders.findFirst({
    where: providerId 
      ? eq(aiProviders.id, providerId)
      : and(
          eq(aiProviders.type, type),
          eq(aiProviders.isDefault, true),
          eq(aiProviders.isEnabled, true)
        ),
  });
  
  if (!provider) {
    throw new Error(`No ${type} provider configured`);
  }
  
  // Decrypt API key
  const apiKey = decrypt(provider.apiKey);
  
  // Create provider instance
  switch (provider.name) {
    case 'openai':
      return createOpenAI({ apiKey });
    case 'google':
      return createGoogleGenerativeAI({ apiKey });
    case 'anthropic':
      return createAnthropic({ apiKey });
    default:
      throw new Error(`Unknown provider: ${provider.name}`);
  }
}

// Get available models for a provider
export async function getAvailableModels(type: 'text' | 'image' | 'video') {
  const models = await db.query.aiModels.findMany({
    where: and(
      eq(aiModels.type, type),
      eq(aiModels.isEnabled, true)
    ),
    with: {
      provider: true,
    },
  });
  
  return models.map(m => ({
    id: m.id,
    name: m.name,
    displayName: m.displayName,
    provider: m.provider.name,
    costPerUnit: m.costPerUnit,
  }));
}
```

## Text Generation (Streaming)

```typescript
// app/api/ai/generate-text/route.ts

import { streamText } from 'ai';
import { getAIProvider } from '@/lib/ai/providers';
import { checkCredits, deductCredits } from '@/lib/ai/credits';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const { prompt, type, projectId, modelId } = await req.json();
  
  // Check credits
  const creditCost = await checkCredits(session.user.id, modelId);
  if (!creditCost.hasEnough) {
    return new Response(JSON.stringify({
      error: 'Insufficient credits',
      required: creditCost.required,
      available: creditCost.available,
    }), { status: 402 });
  }
  
  // Check trial limits
  if (session.user.plan === 'trial') {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    
    if (user.trialUsed >= 2) {
      return new Response(JSON.stringify({
        error: 'Trial limit reached',
        message: 'Upgrade to continue using AI features',
      }), { status: 402 });
    }
  }
  
  try {
    // Get AI provider
    const provider = await getAIProvider('text', modelId);
    
    // System prompts based on type
    const systemPrompts = {
      story: `You are a professional screenwriter and story developer. 
        Create compelling narratives with rich details, clear structure, 
        and engaging plot points. Format output in Markdown.`,
      character: `You are a character designer and writer. 
        Create detailed character profiles including backstory, 
        personality traits, motivations, and relationships.`,
      world: `You are a world-builder and lore creator. 
        Design immersive settings with history, culture, 
        geography, and rules that govern the world.`,
      script: `You are a screenplay writer. 
        Write in proper screenplay format with scene headings, 
        action lines, and dialogue.`,
    };
    
    // Stream response
    const result = await streamText({
      model: provider('gpt-4-turbo'), // or gemini-pro, claude-3
      system: systemPrompts[type] || systemPrompts.story,
      prompt,
      maxTokens: 4000,
      temperature: 0.7,
      onFinish: async ({ text, usage }) => {
        // Deduct credits after successful generation
        await deductCredits({
          userId: session.user.id,
          modelId,
          usage: usage.totalTokens,
          projectId,
          type,
          content: text.slice(0, 500), // Store preview
        });
        
        // Increment trial usage if trial user
        if (session.user.plan === 'trial') {
          await db.update(users)
            .set({ trialUsed: sql`trial_used + 1` })
            .where(eq(users.id, session.user.id));
        }
      },
    });
    
    // Return streaming response
    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error('AI Generation Error:', error);
    return new Response(JSON.stringify({
      error: 'Generation failed',
      message: error.message,
    }), { status: 500 });
  }
}
```

## Image Generation

```typescript
// app/api/ai/generate-image/route.ts

import { generateImage } from '@/lib/ai/image';
import { checkCredits, deductCredits } from '@/lib/ai/credits';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const { prompt, style, aspectRatio, projectId, modelId } = await req.json();
  
  // Check credits
  const creditCost = await checkCredits(session.user.id, modelId);
  if (!creditCost.hasEnough) {
    return new Response(JSON.stringify({
      error: 'Insufficient credits',
    }), { status: 402 });
  }
  
  try {
    // Enhanced prompt for consistency
    const enhancedPrompt = `
      ${prompt}
      
      Style: ${style || 'cinematic, high quality, detailed'}
      Aspect Ratio: ${aspectRatio || '16:9'}
      
      For IP Bible character/scene reference.
    `;
    
    // Generate image based on model
    const result = await generateImage({
      modelId,
      prompt: enhancedPrompt,
      aspectRatio,
    });
    
    // Deduct credits
    await deductCredits({
      userId: session.user.id,
      modelId,
      projectId,
      type: 'image',
      imageUrl: result.url,
    });
    
    return Response.json({
      success: true,
      imageUrl: result.url,
      metadata: result.metadata,
    });
    
  } catch (error) {
    console.error('Image Generation Error:', error);
    return new Response(JSON.stringify({
      error: 'Generation failed',
      message: error.message,
    }), { status: 500 });
  }
}

// lib/ai/image.ts

export async function generateImage({ modelId, prompt, aspectRatio }) {
  const model = await db.query.aiModels.findFirst({
    where: eq(aiModels.id, modelId),
    with: { provider: true },
  });
  
  const apiKey = decrypt(model.provider.apiKey);
  
  switch (model.provider.name) {
    case 'openai':
      // DALL-E 3
      const openai = new OpenAI({ apiKey });
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        size: aspectRatio === '1:1' ? '1024x1024' : '1792x1024',
        quality: 'hd',
      });
      return { url: response.data[0].url };
      
    case 'replicate':
      // FLUX, Stable Diffusion, etc.
      const replicate = new Replicate({ auth: apiKey });
      const output = await replicate.run(model.config.modelId, {
        input: { prompt, aspect_ratio: aspectRatio },
      });
      return { url: output[0] };
      
    case 'google':
      // Imagen 3
      const genai = new GoogleGenerativeAI(apiKey);
      const imagen = genai.getGenerativeModel({ model: 'imagen-3.0' });
      const result = await imagen.generateImages({ prompt });
      return { url: result.images[0].uri };
      
    default:
      throw new Error(`Unsupported image provider: ${model.provider.name}`);
  }
}
```

## Credit System

```typescript
// lib/ai/credits.ts

import { db } from '@/lib/db';
import { users, creditTransactions, aiModels } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function checkCredits(userId: string, modelId: string) {
  const [user, model] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.aiModels.findFirst({ where: eq(aiModels.id, modelId) }),
  ]);
  
  return {
    hasEnough: user.credits >= model.costPerUnit,
    required: model.costPerUnit,
    available: user.credits,
  };
}

export async function deductCredits({
  userId,
  modelId,
  projectId,
  type,
  usage,
  content,
  imageUrl,
}) {
  const model = await db.query.aiModels.findFirst({
    where: eq(aiModels.id, modelId),
  });
  
  const cost = model.costPerUnit;
  
  // Transaction: deduct credits and log
  await db.transaction(async (tx) => {
    // Deduct from user
    await tx.update(users)
      .set({ credits: sql`credits - ${cost}` })
      .where(eq(users.id, userId));
    
    // Log transaction
    await tx.insert(creditTransactions).values({
      userId,
      amount: -cost,
      type: 'usage',
      description: `${type} generation`,
      metadata: {
        modelId,
        modelName: model.name,
        projectId,
        usage,
        content: content?.slice(0, 200),
        imageUrl,
      },
    });
  });
}

export async function refundCredits(userId: string, transactionId: string, reason: string) {
  const transaction = await db.query.creditTransactions.findFirst({
    where: eq(creditTransactions.id, transactionId),
  });
  
  if (!transaction || transaction.amount >= 0) {
    throw new Error('Invalid transaction for refund');
  }
  
  const refundAmount = Math.abs(transaction.amount);
  
  await db.transaction(async (tx) => {
    // Add credits back
    await tx.update(users)
      .set({ credits: sql`credits + ${refundAmount}` })
      .where(eq(users.id, userId));
    
    // Log refund
    await tx.insert(creditTransactions).values({
      userId,
      amount: refundAmount,
      type: 'refund',
      description: `Refund: ${reason}`,
      metadata: {
        originalTransactionId: transactionId,
      },
    });
  });
}
```

## Video Generation (With Webhook)

```typescript
// app/api/ai/generate-video/route.ts

import Replicate from 'replicate';
import { checkCredits, reserveCredits } from '@/lib/ai/credits';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Check plan allows video
  if (!['pro', 'unlimited'].includes(session.user.plan)) {
    return new Response(JSON.stringify({
      error: 'Video generation requires Pro or Unlimited plan',
    }), { status: 403 });
  }
  
  const { prompt, imageUrl, duration, projectId, modelId } = await req.json();
  
  // Reserve credits (will be deducted on completion)
  const reservation = await reserveCredits(session.user.id, modelId);
  
  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    // Start async video generation
    const prediction = await replicate.predictions.create({
      version: modelId, // e.g., minimax video model
      input: {
        prompt,
        first_frame_image: imageUrl,
        prompt_optimizer: true,
      },
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`,
      webhook_events_filter: ['completed', 'failed'],
    });
    
    // Store pending generation
    await db.insert(videoGenerations).values({
      id: prediction.id,
      userId: session.user.id,
      projectId,
      prompt,
      status: 'processing',
      creditReservationId: reservation.id,
    });
    
    return Response.json({
      success: true,
      predictionId: prediction.id,
      status: 'processing',
      estimatedTime: '2-5 minutes',
    });
    
  } catch (error) {
    // Release reserved credits on error
    await releaseCredits(reservation.id);
    
    return new Response(JSON.stringify({
      error: 'Video generation failed',
      message: error.message,
    }), { status: 500 });
  }
}

// app/api/webhooks/replicate/route.ts

export async function POST(req: Request) {
  const body = await req.json();
  
  const { id, status, output, error } = body;
  
  // Get generation record
  const generation = await db.query.videoGenerations.findFirst({
    where: eq(videoGenerations.id, id),
  });
  
  if (!generation) {
    return new Response('Not found', { status: 404 });
  }
  
  if (status === 'succeeded') {
    // Update generation with output
    await db.update(videoGenerations)
      .set({
        status: 'completed',
        outputUrl: output[0],
        completedAt: new Date(),
      })
      .where(eq(videoGenerations.id, id));
    
    // Confirm credit deduction
    await confirmCreditReservation(generation.creditReservationId);
    
    // TODO: Send notification to user
    
  } else if (status === 'failed') {
    // Update generation as failed
    await db.update(videoGenerations)
      .set({
        status: 'failed',
        error: error,
      })
      .where(eq(videoGenerations.id, id));
    
    // Release reserved credits (refund)
    await releaseCredits(generation.creditReservationId);
    
    // TODO: Send error notification to user
  }
  
  return new Response('OK');
}
```

---

# 🔐 AUTHENTICATION FLOW

## NextAuth.js v5 Configuration

```typescript
// lib/auth/config.ts

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate credentials
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });
        
        if (!user || !user.password) return null;
        
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        
        if (!isValid) return null;
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.plan = user.plan;
      }
      
      // Refresh user data on session update
      if (trigger === 'update') {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, token.id),
        });
        token.plan = dbUser.plan;
        token.credits = dbUser.credits;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.plan = token.plan;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // New user = 14-day trial
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);
      
      await db.update(users)
        .set({
          plan: 'trial',
          planExpiresAt: trialEndDate,
          trialUsed: 0,
          maxProjects: 1,
        })
        .where(eq(users.id, user.id));
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth?error=true',
  },
});
```

## Trial System

```typescript
// lib/auth/trial.ts

export async function checkTrialStatus(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  
  if (user.plan !== 'trial') {
    return { isActive: true, plan: user.plan };
  }
  
  const now = new Date();
  const isExpired = user.planExpiresAt < now;
  const usageLimitReached = user.trialUsed >= 2;
  
  if (isExpired || usageLimitReached) {
    return {
      isActive: false,
      plan: 'trial',
      reason: isExpired ? 'expired' : 'usage_limit',
      message: isExpired 
        ? 'Your 14-day trial has ended'
        : 'You have used all 2 AI generations',
      upgradeUrl: '/settings/subscription',
      contactWhatsApp: '081319504441',
      contactName: 'Galih Praz',
    };
  }
  
  return {
    isActive: true,
    plan: 'trial',
    daysRemaining: Math.ceil(
      (user.planExpiresAt - now) / (1000 * 60 * 60 * 24)
    ),
    usageRemaining: 2 - user.trialUsed,
  };
}

// Middleware to check trial
export async function trialGuard(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }
  
  const trialStatus = await checkTrialStatus(session.user.id);
  
  if (!trialStatus.isActive) {
    return NextResponse.redirect(
      new URL(`/settings/subscription?locked=true&reason=${trialStatus.reason}`, req.url)
    );
  }
  
  return NextResponse.next();
}
```

---

# 🚢 DEPLOYMENT STRATEGY

## Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["sin1"], // Singapore (closest to Indonesia)
  "functions": {
    "app/api/ai/**/*.ts": {
      "maxDuration": 60
    },
    "app/api/webhooks/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/check-trials",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/reset-monthly-limits",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

## GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml

name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

# 🧪 TESTING STRATEGY

```typescript
// __tests__/api/ai/generate-text.test.ts

import { POST } from '@/app/api/ai/generate-text/route';

describe('Text Generation API', () => {
  it('should reject unauthorized requests', async () => {
    const req = new Request('http://localhost/api/ai/generate-text', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    });
    
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
  
  it('should reject when credits insufficient', async () => {
    // Mock auth session with no credits
    // ...
  });
  
  it('should reject trial users after 2 uses', async () => {
    // Mock trial user with trialUsed = 2
    // ...
  });
  
  it('should successfully generate text and deduct credits', async () => {
    // Mock auth session with credits
    // Mock AI provider
    // ...
  });
});
```

---

# 📊 MONITORING & COST ALERTS

```typescript
// lib/monitoring/cost-alerts.ts

export async function checkDailyCosts() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get today's AI costs
  const costs = await db.select({
    provider: aiModels.provider,
    totalCost: sql`SUM(credit_transactions.amount * ai_models.cost_per_unit)`,
  })
    .from(creditTransactions)
    .leftJoin(aiModels, eq(creditTransactions.metadata->>'modelId', aiModels.id))
    .where(gte(creditTransactions.createdAt, today))
    .groupBy(aiModels.provider);
  
  // Alert if daily cost exceeds threshold
  const threshold = 100; // $100 per day
  const totalCost = costs.reduce((sum, c) => sum + c.totalCost, 0);
  
  if (totalCost > threshold) {
    await sendAlert({
      type: 'cost_alert',
      message: `Daily AI cost exceeded $${threshold}: $${totalCost.toFixed(2)}`,
      data: costs,
    });
  }
  
  return { totalCost, breakdown: costs };
}
```

---

## 📅 Document Info
- **Version:** 2.0
- **Updated:** December 2025
- **Contact:** 081319504441 (Galih Praz)
