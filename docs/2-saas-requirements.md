# SaaS Requirements & AI Budgeting

## 1. SaaS Architecture Requirements

### Multi-Tenancy
- **Tenant Isolation**: Setiap user/organization memiliki data terpisah
- **Subdomain/Custom Domain**: `studio.{tenant}.cinegenesis.app`
- **Role-Based Access Control (RBAC)**:
  - Owner, Admin, Editor, Viewer
  - Team member dengan token-based access (Modo tokens)

### Authentication & Authorization
- **Auth Provider Options**:
  - Auth0, Clerk, or NextAuth.js
  - Social login (Google, GitHub, Discord)
  - Magic link / Passwordless
  - Web3 wallet connection (MetaMask, WalletConnect)
- **Session Management**: JWT + Refresh tokens
- **API Key Management**: Untuk integrasi third-party

### Billing & Subscription
- **Payment Gateway**: Stripe, Paddle, atau LemonSqueezy
- **Subscription Tiers**:

| Tier | Price/mo | AI Credits | Storage | Projects | Team Members |
|------|----------|------------|---------|----------|--------------|
| Free | $0 | 50 credits | 1GB | 2 | 1 |
| Starter | $29 | 500 credits | 10GB | 10 | 3 |
| Pro | $79 | 2000 credits | 50GB | Unlimited | 10 |
| Enterprise | Custom | Unlimited | Custom | Unlimited | Unlimited |

- **Pay-as-you-go**: Tambahan credits diluar subscription
- **Usage Tracking**: Monitor AI calls, storage, bandwidth

---

## 2. API Requirements (External)

### AI/LLM APIs

#### Option A: OpenAI
| Service | Model | Use Case |
|---------|-------|----------|
| Chat Completions | GPT-4o | Script, story, character generation |
| Image Generation | DALL-E 3 / gpt-image-1 | Moodboard, character, thumbnail |
| Embeddings | text-embedding-3-small | Semantic search (future) |

#### Option B: Google Gemini
| Service | Model | Use Case |
|---------|-------|----------|
| Text Generation | Gemini 1.5 Pro | Script, story generation |
| Image Generation | Imagen 3 | Moodboard, thumbnails |
| Video Generation | Veo 2 (future) | Animation preview |

#### Option C: Alibaba Qwen
| Service | Model | Use Case |
|---------|-------|----------|
| Text Generation | Qwen-Max | Script, story generation |
| Image Generation | Qwen-VL | Image understanding/editing |

### Image Generation Alternatives
| Provider | Model | Quality | Price |
|----------|-------|---------|-------|
| Midjourney | v6 | Excellent | $10-30/mo |
| Stability AI | SDXL, SD3 | Good | $0.02-0.05/image |
| Leonardo AI | Phoenix | Good | $12-48/mo |
| Ideogram | v2 | Good | $8-20/mo |
| Flux (Black Forest Labs) | Flux 1.1 Pro | Excellent | $0.04/image |

### Video Generation APIs
| Provider | Model | Quality | Price |
|----------|-------|---------|-------|
| Runway | Gen-3 Alpha | Excellent | $15-95/mo |
| Pika Labs | Pika 1.0 | Good | $8-58/mo |
| Kling AI | Kling 1.5 | Good | Pay-per-use |
| Luma AI | Dream Machine | Good | $24-100/mo |
| Google Veo 2 | Veo 2 | Excellent | TBD |

### Other Required APIs
| Service | Provider | Purpose |
|---------|----------|---------|
| Storage | AWS S3 / Cloudflare R2 | Asset storage |
| CDN | Cloudflare / CloudFront | Media delivery |
| Email | SendGrid / Resend | Transactional emails |
| Analytics | Mixpanel / PostHog | User analytics |
| Error Tracking | Sentry | Error monitoring |
| Design | Canva API | IP Bible design |

---

## 3. AI Budgeting Comparison

### Text Generation Cost Analysis (per 1M tokens)

| Provider | Input Cost | Output Cost | Model |
|----------|------------|-------------|-------|
| **OpenAI** | $2.50 | $10.00 | GPT-4o |
| **OpenAI** | $0.15 | $0.60 | GPT-4o-mini |
| **Google** | $1.25 | $5.00 | Gemini 1.5 Pro |
| **Google** | $0.075 | $0.30 | Gemini 1.5 Flash |
| **Anthropic** | $3.00 | $15.00 | Claude 3.5 Sonnet |
| **Qwen** | $0.50 | $2.00 | Qwen-Max |

### Image Generation Cost Analysis

| Provider | Cost/Image | Resolution | Quality |
|----------|------------|------------|---------|
| **OpenAI DALL-E 3** | $0.04-0.12 | 1024x1024 | Good |
| **OpenAI gpt-image-1** | ~$0.08 | 1024x1024 | Better |
| **Google Imagen 3** | $0.02-0.05 | Up to 4096x4096 | Excellent |
| **Stability AI SDXL** | $0.02-0.04 | 1024x1024 | Good |
| **Flux 1.1 Pro** | $0.04 | 1024x1024 | Excellent |
| **Midjourney** | ~$0.10* | 1024x1024 | Excellent |

*Midjourney: subscription based, estimated per image

### Estimated Monthly Cost per User Tier

#### Scenario: Active Creator (100 projects/month)
| Activity | Count | OpenAI Cost | Gemini Cost | Qwen Cost |
|----------|-------|-------------|-------------|-----------|
| Script Generation | 50 | $5.00 | $2.50 | $1.00 |
| Character Generation | 100 | $2.00 | $1.00 | $0.50 |
| Story Structure | 100 | $4.00 | $2.00 | $1.00 |
| Synopsis | 100 | $1.00 | $0.50 | $0.25 |
| Image Gen (Character) | 200 | $16.00 | $6.00 | N/A* |
| Image Gen (Moodboard) | 500 | $40.00 | $15.00 | N/A* |
| Image Gen (Thumbnail) | 100 | $8.00 | $3.00 | N/A* |
| **TOTAL/user** | - | **$76.00** | **$30.00** | **~$20.00** |

*Qwen: Use Stability AI or Flux for images

### Recommended AI Stack by Budget

#### Budget-Conscious
```
Text: Gemini 1.5 Flash ($0.075/1M input)
Images: Stability AI SDXL ($0.02/image)
Video: Pika Labs ($8/mo)
Total: ~$15-25/user/month
```

#### Balanced Quality
```
Text: Gemini 1.5 Pro ($1.25/1M input)
Images: Flux 1.1 Pro ($0.04/image)
Video: Runway Gen-3 ($30/mo shared)
Total: ~$35-50/user/month
```

#### Premium Quality
```
Text: GPT-4o ($2.50/1M input)
Images: Midjourney + DALL-E 3 ($20/mo + $0.08/image)
Video: Runway Gen-3 Alpha ($95/mo)
Total: ~$80-120/user/month
```

---

## 4. Infrastructure Requirements

### Database
- **Primary**: PostgreSQL (Neon, Supabase, or PlanetScale)
- **Cache**: Redis (Upstash)
- **Search**: Elasticsearch / Meilisearch (untuk script search)

### Hosting
| Component | Recommended | Alternative |
|-----------|-------------|-------------|
| Frontend | Vercel | Cloudflare Pages |
| Backend | Railway / Render | AWS ECS |
| Database | Neon / Supabase | AWS RDS |
| Storage | Cloudflare R2 | AWS S3 |
| Queue | Upstash Redis | AWS SQS |

### Scaling Considerations
- **API Rate Limiting**: Per user, per endpoint
- **Queue System**: For AI jobs (Bull/BullMQ)
- **Caching**: Redis for AI responses
- **CDN**: For generated images/videos

---

## 5. Security Requirements

### Data Protection
- [ ] End-to-end encryption for sensitive data
- [ ] GDPR/CCPA compliance
- [ ] Data residency options (EU, US, APAC)
- [ ] Regular security audits

### API Security
- [ ] Rate limiting
- [ ] API key rotation
- [ ] Request signing
- [ ] IP allowlisting (enterprise)

### Content Safety
- [ ] AI content moderation
- [ ] NSFW filtering
- [ ] Copyright detection (future)

---

## 6. Monitoring & Analytics

### Metrics to Track
- AI credit usage per user
- API latency (p50, p95, p99)
- Error rates by endpoint
- Feature adoption
- Revenue per user (ARPU)
- Churn rate

### Tools
- **APM**: Datadog / New Relic
- **Logging**: Logtail / Better Stack
- **Analytics**: Mixpanel / Amplitude
- **Error Tracking**: Sentry

---

## 7. Compliance & Legal

### Required Documents
- Terms of Service
- Privacy Policy
- Cookie Policy
- DPA (Data Processing Agreement)
- Acceptable Use Policy

### AI-Specific Compliance
- AI-generated content labeling
- Copyright ownership clarity
- Model training opt-out
- Content moderation policies
