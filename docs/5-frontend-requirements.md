# Frontend Requirements - MODO Platform

## Tech Stack Decision

### Rekomendasi: Next.js 14 (App Router)

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHY NEXT.JS?                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ SSR/SSG untuk SEO (landing, pricing, blog)                 │
│  ✅ Built-in API routes                                        │
│  ✅ Image optimization otomatis                                │
│  ✅ Edge functions untuk performa                              │
│  ✅ Easy deployment (Vercel)                                   │
│  ✅ Built-in caching & revalidation                           │
│  ✅ Middleware untuk auth protection                          │
│  ✅ Server Components (reduce JS bundle)                      │
│                                                                 │
│  Capacity: 1,000 - 1,000,000+ users NO PROBLEM                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Scalability untuk 1000 Users

| Concern | Solution |
|---------|----------|
| Database | Connection pooling (Neon/Supabase) |
| AI API | Queue system + rate limiting |
| Video | CDN (Cloudflare Stream) |
| Static | Edge caching |
| Real-time | WebSocket (Pusher/Ably) |

---

## Complete Tech Stack

### Core Framework
```json
{
  "next": "14.2.x",
  "react": "18.3.x",
  "typescript": "5.4.x"
}
```

### UI & Styling
```json
{
  "tailwindcss": "3.4.x",
  "@radix-ui/*": "latest",
  "class-variance-authority": "0.7.x",
  "clsx": "2.x",
  "tailwind-merge": "2.x",
  "lucide-react": "0.x",
  "framer-motion": "11.x"
}
```

### State Management
```json
{
  "@tanstack/react-query": "5.x",
  "zustand": "4.x",
  "react-hook-form": "7.x",
  "@hookform/resolvers": "3.x",
  "zod": "3.x"
}
```

### Data Visualization
```json
{
  "recharts": "2.x",
  "@tremor/react": "3.x"
}
```

### Video Player
```json
{
  "video.js": "8.x",
  "@videojs/http-streaming": "3.x",
  "hls.js": "1.x"
}
```

### Utilities
```json
{
  "date-fns": "3.x",
  "lodash-es": "4.x",
  "nanoid": "5.x",
  "sonner": "1.x"
}
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (marketing)/             # Public pages (SSG)
│   │   ├── page.tsx             # Landing page
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── features/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── layout.tsx           # Marketing layout
│   │
│   ├── (auth)/                  # Auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── verify-email/
│   │   │   └── page.tsx
│   │   └── layout.tsx           # Auth layout (centered)
│   │
│   ├── (app)/                   # Protected app pages
│   │   ├── layout.tsx           # App shell with sidebar
│   │   │
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Project overview
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── studio/
│   │   │   ├── page.tsx         # Redirect to last project
│   │   │   ├── new/
│   │   │   │   └── page.tsx     # Create project
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx     # Project overview
│   │   │       ├── story/
│   │   │       │   └── page.tsx
│   │   │       ├── characters/
│   │   │       │   └── page.tsx
│   │   │       ├── universe/
│   │   │       │   └── page.tsx
│   │   │       ├── moodboard/
│   │   │       │   └── page.tsx
│   │   │       ├── animation/
│   │   │       │   └── page.tsx
│   │   │       ├── distribution/
│   │   │       │   └── page.tsx
│   │   │       └── settings/
│   │   │           └── page.tsx
│   │   │
│   │   ├── watch/
│   │   │   ├── page.tsx         # Content catalog
│   │   │   ├── [contentId]/
│   │   │   │   ├── page.tsx     # Content details
│   │   │   │   └── play/
│   │   │   │       └── page.tsx # Video player
│   │   │   └── my-list/
│   │   │       └── page.tsx
│   │   │
│   │   ├── invest/
│   │   │   ├── page.tsx         # Campaign catalog
│   │   │   ├── [campaignId]/
│   │   │   │   └── page.tsx     # Campaign details
│   │   │   ├── portfolio/
│   │   │   │   └── page.tsx
│   │   │   └── submit/
│   │   │       └── page.tsx
│   │   │
│   │   ├── store/
│   │   │   ├── page.tsx         # Product catalog
│   │   │   ├── [productId]/
│   │   │   │   └── page.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx
│   │   │   └── orders/
│   │   │       └── page.tsx
│   │   │
│   │   ├── fandom/
│   │   │   ├── page.tsx         # Communities
│   │   │   ├── [communityId]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── discussions/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── events/
│   │   │   │       └── page.tsx
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   │
│   │   ├── billing/
│   │   │   ├── page.tsx         # Subscription
│   │   │   └── history/
│   │   │       └── page.tsx
│   │   │
│   │   └── admin/               # Admin only
│   │       ├── page.tsx
│   │       ├── users/
│   │       ├── content/
│   │       └── reports/
│   │
│   ├── api/                     # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── ai/
│   │   │   ├── generate-story/
│   │   │   │   └── route.ts
│   │   │   ├── generate-image/
│   │   │   │   └── route.ts
│   │   │   └── [...]/
│   │   ├── stripe/
│   │   │   ├── checkout/
│   │   │   │   └── route.ts
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   └── [...]/
│   │
│   ├── layout.tsx               # Root layout
│   ├── loading.tsx              # Global loading
│   ├── error.tsx                # Global error
│   ├── not-found.tsx            # 404 page
│   └── globals.css
│
├── components/
│   ├── ui/                      # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── [40+ components]
│   │
│   ├── layout/                  # Layout components
│   │   ├── marketing-header.tsx
│   │   ├── marketing-footer.tsx
│   │   ├── app-sidebar.tsx
│   │   ├── app-header.tsx
│   │   ├── app-shell.tsx
│   │   ├── mobile-nav.tsx
│   │   └── breadcrumbs.tsx
│   │
│   ├── auth/                    # Auth components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── social-buttons.tsx
│   │   └── user-menu.tsx
│   │
│   ├── studio/                  # Studio components
│   │   ├── project-card.tsx
│   │   ├── story-editor.tsx
│   │   ├── character-editor.tsx
│   │   ├── character-card.tsx
│   │   ├── structure-beats.tsx
│   │   ├── want-need-matrix.tsx
│   │   ├── moodboard-grid.tsx
│   │   ├── animation-timeline.tsx
│   │   ├── script-viewer.tsx
│   │   ├── performance-chart.tsx
│   │   └── ai-generate-button.tsx
│   │
│   ├── watch/                   # Watch components
│   │   ├── content-card.tsx
│   │   ├── content-row.tsx
│   │   ├── hero-banner.tsx
│   │   ├── video-player.tsx
│   │   ├── episode-list.tsx
│   │   └── rating-stars.tsx
│   │
│   ├── invest/                  # Invest components
│   │   ├── campaign-card.tsx
│   │   ├── funding-progress.tsx
│   │   ├── tier-selector.tsx
│   │   ├── investment-form.tsx
│   │   └── portfolio-chart.tsx
│   │
│   ├── store/                   # Store components
│   │   ├── product-card.tsx
│   │   ├── product-gallery.tsx
│   │   ├── cart-drawer.tsx
│   │   ├── checkout-form.tsx
│   │   └── order-summary.tsx
│   │
│   ├── fandom/                  # Fandom components
│   │   ├── community-card.tsx
│   │   ├── discussion-thread.tsx
│   │   ├── comment-tree.tsx
│   │   ├── fan-content-card.tsx
│   │   ├── event-card.tsx
│   │   └── badge-display.tsx
│   │
│   ├── billing/                 # Billing components
│   │   ├── pricing-table.tsx
│   │   ├── subscription-card.tsx
│   │   ├── credit-balance.tsx
│   │   ├── usage-chart.tsx
│   │   └── invoice-list.tsx
│   │
│   └── shared/                  # Shared components
│       ├── locked-feature.tsx
│       ├── upgrade-prompt.tsx
│       ├── empty-state.tsx
│       ├── loading-skeleton.tsx
│       ├── error-boundary.tsx
│       ├── infinite-scroll.tsx
│       ├── file-uploader.tsx
│       ├── image-cropper.tsx
│       ├── rich-text-editor.tsx
│       ├── search-command.tsx
│       └── confirmation-dialog.tsx
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-user.ts
│   ├── use-subscription.ts
│   ├── use-credits.ts
│   ├── use-projects.ts
│   ├── use-ai-generate.ts
│   ├── use-media-query.ts
│   ├── use-local-storage.ts
│   ├── use-debounce.ts
│   └── use-infinite-query.ts
│
├── lib/
│   ├── api/                     # API client functions
│   │   ├── client.ts            # Base fetch wrapper
│   │   ├── projects.ts
│   │   ├── stories.ts
│   │   ├── characters.ts
│   │   ├── ai.ts
│   │   ├── watch.ts
│   │   ├── invest.ts
│   │   ├── store.ts
│   │   └── fandom.ts
│   │
│   ├── auth/
│   │   ├── config.ts            # NextAuth config
│   │   ├── providers.ts
│   │   └── middleware.ts
│   │
│   ├── db/
│   │   ├── index.ts             # Drizzle client
│   │   ├── schema/              # Schema files
│   │   │   ├── users.ts
│   │   │   ├── projects.ts
│   │   │   ├── watch.ts
│   │   │   ├── invest.ts
│   │   │   ├── store.ts
│   │   │   └── fandom.ts
│   │   └── migrations/
│   │
│   ├── ai/
│   │   ├── providers/
│   │   │   ├── openai.ts
│   │   │   ├── gemini.ts
│   │   │   └── anthropic.ts
│   │   ├── prompts/
│   │   │   ├── story.ts
│   │   │   ├── character.ts
│   │   │   └── image.ts
│   │   └── index.ts
│   │
│   ├── stripe/
│   │   ├── client.ts
│   │   ├── products.ts
│   │   └── webhooks.ts
│   │
│   ├── utils/
│   │   ├── cn.ts                # className merger
│   │   ├── format.ts            # Formatters
│   │   ├── validation.ts        # Zod schemas
│   │   └── constants.ts
│   │
│   └── config/
│       ├── site.ts              # Site config
│       ├── nav.ts               # Navigation config
│       └── features.ts          # Feature flags
│
├── stores/                      # Zustand stores
│   ├── ui-store.ts
│   ├── editor-store.ts
│   ├── cart-store.ts
│   └── player-store.ts
│
├── types/
│   ├── api.ts
│   ├── database.ts
│   ├── auth.ts
│   └── index.ts
│
└── styles/
    └── globals.css
```

---

## Page Requirements

### Marketing Pages (SSG)

| Page | Route | Render | Cache |
|------|-------|--------|-------|
| Landing | `/` | SSG | Revalidate 1h |
| Pricing | `/pricing` | SSG | Revalidate 1h |
| Features | `/features` | SSG | Revalidate 1h |
| About | `/about` | SSG | Revalidate 24h |
| Blog | `/blog` | ISR | Revalidate 1h |
| Blog Post | `/blog/[slug]` | ISR | Revalidate 1h |

### Auth Pages

| Page | Route | Protection |
|------|-------|------------|
| Login | `/login` | Redirect if logged in |
| Register | `/register` | Redirect if logged in |
| Forgot Password | `/forgot-password` | Public |
| Reset Password | `/reset-password` | Token required |
| Verify Email | `/verify-email` | Token required |

### App Pages (Protected)

| Page | Route | Auth | Subscription |
|------|-------|------|--------------|
| Dashboard | `/dashboard` | Required | Any |
| Studio List | `/studio` | Required | Any |
| Project | `/studio/[id]` | Required | Trial+ |
| Story Tab | `/studio/[id]/story` | Required | Trial+ |
| Watch | `/watch` | Required | Premium+ |
| Invest | `/invest` | Required | Premium+ |
| Store | `/store` | Required | Any |
| Fandom | `/fandom` | Required | Any |
| Billing | `/billing` | Required | Any |

---

## Component Specifications

### LockedFeature Component
```tsx
// components/shared/locked-feature.tsx
interface LockedFeatureProps {
  feature: string;
  requiredTier: 'premium' | 'pro' | 'unlimited';
  children: React.ReactNode;
  showPreview?: boolean;
}

export function LockedFeature({ 
  feature, 
  requiredTier, 
  children,
  showPreview = true 
}: LockedFeatureProps) {
  const { subscription, credits } = useSubscription();
  
  const isLocked = !hasAccess(subscription.tier, requiredTier) || 
                   (subscription.tier === 'trial' && credits.used >= 2);
  
  if (!isLocked) return <>{children}</>;
  
  return (
    <div className="relative">
      {showPreview && (
        <div className="blur-sm opacity-50 pointer-events-none select-none">
          {children}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="max-w-md text-center p-6">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Fitur Terkunci</h3>
          <p className="text-muted-foreground mb-4">
            Upgrade ke {requiredTier} untuk mengakses {feature}
          </p>
          <Button asChild>
            <Link href="/billing">
              Upgrade Sekarang
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
```

### AIGenerateButton Component
```tsx
// components/studio/ai-generate-button.tsx
interface AIGenerateButtonProps {
  type: 'story' | 'character' | 'image' | 'script';
  onGenerate: () => Promise<void>;
  creditCost: number;
  disabled?: boolean;
}

export function AIGenerateButton({
  type,
  onGenerate,
  creditCost,
  disabled
}: AIGenerateButtonProps) {
  const { credits, subscription } = useSubscription();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canGenerate = subscription.tier !== 'trial' || credits.used < 2;
  const hasEnoughCredits = credits.balance >= creditCost;
  
  const handleClick = async () => {
    if (!canGenerate || !hasEnoughCredits) return;
    
    setIsGenerating(true);
    try {
      await onGenerate();
      // Credits deducted on server
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (!canGenerate) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button disabled className="gap-2">
              <Lock className="h-4 w-4" />
              Generate
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Trial limit reached. Upgrade to continue.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <Button 
      onClick={handleClick}
      disabled={disabled || isGenerating || !hasEnoughCredits}
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Generate ({creditCost} credits)
        </>
      )}
    </Button>
  );
}
```

---

## State Management

### React Query Setup
```tsx
// lib/api/client.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Query keys
export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  story: (projectId: string) => ['projects', projectId, 'story'] as const,
  characters: (projectId: string) => ['projects', projectId, 'characters'] as const,
  credits: ['credits'] as const,
  subscription: ['subscription'] as const,
};
```

### Zustand Stores
```tsx
// stores/editor-store.ts
interface EditorState {
  unsavedChanges: boolean;
  activeTab: string;
  editingCharacter: Character | null;
  
  setActiveTab: (tab: string) => void;
  setEditingCharacter: (char: Character | null) => void;
  markUnsaved: () => void;
  markSaved: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  unsavedChanges: false,
  activeTab: 'story',
  editingCharacter: null,
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  setEditingCharacter: (char) => set({ editingCharacter: char }),
  markUnsaved: () => set({ unsavedChanges: true }),
  markSaved: () => set({ unsavedChanges: false }),
}));
```

---

## Responsive Breakpoints

```css
/* Tailwind defaults used */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Wide screen */
```

### Mobile-First Design Rules

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Sidebar | Hidden (hamburger) | Collapsible | Expanded |
| Project Cards | 1 column | 2 columns | 4 columns |
| Studio Tabs | Scrollable | Full width | Full width |
| Video Player | Fullscreen | 16:9 | 16:9 |
| Forms | Single column | Single column | Two column |

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |
| TTI | < 3.5s | Time to Interactive |
| Bundle Size | < 200KB | Initial JS |

### Optimization Checklist
- [ ] Use Next.js Image component
- [ ] Lazy load below-fold components
- [ ] Code split by route
- [ ] Prefetch critical routes
- [ ] Use Server Components where possible
- [ ] Minimize client-side JavaScript
- [ ] Enable gzip/brotli compression
- [ ] Use CDN for static assets

---

## Accessibility (WCAG 2.1 AA)

- [ ] All images have alt text
- [ ] Color contrast 4.5:1 minimum
- [ ] Keyboard navigable
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] Skip links present
- [ ] Form labels associated
- [ ] Error messages clear
- [ ] Motion reducible

---

## Testing Requirements

### Unit Tests (Jest + RTL)
```bash
# Coverage target: 70%
npm run test
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
# Critical flows
npm run test:e2e
```

### Critical User Flows to Test:
1. Register → Login → Create Project → Generate Story
2. Login → Watch Content → Add to Watchlist
3. Login → Invest → Complete Payment
4. Login → Store → Checkout → Track Order
5. Login → Fandom → Create Discussion → Comment
