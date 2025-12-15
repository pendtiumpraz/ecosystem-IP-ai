# MODO Creator Verse - Complete Ecosystem Documentation

## Platform Overview

MODO adalah **All-in-One Creator Economy Platform** yang menggabungkan:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MODO CREATOR VERSE                                   │
│                    "Ekosistem IP: Kreasi, Investasi, Aktivasi"              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ WATCH   │  │ STUDIO  │  │ INVEST  │  │ LICENSE │  │ FANDOM  │          │
│  │         │  │         │  │         │  │         │  │         │          │
│  │Streaming│  │IP Bible │  │Crowdfund│  │Merch &  │  │Community│          │
│  │Platform │  │Creation │  │Platform │  │Licensing│  │Hub      │          │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘          │
│       │            │            │            │            │                │
│       └────────────┴────────────┼────────────┴────────────┘                │
│                                 │                                          │
│                    ┌────────────┴────────────┐                             │
│                    │      UNIFIED USER       │                             │
│                    │   (Creator/Fan/Investor)│                             │
│                    └─────────────────────────┘                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Module Breakdown

### 1. WATCH - Streaming Platform
**Similar to:** Netflix, Disney+, Vidio

| Feature | Description |
|---------|-------------|
| Content Catalog | Film, Serial, Drama, Animasi |
| Categories | Genre-based (Horror, Action, Sci-Fi, Drama, Comedy) |
| Hero Banner | Featured content dengan CTA |
| Recommendation | "Trending", "Populer", kategori |
| Content Details | Rating, year, genre, synopsis |
| Watch History | Resume watching |
| Watchlist | Save for later |

**Key Pages:**
- `/watch` - Browse catalog
- `/watch/[contentId]` - Content details
- `/watch/[contentId]/play` - Video player

### 2. STUDIO - IP Bible Creation
**Similar to:** AI-Series-Studio (existing), WriterSolo, Celtx

| Feature | Description |
|---------|-------------|
| Project Creation | Create IP Bible projects |
| Story Formula | Premise, synopsis, structure, beats |
| Character Bible | Full character development |
| World Building | Universe/setting details |
| Moodboard | Visual references per beat |
| Animation Preview | AI-generated previews |
| Script Generation | Full screenplay output |
| Performance Analysis | Predictive analytics |
| Team Collaboration | Assign roles, invite members |
| Canva Integration | Design IP Bible documents |

**Key Pages:**
- `/studio` - Dashboard projects
- `/studio/new` - Create new project
- `/studio/[projectId]` - Full studio interface

### 3. INVEST - Crowdfunding Platform
**Similar to:** Kickstarter, Indiegogo, Republic, StartEngine

| Feature | Description |
|---------|-------------|
| IP Catalog | Browsable investment opportunities |
| Funding Progress | Real-time funding tracker |
| Investment Tiers | Bronze, Silver, Gold, Platinum |
| Benefits | Revenue share, NFTs, early access, credits |
| NFT Integration | Digital collectibles with utility |
| Performance Index | IP performance tracking |
| Creator Applications | Submit projects for funding |

**Key Pages:**
- `/invest` - Investment catalog
- `/invest/[projectId]` - Project details + invest
- `/invest/portfolio` - User's investments
- `/invest/submit` - Submit project for funding

**Investment Tiers Example:**
| Tier | Min Investment | Benefits |
|------|---------------|----------|
| Supporter | Rp 100.000 | Digital thank you, updates |
| Bronze | Rp 500.000 | + Early access, name in credits |
| Silver | Rp 2.000.000 | + Exclusive NFT, merchandise |
| Gold | Rp 10.000.000 | + Revenue share (0.5%), premiere invite |
| Platinum | Rp 50.000.000 | + Executive producer credit, 2% revenue |

### 4. LICENSE - Merchandise & Licensing
**Similar to:** Shopify, TeePublic, License Global

#### 4a. Official Store (B2C)
| Feature | Description |
|---------|-------------|
| Product Catalog | Apparel, Toys, Books, Stationary |
| IP Filtering | Browse by IP/franchise |
| Shopping Cart | Add to cart, checkout |
| Order Management | Track orders |
| Wishlist | Save products |

#### 4b. Licensing Marketplace (B2B)
| Feature | Description |
|---------|-------------|
| License Catalog | Available IPs for licensing |
| License Types | Merchandise, Media, Gaming, Theme Park |
| Application Process | Request license inquiry |
| Contract Management | Digital contracts |
| Royalty Tracking | Revenue reporting |

**Key Pages:**
- `/license` - Store + licensing overview
- `/license/store` - B2C merchandise
- `/license/b2b` - B2B licensing marketplace
- `/license/cart` - Shopping cart
- `/license/orders` - Order history

### 5. FANDOM - Community Hub
**Similar to:** Discord, Reddit, Fandom.com, Patreon community

| Feature | Description |
|---------|-------------|
| Communities | IP-specific fan groups |
| Discussions | Forum-style threads |
| Fan Content | Upload fan art, videos, cosplay |
| Events | Watch parties, Q&A, premieres |
| Creator Spotlight | Highlight fan creators |
| Reactions | Upvote/downvote, comments |

**Key Pages:**
- `/fandom` - Community overview
- `/fandom/[communityId]` - Specific community
- `/fandom/[communityId]/discussions` - Forum threads
- `/fandom/[communityId]/gallery` - Fan content
- `/fandom/events` - Upcoming events
- `/fandom/create` - Create fan content

---

## User Roles & Personas

### 1. Creator (IP Owner)
```
Permissions:
✅ Create IP Bible in Studio
✅ Submit to Invest for crowdfunding
✅ Manage licensing deals
✅ Engage with fandom
✅ Upload content to Watch (after production)
✅ Receive revenue share
```

### 2. Fan (Consumer)
```
Permissions:
✅ Watch content (subscription)
✅ Join fandom communities
✅ Create fan content
✅ Buy merchandise
✅ Back projects (small investments)
```

### 3. Investor
```
Permissions:
✅ All Fan permissions
✅ Invest in IP projects
✅ Receive revenue share
✅ Exclusive access & benefits
✅ Vote on project decisions (governance)
```

### 4. Licensee (B2B Partner)
```
Permissions:
✅ Browse licensable IPs
✅ Request licensing deals
✅ Access brand assets
✅ Report royalties
```

### 5. Platform Admin
```
Permissions:
✅ Curate content
✅ Approve investments
✅ Moderate communities
✅ Manage platform
```

---

## Complete Database Schema (Extended)

### Core Tables (Existing)
```sql
-- From AI-Series-Studio
users, projects, stories, characters, universes, moodboards, animations
```

### Watch Module
```sql
CREATE TABLE contents (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id), -- Link to IP
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- movie, series, short
  genre VARCHAR(100),
  rating VARCHAR(10), -- G, PG, PG-13, R
  release_year INTEGER,
  duration_minutes INTEGER,
  synopsis TEXT,
  poster_url TEXT,
  banner_url TEXT,
  trailer_url TEXT,
  video_url TEXT, -- Main content URL
  match_score INTEGER, -- Recommendation score
  status VARCHAR(50), -- draft, published, archived
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE content_episodes (
  id UUID PRIMARY KEY,
  content_id UUID REFERENCES contents(id),
  season_number INTEGER,
  episode_number INTEGER,
  title VARCHAR(255),
  duration_minutes INTEGER,
  video_url TEXT,
  thumbnail_url TEXT,
  released_at TIMESTAMP
);

CREATE TABLE watch_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content_id UUID REFERENCES contents(id),
  episode_id UUID REFERENCES content_episodes(id),
  progress_seconds INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE watchlists (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content_id UUID REFERENCES contents(id),
  added_at TIMESTAMP DEFAULT NOW()
);
```

### Invest Module
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  poster_url TEXT,
  goal_amount DECIMAL(15,2),
  raised_amount DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'IDR',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(50), -- draft, active, funded, failed, completed
  category VARCHAR(50), -- film, series, animation, novel, game
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE investment_tiers (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  name VARCHAR(100), -- Bronze, Silver, Gold, Platinum
  min_amount DECIMAL(15,2),
  max_amount DECIMAL(15,2),
  benefits JSONB, -- Array of benefit descriptions
  revenue_share_percent DECIMAL(5,2),
  nft_included BOOLEAN DEFAULT FALSE,
  limit_quantity INTEGER, -- NULL = unlimited
  sold_quantity INTEGER DEFAULT 0
);

CREATE TABLE investments (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  user_id UUID REFERENCES users(id),
  tier_id UUID REFERENCES investment_tiers(id),
  amount DECIMAL(15,2),
  payment_status VARCHAR(50), -- pending, completed, refunded
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE investor_rewards (
  id UUID PRIMARY KEY,
  investment_id UUID REFERENCES investments(id),
  reward_type VARCHAR(50), -- nft, revenue_share, merchandise, access
  description TEXT,
  status VARCHAR(50), -- pending, delivered
  delivered_at TIMESTAMP
);

CREATE TABLE revenue_distributions (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  period_start DATE,
  period_end DATE,
  total_revenue DECIMAL(15,2),
  distributed_amount DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### License Module
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id), -- Link to IP
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- apparel, toys, books, stationary
  price DECIMAL(15,2),
  currency VARCHAR(10) DEFAULT 'IDR',
  stock_quantity INTEGER,
  images JSONB, -- Array of image URLs
  status VARCHAR(50), -- active, out_of_stock, discontinued
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  status VARCHAR(50), -- pending, paid, shipped, delivered, cancelled
  subtotal DECIMAL(15,2),
  shipping_cost DECIMAL(15,2),
  total DECIMAL(15,2),
  shipping_address JSONB,
  tracking_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER,
  unit_price DECIMAL(15,2),
  subtotal DECIMAL(15,2)
);

CREATE TABLE license_requests (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  requester_company VARCHAR(255),
  requester_email VARCHAR(255),
  license_type VARCHAR(50), -- merchandise, media, gaming, theme_park
  territory VARCHAR(100), -- Indonesia, Southeast Asia, Global
  duration_years INTEGER,
  proposed_royalty_percent DECIMAL(5,2),
  message TEXT,
  status VARCHAR(50), -- pending, reviewing, approved, rejected
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE license_agreements (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  licensee_id UUID REFERENCES users(id),
  license_type VARCHAR(50),
  territory VARCHAR(100),
  start_date DATE,
  end_date DATE,
  royalty_percent DECIMAL(5,2),
  minimum_guarantee DECIMAL(15,2),
  contract_url TEXT,
  status VARCHAR(50) -- active, expired, terminated
);
```

### Fandom Module
```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE community_members (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(50), -- member, moderator, admin
  joined_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE discussions (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id),
  author_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE discussion_comments (
  id UUID PRIMARY KEY,
  discussion_id UUID REFERENCES discussions(id),
  author_id UUID REFERENCES users(id),
  parent_id UUID REFERENCES discussion_comments(id), -- For nested replies
  content TEXT,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fan_contents (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id),
  author_id UUID REFERENCES users(id),
  type VARCHAR(50), -- fanart, video, cosplay, theory, review
  title VARCHAR(255),
  description TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50), -- watch_party, qa_session, premiere, meetup
  platform VARCHAR(50), -- discord, zoom, in_person
  event_date TIMESTAMP,
  event_url TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES users(id),
  status VARCHAR(50), -- attending, maybe, not_attending
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints (Complete)

### Watch API
```
GET    /api/watch/catalog              - List all content
GET    /api/watch/catalog/trending     - Trending content
GET    /api/watch/catalog/[category]   - By category
GET    /api/watch/content/[id]         - Content details
GET    /api/watch/content/[id]/episodes - Series episodes
POST   /api/watch/history              - Update watch progress
GET    /api/watch/history              - Get watch history
POST   /api/watch/watchlist            - Add to watchlist
DELETE /api/watch/watchlist/[id]       - Remove from watchlist
GET    /api/watch/watchlist            - Get watchlist
```

### Invest API
```
GET    /api/invest/campaigns           - List campaigns
GET    /api/invest/campaigns/[id]      - Campaign details
GET    /api/invest/campaigns/[id]/tiers - Investment tiers
POST   /api/invest/campaigns/[id]/invest - Make investment
GET    /api/invest/portfolio           - User's investments
GET    /api/invest/portfolio/returns   - Revenue distributions
POST   /api/invest/campaigns/submit    - Submit new campaign
```

### License API
```
GET    /api/license/products           - List products
GET    /api/license/products/[id]      - Product details
POST   /api/license/cart               - Add to cart
GET    /api/license/cart               - Get cart
POST   /api/license/checkout           - Create order
GET    /api/license/orders             - Order history
GET    /api/license/orders/[id]        - Order details

POST   /api/license/b2b/inquiry        - Submit license inquiry
GET    /api/license/b2b/agreements     - User's license agreements
```

### Fandom API
```
GET    /api/fandom/communities         - List communities
GET    /api/fandom/communities/[id]    - Community details
POST   /api/fandom/communities/[id]/join - Join community
DELETE /api/fandom/communities/[id]/leave - Leave community

GET    /api/fandom/discussions         - List discussions
POST   /api/fandom/discussions         - Create discussion
GET    /api/fandom/discussions/[id]    - Discussion + comments
POST   /api/fandom/discussions/[id]/comments - Add comment
POST   /api/fandom/discussions/[id]/vote - Upvote/downvote

GET    /api/fandom/content             - Fan content feed
POST   /api/fandom/content             - Upload fan content
GET    /api/fandom/content/[id]        - Content details

GET    /api/fandom/events              - List events
POST   /api/fandom/events/[id]/rsvp    - RSVP to event
```

---

## Tech Stack Recommendations

### Frontend (All Modules)
```
Next.js 14 (App Router)
├── React 19
├── TypeScript
├── Tailwind CSS
├── shadcn/ui
├── Framer Motion
├── TanStack Query
├── Zustand
└── Video.js (for streaming)
```

### Backend
```
Option A: Next.js API Routes (Simpler)
├── All API in /app/api
├── Edge functions for performance
└── Vercel for deployment

Option B: Separate Microservices (Scalable)
├── Auth Service (NextAuth)
├── Studio Service (Express)
├── Watch Service (Express + HLS)
├── Invest Service (Express)
├── License Service (Express)
├── Fandom Service (Express)
└── API Gateway (Kong/Nginx)
```

### Video Streaming
```
HLS Streaming Stack:
├── Video Storage: AWS S3 / Cloudflare R2
├── Transcoding: AWS MediaConvert / FFmpeg
├── CDN: CloudFront / Cloudflare Stream
├── Player: Video.js / Plyr
└── DRM: Widevine / FairPlay (optional)
```

### Payment Processing
```
Indonesia:
├── Midtrans (Primary)
├── Xendit
├── Stripe (International)
└── Crypto (USDT/USDC) - Optional
```

### Additional Services
```
├── Email: Resend / SendGrid
├── Push Notifications: OneSignal
├── Analytics: Mixpanel / PostHog
├── Search: Meilisearch / Algolia
├── Real-time: Pusher / Ably
└── File Storage: Cloudflare R2
```

---

## Revenue Model

### 1. Platform Revenue Streams

| Stream | Source | Revenue |
|--------|--------|---------|
| **Subscriptions** | Watch streaming access | Rp 49k-149k/month |
| **SaaS** | Studio AI tools | $29-199/month |
| **Transaction Fees** | Investment platform | 3-5% of investments |
| **E-commerce** | Merchandise sales | 15-30% margin |
| **Licensing** | B2B license deals | 10-20% royalty commission |
| **Ads** | Free tier advertising | CPM-based |

### 2. Creator Revenue Share

| Source | Creator Share | Platform Share |
|--------|---------------|----------------|
| Streaming royalties | 50-70% | 30-50% |
| Investment proceeds | 85-95% | 5-15% |
| Merchandise profits | 60-70% | 30-40% |
| Licensing royalties | 70-80% | 20-30% |

---

## Competitive Analysis

| Feature | MODO | Netflix | Kickstarter | Patreon | Shopify |
|---------|------|---------|-------------|---------|---------|
| Streaming | ✅ | ✅ | ❌ | ❌ | ❌ |
| IP Creation | ✅ | ❌ | ❌ | ❌ | ❌ |
| Crowdfunding | ✅ | ❌ | ✅ | ✅ | ❌ |
| Merchandise | ✅ | ❌ | ❌ | ✅ | ✅ |
| Community | ✅ | ❌ | ❌ | ✅ | ❌ |
| Licensing B2B | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI Tools | ✅ | ❌ | ❌ | ❌ | ❌ |
| Revenue Share | ✅ | ❌ | ❌ | ✅ | ❌ |

**MODO Unique Value:** Satu-satunya platform yang menggabungkan seluruh lifecycle IP dari kreasi hingga monetisasi.

---

## Implementation Priority

### Phase 1: Core Platform (Month 1-2)
- [ ] User authentication (all roles)
- [ ] Studio module (existing AI-Series-Studio)
- [ ] Basic Watch catalog (no streaming yet)
- [ ] Homepage integration

### Phase 2: Streaming (Month 3)
- [ ] Video upload & processing
- [ ] HLS streaming setup
- [ ] Video player integration
- [ ] Watch history & watchlist

### Phase 3: Investment (Month 4)
- [ ] Campaign creation
- [ ] Investment tiers
- [ ] Payment integration (Midtrans)
- [ ] Portfolio dashboard

### Phase 4: Commerce (Month 5)
- [ ] Product catalog
- [ ] Shopping cart
- [ ] Order management
- [ ] B2B license inquiries

### Phase 5: Community (Month 6)
- [ ] Community creation
- [ ] Discussions/forums
- [ ] Fan content uploads
- [ ] Events system

### Phase 6: Polish & Scale (Month 7+)
- [ ] Mobile apps
- [ ] Advanced analytics
- [ ] NFT integration
- [ ] International expansion
