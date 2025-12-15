# Entity Relationship Diagram (ERD)

## Current Schema

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATABASE SCHEMA                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────────────────────────────────────────────────┐
│     users       │       │                        projects                              │
├─────────────────┤       ├─────────────────────────────────────────────────────────────┤
│ id (PK, UUID)   │──────<│ id (PK, UUID)                                               │
│ username        │       │ user_id (FK) ────────────────────────────────────────────────┘
│ password        │       │ title
└─────────────────┘       │ logo
                          │ thumbnail_mood
                          │ genre
                          │ status (draft/in_progress/completed)
                          │ created_at
                          │ updated_at
                          └─────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:1
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       stories                                                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ project_id (FK, UNIQUE) ──────────────────────────────────────────────────────────────────┘
│ premise (TEXT)
│ synopsis (TEXT)
│ global_synopsis (TEXT)
│ duration (TEXT)
│ format (TEXT) - feature, series, short_movie, short_video
│ genre (TEXT)
│ sub_genre (TEXT)
│ tone (TEXT)
│ intensity (TEXT)
│ moral_values (TEXT)
│ theme (TEXT)
│ sub_theme (TEXT)
│ plot (TEXT)
│ target_audience (TEXT)
│ twist (TEXT)
│ local_values (TEXT)
│ target_market (TEXT)
│ structure (TEXT) - hero, cat, harmon
│ structure_beats (JSONB) - Dynamic story beats based on structure
│ want_need_matrix (JSONB) - Want/Need matrix data
│ ending_type (TEXT)
│ generated_script (TEXT)
│ created_at (TIMESTAMP)
│ updated_at (TIMESTAMP)
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                          ┌─────────────────────────────────────────────────────────────┐
                          │                        projects                              │
                          │                            │                                 │
                          │                            │ 1:N                             │
                          │                            ▼                                 │
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     characters                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ project_id (FK) ──────────────────────────────────────────────────────────────────────────┘
│ name (TEXT, NOT NULL)
│ role (TEXT)
│ image_url (TEXT)
│ physiological (JSONB) - age, gender, height, weight, appearance, features
│ psychological (JSONB) - personality, intelligence, temperament, mental_state
│ emotional (JSONB) - fears, dreams, triggers, beliefs, emotional_range
│ sociocultural (JSONB) - class, education, occupation, culture, family, social
│ swot_analysis (JSONB) - strengths, weaknesses, opportunities, threats
│ created_at (TIMESTAMP)
│ updated_at (TIMESTAMP)
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                          ┌─────────────────────────────────────────────────────────────┐
                          │                        projects                              │
                          │                            │                                 │
                          │                            │ 1:1                             │
                          │                            ▼                                 │
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      universes                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ project_id (FK, UNIQUE) ──────────────────────────────────────────────────────────────────┘
│ environment (JSONB) - landscape, climate, architecture
│ public_systems (JSONB) - government, politics, economy
│ private_systems (JSONB) - family, social_life, culture
│ visualizations (JSONB) - URLs for environment, society, private images
│ created_at (TIMESTAMP)
│ updated_at (TIMESTAMP)
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                          ┌─────────────────────────────────────────────────────────────┐
                          │                        projects                              │
                          │                            │                                 │
                          │                            │ 1:N                             │
                          │                            ▼                                 │
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      moodboards                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ project_id (FK) ──────────────────────────────────────────────────────────────────────────┘
│ beat_name (TEXT, NOT NULL)
│ beat_index (INTEGER, NOT NULL)
│ description (TEXT)
│ image_url (TEXT)
│ created_at (TIMESTAMP)
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                          ┌─────────────────────────────────────────────────────────────┐
                          │                        projects                              │
                          │                            │                                 │
                          │                            │ 1:N                             │
                          │                            ▼                                 │
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      animations                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ project_id (FK) ──────────────────────────────────────────────────────────────────────────┘
│ beat_name (TEXT, NOT NULL)
│ beat_index (INTEGER, NOT NULL)
│ style (TEXT, NOT NULL) - cartoon, sketch, 3d, vector, realistic
│ video_url (TEXT)
│ status (TEXT) - pending, processing, completed, failed
│ created_at (TIMESTAMP)
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## SaaS Extended Schema (Proposed)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              NEW TABLES FOR SAAS                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    organizations                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ name (TEXT, NOT NULL)                                                                       │
│ slug (TEXT, UNIQUE) - untuk subdomain                                                       │
│ logo (TEXT)                                                                                 │
│ plan (TEXT) - free, starter, pro, enterprise                                                │
│ billing_email (TEXT)                                                                        │
│ stripe_customer_id (TEXT)                                                                   │
│ stripe_subscription_id (TEXT)                                                               │
│ ai_credits_balance (INTEGER, DEFAULT 0)                                                     │
│ storage_used_bytes (BIGINT, DEFAULT 0)                                                      │
│ created_at (TIMESTAMP)                                                                      │
│ updated_at (TIMESTAMP)                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   organization_members                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ organization_id (FK) ─────────────────────────────────────────────────────────────────────┘
│ user_id (FK) ──────────────────────────────────────────────────────────────────────────────┘
│ role (TEXT) - owner, admin, editor, viewer                                                  │
│ modo_tokens (INTEGER, DEFAULT 0) - Web3 token balance                                       │
│ invited_by (FK -> users)                                                                    │
│ joined_at (TIMESTAMP)                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    subscriptions                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ organization_id (FK)                                                                        │
│ plan (TEXT) - free, starter, pro, enterprise                                                │
│ status (TEXT) - active, canceled, past_due, trialing                                        │
│ stripe_subscription_id (TEXT)                                                               │
│ current_period_start (TIMESTAMP)                                                            │
│ current_period_end (TIMESTAMP)                                                              │
│ cancel_at_period_end (BOOLEAN)                                                              │
│ created_at (TIMESTAMP)                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ai_usage_logs                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ organization_id (FK)                                                                        │
│ user_id (FK)                                                                                │
│ project_id (FK, NULLABLE)                                                                   │
│ endpoint (TEXT) - /api/ai/generate-script, etc                                              │
│ model (TEXT) - gpt-4o, gemini-1.5-pro, etc                                                  │
│ input_tokens (INTEGER)                                                                      │
│ output_tokens (INTEGER)                                                                     │
│ credits_used (INTEGER)                                                                      │
│ cost_usd (DECIMAL)                                                                          │
│ duration_ms (INTEGER)                                                                       │
│ status (TEXT) - success, error                                                              │
│ created_at (TIMESTAMP)                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    credit_transactions                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ organization_id (FK)                                                                        │
│ type (TEXT) - subscription, purchase, usage, refund, bonus                                  │
│ amount (INTEGER) - positive=credit, negative=debit                                          │
│ balance_after (INTEGER)                                                                     │
│ description (TEXT)                                                                          │
│ reference_id (TEXT, NULLABLE) - stripe invoice, etc                                         │
│ created_at (TIMESTAMP)                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    assets                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ organization_id (FK)                                                                        │
│ project_id (FK, NULLABLE)                                                                   │
│ uploaded_by (FK -> users)                                                                   │
│ filename (TEXT)                                                                             │
│ original_name (TEXT)                                                                        │
│ mime_type (TEXT)                                                                            │
│ size_bytes (INTEGER)                                                                        │
│ storage_path (TEXT) - S3/R2 path                                                            │
│ cdn_url (TEXT)                                                                              │
│ type (TEXT) - image, video, document                                                        │
│ ai_generated (BOOLEAN, DEFAULT false)                                                       │
│ created_at (TIMESTAMP)                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    api_keys                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ organization_id (FK)                                                                        │
│ created_by (FK -> users)                                                                    │
│ name (TEXT)                                                                                 │
│ key_hash (TEXT) - hashed API key                                                            │
│ key_prefix (TEXT) - first 8 chars for display                                               │
│ scopes (TEXT[]) - array of permissions                                                      │
│ last_used_at (TIMESTAMP)                                                                    │
│ expires_at (TIMESTAMP, NULLABLE)                                                            │
│ revoked_at (TIMESTAMP, NULLABLE)                                                            │
│ created_at (TIMESTAMP)                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    invitations                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ organization_id (FK)                                                                        │
│ email (TEXT)                                                                                │
│ role (TEXT) - admin, editor, viewer                                                         │
│ invited_by (FK -> users)                                                                    │
│ token (TEXT, UNIQUE)                                                                        │
│ status (TEXT) - pending, accepted, expired                                                  │
│ expires_at (TIMESTAMP)                                                                      │
│ created_at (TIMESTAMP)                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    audit_logs                                                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ organization_id (FK)                                                                        │
│ user_id (FK)                                                                                │
│ action (TEXT) - create, update, delete, export, share                                       │
│ entity_type (TEXT) - project, character, story, etc                                         │
│ entity_id (UUID)                                                                            │
│ changes (JSONB) - diff of changes                                                           │
│ ip_address (TEXT)                                                                           │
│ user_agent (TEXT)                                                                           │
│ created_at (TIMESTAMP)                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    project_collaborators                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                               │
│ project_id (FK)                                                                             │
│ user_id (FK)                                                                                │
│ role (TEXT) - ip_producer, head_creative, head_production, head_business, etc               │
│ permissions (TEXT[]) - array of permissions                                                 │
│ created_at (TIMESTAMP)                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Relationship Summary

### Current Schema
```
users (1) ──────< (N) projects
projects (1) ────── (1) stories
projects (1) ──────< (N) characters
projects (1) ────── (1) universes
projects (1) ──────< (N) moodboards
projects (1) ──────< (N) animations
```

### Extended SaaS Schema
```
organizations (1) ──────< (N) organization_members
organizations (1) ──────< (N) subscriptions
organizations (1) ──────< (N) ai_usage_logs
organizations (1) ──────< (N) credit_transactions
organizations (1) ──────< (N) assets
organizations (1) ──────< (N) api_keys
organizations (1) ──────< (N) invitations
organizations (1) ──────< (N) audit_logs
organizations (1) ──────< (N) projects (via users)

users (1) ──────< (N) organization_members
projects (1) ──────< (N) project_collaborators
```

---

## Indexes Required

```sql
-- Performance indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_org_status ON projects(user_id, status);
CREATE INDEX idx_stories_project_id ON stories(project_id);
CREATE INDEX idx_characters_project_id ON characters(project_id);
CREATE INDEX idx_moodboards_project_id ON moodboards(project_id);
CREATE INDEX idx_animations_project_id ON animations(project_id);

-- SaaS indexes
CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_ai_usage_org_date ON ai_usage_logs(organization_id, created_at);
CREATE INDEX idx_assets_org_id ON assets(organization_id);
CREATE INDEX idx_audit_org_date ON audit_logs(organization_id, created_at);
```
