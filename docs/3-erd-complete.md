# Complete Entity Relationship Diagram (ERD)
## MODO Creator Verse - All Modules

---

## Visual ERD Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    MODO CREATOR VERSE - COMPLETE ERD                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────────┐
                                    │  organizations   │
                                    │──────────────────│
                                    │ id (PK)          │
                                    │ name             │
                                    │ slug             │
                                    │ logo             │
                                    │ plan             │
                                    │ stripe_customer  │
                                    └────────┬─────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              │                              │                              │
              ▼                              ▼                              ▼
    ┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
    │ org_members      │          │ subscriptions    │          │ credit_balances  │
    │──────────────────│          │──────────────────│          │──────────────────│
    │ org_id (FK)      │          │ org_id (FK)      │          │ org_id (FK)      │
    │ user_id (FK)     │          │ plan             │          │ balance          │
    │ role             │          │ status           │          │ bonus_balance    │
    └────────┬─────────┘          └──────────────────┘          └──────────────────┘
             │
             ▼
    ┌──────────────────┐
    │     users        │◄─────────────────────────────────────────────────────────────────┐
    │──────────────────│                                                                   │
    │ id (PK)          │                                                                   │
    │ email            │     ┌─────────────────────────────────────────────────────────┐  │
    │ password_hash    │     │                    STUDIO MODULE                         │  │
    │ name             │     └─────────────────────────────────────────────────────────┘  │
    │ avatar           │                                                                   │
    │ role             │          ┌──────────────────┐                                    │
    │ wallet_address   │          │    projects      │                                    │
    │ modo_tokens      │          │──────────────────│                                    │
    └────────┬─────────┘          │ id (PK)          │                                    │
             │                    │ org_id (FK)      │                                    │
             │                    │ user_id (FK)─────┼────────────────────────────────────┘
             │                    │ title            │
             │                    │ logo             │
             │                    │ thumbnail_mood   │
             │                    │ genre            │
             │                    │ status           │
             │                    └────────┬─────────┘
             │                             │
             │    ┌────────────────────────┼────────────────────────────┐
             │    │                        │                            │
             │    ▼                        ▼                            ▼
             │  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
             │  │    stories       │    │   characters     │    │   universes      │
             │  │──────────────────│    │──────────────────│    │──────────────────│
             │  │ project_id (FK)  │    │ project_id (FK)  │    │ project_id (FK)  │
             │  │ premise          │    │ name             │    │ environment      │
             │  │ synopsis         │    │ role             │    │ public_systems   │
             │  │ structure_beats  │    │ physiological    │    │ private_systems  │
             │  │ want_need_matrix │    │ psychological    │    │ visualizations   │
             │  │ generated_script │    │ swot_analysis    │    └──────────────────┘
             │  └──────────────────┘    └──────────────────┘
             │                                   │
             │    ┌──────────────────────────────┴───────────────────────────────┐
             │    │                                                              │
             │    ▼                                                              ▼
             │  ┌──────────────────┐                                   ┌──────────────────┐
             │  │   moodboards     │                                   │   animations     │
             │  │──────────────────│                                   │──────────────────│
             │  │ project_id (FK)  │                                   │ project_id (FK)  │
             │  │ beat_name        │                                   │ beat_name        │
             │  │ image_url        │                                   │ video_url        │
             │  └──────────────────┘                                   │ style            │
             │                                                         └──────────────────┘
             │
             │     ┌─────────────────────────────────────────────────────────────────────┐
             │     │                       WATCH MODULE                                   │
             │     └─────────────────────────────────────────────────────────────────────┘
             │
             │          ┌──────────────────┐
             │          │    contents      │
             │          │──────────────────│
             │          │ id (PK)          │
             │          │ project_id (FK)──┼──► Link to IP Project
             │          │ title            │
             │          │ type (movie/series)
             │          │ genre            │
             │          │ rating           │
             │          │ poster_url       │
             │          │ video_url        │
             │          └────────┬─────────┘
             │                   │
             │    ┌──────────────┼──────────────┐
             │    │              │              │
             │    ▼              ▼              ▼
             │  ┌────────────┐ ┌────────────┐ ┌────────────┐
             │  │ episodes   │ │watch_history│ │ watchlists │
             │  │────────────│ │────────────│ │────────────│
             │  │content_id  │ │user_id (FK)│◄┤user_id (FK)│◄─────────┐
             │  │season      │ │content_id  │ │content_id  │          │
             │  │episode     │ │progress    │ └────────────┘          │
             │  │video_url   │ │completed   │                         │
             │  └────────────┘ └────────────┘                         │
             │                                                         │
             │     ┌─────────────────────────────────────────────────────────────────────┐
             │     │                       INVEST MODULE                                  │
             │     └─────────────────────────────────────────────────────────────────────┘
             │
             │          ┌──────────────────┐
             │          │   campaigns      │
             │          │──────────────────│
             │          │ id (PK)          │
             │          │ project_id (FK)──┼──► Link to IP Project
             │          │ title            │
             │          │ goal_amount      │
             │          │ raised_amount    │
             │          │ status           │
             │          └────────┬─────────┘
             │                   │
             │    ┌──────────────┼──────────────┐
             │    │              │              │
             │    ▼              ▼              ▼
             │  ┌────────────┐ ┌────────────┐ ┌────────────────┐
             │  │invest_tiers│ │investments │ │revenue_distrib │
             │  │────────────│ │────────────│ │────────────────│
             │  │campaign_id │ │campaign_id │ │campaign_id     │
             │  │name        │ │user_id(FK) │◄┤total_revenue   │
             │  │min_amount  │ │tier_id     │ │distributed_amt │
             │  │benefits    │ │amount      │ └────────────────┘
             │  │rev_share % │ │status      │          │
             │  └────────────┘ └─────┬──────┘          │
             │                       │                  │
             │                       ▼                  │
             │                ┌────────────────┐        │
             │                │investor_rewards│        │
             │                │────────────────│        │
             │                │investment_id   │        │
             │                │reward_type     │◄───────┘
             │                │status          │
             │                └────────────────┘
             │
             │     ┌─────────────────────────────────────────────────────────────────────┐
             │     │                      LICENSE MODULE                                  │
             │     └─────────────────────────────────────────────────────────────────────┘
             │
             │          ┌──────────────────┐
             │          │    products      │
             │          │──────────────────│
             │          │ id (PK)          │
             │          │ project_id (FK)──┼──► Link to IP Project
             │          │ name             │
             │          │ category         │
             │          │ price            │
             │          │ stock            │
             │          └────────┬─────────┘
             │                   │
             │    ┌──────────────┴──────────────┐
             │    ▼                             ▼
             │  ┌────────────┐           ┌────────────────┐
             │  │  orders    │           │ license_requests│
             │  │────────────│           │────────────────│
             │  │ user_id(FK)│◄──────────┤project_id (FK) │
             │  │ status     │           │company         │
             │  │ total      │           │license_type    │
             │  └─────┬──────┘           │status          │
             │        │                  └───────┬────────┘
             │        ▼                          │
             │  ┌────────────┐                   ▼
             │  │order_items │           ┌────────────────┐
             │  │────────────│           │license_agreements
             │  │order_id    │           │────────────────│
             │  │product_id  │           │project_id      │
             │  │quantity    │           │licensee_id     │
             │  │subtotal    │           │royalty_percent │
             │  └────────────┘           │contract_url    │
             │                           └────────────────┘
             │
             │     ┌─────────────────────────────────────────────────────────────────────┐
             │     │                       FANDOM MODULE                                  │
             │     └─────────────────────────────────────────────────────────────────────┘
             │
             │          ┌──────────────────┐
             │          │  communities     │
             │          │──────────────────│
             │          │ id (PK)          │
             │          │ project_id (FK)──┼──► Link to IP Project
             │          │ name             │
             │          │ member_count     │
             │          └────────┬─────────┘
             │                   │
             │    ┌──────────────┼──────────────┬──────────────┬──────────────┐
             │    │              │              │              │              │
             │    ▼              ▼              ▼              ▼              ▼
             │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
             │  │community │ │discussions│ │fan_content│ │  events  │ │  badges  │
             │  │_members  │ │──────────│ │──────────│ │──────────│ │──────────│
             │  │──────────│ │community │ │community │ │community │ │community │
             │  │community │ │_id       │ │_id       │ │_id       │ │_id       │
             │  │_id       │ │author_id │◄┤author_id │◄┤title     │ │name      │
             │  │user_id   │◄┤title     │ │type      │ │event_date│ │criteria  │
             │  │role      │ │content   │ │media_url │ │max_attend│ └──────────┘
             │  └──────────┘ │upvotes   │ │views     │ └────┬─────┘
             │               └────┬─────┘ └──────────┘      │
             │                    │                         ▼
             │                    ▼                   ┌──────────┐
             │              ┌──────────┐              │event_rsvp│
             │              │discussion│              │──────────│
             │              │_comments │              │event_id  │
             │              │──────────│              │user_id   │◄────────────┘
             │              │discuss_id│              │status    │
             │              │author_id │◄─────────────└──────────┘
             │              │content   │
             │              │parent_id │ (self-reference for nested)
             │              └──────────┘
             │
             └─────────────────────────────────────────────────────────────────────────────
```

---

## Complete Table Definitions

### CORE MODULE - Authentication & Organizations

```sql
-- =====================================================
-- CORE: Organizations & Users
-- =====================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- untuk subdomain
  logo TEXT,
  banner TEXT,
  description TEXT,
  website VARCHAR(255),
  
  -- Subscription & Billing
  plan VARCHAR(50) DEFAULT 'free', -- free, starter, pro, team, enterprise, byok
  billing_email VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  
  -- Limits & Usage
  ai_credits_balance INTEGER DEFAULT 0,
  storage_used_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT DEFAULT 524288000, -- 500MB default
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
  -- Timestamps
  trial_ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Auth
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  
  -- Profile
  name VARCHAR(255),
  username VARCHAR(100) UNIQUE,
  avatar TEXT,
  bio TEXT,
  
  -- Web3
  wallet_address VARCHAR(255) UNIQUE,
  modo_tokens INTEGER DEFAULT 0,
  
  -- OAuth
  google_id VARCHAR(255) UNIQUE,
  github_id VARCHAR(255) UNIQUE,
  discord_id VARCHAR(255) UNIQUE,
  
  -- Settings
  preferences JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, deleted
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  role VARCHAR(50) NOT NULL, -- owner, admin, editor, viewer
  permissions JSONB DEFAULT '[]', -- granular permissions
  
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  plan VARCHAR(50) NOT NULL, -- free, starter, pro, team, enterprise, byok
  status VARCHAR(50) NOT NULL, -- active, canceled, past_due, trialing, paused
  billing_cycle VARCHAR(20), -- monthly, yearly
  
  -- Stripe
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  
  -- Dates
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  canceled_at TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  
  balance INTEGER DEFAULT 0, -- Main credits
  bonus_balance INTEGER DEFAULT 0, -- Promotional credits
  rollover_balance INTEGER DEFAULT 0, -- Rolled over from previous month
  
  last_reset_at TIMESTAMP,
  next_reset_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  type VARCHAR(50) NOT NULL, -- subscription, purchase, usage, refund, bonus, rollover
  amount INTEGER NOT NULL, -- positive=credit, negative=debit
  balance_after INTEGER NOT NULL,
  
  description TEXT,
  reference_type VARCHAR(50), -- ai_usage, stripe_invoice, manual
  reference_id VARCHAR(255),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  project_id UUID, -- Optional link to project
  
  endpoint VARCHAR(100) NOT NULL, -- /api/ai/generate-script, etc
  provider VARCHAR(50), -- openai, gemini, anthropic
  model VARCHAR(100), -- gpt-4o, gemini-1.5-pro, etc
  
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6),
  
  duration_ms INTEGER,
  status VARCHAR(50), -- success, error, timeout
  error_message TEXT,
  
  request_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  provider VARCHAR(50) NOT NULL, -- openai, gemini, anthropic, stability
  name VARCHAR(100),
  api_key_encrypted TEXT NOT NULL, -- Encrypted API key
  
  is_valid BOOLEAN DEFAULT TRUE,
  last_validated_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  
  token VARCHAR(255) UNIQUE NOT NULL,
  invited_by UUID REFERENCES users(id),
  
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, expired, revoked
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  device_info JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  expires_at TIMESTAMP NOT NULL,
  last_active_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### STUDIO MODULE - IP Creation

```sql
-- =====================================================
-- STUDIO: IP Bible Creation
-- =====================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  logo TEXT,
  thumbnail_mood TEXT,
  
  -- Classification
  genre VARCHAR(100),
  sub_genre VARCHAR(100),
  format VARCHAR(50), -- feature, series, short_movie, short_video, animation
  target_audience VARCHAR(100),
  target_market VARCHAR(100),
  
  -- IP Project Details
  studio_name VARCHAR(255),
  studio_logo TEXT,
  ip_owner VARCHAR(255),
  production_date DATE,
  
  -- Brand Identity
  brand_logos JSONB DEFAULT '[]', -- Array of logo URLs
  color_palette JSONB DEFAULT '[]', -- Array of hex colors
  
  -- Status & Visibility
  status VARCHAR(50) DEFAULT 'draft', -- draft, in_progress, completed, published
  visibility VARCHAR(50) DEFAULT 'private', -- private, team, public
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

CREATE TABLE project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  role VARCHAR(100) NOT NULL, -- ip_producer, head_creative, head_production, head_business, story_supervisor, character_supervisor, custom
  custom_role_title VARCHAR(100), -- For custom roles
  
  permissions JSONB DEFAULT '[]',
  modo_tokens INTEGER DEFAULT 0, -- Tokens allocated for this project
  
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_id, user_id)
);

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Core Story
  premise TEXT,
  synopsis TEXT,
  global_synopsis TEXT,
  logline TEXT,
  
  -- Format & Duration
  duration VARCHAR(50), -- 90min, 120min, 10eps, etc
  format VARCHAR(50), -- feature, series, short_movie, short_video
  episode_count INTEGER,
  episode_duration INTEGER, -- minutes
  
  -- Genre & Tone
  genre VARCHAR(100),
  sub_genre VARCHAR(100),
  tone VARCHAR(100),
  intensity VARCHAR(50), -- light, moderate, intense
  
  -- Theme & Values
  theme VARCHAR(255),
  sub_theme VARCHAR(255),
  moral_values TEXT,
  local_values TEXT,
  
  -- Plot Elements
  plot TEXT,
  twist TEXT,
  conflict_type VARCHAR(100), -- man_vs_man, man_vs_nature, man_vs_self, etc
  
  -- Target
  target_audience VARCHAR(100),
  target_market VARCHAR(100),
  age_rating VARCHAR(20), -- G, PG, PG-13, R, NC-17
  
  -- Story Structure
  structure VARCHAR(50) DEFAULT 'hero', -- hero, cat, harmon, custom
  structure_beats JSONB DEFAULT '{}', -- Beat name -> description
  key_actions JSONB DEFAULT '{}', -- Beat name -> character -> action
  
  -- Character Arc
  want_need_matrix JSONB DEFAULT '{}',
  ending_type VARCHAR(50), -- happy, tragic, open, bittersweet
  
  -- Generated Content
  generated_script TEXT,
  script_version INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100), -- protagonist, antagonist, supporting, minor
  archetype VARCHAR(100), -- hero, mentor, shadow, trickster, etc
  
  -- Visual
  image_url TEXT,
  image_poses JSONB DEFAULT '{}', -- pose_type -> image_url
  cast_reference VARCHAR(255), -- Actor reference
  
  -- Physiological
  physiological JSONB DEFAULT '{}',
  -- age, gender, height, weight, body_type, hair_style, hair_color,
  -- eye_color, skin_tone, distinguishing_features, clothing_style,
  -- birth_signs, uniqueness
  
  -- Psychological
  psychological JSONB DEFAULT '{}',
  -- personality_type (MBTI), archetype, intelligence, temperament,
  -- fears, wants, needs, alter_ego, traumatic_events, mental_state,
  -- cognitive_style
  
  -- Emotional
  emotional JSONB DEFAULT '{}',
  -- logos, ethos, pathos, tone, style, mode, emotional_range,
  -- triggers, coping_mechanisms
  
  -- Background
  family JSONB DEFAULT '{}',
  -- spouse, children, parents, siblings, family_dynamics
  
  sociocultural JSONB DEFAULT '{}',
  -- social_class, education, occupation, culture, language,
  -- tribe, religion, political_views, economic_status, affiliations
  
  core_beliefs JSONB DEFAULT '{}',
  -- faith, spirituality, values, integrity, trustworthiness,
  -- willingness, vulnerability, commitments
  
  educational JSONB DEFAULT '{}',
  -- degrees, achievements, fellowships, skills, expertise
  
  sociopolitics JSONB DEFAULT '{}',
  -- party_affiliation, nationalism, citizenship, activism
  
  -- SWOT Analysis
  swot_analysis JSONB DEFAULT '{}',
  -- strengths, weaknesses, opportunities, threats
  
  -- Character Arc
  character_arc TEXT,
  transformation TEXT,
  
  -- Relationships
  relationships JSONB DEFAULT '[]', -- Array of {character_id, relationship_type, description}
  
  -- Order
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE universes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  
  -- World Name
  name VARCHAR(255),
  description TEXT,
  
  -- Environment
  environment JSONB DEFAULT '{}',
  -- landscape, climate, geography, architecture, technology_level,
  -- time_period, key_locations
  
  -- Public Systems
  public_systems JSONB DEFAULT '{}',
  -- government_type, political_structure, legal_system, economy_type,
  -- currency, military, education_system, healthcare
  
  -- Private Systems
  private_systems JSONB DEFAULT '{}',
  -- family_structure, social_classes, cultural_norms, traditions,
  -- religions, languages, arts, entertainment
  
  -- Rules & Magic
  rules JSONB DEFAULT '{}',
  -- magic_system, technology_rules, supernatural_elements,
  -- unique_physics, limitations
  
  -- History
  history JSONB DEFAULT '{}',
  -- origin, major_events, conflicts, legends
  
  -- Visualizations
  visualizations JSONB DEFAULT '{}',
  -- environment_image, society_image, private_image, map_image
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE moodboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  beat_name VARCHAR(255) NOT NULL,
  beat_index INTEGER NOT NULL,
  
  description TEXT,
  ai_prompt TEXT,
  image_url TEXT,
  
  -- Style
  animation_style VARCHAR(50), -- cartoon, sketch, 3d, vector, realistic
  color_mood VARCHAR(100),
  lighting VARCHAR(100),
  
  -- Reference
  reference_images JSONB DEFAULT '[]',
  notes TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, generating, completed, failed
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE animations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  beat_name VARCHAR(255) NOT NULL,
  beat_index INTEGER NOT NULL,
  
  -- Prompt & Style
  ai_prompt TEXT,
  style VARCHAR(50) NOT NULL, -- cartoon, sketch, 3d, vector, realistic
  
  -- Output
  preview_image_url TEXT,
  video_url TEXT,
  video_duration_seconds INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  
  -- Metadata
  generation_params JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE performance_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Input Factors
  input_data JSONB NOT NULL,
  -- cast, director, producer, exec_producer, distributor, publisher,
  -- brand_positioning, theme, usp, story_values, fans_loyalty,
  -- production_budget, promotion_budget, social_media, teaser_engagement
  
  -- AI Predictions
  scores JSONB DEFAULT '[]', -- Array of {name, score, competitor}
  predicted_audience INTEGER,
  competitor_audience INTEGER,
  suggestions JSONB DEFAULT '[]',
  
  -- Metadata
  model_version VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES users(id),
  
  -- File Info
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100),
  size_bytes INTEGER,
  
  -- Storage
  storage_path TEXT NOT NULL,
  cdn_url TEXT,
  thumbnail_url TEXT,
  
  -- Classification
  type VARCHAR(50), -- image, video, audio, document
  category VARCHAR(100), -- character, moodboard, reference, logo, etc
  
  -- AI Generated
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_prompt TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### WATCH MODULE - Streaming

```sql
-- =====================================================
-- WATCH: Streaming Platform
-- =====================================================

CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- Link to IP
  organization_id UUID REFERENCES organizations(id),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  original_title VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  synopsis TEXT,
  
  -- Type & Format
  type VARCHAR(50) NOT NULL, -- movie, series, short, documentary
  genre VARCHAR(100),
  sub_genres JSONB DEFAULT '[]',
  
  -- Rating & Classification
  rating VARCHAR(20), -- G, PG, PG-13, R, NC-17
  content_warnings JSONB DEFAULT '[]',
  
  -- Duration
  duration_minutes INTEGER, -- For movies
  season_count INTEGER, -- For series
  episode_count INTEGER,
  
  -- Release
  release_year INTEGER,
  release_date DATE,
  
  -- Media
  poster_url TEXT,
  banner_url TEXT,
  thumbnail_url TEXT,
  trailer_url TEXT,
  video_url TEXT, -- Main content (for movies)
  
  -- Streaming
  hls_url TEXT, -- HLS manifest URL
  dash_url TEXT, -- DASH manifest URL
  drm_key_id VARCHAR(255),
  
  -- Metadata
  cast_list JSONB DEFAULT '[]', -- Array of {name, role, image}
  crew_list JSONB DEFAULT '[]', -- Array of {name, role}
  production_company VARCHAR(255),
  country VARCHAR(100),
  languages JSONB DEFAULT '[]',
  subtitles JSONB DEFAULT '[]', -- Available subtitle languages
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  rating_count INTEGER DEFAULT 0,
  match_score INTEGER, -- AI recommendation score
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, processing, published, archived
  visibility VARCHAR(50) DEFAULT 'subscribers', -- free, subscribers, premium
  featured BOOLEAN DEFAULT FALSE,
  trending_rank INTEGER,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

CREATE TABLE content_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  
  season_number INTEGER NOT NULL,
  title VARCHAR(255),
  description TEXT,
  poster_url TEXT,
  episode_count INTEGER DEFAULT 0,
  release_year INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(content_id, season_number)
);

CREATE TABLE content_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  season_id UUID REFERENCES content_seasons(id) ON DELETE CASCADE,
  
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  
  title VARCHAR(255),
  description TEXT,
  duration_minutes INTEGER,
  
  thumbnail_url TEXT,
  video_url TEXT,
  hls_url TEXT,
  
  release_date DATE,
  
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(content_id, season_number, episode_number)
);

CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES content_episodes(id) ON DELETE SET NULL,
  
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  progress_percent DECIMAL(5,2),
  
  completed BOOLEAN DEFAULT FALSE,
  
  device_type VARCHAR(50),
  
  watched_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, content_id, episode_id)
);

CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  
  added_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, content_id)
);

CREATE TABLE content_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  
  helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, content_id)
);

CREATE TABLE content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE content_category_items (
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  category_id UUID REFERENCES content_categories(id) ON DELETE CASCADE,
  
  PRIMARY KEY (content_id, category_id)
);
```

### INVEST MODULE - Crowdfunding

```sql
-- =====================================================
-- INVEST: Crowdfunding Platform
-- =====================================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- Link to IP
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES users(id),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  tagline VARCHAR(500),
  description TEXT,
  story TEXT, -- Rich text story/pitch
  
  -- Media
  poster_url TEXT,
  banner_url TEXT,
  video_url TEXT, -- Pitch video
  gallery JSONB DEFAULT '[]', -- Array of image URLs
  
  -- Funding
  goal_amount DECIMAL(15,2) NOT NULL,
  raised_amount DECIMAL(15,2) DEFAULT 0,
  backer_count INTEGER DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'IDR',
  
  -- Funding Type
  funding_type VARCHAR(50) DEFAULT 'flexible', -- all_or_nothing, flexible
  equity_offered DECIMAL(5,2), -- Percentage if equity crowdfunding
  
  -- Timeline
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  
  -- Classification
  category VARCHAR(50), -- film, series, animation, novel, game, music
  tags JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, pending_review, active, funded, failed, completed, cancelled
  
  -- Risk & Challenges
  risks TEXT,
  challenges TEXT,
  
  -- Updates
  update_count INTEGER DEFAULT 0,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  
  -- Performance
  performance_score INTEGER, -- AI predicted score
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  launched_at TIMESTAMP,
  funded_at TIMESTAMP
);

CREATE TABLE campaign_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  -- Visibility
  visibility VARCHAR(50) DEFAULT 'public', -- public, backers_only
  
  -- Engagement
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE investment_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL, -- Supporter, Bronze, Silver, Gold, Platinum
  description TEXT,
  
  -- Pricing
  min_amount DECIMAL(15,2) NOT NULL,
  max_amount DECIMAL(15,2),
  suggested_amount DECIMAL(15,2),
  
  -- Rewards
  benefits JSONB DEFAULT '[]', -- Array of benefit descriptions
  reward_items JSONB DEFAULT '[]', -- Physical/digital rewards
  
  -- Equity/Revenue Share
  revenue_share_percent DECIMAL(5,2) DEFAULT 0,
  equity_percent DECIMAL(5,2) DEFAULT 0,
  
  -- NFT
  nft_included BOOLEAN DEFAULT FALSE,
  nft_collection_id VARCHAR(255),
  
  -- Limits
  limit_quantity INTEGER, -- NULL = unlimited
  sold_quantity INTEGER DEFAULT 0,
  
  -- Timing
  estimated_delivery DATE,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES investment_tiers(id),
  
  -- Amount
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR',
  
  -- Payment
  payment_status VARCHAR(50), -- pending, processing, completed, failed, refunded
  payment_method VARCHAR(50), -- credit_card, bank_transfer, ewallet, crypto
  payment_reference VARCHAR(255),
  payment_gateway VARCHAR(50), -- midtrans, xendit, stripe
  
  -- Fees
  platform_fee DECIMAL(15,2) DEFAULT 0,
  payment_fee DECIMAL(15,2) DEFAULT 0,
  net_amount DECIMAL(15,2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, refunded
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  refunded_at TIMESTAMP
);

CREATE TABLE investor_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  
  reward_type VARCHAR(50) NOT NULL, -- nft, physical, digital, access, revenue_share, credit
  name VARCHAR(255),
  description TEXT,
  
  -- Delivery
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, failed
  tracking_number VARCHAR(255),
  shipping_address JSONB,
  
  -- Digital
  download_url TEXT,
  access_code VARCHAR(255),
  
  -- Timestamps
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE revenue_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Amounts
  total_revenue DECIMAL(15,2) NOT NULL,
  platform_share DECIMAL(15,2),
  creator_share DECIMAL(15,2),
  investor_pool DECIMAL(15,2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed
  
  -- Timestamps
  distributed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE investor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID REFERENCES revenue_distributions(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  -- Calculation
  share_percent DECIMAL(5,2),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR',
  
  -- Payment
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### LICENSE MODULE - Merchandise & Licensing

```sql
-- =====================================================
-- LICENSE: Merchandise & B2B Licensing
-- =====================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- Link to IP
  organization_id UUID REFERENCES organizations(id),
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  short_description VARCHAR(500),
  
  -- Category
  category VARCHAR(50) NOT NULL, -- apparel, toys, books, stationary, collectibles, digital
  sub_category VARCHAR(100),
  
  -- Pricing
  price DECIMAL(15,2) NOT NULL,
  compare_at_price DECIMAL(15,2), -- Original price for sale display
  cost_price DECIMAL(15,2), -- Internal cost
  currency VARCHAR(10) DEFAULT 'IDR',
  
  -- Inventory
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  track_inventory BOOLEAN DEFAULT TRUE,
  allow_backorder BOOLEAN DEFAULT FALSE,
  
  -- Variants
  has_variants BOOLEAN DEFAULT FALSE,
  variant_options JSONB DEFAULT '[]', -- [{name: "Size", values: ["S","M","L"]}]
  
  -- Media
  images JSONB DEFAULT '[]', -- Array of image URLs
  thumbnail_url TEXT,
  
  -- Physical
  weight_grams INTEGER,
  dimensions JSONB, -- {length, width, height}
  
  -- Digital
  is_digital BOOLEAN DEFAULT FALSE,
  digital_file_url TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, out_of_stock, discontinued
  visibility VARCHAR(50) DEFAULT 'public',
  featured BOOLEAN DEFAULT FALSE,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  -- Variant Details
  title VARCHAR(255), -- e.g., "Red / Large"
  options JSONB NOT NULL, -- {size: "L", color: "Red"}
  
  -- Pricing
  price DECIMAL(15,2),
  compare_at_price DECIMAL(15,2),
  
  -- Inventory
  sku VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  
  -- Media
  image_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session cart for guests
  session_id VARCHAR(255),
  
  -- Totals (calculated)
  subtotal DECIMAL(15,2) DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id),
  
  -- Order Number
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', 
  -- pending, confirmed, processing, shipped, delivered, cancelled, refunded
  
  -- Amounts
  subtotal DECIMAL(15,2) NOT NULL,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  shipping_cost DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR',
  
  -- Customer Info
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  
  -- Shipping
  shipping_address JSONB,
  -- {name, address_line_1, address_line_2, city, province, postal_code, country, phone}
  billing_address JSONB,
  
  shipping_method VARCHAR(100),
  tracking_number VARCHAR(255),
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  
  -- Payment
  payment_status VARCHAR(50), -- pending, paid, failed, refunded
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  paid_at TIMESTAMP,
  
  -- Discount
  discount_code VARCHAR(100),
  
  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Product Snapshot
  product_name VARCHAR(255) NOT NULL,
  variant_title VARCHAR(255),
  sku VARCHAR(100),
  
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  
  -- Fulfillment
  fulfilled_quantity INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  
  -- Type
  type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, free_shipping
  value DECIMAL(10,2) NOT NULL,
  
  -- Limits
  minimum_order DECIMAL(15,2),
  maximum_discount DECIMAL(15,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  
  -- Validity
  starts_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Restrictions
  product_ids JSONB, -- Specific products only
  category_ids JSONB, -- Specific categories only
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- B2B Licensing

CREATE TABLE license_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Availability
  is_available BOOLEAN DEFAULT TRUE,
  
  -- License Types Available
  available_types JSONB DEFAULT '[]', 
  -- [merchandise, media_adaptation, gaming, theme_park, publishing, music]
  
  -- Territories
  available_territories JSONB DEFAULT '[]', -- [indonesia, southeast_asia, global]
  
  -- Pricing Guidelines
  minimum_guarantee DECIMAL(15,2),
  royalty_range JSONB, -- {min: 5, max: 15}
  
  -- Assets
  brand_guidelines_url TEXT,
  asset_kit_url TEXT,
  
  -- Description
  description TEXT,
  highlights JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE license_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Requester
  requester_user_id UUID REFERENCES users(id),
  company_name VARCHAR(255) NOT NULL,
  company_website VARCHAR(255),
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  
  -- Request Details
  license_type VARCHAR(50) NOT NULL, -- merchandise, media, gaming, theme_park
  territory VARCHAR(100) NOT NULL,
  duration_years INTEGER,
  
  -- Proposal
  proposed_royalty_percent DECIMAL(5,2),
  proposed_minimum_guarantee DECIMAL(15,2),
  proposed_products TEXT, -- Description of planned products
  
  message TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewing, negotiating, approved, rejected
  
  -- Internal
  assigned_to UUID REFERENCES users(id),
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE license_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  request_id UUID REFERENCES license_requests(id),
  
  -- Parties
  licensor_org_id UUID REFERENCES organizations(id),
  licensee_user_id UUID REFERENCES users(id),
  licensee_company VARCHAR(255),
  
  -- Terms
  license_type VARCHAR(50) NOT NULL,
  territory VARCHAR(100) NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Financial
  royalty_percent DECIMAL(5,2) NOT NULL,
  minimum_guarantee DECIMAL(15,2),
  advance_payment DECIMAL(15,2),
  
  -- Contract
  contract_url TEXT,
  signed_at TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, pending_signature, active, expired, terminated
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE royalty_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID REFERENCES license_agreements(id) ON DELETE CASCADE,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Revenue
  gross_revenue DECIMAL(15,2) NOT NULL,
  net_revenue DECIMAL(15,2),
  royalty_amount DECIMAL(15,2) NOT NULL,
  
  -- Details
  sales_breakdown JSONB, -- By product/category
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, verified, paid, disputed
  
  -- Payment
  paid_at TIMESTAMP,
  payment_reference VARCHAR(255),
  
  -- Timestamps
  submitted_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### FANDOM MODULE - Community

```sql
-- =====================================================
-- FANDOM: Community Hub
-- =====================================================

CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- Link to IP
  organization_id UUID REFERENCES organizations(id),
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Media
  avatar_url TEXT,
  banner_url TEXT,
  
  -- Settings
  settings JSONB DEFAULT '{}',
  rules JSONB DEFAULT '[]', -- Community rules
  
  -- Stats
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, archived, banned
  visibility VARCHAR(50) DEFAULT 'public', -- public, private, invite_only
  
  -- Moderation
  auto_mod_settings JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  role VARCHAR(50) DEFAULT 'member', -- member, moderator, admin, owner
  
  -- Engagement
  reputation INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, muted, banned
  muted_until TIMESTAMP,
  banned_at TIMESTAMP,
  ban_reason TEXT,
  
  -- Notifications
  notification_settings JSONB DEFAULT '{}',
  
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(community_id, user_id)
);

CREATE TABLE discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Content
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT, -- Rendered HTML
  
  -- Type
  type VARCHAR(50) DEFAULT 'discussion', -- discussion, question, announcement, poll
  
  -- Media
  attachments JSONB DEFAULT '[]', -- Array of {type, url}
  
  -- Poll (if type = poll)
  poll_options JSONB, -- [{id, text, votes}]
  poll_ends_at TIMESTAMP,
  
  -- Engagement
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0, -- upvotes - downvotes
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Status
  pinned BOOLEAN DEFAULT FALSE,
  locked BOOLEAN DEFAULT FALSE,
  
  -- Moderation
  status VARCHAR(50) DEFAULT 'published', -- draft, published, hidden, removed
  removed_reason TEXT,
  
  -- Tags
  tags JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE discussion_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE, -- For nested replies
  
  -- Content
  content TEXT NOT NULL,
  content_html TEXT,
  
  -- Engagement
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'published', -- published, hidden, removed
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE discussion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Target (either discussion or comment)
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
  
  vote_type VARCHAR(10) NOT NULL, -- up, down
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, discussion_id),
  UNIQUE(user_id, comment_id)
);

CREATE TABLE fan_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Content Type
  type VARCHAR(50) NOT NULL, -- fanart, video, cosplay, fanfic, theory, review, meme
  
  -- Content
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Media
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  media_type VARCHAR(50), -- image, video, audio
  
  -- For videos
  video_platform VARCHAR(50), -- youtube, tiktok, native
  video_embed_url TEXT,
  duration_seconds INTEGER,
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'published', -- draft, processing, published, hidden
  featured BOOLEAN DEFAULT FALSE,
  
  -- Tags
  tags JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fan_content_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES fan_contents(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES fan_content_comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  like_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fan_content_likes (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES fan_contents(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  PRIMARY KEY (user_id, content_id)
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Type
  event_type VARCHAR(50) NOT NULL, -- watch_party, qa_session, premiere, meetup, contest
  
  -- Platform
  platform VARCHAR(50), -- discord, zoom, youtube, in_person, custom
  event_url TEXT,
  location TEXT, -- For in-person events
  
  -- Media
  cover_image_url TEXT,
  
  -- Time
  event_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
  
  -- Capacity
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  
  -- RSVP Settings
  rsvp_required BOOLEAN DEFAULT TRUE,
  rsvp_deadline TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- draft, scheduled, live, completed, cancelled
  
  -- Engagement
  interested_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  status VARCHAR(50) NOT NULL, -- going, interested, not_going
  
  -- Notifications
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(event_id, user_id)
);

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  
  -- Criteria
  criteria_type VARCHAR(50), -- manual, post_count, comment_count, tenure, achievement
  criteria_value INTEGER,
  
  -- Rarity
  rarity VARCHAR(50), -- common, uncommon, rare, epic, legendary
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  
  awarded_by UUID REFERENCES users(id),
  awarded_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, badge_id)
);

-- User follows/notifications
CREATE TABLE user_follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL, 
  -- comment_reply, mention, follow, like, badge, event_reminder, investment_update, order_update
  
  title VARCHAR(255),
  message TEXT,
  
  -- Reference
  reference_type VARCHAR(50), -- discussion, comment, content, event, order, investment
  reference_id UUID,
  
  -- Actor
  actor_id UUID REFERENCES users(id),
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### AUDIT & SYSTEM

```sql
-- =====================================================
-- AUDIT & SYSTEM TABLES
-- =====================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Action
  action VARCHAR(100) NOT NULL, -- create, update, delete, login, logout, export, etc
  
  -- Target
  entity_type VARCHAR(50) NOT NULL, -- project, character, order, investment, etc
  entity_id UUID,
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  enabled BOOLEAN DEFAULT FALSE,
  
  -- Targeting
  target_type VARCHAR(50), -- all, percentage, users, organizations
  target_value JSONB, -- Specific targets
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  url TEXT NOT NULL,
  secret VARCHAR(255),
  
  events JSONB DEFAULT '[]', -- Array of event types to trigger
  
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Stats
  last_triggered_at TIMESTAMP,
  failure_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  
  event_type VARCHAR(100),
  payload JSONB,
  
  -- Response
  status_code INTEGER,
  response_body TEXT,
  
  -- Timing
  duration_ms INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Index Definitions

```sql
-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Core
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet ON users(wallet_address);

-- Studio
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_characters_project ON characters(project_id);
CREATE INDEX idx_moodboards_project ON moodboards(project_id);
CREATE INDEX idx_animations_project ON animations(project_id);

-- Watch
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_type ON contents(type);
CREATE INDEX idx_episodes_content ON content_episodes(content_id);
CREATE INDEX idx_watch_history_user ON watch_history(user_id);
CREATE INDEX idx_watch_history_content ON watch_history(content_id);
CREATE INDEX idx_watchlists_user ON watchlists(user_id);

-- Invest
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_project ON campaigns(project_id);
CREATE INDEX idx_investments_campaign ON investments(campaign_id);
CREATE INDEX idx_investments_user ON investments(user_id);
CREATE INDEX idx_investments_status ON investments(payment_status);

-- License
CREATE INDEX idx_products_project ON products(project_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Fandom
CREATE INDEX idx_communities_project ON communities(project_id);
CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_discussions_community ON discussions(community_id);
CREATE INDEX idx_discussions_author ON discussions(author_id);
CREATE INDEX idx_discussion_comments_discussion ON discussion_comments(discussion_id);
CREATE INDEX idx_fan_contents_community ON fan_contents(community_id);
CREATE INDEX idx_events_community ON events(community_id);
CREATE INDEX idx_events_date ON events(event_date);

-- Audit
CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
```

---

## Table Count Summary

| Module | Tables | Description |
|--------|--------|-------------|
| **Core** | 10 | Auth, Orgs, Subscriptions, Credits |
| **Studio** | 8 | Projects, Stories, Characters, Universe, etc |
| **Watch** | 8 | Contents, Episodes, History, Ratings |
| **Invest** | 8 | Campaigns, Tiers, Investments, Payouts |
| **License** | 10 | Products, Orders, B2B Licensing |
| **Fandom** | 12 | Communities, Discussions, Events, Badges |
| **System** | 5 | Audit, Webhooks, Feature Flags |
| **TOTAL** | **61 Tables** | Complete MODO Platform |
