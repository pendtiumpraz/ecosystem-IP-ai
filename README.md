# 🎬 MODO Creator Verse

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19.2.1-61dafb?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=for-the-badge&logo=tailwindcss)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.38.0-C5F74F?style=for-the-badge)

**Platform SaaS Ekosistem IP (Intellectual Property) berbasis AI untuk kreator konten, investor, dan penggemar.**

[Live Demo](#) • [Documentation](/docs) • [Features](#-core-features)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [AI Integration](#-ai-integration)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [Development Progress](#-development-progress)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**MODO Creator Verse** adalah platform SaaS komprehensif yang memfasilitasi seluruh siklus hidup Intellectual Property (IP) — dari pembuatan konten menggunakan AI, pengelolaan investasi, distribusi streaming, lisensi merchandise, hingga komunitas penggemar.

Platform ini menggabungkan kekuatan AI generatif multi-provider (OpenAI, Anthropic, Google, Fal.ai) dengan tools profesional untuk membantu kreator mengembangkan IP mereka secara end-to-end.

### 🌟 Why MODO?

| Untuk Kreator | Untuk Investor | Untuk Penggemar |
|---------------|----------------|-----------------|
| ✅ AI-powered story & character creation | ✅ Portfolio management | ✅ Streaming platform |
| ✅ Moodboard & visual generation | ✅ Campaign discovery | ✅ Community hub |
| ✅ IP Bible export | ✅ Return tracking | ✅ Merchandise store |
| ✅ Multi-tier subscription | ✅ Analytics dashboard | ✅ Fan engagement |

---

## 🚀 Core Features

### 📺 **STUDIO Module**
Platform kreasi IP berbasis AI dengan 9 tab terintegrasi:

- **IP Project** — Manajemen proyek IP dengan CRUD lengkap
- **Strategic Plan** — Perencanaan strategis dengan AI assistance
- **Character Formula** — Pembuatan karakter dengan AI profiling & image generation
- **Story Formula** — Pengembangan cerita dengan 3 structure templates (Hero's Journey, Save the Cat, Dan Harmon's Story Circle)
- **Universe Formula** — World-building dengan AI generation untuk environment, society, dan lore
- **Moodboard** — Visual reference dengan AI image generation per-beat
- **Animate** — Preview animasi (in development)
- **Edit & Mix** — Post-production tools
- **IP Bible Export** — Export PDF komprehensif

### 💰 **INVEST Module**
Crowdfunding dan investment platform:

- Campaign browsing & discovery
- Portfolio management
- Escrow system
- Contract generation & e-signature
- KYC/AML compliance
- Real-time analytics

### 📺 **WATCH Module**
Streaming platform dengan:

- HLS adaptive streaming
- Multi-quality transcoding (360p - 4K)
- Watch history & resume
- AI-powered recommendations
- Multi-language subtitles
- Live streaming capability

### 🏪 **LICENSE Module**
Merchandise & licensing management:

- Product catalog management
- B2B licensing portal
- Inventory tracking
- Multi-category products

### 👥 **FANDOM Module**
Community engagement hub:

- Discord integration
- Telegram community
- WhatsApp groups
- Fan activities & events

### 🛡️ **HAKI Module**
IP protection & management (in development)

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework dengan App Router |
| **React 19** | UI library dengan concurrent features |
| **TypeScript 5** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Radix UI** | Accessible component primitives |
| **Framer Motion** | Animation library |
| **Recharts** | Data visualization |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Serverless API endpoints |
| **Drizzle ORM** | Type-safe database ORM |
| **Neon PostgreSQL** | Serverless PostgreSQL |
| **Upstash Redis** | Rate limiting & caching |
| **NextAuth 5** | Authentication |
| **Zod** | Schema validation |

### AI Providers
| Provider | Models |
|----------|--------|
| **OpenAI** | GPT-4o, GPT-4o-mini, DALL-E 3 |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Haiku |
| **Google** | Gemini 2.0 Pro, Gemini 2.0 Flash |
| **Fal.ai** | FLUX, Kling Video |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Vercel** | Deployment & hosting |
| **Google Drive** | File storage integration |
| **Midtrans/Xendit** | Payment gateway |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- PostgreSQL database (Neon recommended)
- AI Provider API keys

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pendtiumpraz/ecosystem-IP-ai.git
   cd ecosystem-IP-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following in `.env`:
   ```env
   # Database
   DATABASE_URL=your_neon_postgres_url
   
   # Authentication
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   
   # AI Providers
   OPENAI_API_KEY=sk-xxx
   ANTHROPIC_API_KEY=sk-ant-xxx
   GOOGLE_AI_API_KEY=xxx
   FAL_API_KEY=xxx
   
   # Redis (Optional)
   UPSTASH_REDIS_REST_URL=xxx
   UPSTASH_REDIS_REST_TOKEN=xxx
   
   # Google Drive (Optional)
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=xxx
   ```

4. **Setup database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Commands

```bash
# Generate migrations
npm run db:generate

# Push schema to database
npm run db:push

# Open Drizzle Studio
npm run db:studio

# Seed database
npm run db:seed
```

---

## 📁 Project Structure

```
ecosystem-IP-ai/
├── docs/                   # Documentation files
├── drizzle/                # Database migrations
├── public/                 # Static assets
├── scripts/                # Utility scripts
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (public)/       # Public pages (landing, pricing, etc.)
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (creator)/      # Creator dashboard & projects
│   │   ├── (investor)/     # Investor dashboard
│   │   ├── (admin)/        # Admin panel
│   │   └── api/            # API routes
│   ├── components/         # React components
│   │   ├── ui/             # Shadcn/ui primitives
│   │   ├── studio/         # Studio-specific components
│   │   └── ...
│   ├── db/                 # Database schema & queries
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript types
├── .env.example            # Environment template
├── drizzle.config.ts       # Drizzle configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript configuration
```

---

## 🗄️ Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts with roles, subscription, credits |
| `sessions` | Authentication sessions |
| `organizations` | Team/studio management |
| `projects` | IP Bible projects |
| `stories` | Story content |
| `characters` | Character profiles |
| `universes` | World building data |
| `moodboards` | Visual references |

### AI System Tables

| Table | Description |
|-------|-------------|
| `ai_providers` | Provider configurations |
| `ai_models` | Available models with pricing |
| `ai_tier_models` | Tier-based model access |
| `platform_api_keys` | Platform-level API keys |
| `user_api_keys` | BYOK (Bring Your Own Key) |
| `ai_generation_logs` | Generation history |
| `credit_transactions` | Credit usage audit |

### Soft Delete Pattern

All critical tables implement soft delete:
```sql
UPDATE table SET deleted_at = NOW() WHERE id = ?
-- All SELECT queries filter: WHERE deleted_at IS NULL
```

---

## 🤖 AI Integration

### Generation Types & Credit Costs

| Type | Credits | Description |
|------|---------|-------------|
| `synopsis` | 3 | Story synopsis |
| `story_structure` | 10 | Beat sheet |
| `character_profile` | 8 | Character development |
| `character_image` | 12 | AI portraits |
| `universe` | 10 | World building |
| `moodboard_prompt` | 3 | Visual prompt |
| `moodboard_image` | 12 | Scene images |
| `script` | 25 | Screenplay |
| `animation_preview` | 15 | Short clips |
| `video` | 50 | Full video |
| `voice` | 20 | Voice synthesis |
| `music` | 30 | Music composition |

### Fallback System

Platform implements a tier-based AI fallback system:
- **Premium models** for paid tiers
- **Free models** available for trial users
- **BYOK** (Bring Your Own Key) for enterprise

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Superadmin** | Full platform access, user management, analytics |
| **Admin** | Limited admin functions |
| **Creator (Tenant)** | Studio module, project management |
| **Investor** | Investment module, portfolio management |

---

## 📚 API Documentation

### Authentication
```
POST /api/auth/register    - Create new user
POST /api/auth/login       - Authenticate user
GET  /api/auth/session     - Get current session
```

### Projects
```
GET    /api/creator/projects         - List projects
POST   /api/creator/projects         - Create project
GET    /api/creator/projects/[id]    - Get project detail
PUT    /api/creator/projects/[id]    - Update project
DELETE /api/creator/projects/[id]    - Soft delete project
```

### AI Generation
```
POST   /api/ai/generate              - Generate content
GET    /api/ai/generate              - Get generation history
GET    /api/ai/generate/[id]         - Get single generation
POST   /api/ai/generate/[id]/accept  - Accept/use version
DELETE /api/ai/generate/[id]         - Soft delete generation
```

### Admin
```
GET    /api/admin/dashboard          - Platform stats
GET    /api/admin/users              - User list
PUT    /api/admin/users/[id]         - Update user
DELETE /api/admin/users/[id]         - Soft delete user
GET    /api/admin/ai-providers       - AI provider list
```

For complete API documentation, refer to the `/docs` directory.

---

## 📊 Development Progress

| Phase | Status | Progress |
|-------|--------|----------|
| Setup & Foundation | ✅ Completed | 100% |
| Public Pages & Landing | ✅ Completed | 100% |
| Authentication & Users | ✅ Completed | 100% |
| Database & Schema | ✅ Completed | 100% |
| Studio Module (Core) | ✅ Completed | 95% |
| AI Integration | ✅ Completed | 100% |
| Public Modules | ✅ Completed | 100% |
| Soft Delete & Data Safety | ✅ Completed | 100% |
| Google Drive Integration | ✅ Completed | 100% |
| Admin & Superadmin | ✅ Completed | 90% |
| Investor Module | ✅ Completed | 80% |
| Billing & Monetization | ✅ Completed | 100% |
| Watch Module (Streaming) | ✅ Completed | 95% |
| License Module | ✅ Completed | 95% |
| Fandom Module | ✅ Completed | 100% |
| Testing & Polish | 🔄 In Progress | 20% |
| Mobile Applications | ❌ Not Started | 0% |

**Overall Progress: 85% Complete**

For detailed progress, see [PROGRESS.md](./PROGRESS.md).

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📞 Contact

- **Website**: [modo.id](https://modo.id)
- **WhatsApp**: Contact for inquiries
- **Email**: support@modo.id

---

<div align="center">

**Built with ❤️ by MODO Team**

</div>
