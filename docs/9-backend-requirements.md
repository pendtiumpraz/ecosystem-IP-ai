# Backend Requirements - MODO Platform

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MODO BACKEND ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Client (Next.js)                                                          │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                     API LAYER (Next.js API Routes)                   │  │
│   │   /api/auth/*  /api/projects/*  /api/ai/*  /api/stripe/*            │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│        │                                                                    │
│        ├──────────────┬──────────────┬──────────────┬──────────────┐       │
│        ▼              ▼              ▼              ▼              ▼       │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐    │
│   │ Auth    │   │Database │   │ AI      │   │ Storage │   │ Payment │    │
│   │(NextAuth)│   │(Postgres)│   │(OpenAI) │   │ (R2)    │   │(Midtrans)│   │
│   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘    │
│                      │              │                                       │
│                      ▼              ▼                                       │
│               ┌─────────┐   ┌─────────┐                                    │
│               │ Redis   │   │ Queue   │                                    │
│               │ (Cache) │   │(BullMQ) │                                    │
│               └─────────┘   └─────────┘                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Core
```json
{
  "runtime": "Node.js 20 LTS",
  "framework": "Next.js 14 (API Routes)",
  "language": "TypeScript 5.4",
  "orm": "Drizzle ORM",
  "validation": "Zod"
}
```

### Database & Cache
```json
{
  "database": "PostgreSQL 15 (Neon/Supabase)",
  "cache": "Redis (Upstash)",
  "search": "Meilisearch (optional)"
}
```

### External Services
```json
{
  "auth": "NextAuth.js v5",
  "ai_text": ["Google Gemini", "OpenAI GPT-4o"],
  "ai_image": ["Stability AI", "OpenAI DALL-E"],
  "storage": "Cloudflare R2",
  "cdn": "Cloudflare",
  "payment": "Midtrans + Xendit",
  "email": "Resend",
  "queue": "BullMQ + Redis"
}
```

---

## Database Configuration

### Connection Pooling (CRITICAL for 1000+ users)

```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Neon automatically handles connection pooling
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// For Supabase alternative:
// import { drizzle } from 'drizzle-orm/postgres-js';
// import postgres from 'postgres';
// const client = postgres(process.env.DATABASE_URL!, { max: 10 });
// export const db = drizzle(client);
```

### Database Indexes (Performance)

```sql
-- Critical indexes for 1000+ users
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_projects_user_id ON projects(user_id);
CREATE INDEX CONCURRENTLY idx_projects_org_id ON projects(organization_id);
CREATE INDEX CONCURRENTLY idx_credits_org_id ON credit_balances(organization_id);
CREATE INDEX CONCURRENTLY idx_ai_usage_org_date ON ai_usage_logs(organization_id, created_at);

-- Partial indexes for active data
CREATE INDEX CONCURRENTLY idx_active_subscriptions 
  ON subscriptions(organization_id) 
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_published_contents 
  ON contents(status, created_at) 
  WHERE status = 'published';
```

---

## Authentication System

### NextAuth.js Configuration

```typescript
// lib/auth/config.ts
import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';

export const authConfig: NextAuthConfig = {
  adapter: DrizzleAdapter(db),
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });
        
        if (!user) return null;
        
        const valid = await bcrypt.compare(
          credentials.password, 
          user.passwordHash
        );
        
        if (!valid) return null;
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  
  callbacks: {
    async session({ session, user }) {
      // Add subscription info to session
      const subscription = await getSubscription(user.id);
      session.user.subscription = subscription;
      session.user.credits = await getCredits(user.id);
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error',
  },
};
```

### Middleware Protection

```typescript
// middleware.ts
import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                     req.nextUrl.pathname.startsWith('/register');
  const isAppPage = req.nextUrl.pathname.startsWith('/dashboard') ||
                    req.nextUrl.pathname.startsWith('/studio');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  
  // Redirect logged-in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.nextUrl));
  }
  
  // Protect app pages
  if (isAppPage && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
  
  // Protect API routes (except public ones)
  if (isApiRoute && !isLoggedIn) {
    const publicRoutes = ['/api/auth', '/api/public'];
    const isPublic = publicRoutes.some(r => 
      req.nextUrl.pathname.startsWith(r)
    );
    
    if (!isPublic) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Credit System Implementation

### Credit Deduction Flow

```typescript
// lib/credits/index.ts

interface CreditResult {
  success: boolean;
  remainingCredits: number;
  error?: string;
}

export async function deductCredits(
  organizationId: string,
  amount: number,
  feature: string,
  userId: string
): Promise<CreditResult> {
  return await db.transaction(async (tx) => {
    // 1. Get current balance with lock
    const balance = await tx.query.creditBalances.findFirst({
      where: eq(creditBalances.organizationId, organizationId),
      for: 'update', // Row lock
    });
    
    if (!balance) {
      return { success: false, remainingCredits: 0, error: 'No balance found' };
    }
    
    // 2. Check if enough credits
    const totalCredits = balance.balance + balance.bonusBalance;
    if (totalCredits < amount) {
      return { 
        success: false, 
        remainingCredits: totalCredits,
        error: 'Insufficient credits' 
      };
    }
    
    // 3. Deduct from bonus first, then main balance
    let deductFromBonus = Math.min(balance.bonusBalance, amount);
    let deductFromMain = amount - deductFromBonus;
    
    // 4. Update balance
    await tx.update(creditBalances)
      .set({
        balance: balance.balance - deductFromMain,
        bonusBalance: balance.bonusBalance - deductFromBonus,
        updatedAt: new Date(),
      })
      .where(eq(creditBalances.organizationId, organizationId));
    
    // 5. Log transaction
    await tx.insert(creditTransactions).values({
      organizationId,
      userId,
      type: 'usage',
      amount: -amount,
      balanceAfter: totalCredits - amount,
      description: `AI generation: ${feature}`,
      referenceType: 'ai_usage',
    });
    
    return {
      success: true,
      remainingCredits: totalCredits - amount,
    };
  });
}

export async function refundCredits(
  organizationId: string,
  amount: number,
  reason: string
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.update(creditBalances)
      .set({
        balance: sql`balance + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(creditBalances.organizationId, organizationId));
    
    await tx.insert(creditTransactions).values({
      organizationId,
      type: 'refund',
      amount: amount,
      balanceAfter: sql`(SELECT balance FROM credit_balances WHERE organization_id = ${organizationId})`,
      description: reason,
    });
  });
}
```

### Trial Usage Tracking

```typescript
// lib/credits/trial.ts

export async function checkTrialUsage(userId: string): Promise<{
  canUse: boolean;
  usedCount: number;
  maxCount: number;
}> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      subscriptionTier: true,
      trialCreditsUsed: true,
      trialEndsAt: true,
    },
  });
  
  if (!user || user.subscriptionTier !== 'trial') {
    return { canUse: true, usedCount: 0, maxCount: Infinity };
  }
  
  // Check trial expiry
  if (user.trialEndsAt && new Date() > user.trialEndsAt) {
    return { canUse: false, usedCount: 2, maxCount: 2 };
  }
  
  // Check usage limit
  const canUse = user.trialCreditsUsed < 2;
  
  return {
    canUse,
    usedCount: user.trialCreditsUsed,
    maxCount: 2,
  };
}

export async function incrementTrialUsage(userId: string): Promise<void> {
  await db.update(users)
    .set({
      trialCreditsUsed: sql`trial_credits_used + 1`,
    })
    .where(eq(users.id, userId));
}
```

---

## AI Service Layer

### Multi-Provider AI Client

```typescript
// lib/ai/index.ts

type AIProvider = 'gemini' | 'openai' | 'anthropic';
type AIModel = 'fast' | 'premium';

interface AIConfig {
  provider: AIProvider;
  model: string;
  costPerRequest: number;
}

const MODEL_CONFIG: Record<string, AIConfig> = {
  'text:fast': {
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    costPerRequest: 0.0005,
  },
  'text:premium': {
    provider: 'openai',
    model: 'gpt-4o',
    costPerRequest: 0.02,
  },
  'image:fast': {
    provider: 'stability',
    model: 'sdxl',
    costPerRequest: 0.02,
  },
  'image:premium': {
    provider: 'openai',
    model: 'dall-e-3',
    costPerRequest: 0.04,
  },
};

export async function generateText(
  prompt: string,
  systemPrompt: string,
  quality: AIModel = 'fast'
): Promise<string> {
  const config = MODEL_CONFIG[`text:${quality}`];
  
  switch (config.provider) {
    case 'gemini':
      return await generateWithGemini(prompt, systemPrompt, config.model);
    case 'openai':
      return await generateWithOpenAI(prompt, systemPrompt, config.model);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

export async function generateImage(
  prompt: string,
  quality: AIModel = 'fast'
): Promise<string> {
  const config = MODEL_CONFIG[`image:${quality}`];
  
  switch (config.provider) {
    case 'stability':
      return await generateWithStability(prompt);
    case 'openai':
      return await generateWithDALLE(prompt);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}
```

### Gemini Implementation (Default - CHEAP)

```typescript
// lib/ai/providers/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function generateWithGemini(
  prompt: string,
  systemPrompt: string,
  model: string = 'gemini-1.5-flash'
): Promise<string> {
  const gemini = genAI.getGenerativeModel({ 
    model,
    systemInstruction: systemPrompt,
  });
  
  const result = await gemini.generateContent(prompt);
  return result.response.text();
}
```

### Stability AI Implementation (Default Images - CHEAP)

```typescript
// lib/ai/providers/stability.ts

export async function generateWithStability(
  prompt: string
): Promise<string> {
  const response = await fetch(
    'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
    }
  );
  
  const data = await response.json();
  const base64 = data.artifacts[0].base64;
  
  // Upload to R2 and return URL
  const url = await uploadToR2(base64, 'image/png');
  return url;
}
```

---

## API Route Examples

### AI Generation Endpoint

```typescript
// app/api/ai/generate-story/route.ts
import { auth } from '@/lib/auth';
import { deductCredits, refundCredits } from '@/lib/credits';
import { generateText } from '@/lib/ai';
import { checkTrialUsage, incrementTrialUsage } from '@/lib/credits/trial';
import { logAIUsage } from '@/lib/analytics';

const CREDIT_COSTS = {
  'story:fast': 3,
  'story:premium': 8,
};

export async function POST(req: Request) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { premise, quality = 'fast' } = await req.json();
  const creditCost = CREDIT_COSTS[`story:${quality}`];
  
  // 2. Trial check
  if (session.user.subscription.tier === 'trial') {
    const trial = await checkTrialUsage(session.user.id);
    if (!trial.canUse) {
      return Response.json({
        error: 'Trial limit reached',
        code: 'TRIAL_LIMIT',
        upgradeUrl: '/billing',
      }, { status: 403 });
    }
  }
  
  // 3. Deduct credits FIRST
  const deduction = await deductCredits(
    session.user.organizationId,
    creditCost,
    'story_generation',
    session.user.id
  );
  
  if (!deduction.success) {
    return Response.json({
      error: 'Insufficient credits',
      code: 'NO_CREDITS',
      remainingCredits: deduction.remainingCredits,
    }, { status: 402 });
  }
  
  try {
    // 4. Generate with AI
    const startTime = Date.now();
    
    const result = await generateText(
      `Generate a compelling story idea based on: ${premise}`,
      STORY_SYSTEM_PROMPT,
      quality
    );
    
    const duration = Date.now() - startTime;
    
    // 5. Log usage
    await logAIUsage({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      endpoint: '/api/ai/generate-story',
      provider: quality === 'fast' ? 'gemini' : 'openai',
      model: quality === 'fast' ? 'gemini-1.5-flash' : 'gpt-4o',
      creditsUsed: creditCost,
      durationMs: duration,
      status: 'success',
    });
    
    // 6. Update trial usage
    if (session.user.subscription.tier === 'trial') {
      await incrementTrialUsage(session.user.id);
    }
    
    return Response.json({
      success: true,
      data: JSON.parse(result),
      creditsUsed: creditCost,
      remainingCredits: deduction.remainingCredits,
    });
    
  } catch (error) {
    // 7. Refund on error
    await refundCredits(
      session.user.organizationId,
      creditCost,
      `API error: ${error.message}`
    );
    
    await logAIUsage({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      endpoint: '/api/ai/generate-story',
      status: 'error',
      errorMessage: error.message,
    });
    
    return Response.json({
      error: 'Generation failed',
      message: error.message,
    }, { status: 500 });
  }
}
```

---

## Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Different limits per tier
const RATE_LIMITS = {
  trial: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, '24h'), // 2 per day total
    analytics: true,
  }),
  premium: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1d'), // 100 per day
    analytics: true,
  }),
  pro: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(500, '1d'), // 500 per day
    analytics: true,
  }),
  unlimited: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2000, '1d'), // 2000 per day
    analytics: true,
  }),
};

export async function checkRateLimit(
  userId: string,
  tier: string
): Promise<{ success: boolean; remaining: number }> {
  const limiter = RATE_LIMITS[tier] || RATE_LIMITS.trial;
  const { success, remaining } = await limiter.limit(userId);
  return { success, remaining };
}
```

---

## Queue System (for Heavy Jobs)

```typescript
// lib/queue/index.ts
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!);

// Video generation queue (heavy, async)
export const videoQueue = new Queue('video-generation', { connection });

// Worker
const videoWorker = new Worker('video-generation', async (job) => {
  const { projectId, beatIndex, prompt } = job.data;
  
  // Long-running video generation
  const videoUrl = await generateVideo(prompt);
  
  // Update database
  await db.update(animations)
    .set({ videoUrl, status: 'completed' })
    .where(eq(animations.id, job.data.animationId));
    
  // Notify user
  await sendNotification(job.data.userId, 'Video ready!');
  
}, { connection });

// Add job
export async function queueVideoGeneration(data: VideoJobData) {
  await videoQueue.add('generate', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
}
```

---

## Caching Strategy

```typescript
// lib/cache/index.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Cache AI responses (same input = same output)
export async function getCachedAIResponse(
  key: string
): Promise<string | null> {
  return await redis.get(`ai:${key}`);
}

export async function cacheAIResponse(
  key: string,
  response: string,
  ttlSeconds: number = 3600
): Promise<void> {
  await redis.setex(`ai:${key}`, ttlSeconds, response);
}

// Cache user subscription
export async function getCachedSubscription(
  userId: string
): Promise<Subscription | null> {
  const cached = await redis.get(`sub:${userId}`);
  return cached ? JSON.parse(cached) : null;
}

export async function cacheSubscription(
  userId: string,
  subscription: Subscription
): Promise<void> {
  await redis.setex(`sub:${userId}`, 300, JSON.stringify(subscription)); // 5 min
}

// Invalidate on subscription change
export async function invalidateSubscriptionCache(
  userId: string
): Promise<void> {
  await redis.del(`sub:${userId}`);
}
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/modo?sslmode=require"

# Auth
NEXTAUTH_URL="https://modo.id"
NEXTAUTH_SECRET="super-secret-key-min-32-chars"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# AI Providers
GOOGLE_AI_API_KEY=""           # Gemini (default, cheap)
OPENAI_API_KEY=""              # GPT-4o (premium)
STABILITY_API_KEY=""           # SDXL (default images)
ANTHROPIC_API_KEY=""           # Claude (optional)

# Storage
CLOUDFLARE_ACCOUNT_ID=""
CLOUDFLARE_R2_ACCESS_KEY=""
CLOUDFLARE_R2_SECRET_KEY=""
CLOUDFLARE_R2_BUCKET=""
CLOUDFLARE_R2_PUBLIC_URL=""

# Cache & Queue
UPSTASH_REDIS_URL=""
UPSTASH_REDIS_TOKEN=""

# Payment
MIDTRANS_SERVER_KEY=""
MIDTRANS_CLIENT_KEY=""
MIDTRANS_IS_PRODUCTION="false"
XENDIT_SECRET_KEY=""

# Email
RESEND_API_KEY=""

# Monitoring
SENTRY_DSN=""
```

---

## Scaling Checklist for 1000+ Users

### Database
- [x] Use Neon/Supabase with connection pooling
- [x] Add proper indexes
- [x] Use transactions for credits
- [x] Implement soft deletes

### API
- [x] Rate limiting per tier
- [x] Request validation with Zod
- [x] Error handling with proper codes
- [x] Response caching where applicable

### AI
- [x] Default to cheap models (Gemini Flash, SDXL)
- [x] Credit deduction before API call
- [x] Refund on API failure
- [x] Queue for heavy jobs (video)

### Caching
- [x] Redis for session data
- [x] Cache subscription info (5 min)
- [x] Cache AI responses (1 hour)
- [x] Edge caching for static content

### Monitoring
- [x] Error tracking (Sentry)
- [x] API latency monitoring
- [x] Credit usage analytics
- [x] Abuse detection alerts
