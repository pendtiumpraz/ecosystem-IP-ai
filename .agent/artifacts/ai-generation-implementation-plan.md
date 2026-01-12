# 📋 Implementation Plan: AI Image & Video Generation dengan Google Drive Storage

## 🎯 Overview

Implementasi fitur AI generation untuk:
1. **Character Image** - Text2Image atau Image2Image dengan reference
2. **Moodboard Image** - Multi-character + Universe + Pose + Scene
3. **Animation Video** - Image2Video dari moodboard

Storage menggunakan **Google Drive per user** (OAuth masing-masing).

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI GENERATION PIPELINE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   CHARACTER                MOODBOARD                 ANIMATION           │
│   ──────────              ──────────                ──────────           │
│   ┌─────────┐            ┌─────────────┐           ┌─────────────┐       │
│   │ Image   │ ────┐      │ Character A │ ──────┐   │  Moodboard  │       │
│   │ Ref?    │     │      │ Character B │       │   │   Image     │       │
│   └────┬────┘     │      │ + Universe  │       │   └──────┬──────┘       │
│        │          │      │ + Pose      │       │          │              │
│   ┌────▼────┐     │      │ + Scene     │       │   ┌──────▼──────┐       │
│   │ Yes: I2I│     │      └──────┬──────┘       │   │   LTX 2 Pro │       │
│   │ No: T2I │     │             │              │   │   Image2Vid │       │
│   └────┬────┘     │      ┌──────▼──────┐       │   └──────┬──────┘       │
│        │          │      │ Seedream4.5 │       │          │              │
│   ┌────▼────┐     │      │   I2I       │       │   ┌──────▼──────┐       │
│   │Seedream │     └─────►│ (multi-img) │───────┘   │   VIDEO     │       │
│   │  4.5    │            └─────────────┘           │   OUTPUT    │       │
│   └────┬────┘                                      └─────────────┘       │
│        │                                                                 │
│        ▼                         ALL OUTPUTS                             │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │              USER's GOOGLE DRIVE                              │      │
│   │              (OAuth per user)                                 │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Model Configuration

| Feature | Model | Model ID | Type |
|---------|-------|----------|------|
| Character (no reference) | Seedream 4.5 | `seedream-4.5` | Text2Image |
| Character (with reference) | Seedream 4.5 | `seedream-4.5-i2i` | Image2Image |
| Moodboard | Seedream 4.5 | `seedream-4.5-i2i` | Image2Image |
| Animation | LTX 2 Pro | `ltx-2-pro-i2v` | Image2Video |

> ✅ Semua model sudah di-setting di backend

---

## 📁 File Structure

```
src/
├── lib/
│   ├── google-drive-user.ts      # Per-user Drive service
│   ├── ai-generation-service.ts  # Character/Moodboard/Animation generation
│   └── modelslab-client.ts       # API calls to ModelsLab (existing)
│
├── app/
│   ├── api/
│   │   ├── user/
│   │   │   └── google-drive/
│   │   │       ├── connect/route.ts     # OAuth initiate
│   │   │       ├── callback/route.ts    # OAuth callback
│   │   │       ├── status/route.ts      # Check connection status
│   │   │       └── disconnect/route.ts  # Remove connection
│   │   │
│   │   └── generate/
│   │       ├── character/route.ts       # Character image generation
│   │       ├── moodboard/route.ts       # Moodboard generation
│   │       └── animation/route.ts       # Video animation generation
│   │
│   └── (dashboard)/
│       └── project/
│           └── [projectId]/
│               ├── character/
│               │   └── GenerateCharacterButton.tsx
│               ├── moodboard/
│               │   └── GenerateMoodboardButton.tsx
│               └── animation/
│                   └── GenerateAnimationButton.tsx
│
├── components/
│   └── GoogleDriveConnectModal.tsx   # OAuth connection modal
│
└── db/
    └── schema/
        └── user-integrations.ts      # Store user OAuth tokens
```

---

## 🗃️ Database Schema

### Table: `user_google_drive_tokens`

```sql
CREATE TABLE user_google_drive_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  
  -- OAuth Tokens (encrypted)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- User's Drive Info
  drive_email VARCHAR(255),
  drive_folder_id VARCHAR(255),  -- Root folder for app files
  storage_used_bytes BIGINT DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_drive_user ON user_google_drive_tokens(user_id);
```

### Table: `generated_media`

```sql
CREATE TABLE generated_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  
  -- Source Entity (character, moodboard, scene)
  entity_type VARCHAR(50) NOT NULL,  -- 'character', 'moodboard', 'animation'
  entity_id UUID NOT NULL,
  
  -- Media Info
  media_type VARCHAR(20) NOT NULL,  -- 'image', 'video'
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  file_size_bytes BIGINT,
  
  -- Source Type (generated or manual link)
  source_type VARCHAR(20) DEFAULT 'generated',  -- 'generated', 'linked', 'replaced'
  
  -- Google Drive Storage
  drive_file_id VARCHAR(255),        -- File ID di Drive
  drive_web_view_link TEXT,          -- Link view di Drive
  drive_thumbnail_link TEXT,         -- Thumbnail link
  public_url TEXT,                   -- ← PUBLIC URL untuk akses tanpa auth
  
  -- Manual Link Info (jika user insert via URL)
  original_drive_url TEXT,           -- URL asli yang di-input user
  linked_at TIMESTAMP WITH TIME ZONE, -- Kapan di-link manual
  
  -- Generation Info (null jika manual link)
  model_used VARCHAR(100),
  prompt_used TEXT,
  generation_params JSONB,
  credits_used INTEGER DEFAULT 0,
  
  -- Status
  is_accessible BOOLEAN DEFAULT TRUE,  -- False jika file tidak bisa diakses
  last_checked_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_entity ON generated_media(entity_type, entity_id);
CREATE INDEX idx_media_user ON generated_media(user_id);
CREATE INDEX idx_media_accessible ON generated_media(is_accessible);
```

### Source Types Explanation

| source_type | Description | Use Case |
|-------------|-------------|----------|
| `generated` | File dibuat oleh AI generation | Default untuk hasil generate |
| `linked` | User insert via Google Drive URL | User tambah asset existing |
| `replaced` | User replace file yang hilang | File lama tidak accessible |

---

## 🔧 Implementation Phases

### Phase 1: Google Drive + Login Integration

**RECOMMENDED: Login Google + Drive dalam 1 klik!**

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN + DRIVE (1 KLIK)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   User klik "Login with Google"                                 │
│                │                                                 │
│                ▼                                                 │
│   ┌─────────────────────────────────────┐                       │
│   │   Google OAuth dengan scopes:       │                       │
│   │   - openid (login)                  │                       │
│   │   - email (email user)              │                       │
│   │   - profile (nama, foto)            │                       │
│   │   - drive.file (akses Drive) ← !    │                       │
│   └───────────────────┬─────────────────┘                       │
│                       │                                          │
│                       ▼                                          │
│   ┌─────────────────────────────────────┐                       │
│   │   User approve:                     │                       │
│   │   "Allow Ecosystem IP to:           │                       │
│   │    ✓ See your email                 │                       │
│   │    ✓ See your profile               │                       │
│   │    ✓ Manage files created by app"   │                       │
│   └───────────────────┬─────────────────┘                       │
│                       │                                          │
│                       ▼                                          │
│   ✅ User logged in                                             │
│   ✅ Drive connected                                            │
│   ✅ 1 KLIK SELESAI!                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Task 1.1: Database Schema
- [ ] Create migration for `user_google_drive_tokens` table
- [ ] Create migration for `generated_media` table
- [ ] Add Drizzle schema definitions in `src/db/schema/user-integrations.ts`

#### Task 1.2: NextAuth Configuration with Drive Scope
```typescript
// src/lib/auth.ts atau app/api/auth/[...nextauth]/route.ts
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email", 
            "profile",
            "https://www.googleapis.com/auth/drive.file"  // ← Drive scope!
          ].join(" "),
          access_type: "offline",  // Untuk dapat refresh_token
          prompt: "consent"        // Force consent untuk dapat refresh_token
        }
      }
    })
  ],
  callbacks: {
    // Simpan tokens saat login
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    
    // Simpan ke session
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
    
    // Simpan tokens ke database saat login
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await db.insert(userGoogleDriveTokens).values({
          userId: user.id,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          tokenExpiresAt: new Date(account.expires_at! * 1000),
          driveEmail: user.email,
          isActive: true
        }).onConflictDoUpdate({
          target: userGoogleDriveTokens.userId,
          set: {
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            tokenExpiresAt: new Date(account.expires_at! * 1000)
          }
        });
      }
      return true;
    }
  }
};
```

#### Task 1.3: Google Drive User Service
```typescript
// src/lib/google-drive-user.ts
class UserGoogleDriveService {
  constructor(userId: string)
  
  async isConnected(): Promise<boolean>
  async refreshTokenIfNeeded(): Promise<void>
  async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<DriveFile>
  async downloadFile(fileId: string): Promise<Buffer>
  async getFileUrl(fileId: string): Promise<string>
  async createAppFolder(): Promise<string>
  async disconnect(): Promise<void>
}
```

#### Task 1.4: ENV Configuration
```env
# Google OAuth (1 set untuk SEMUA users)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# NextAuth
NEXTAUTH_URL=https://yourapp.com
NEXTAUTH_SECRET=your-secret-key
```

#### Task 1.5: Fallback untuk Email Login
Untuk user yang login via email (bukan Google):
- [ ] Create `/api/user/google-drive/connect` - Manual OAuth initiate
- [ ] Create `/api/user/google-drive/callback` - Handle OAuth callback
- [ ] Create `GoogleDriveConnectModal.tsx` - Trigger saat generate tanpa Drive

#### Task 1.6: Google Cloud Console Setup
1. Buat/gunakan existing Google Cloud Project
2. Enable APIs:
   - Google Drive API
3. OAuth Consent Screen:
   - User Type: External
   - App name: Ecosystem IP AI
   - Scopes: `email`, `profile`, `drive.file`
4. Credentials → Create OAuth Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - `https://yourapp.com/api/auth/callback/google`
5. **Untuk Production**: Submit untuk verification (karena scope Drive)

#### Task 1.7: Asset Management (Link/Replace/Insert via Drive URL)

User bisa menautkan, replace, atau insert asset dari Google Drive URL:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASSET MANAGEMENT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   📁 LINK ASSET                                                 │
│   └── User punya file di Drive → Paste URL → Link ke project   │
│                                                                  │
│   🔄 REPLACE ASSET                                              │
│   └── File hilang/dipindah → Paste URL baru → Replace link     │
│                                                                  │
│   ➕ INSERT ASSET                                               │
│   └── Tambah asset baru dari Drive → Paste URL → Save          │
│                                                                  │
│   🎨 USE FOR GENERATION                                         │
│   └── Semua asset (generated/linked) bisa dipakai untuk:       │
│       • Image2Image (character, moodboard)                      │
│       • Image2Video (animation)                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**API Routes:**
```typescript
// POST /api/assets/link
// Link asset dari Google Drive URL
{
  entityType: 'character' | 'moodboard' | 'animation',
  entityId: string,
  driveUrl: string,  // https://drive.google.com/file/d/{fileId}/view
  mediaType: 'image' | 'video'
}

// PUT /api/assets/[id]/replace
// Replace asset yang tidak accessible
{
  newDriveUrl: string
}

// GET /api/assets/[id]/check
// Check if asset masih accessible
{
  isAccessible: boolean,
  lastCheckedAt: string
}
```

**Drive URL Parser:**
```typescript
// src/lib/utils/drive-url-parser.ts

// Input formats yang didukung:
// - https://drive.google.com/file/d/{fileId}/view
// - https://drive.google.com/open?id={fileId}
// - https://drive.google.com/uc?id={fileId}

export function extractDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getDrivePublicUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export function getDriveThumbnailUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w300`;
}
```

**Link Asset Service:**
```typescript
// src/lib/services/asset-link-service.ts

export async function linkDriveAsset(params: {
  userId: string,
  entityType: string,
  entityId: string,
  driveUrl: string,
  mediaType: 'image' | 'video'
}): Promise<GeneratedMedia> {
  
  const fileId = extractDriveFileId(params.driveUrl);
  if (!fileId) {
    throw new Error('Invalid Google Drive URL');
  }
  
  // Verify file is accessible (must be shared public)
  const isAccessible = await checkDriveFileAccessible(fileId);
  if (!isAccessible) {
    throw new Error('File is not publicly accessible. Please set sharing to "Anyone with link"');
  }
  
  // Get file metadata
  const metadata = await getDriveFileMetadata(fileId);
  
  // Save to database
  const media = await db.insert(generatedMedia).values({
    userId: params.userId,
    entityType: params.entityType,
    entityId: params.entityId,
    mediaType: params.mediaType,
    
    sourceType: 'linked',  // ← Manual link
    
    driveFileId: fileId,
    driveWebViewLink: params.driveUrl,
    publicUrl: getDrivePublicUrl(fileId),
    driveThumbnailLink: getDriveThumbnailUrl(fileId),
    
    originalDriveUrl: params.driveUrl,
    linkedAt: new Date(),
    
    fileName: metadata.name,
    mimeType: metadata.mimeType,
    fileSizeBytes: metadata.size,
    
    isAccessible: true,
    lastCheckedAt: new Date()
  }).returning();
  
  return media[0];
}

export async function replaceAsset(
  mediaId: string,
  newDriveUrl: string
): Promise<GeneratedMedia> {
  
  const fileId = extractDriveFileId(newDriveUrl);
  if (!fileId) {
    throw new Error('Invalid Google Drive URL');
  }
  
  // Verify accessibility
  const isAccessible = await checkDriveFileAccessible(fileId);
  if (!isAccessible) {
    throw new Error('File is not publicly accessible');
  }
  
  // Update record
  const media = await db.update(generatedMedia)
    .set({
      sourceType: 'replaced',
      driveFileId: fileId,
      publicUrl: getDrivePublicUrl(fileId),
      driveThumbnailLink: getDriveThumbnailUrl(fileId),
      originalDriveUrl: newDriveUrl,
      linkedAt: new Date(),
      isAccessible: true,
      lastCheckedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(generatedMedia.id, mediaId))
    .returning();
  
  return media[0];
}

// Check if file is accessible (for periodic checks)
export async function checkAssetAccessibility(mediaId: string): Promise<boolean> {
  const media = await db.query.generatedMedia.findFirst({
    where: eq(generatedMedia.id, mediaId)
  });
  
  if (!media?.driveFileId) return false;
  
  const isAccessible = await checkDriveFileAccessible(media.driveFileId);
  
  await db.update(generatedMedia)
    .set({
      isAccessible,
      lastCheckedAt: new Date()
    })
    .where(eq(generatedMedia.id, mediaId));
  
  return isAccessible;
}
```

**UI Components:**
- [ ] `LinkAssetModal.tsx` - Modal untuk paste Drive URL
- [ ] `ReplaceAssetButton.tsx` - Button untuk replace asset tidak accessible
- [ ] `AssetAccessibilityBadge.tsx` - Badge warning jika file tidak accessible
- [ ] Asset picker untuk reference images (I2I, I2V)

**UI Flow:**
```
┌─────────────────────────────────────────────────────────────────┐
│   CHARACTER DETAIL PAGE                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [Image Gallery]                                                │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐                          │
│   │  img_1  │ │  img_2  │ │   ⚠️   │ ← Not accessible         │
│   │   ✅    │ │   ✅    │ │ Replace │                          │
│   └─────────┘ └─────────┘ └─────────┘                          │
│                                                                  │
│   [+ Add from Drive]  [Generate New]                            │
│                                                                  │
│   ─────────────────────────────────────────────────────         │
│                                                                  │
│   Generate with Reference:                                       │
│   [Select Reference Image ▼]                                    │
│   ├── img_1.png (generated)                                     │
│   ├── img_2.png (linked)                                        │
│   └── + Link from Drive                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Phase 2: Character Image Generation

#### Task 2.1: API Route
```typescript
// POST /api/generate/character
// Request Body:
{
  characterId: string,
  imageReferenceId?: string,  // Drive file ID of reference image
  additionalPrompt?: string   // Extra prompt instructions
}

// Response:
{
  success: boolean,
  media: {
    id: string,
    driveFileId: string,
    thumbnailUrl: string,
    viewUrl: string
  }
}
```

#### Task 2.2: Generation Logic
```typescript
// src/lib/ai-generation-service.ts

async function generateCharacterImage(params: {
  userId: string,
  characterId: string,
  imageReferenceId?: string
}): Promise<GeneratedMedia> {
  
  // 1. Check Google Drive connection
  const driveService = new UserGoogleDriveService(params.userId);
  if (!await driveService.isConnected()) {
    throw new Error('GOOGLE_DRIVE_NOT_CONNECTED');
  }
  
  // 2. Get character details from database
  const character = await getCharacterById(params.characterId);
  
  // 3. Build prompt from character data
  const prompt = buildCharacterPrompt(character);
  
  // 4. Generate image
  let result: Buffer;
  if (params.imageReferenceId) {
    // Download reference image from user's Drive
    const refImage = await driveService.downloadFile(params.imageReferenceId);
    const base64 = refImage.toString('base64');
    
    // Call Seedream 4.5 Image2Image
    result = await modelslab.img2img({
      model_id: 'seedream-4.5-i2i',
      init_image: `data:image/png;base64,${base64}`,
      prompt: prompt,
      strength: 0.7  // Preserve some of reference
    });
  } else {
    // Call Seedream 4.5 Text2Image
    result = await modelslab.txt2img({
      model_id: 'seedream-4.5',
      prompt: prompt
    });
  }
  
  // 5. Upload result to user's Drive
  const fileName = `character_${character.name}_${Date.now()}.png`;
  const driveFile = await driveService.uploadFile(result, fileName, 'image/png');
  
  // 6. Save to database
  const media = await saveGeneratedMedia({
    userId: params.userId,
    projectId: character.projectId,
    entityType: 'character',
    entityId: params.characterId,
    mediaType: 'image',
    driveFileId: driveFile.id,
    modelUsed: params.imageReferenceId ? 'seedream-4.5-i2i' : 'seedream-4.5',
    promptUsed: prompt
  });
  
  return media;
}
```

#### Task 2.3: Character Prompt Builder
```typescript
function buildCharacterPrompt(character: Character): string {
  const parts: string[] = [];
  
  // Core identity
  parts.push(character.name);
  
  // Physical appearance
  if (character.appearance) {
    parts.push(character.appearance);
  }
  
  // Clothing/costume
  if (character.clothing) {
    parts.push(`wearing ${character.clothing}`);
  }
  
  // Accessories
  if (character.accessories) {
    parts.push(`with ${character.accessories}`);
  }
  
  // Style modifiers
  if (character.visualStyle) {
    parts.push(character.visualStyle);
  }
  
  // Quality tags
  parts.push('high quality, detailed, professional');
  
  return parts.join(', ');
}
```

#### Task 2.4: UI Integration
- [ ] Add "Generate Image" button to character detail page
- [ ] Add "Upload Reference" option
- [ ] Show loading spinner during generation
- [ ] Display generated image with Drive link
- [ ] Add regenerate and delete options

---

### Phase 3: Moodboard Generation (Multi-Character + Scene)

#### Task 3.1: API Route
```typescript
// POST /api/generate/moodboard
// Request Body:
{
  moodboardId: string,
  characterIds: string[],      // Multiple character IDs
  sceneId: string,             // Scene for context
  universeId?: string,         // Universe for location
  pose?: string,               // Character pose
  action?: string              // Character action
}
```

#### Task 3.2: Multi-Character Reference Handling
```typescript
async function prepareMultiCharacterReference(
  characterIds: string[],
  userId: string
): Promise<string> {
  const driveService = new UserGoogleDriveService(userId);
  const images: Buffer[] = [];
  
  for (const charId of characterIds) {
    // Get latest generated image for each character
    const media = await getLatestCharacterImage(charId);
    if (media?.driveFileId) {
      const imageBuffer = await driveService.downloadFile(media.driveFileId);
      images.push(imageBuffer);
    }
  }
  
  // Combine images into grid/composite for reference
  const composite = await createImageComposite(images);
  return composite.toString('base64');
}
```

#### Task 3.3: Moodboard Prompt Builder
```typescript
function buildMoodboardPrompt(params: {
  characters: Character[],
  scene: Scene,
  universe?: Universe,
  pose?: string,
  action?: string
}): string {
  const parts: string[] = [];
  
  // Characters
  const charNames = params.characters.map(c => c.name).join(' and ');
  parts.push(charNames);
  
  // Action/Pose
  if (params.action) {
    parts.push(params.action);
  }
  if (params.pose) {
    parts.push(params.pose);
  }
  
  // Scene context
  if (params.scene.description) {
    parts.push(`in ${params.scene.description}`);
  }
  
  // Universe/Location
  if (params.universe?.setting) {
    parts.push(params.universe.setting);
  }
  
  // Visual style
  parts.push('cinematic composition, detailed background');
  
  return parts.join(', ');
}
```

#### Task 3.4: UI Integration
- [ ] Moodboard generation panel with character multi-select
- [ ] Scene selection dropdown
- [ ] Pose/action text inputs
- [ ] Preview window for generated result
- [ ] Save to moodboard gallery

---

### Phase 4: Animation Generation (Image to Video)

#### Task 4.1: API Route
```typescript
// POST /api/generate/animation
// Request Body:
{
  moodboardId: string,
  sourceImageId: string,   // Drive file ID of source image
  duration?: number,       // Video duration in seconds (default: 5)
  motionType?: string      // Motion style
}
```

#### Task 4.2: Video Generation Handler
```typescript
async function generateAnimation(params: {
  userId: string,
  moodboardId: string,
  sourceImageId: string,
  duration?: number
}): Promise<GeneratedMedia> {
  
  const driveService = new UserGoogleDriveService(params.userId);
  
  // 1. Download source image from Drive
  const sourceImage = await driveService.downloadFile(params.sourceImageId);
  const base64 = sourceImage.toString('base64');
  
  // 2. Call LTX 2 Pro Image2Video
  const jobId = await modelslab.img2video({
    model_id: 'ltx-2-pro-i2v',
    init_image: `data:image/png;base64,${base64}`,
    duration: params.duration || 5,
    motion_bucket_id: 127
  });
  
  // 3. Poll for completion (ModelsLab async)
  const videoUrl = await pollForCompletion(jobId, 120000); // 2min timeout
  
  // 4. Download video from ModelsLab
  const videoBuffer = await downloadFromUrl(videoUrl);
  
  // 5. Upload to user's Drive
  const fileName = `animation_${params.moodboardId}_${Date.now()}.mp4`;
  const driveFile = await driveService.uploadFile(videoBuffer, fileName, 'video/mp4');
  
  // 6. Save to database
  const media = await saveGeneratedMedia({
    userId: params.userId,
    entityType: 'animation',
    entityId: params.moodboardId,
    mediaType: 'video',
    driveFileId: driveFile.id,
    modelUsed: 'ltx-2-pro-i2v'
  });
  
  return media;
}
```

#### Task 4.3: Polling Helper
```typescript
async function pollForCompletion(
  jobId: string, 
  timeoutMs: number
): Promise<string> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const status = await modelslab.checkStatus(jobId);
    
    if (status.status === 'completed') {
      return status.output_url;
    }
    
    if (status.status === 'failed') {
      throw new Error(`Generation failed: ${status.error}`);
    }
    
    // Wait 3 seconds before next poll
    await new Promise(r => setTimeout(r, 3000));
  }
  
  throw new Error('Generation timeout');
}
```

#### Task 4.4: UI Integration
- [ ] "Animate" button on moodboard images
- [ ] Duration selector (3s, 5s, 8s)
- [ ] Loading state with progress indication
- [ ] Video player for preview
- [ ] Download button

---

### Phase 5: UX & Flow Enhancement

#### Task 5.1: Drive Connection Gate Hook
```typescript
// src/hooks/useRequireGoogleDrive.ts
export function useRequireGoogleDrive() {
  const [showModal, setShowModal] = useState(false);
  const { data: status } = useQuery(['drive-status'], fetchDriveStatus);
  
  const requireConnection = useCallback((onSuccess: () => void) => {
    if (!status?.isConnected) {
      setShowModal(true);
      return;
    }
    onSuccess();
  }, [status]);
  
  return {
    isConnected: status?.isConnected,
    requireConnection,
    ConnectModal: () => (
      <GoogleDriveConnectModal 
        open={showModal} 
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          // Refresh status
        }}
      />
    )
  };
}
```

#### Task 5.2: Generation Button Component
```typescript
// Reusable button that checks Drive connection first
export function GenerateButton({ 
  onGenerate, 
  loading,
  children 
}: Props) {
  const { requireConnection, ConnectModal } = useRequireGoogleDrive();
  
  const handleClick = () => {
    requireConnection(() => {
      onGenerate();
    });
  };
  
  return (
    <>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        {children}
      </Button>
      <ConnectModal />
    </>
  );
}
```

#### Task 5.3: Media Gallery Component
- [ ] Grid view of all generated media for entity
- [ ] Thumbnail preview from Drive
- [ ] Click to view full size
- [ ] Delete option
- [ ] Set as primary/featured image

---

## 📊 API Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "driveFileId": "1abc...",
    "fileName": "character_hero_1234567890.png",
    "viewUrl": "https://drive.google.com/...",
    "thumbnailUrl": "https://drive.google.com/thumbnail?...",
    "creditsUsed": 5
  }
}
```

### Error Responses
```json
{
  "success": false,
  "error": "GOOGLE_DRIVE_NOT_CONNECTED",
  "message": "Please connect your Google Drive first",
  "action": "connect_drive"
}
```

```json
{
  "success": false,
  "error": "INSUFFICIENT_CREDITS",
  "message": "Not enough credits",
  "required": 10,
  "available": 5
}
```

---

## ⏱️ Timeline Estimate

| Phase | Description | Estimate |
|-------|-------------|----------|
| Phase 1 | Google Drive Connection | 4-6 hours |
| Phase 2 | Character Generation | 3-4 hours |
| Phase 3 | Moodboard Generation | 4-5 hours |
| Phase 4 | Animation Generation | 3-4 hours |
| Phase 5 | UX & Polish | 3-4 hours |
| **Total** | | **17-23 hours** |

---

## ✅ Pre-Implementation Checklist

- [x] Character T2I model configured (Seedream 4.5)
- [x] Character I2I model configured (Seedream 4.5 I2I)
- [x] Moodboard I2I model configured (Seedream 4.5 I2I)
- [x] Animation I2V model configured (LTX 2 Pro)
- [x] Google OAuth credentials available
- [ ] Google Drive API enabled in Cloud Console
- [ ] OAuth consent screen configured for `drive.file` scope

---

## 🚀 Getting Started

Start implementation with:
```bash
# Phase 1: Database migration
npx drizzle-kit generate:pg
npx drizzle-kit push:pg

# Then implement in order:
# 1. user-integrations.ts (schema)
# 2. google-drive-user.ts (service)
# 3. /api/user/google-drive/* (routes)
# 4. GoogleDriveConnectModal.tsx (component)
# 5. Continue to Phase 2...
```
