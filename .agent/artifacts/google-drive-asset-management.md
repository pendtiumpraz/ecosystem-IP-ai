# 🖼️ Google Drive Asset Management - Implementation Complete

## ✅ Status: IMPLEMENTED

Tanggal: 12 Januari 2026

---

## 📋 Overview

Fitur ini memungkinkan user untuk:
1. **Link assets** dari Google Drive yang sudah ada ke character/moodboard/animation
2. **Replace assets** yang broken/inaccessible dengan URL baru
3. **Generate images** menggunakan AI dan otomatis upload ke Google Drive user
4. **Generate animations** (Image-to-Video) dari gambar yang sudah ada

---

## 🗄️ Database Schema

### Table: `user_google_drive_tokens`
Menyimpan OAuth tokens untuk setiap user.

```sql
CREATE TABLE user_google_drive_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id),
  
  -- OAuth Tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- User's Drive Info
  drive_email VARCHAR(255),
  drive_folder_id VARCHAR(255),
  storage_used_bytes BIGINT DEFAULT 0,
  storage_quota_bytes BIGINT DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: `generated_media`
Menyimpan semua assets (generated & linked).

```sql
CREATE TABLE generated_media (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  project_id VARCHAR(36) REFERENCES projects(id),
  
  -- Source Entity
  entity_type entity_type NOT NULL,  -- 'character', 'moodboard', 'animation', 'reference'
  entity_id VARCHAR(36) NOT NULL,
  
  -- Media Info
  media_type media_type NOT NULL,    -- 'image', 'video'
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  file_size_bytes BIGINT,
  
  -- Source Type
  source_type media_source_type DEFAULT 'generated',  -- 'generated', 'linked', 'replaced'
  
  -- Google Drive Storage
  drive_file_id VARCHAR(255),
  drive_web_view_link TEXT,
  
  -- Generated URLs (dari 1 URL input, generate 3 URL berbeda)
  download_url TEXT,      -- untuk AI processing
  thumbnail_url TEXT,     -- untuk gallery preview
  public_url TEXT,        -- untuk viewing
  
  -- Manual Link Info
  original_drive_url TEXT,
  linked_at TIMESTAMP WITH TIME ZONE,
  
  -- Generation Info
  model_used VARCHAR(100),
  prompt_used TEXT,
  credits_used INTEGER DEFAULT 0,
  
  -- Status
  is_accessible BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📁 File Structure

```
src/
├── db/schema/
│   └── user-storage.ts              # Database schema untuk generated_media & tokens
│
├── lib/
│   ├── google-drive.ts              # Drive utilities (URL parsing, upload, check)
│   ├── asset-link-service.ts        # Link/Replace/Delete assets
│   ├── ai-media-generation.ts       # Character/Moodboard/Animation generation
│   └── sweetalert.ts                # Toast notifications helpers
│
├── app/api/
│   ├── assets/
│   │   ├── link/route.ts            # POST - Link Drive URL ke entity
│   │   ├── [id]/
│   │   │   ├── route.ts             # GET/PUT/DELETE - Asset CRUD
│   │   │   ├── check/route.ts       # GET - Check accessibility
│   │   │   └── primary/route.ts     # POST - Set as primary
│   │   └── entity/[entityType]/[entityId]/route.ts  # GET - Entity assets
│   │
│   └── generate/
│       ├── character-image/route.ts  # POST - Generate character image
│       ├── moodboard-image/route.ts  # POST - Generate moodboard image
│       └── animation/route.ts        # POST - Generate animation (I2V)
│
├── components/studio/
│   ├── LinkAssetModal.tsx           # Modal untuk link Drive URL
│   ├── ReplaceAssetButton.tsx       # Button untuk replace broken assets
│   ├── AssetGallery.tsx             # Gallery dengan CRUD operations
│   └── CharacterDeck.tsx            # Updated dengan AssetGallery
│
└── scripts/
    └── migrate-user-storage.ts      # Safe migration script
```

---

## 🌐 API Routes

### Asset Management

| Route | Method | Description |
|-------|--------|-------------|
| `/api/assets/link` | POST | Link Drive URL ke entity |
| `/api/assets/[id]` | GET | Get asset detail |
| `/api/assets/[id]` | PUT | Replace asset dengan URL baru |
| `/api/assets/[id]` | DELETE | Hapus asset |
| `/api/assets/[id]/check` | GET | Check accessibility |
| `/api/assets/[id]/primary` | POST | Set sebagai primary asset |
| `/api/assets/entity/[type]/[id]` | GET | Get semua assets untuk entity |

### AI Generation

| Route | Method | Description |
|-------|--------|-------------|
| `/api/generate/character-image` | POST | Generate character image (T2I/I2I) |
| `/api/generate/moodboard-image` | POST | Generate moodboard image |
| `/api/generate/animation` | POST | Generate animation dari image (I2V) |

---

## 🔧 Service Functions

### `src/lib/google-drive.ts`

| Function | Description |
|----------|-------------|
| `extractDriveFileId(url)` | Extract file ID dari berbagai format Drive URL |
| `generateDriveUrls(fileId)` | Generate 3 URLs: download, thumbnail, public |
| `getDriveDownloadUrl(fileId)` | URL untuk download file (AI processing) |
| `getDriveThumbnailUrl(fileId, size)` | URL untuk thumbnail gallery |
| `getDrivePublicUrl(fileId)` | URL untuk public viewing |
| `checkDriveFileAccessible(fileId)` | Cek apakah file bisa diakses public |
| `uploadFileToDrive(...)` | Upload file ke Drive user |

### `src/lib/asset-link-service.ts`

| Function | Description |
|----------|-------------|
| `linkDriveAsset(...)` | Link asset dari Drive URL |
| `replaceAsset(assetId, newUrl, userId)` | Replace asset dengan URL baru |
| `checkAssetAccessibility(assetId)` | Cek & update status accessibility |
| `getEntityAssets(entityType, entityId, userId)` | Get semua assets entity |
| `getPrimaryAsset(entityType, entityId)` | Get primary asset |
| `setPrimaryAsset(assetId, userId)` | Set sebagai primary |
| `deleteAsset(assetId, userId)` | Soft delete asset |
| `downloadAssetForGeneration(assetId)` | Download file untuk AI (I2I/I2V) |

### `src/lib/ai-media-generation.ts`

| Function | Description |
|----------|-------------|
| `generateCharacterImage(request)` | Generate character dengan AI |
| `generateMoodboardImage(request)` | Generate moodboard dengan AI |
| `generateAnimation(request)` | Generate animation (Image-to-Video) |

---

## 🎨 UI Components

### `LinkAssetModal`
Modal untuk input Drive URL dengan preview.

```tsx
<LinkAssetModal
  isOpen={true}
  onClose={() => {}}
  entityType="character"
  entityId="char-123"
  userId="user-456"
  projectId="proj-789"
  mediaType="image"
  onSuccess={(asset) => console.log(asset)}
/>
```

### `AssetGallery`
Komponen gallery lengkap dengan CRUD.

```tsx
<AssetGallery
  entityType="character"
  entityId="char-123"
  userId="user-456" 
  projectId="proj-789"
  mediaType="image"
  showAddButton={true}
  showGenerateButton={false}
  maxItems={4}
  onSelectForGeneration={(asset) => console.log(asset)}
/>
```

### `ReplaceAssetButton`
Button untuk replace broken assets.

```tsx
<ReplaceAssetButton
  assetId="asset-123"
  userId="user-456"
  isAccessible={false}
  onReplace={(asset) => console.log(asset)}
  compact={true}
/>
```

---

## 🔄 Flow Diagrams

### Link Asset Flow

```
User Input: https://drive.google.com/file/d/ABC123/view
                         │
                         ▼
              ┌─────────────────────┐
              │ extractDriveFileId()│
              │   → "ABC123"        │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  generateDriveUrls()│
              │  → downloadUrl      │
              │  → thumbnailUrl     │
              │  → publicUrl        │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │checkDriveFileAccessible│
              │  → true/false       │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ INSERT generated_media│
              │ sourceType='linked' │
              └─────────────────────┘
```

### AI Generation Flow

```
         Generate Request
              │
              ▼
      ┌───────────────┐
      │ Check Credits │
      └───────┬───────┘
              │ OK
              ▼
      ┌───────────────┐
      │ Deduct Credits│
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐     ┌─────────────────┐
      │ Reference ID? │────►│downloadAssetFor │
      └───────┬───────┘     │  Generation()   │
              │ no          └────────┬────────┘
              ▼                      │
      ┌───────────────┐              │
      │  Call AI API  │◄─────────────┘
      │  (T2I or I2I) │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │ Download Image│
      │  from AI URL  │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │Upload to Drive│
      │(user's folder)│
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │ INSERT        │
      │generated_media│
      │sourceType=    │
      │  'generated'  │
      └───────────────┘
```

---

## 🧪 Testing

### Test Link Asset
```bash
curl -X POST http://localhost:3000/api/assets/link \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "entityType": "character",
    "entityId": "char-456",
    "driveUrl": "https://drive.google.com/file/d/ABC123/view",
    "mediaType": "image"
  }'
```

### Test Generate Character Image
```bash
curl -X POST http://localhost:3000/api/generate/character-image \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "characterId": "char-456",
    "projectId": "proj-789",
    "characterData": {
      "name": "Luna",
      "gender": "female",
      "ethnicity": "Asian",
      "hairStyle": "long straight",
      "hairColor": "black"
    },
    "style": "anime"
  }'
```

---

## ⚙️ Environment Setup

### Environment Variables (.env.local)

Tambahkan ke file `.env.local`:

```bash
# ========== GOOGLE DRIVE API ==========
# Dapatkan dari Google Cloud Console
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/api/auth/google-drive/callback

# ========== DATABASE ==========
DATABASE_URL=postgresql://user:pass@host/dbname

# ========== AI PROVIDERS ==========
# ⚠️ TIDAK PERLU DI ENV!
# AI providers di-manage lewat Admin Panel: /admin/ai-providers
# Admin tinggal aktivasi model yang diinginkan di sana
```

---

## 🤖 AI Providers Configuration

> ⚡ **AI providers TIDAK di-setting via ENV!**  
> Semua AI providers di-manage lewat **Admin Panel**.

### Cara Setup AI Providers:

1. Login sebagai Admin
2. Pergi ke **`/admin/ai-providers`**
3. Di sana sudah ada banyak provider & model:
   - FAL.AI (Flux, Seedream, LTX, dll)
   - ModelsLab (berbagai model)
   - OpenAI (GPT, DALL-E)
   - Dan lainnya
4. **Activate** model yang ingin digunakan
5. Set **API Key** per provider
6. Set **Credit Cost** per model
7. Set **Tier** (Trial, Starter, Pro, Enterprise)

### Model Categories di Admin:

| Type | Untuk |
|------|-------|
| `text` | Story generation, character profile, dll |
| `image` | Character image, moodboard image |
| `video` | Animation (Image-to-Video) |
| `audio` | Voice, music generation |

### Tier-Based Model Selection:

Sistem otomatis memilih model berdasarkan tier user:
- **Trial** → Model gratis/murah
- **Starter** → Model mid-tier
- **Pro** → Model premium
- **Enterprise** → Best quality models

---

## � Yang Perlu di-Setup via ENV (Minimal)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env.local
# Edit .env.local dengan credentials
```

### 3. Run Migration
```bash
npx tsx scripts/migrate-user-storage.ts
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test API
```bash
# Test link asset
curl -X POST http://localhost:3000/api/assets/link \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","entityType":"character","entityId":"test","driveUrl":"..."}'
```

---

## 📝 Next Steps

1. ✅ Database migration complete
2. ✅ Services implemented
3. ✅ API routes created
4. ✅ UI components built
5. ✅ CharacterDeck integration
6. ⏳ MoodboardStudio integration (optional)
7. ⏳ Periodic accessibility check (cron job)
8. ⏳ Batch operations for bulk upload

---

## 🔐 Security Notes

- All assets must be shared as "Anyone with the link can view"
- File ID is extracted from URL and validated
- User ownership is checked before any mutation
- OAuth tokens are stored encrypted in database
- Generated files are uploaded to user's own Drive storage
