# Development Flow & Implementation Guide

## Quick Answer: Next.js untuk 1000 Users?

### ✅ YES, SANGAT AMAN!

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS SCALABILITY                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   1,000 users    → No problem, single Vercel instance                  │
│   10,000 users   → Still fine, auto-scaling                            │
│   100,000 users  → Need optimization, but doable                       │
│   1,000,000 users → Need microservices, but Next.js still frontend     │
│                                                                         │
│   BOTTLENECKS (bukan Next.js):                                         │
│   ❌ Database connections → Solution: Neon/Supabase pooling            │
│   ❌ AI API rate limits   → Solution: Queue + caching                  │
│   ❌ Video streaming      → Solution: CDN (Cloudflare)                 │
│   ❌ File storage         → Solution: R2/S3 + CDN                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack Decision

### Recommendation: Next.js 14 (Monolith First)

```
┌─────────────────────────────────────────────────────────────────┐
│                     RECOMMENDED ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Next.js 14+ (App Router)                                      │
│  ├── Marketing pages (SSG)                                     │
│  ├── Auth (NextAuth.js)                                        │
│  ├── Dashboard & Studio (SSR/CSR hybrid)                       │
│  └── API routes for simple operations                          │
│                                                                 │
│  + Separate Backend (Optional, for complex AI jobs)            │
│  ├── Express/Hono for AI processing                            │
│  ├── Queue system (BullMQ)                                     │
│  └── WebSocket for real-time                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why Next.js over Current Stack?

| Aspect | Current (Vite+Express) | Next.js |
|--------|------------------------|---------|
| SSR/SSG | ❌ Manual | ✅ Built-in |
| Auth | ❌ Manual | ✅ NextAuth.js |
| API Routes | ✅ Express | ✅ Built-in |
| Image Optimization | ❌ Manual | ✅ Built-in |
| Deployment | Manual | One-click (Vercel) |
| Edge Functions | ❌ | ✅ |
| Caching | Manual | Automatic |

---

## Development Phases

### Phase 0: Setup & Migration (Week 1)
```
□ Create new Next.js 14 project
□ Setup Tailwind CSS + shadcn/ui
□ Migrate existing components
□ Setup Drizzle ORM + PostgreSQL
□ Configure environment variables
□ Setup ESLint + Prettier
□ Setup Husky + lint-staged
□ Configure TypeScript strict mode
```

### Phase 1: Backend Core (Week 2-3)

#### 1.1 Database Schema
```
□ Create migration for existing tables
□ Add organization tables
□ Add subscription tables
□ Add credit system tables
□ Add API key tables
□ Add audit log tables
□ Setup indexes
□ Seed sample data
```

#### 1.2 Authentication
```
□ Setup NextAuth.js
□ Email/Password provider
□ Google OAuth provider
□ GitHub OAuth provider (optional)
□ Email verification flow
□ Password reset flow
□ Session management
□ Protected API middleware
```

#### 1.3 Core API Endpoints
```
□ User CRUD
□ Organization CRUD
□ Project CRUD (complete)
□ Story CRUD (complete)
□ Character CRUD (complete)
□ Universe CRUD (complete)
□ Moodboard CRUD (complete)
□ Animation CRUD (complete)
□ Asset management (complete)
```

#### 1.4 AI Integration
```
□ Multi-provider support (OpenAI, Gemini, Anthropic)
□ Credit deduction middleware
□ Rate limiting
□ Error handling & retry
□ Response caching
□ Usage logging
```

### Phase 2: Billing & Subscriptions (Week 4)

```
□ Stripe integration
□ Product/Price setup
□ Checkout session
□ Customer portal
□ Webhook handlers
□ Credit purchase flow
□ Usage tracking
□ Overage handling
□ Invoice generation
```

### Phase 3: Frontend Core (Week 5-6)

#### 3.1 Layout & Navigation
```
□ Marketing layout
□ App layout with sidebar
□ Studio layout with tabs
□ Mobile responsive layouts
□ Loading states
□ Error boundaries
```

#### 3.2 Dashboard
```
□ Project listing with filters
□ Create project modal
□ Project card with preview
□ Usage/credit display
□ Quick actions
```

#### 3.3 Studio Pages
```
□ Story tab (complete features)
□ Characters tab (complete features)
□ Universe tab (new UI)
□ Moodboard tab (grid + generation)
□ Animation tab (timeline + preview)
□ Distribution tab (performance)
□ IP Project tab (team + branding)
```

### Phase 4: Advanced Features (Week 7-8)

```
□ Team invitations
□ Role-based permissions
□ Real-time collaboration (optional)
□ Export functionality (PDF, JSON)
□ Canva integration
□ Version history
□ Undo/redo
□ Keyboard shortcuts
```

### Phase 5: Polish & Testing (Week 9-10)

```
□ Unit tests (70% coverage)
□ Integration tests
□ E2E tests (critical flows)
□ Performance optimization
□ Accessibility audit
□ Security audit
□ Documentation
□ Changelog
```

---

## File Structure (Next.js)

```
cinegenesis-saas/
├── src/
│   ├── app/
│   │   ├── (marketing)/           # Public pages
│   │   │   ├── page.tsx           # Landing
│   │   │   ├── pricing/
│   │   │   ├── features/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (auth)/               # Auth pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (app)/                # Protected pages
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   └── settings/
│   │   │   ├── studio/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [projectId]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── story/
│   │   │   │       ├── characters/
│   │   │   │       ├── universe/
│   │   │   │       ├── moodboard/
│   │   │   │       ├── animation/
│   │   │   │       └── distribution/
│   │   │   ├── billing/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── projects/
│   │   │   ├── ai/
│   │   │   ├── stripe/
│   │   │   │   ├── checkout/
│   │   │   │   ├── portal/
│   │   │   │   └── webhook/
│   │   │   └── [...catchall]/
│   │   │
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── AppShell.tsx
│   │   ├── studio/
│   │   │   ├── StoryEditor.tsx
│   │   │   ├── CharacterEditor.tsx
│   │   │   ├── MoodboardGrid.tsx
│   │   │   └── ...
│   │   ├── dashboard/
│   │   ├── forms/
│   │   └── shared/
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts          # Drizzle client
│   │   │   ├── schema.ts         # All schemas
│   │   │   └── migrations/
│   │   ├── auth/
│   │   │   └── config.ts         # NextAuth config
│   │   ├── ai/
│   │   │   ├── providers/
│   │   │   │   ├── openai.ts
│   │   │   │   ├── gemini.ts
│   │   │   │   └── anthropic.ts
│   │   │   └── index.ts
│   │   ├── stripe/
│   │   │   ├── client.ts
│   │   │   └── products.ts
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── use-project.ts
│   │   ├── use-credits.ts
│   │   ├── use-subscription.ts
│   │   └── use-ai.ts
│   │
│   ├── stores/                   # Zustand
│   │   ├── project-store.ts
│   │   ├── editor-store.ts
│   │   └── ui-store.ts
│   │
│   └── types/
│       ├── api.ts
│       ├── models.ts
│       └── index.ts
│
├── public/
│   ├── images/
│   └── fonts/
│
├── drizzle/
│   └── migrations/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .env.local
├── drizzle.config.ts
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Pre-commit Hooks (Husky)

### Setup
```bash
npm install -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

### Configuration (package.json)
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  },
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:e2e": "playwright test"
  }
}
```

### Pre-commit Hook (.husky/pre-commit)
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Run type check
npm run typecheck

# Run tests (optional, can be slow)
# npm run test
```

---

## TypeScript Configuration

### tsconfig.json (Strict)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"]
    },
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Environment Variables

### .env.example
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/cinegenesis"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# AI Providers
OPENAI_API_KEY=""
GOOGLE_AI_API_KEY=""
ANTHROPIC_API_KEY=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Storage
S3_BUCKET=""
S3_REGION=""
S3_ACCESS_KEY=""
S3_SECRET_KEY=""

# Email
RESEND_API_KEY=""

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=""
SENTRY_DSN=""

# Feature Flags
NEXT_PUBLIC_ENABLE_BYOK="true"
NEXT_PUBLIC_ENABLE_VIDEO_GEN="false"
```

---

## CI/CD Pipeline

### GitHub Actions (.github/workflows/ci.yml)
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## Implementation Checklist

### Backend Priority
1. [ ] Setup Next.js project with TypeScript
2. [ ] Configure Drizzle ORM + migrations
3. [ ] Implement NextAuth.js authentication
4. [ ] Complete all CRUD endpoints
5. [ ] Add credit system middleware
6. [ ] Integrate Stripe billing
7. [ ] Setup multi-provider AI
8. [ ] Add rate limiting
9. [ ] Implement webhooks

### Frontend Priority
1. [ ] Setup shadcn/ui components
2. [ ] Create layout components
3. [ ] Build dashboard page
4. [ ] Build studio with all tabs
5. [ ] Add loading/error states
6. [ ] Implement forms with validation
7. [ ] Add toast notifications
8. [ ] Mobile responsive
9. [ ] Keyboard shortcuts

### Quality Assurance
1. [ ] ESLint strict configuration
2. [ ] Husky pre-commit hooks
3. [ ] TypeScript strict mode
4. [ ] Unit test coverage (70%+)
5. [ ] E2E critical flows
6. [ ] Lighthouse performance audit
7. [ ] Accessibility audit
8. [ ] Security audit

---

## Migration from Current App

### Step 1: Export Current Data
```typescript
// Export script
async function exportData() {
  const projects = await db.select().from(projects)
  const stories = await db.select().from(stories)
  const characters = await db.select().from(characters)
  // ... export all tables to JSON
  fs.writeFileSync('export.json', JSON.stringify({ projects, stories, characters }))
}
```

### Step 2: Component Migration
```
Current → Next.js
───────────────────
client/src/pages/studio.tsx → app/(app)/studio/[projectId]/page.tsx
client/src/components/ui/* → components/ui/* (shadcn regenerate)
server/routes.ts → app/api/*/route.ts
server/lib/openai.ts → lib/ai/providers/openai.ts
shared/schema.ts → lib/db/schema.ts
```

### Step 3: Test Parity
- [ ] All existing features work
- [ ] Data integrity verified
- [ ] Performance equal or better
- [ ] No regression bugs

---

## Quick Start Commands

```bash
# Create new Next.js project
npx create-next-app@latest cinegenesis-saas --typescript --tailwind --eslint --app --src-dir

# Add shadcn/ui
npx shadcn@latest init

# Add core dependencies
npm install drizzle-orm postgres next-auth @tanstack/react-query zustand framer-motion

# Add dev dependencies
npm install -D drizzle-kit @types/node husky lint-staged prettier

# Setup Husky
npx husky install
npx husky add .husky/pre-commit "npx lint-staged && npm run typecheck"

# Generate database
npx drizzle-kit generate
npx drizzle-kit push

# Start development
npm run dev
```
