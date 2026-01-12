# 📦 Storage Implementation Plan
## Ecosystem IP AI - Media Storage Strategy

---

## ✅ KEPUTUSAN: Google Drive Per-User

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE YANG DIPILIH                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ✅ GOOGLE DRIVE (Per-User OAuth)                              │
│                                                                  │
│   Alasan:                                                        │
│   • Platform cost: $0 (user pakai storage sendiri)              │
│   • Setiap user punya 15GB gratis                               │
│   • Login + Drive terkoneksi dalam 1 klik                       │
│   • User bisa ganti Drive jika penuh                            │
│   • Files dibuat PUBLIC untuk tetap accessible                  │
│                                                                  │
│   Opsi lain (AWS, R2, B2) tidak diimplementasi untuk saat ini   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Requirements Analysis

### Storage Needs
| Media Type | Avg Size | Volume/User/Month | Total (1000 users) |
|------------|----------|-------------------|-------------------|
| Character Images | 2-5 MB | 20-50 images | 100-250 GB |
| Moodboard Images | 3-8 MB | 30-100 images | 150-800 GB |
| Animation Videos | 20-100 MB | 10-30 videos | 200 GB - 3 TB |
| **Total Estimate** | | | **500 GB - 4 TB/month** |

### Functional Requirements
- [x] Upload images and videos from AI generation
- [x] Retrieve files for display in web app
- [x] Retrieve files as input for AI processing (I2I, I2V)
- [x] Per-user storage isolation
- [x] Thumbnail generation for previews
- [x] Delete capability
- [x] Storage quota management

### Non-Functional Requirements
- [x] Low latency for image display (<500ms)
- [x] Reliable upload (no data loss)
- [x] Scalable to 10,000+ users
- [x] Cost-effective at scale
- [x] Simple maintenance

---

## 🟢 Google Drive Implementation (CHOSEN)

```
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE DRIVE (Per-User OAuth)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User A ──► User A's Drive (15GB free)                        │
│   User B ──► User B's Drive (15GB free)                        │
│   User C ──► User C's Drive (15GB free)                        │
│                                                                 │
│   Platform Storage Cost: $0                                     │
│   Each user brings their own storage                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Aspect | Details |
|--------|---------|
| **Cost** | $0 for platform (users use own storage) |
| **Free Tier** | 15GB per user |
| **File Size Limit** | 5TB per file |
| **API** | Google Drive API v3 |
| **Auth** | OAuth 2.0 per user |
| **CDN** | No (but Google infra is fast) |
| **Implementation** | Medium complexity (OAuth per user) |

**Pros:**
- ✅ Zero storage cost for platform
- ✅ Unlimited scalability (each user = own storage)
- ✅ Users own their data
- ✅ No bandwidth/egress fees
- ✅ Familiar to users (Google ecosystem)
- ✅ Built-in sharing capabilities

**Cons:**
- ❌ OAuth complexity (token refresh, revocation)
- ❌ User must connect account (friction)
- ❌ No CDN (slightly slower for global users)
- ❌ API rate limits (12,000 requests/100 sec)
- ❌ User can delete files from their Drive
- ❌ Limited control over storage structure

#### 🔄 Skenario: User Ganti Google Drive (Storage Full)

Ketika user ingin ganti ke Google Drive account lain (karena storage penuh):

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   DRIVE LAMA (user@gmail.com) - FULL 15GB                       │
│   ─────────────────────────────────────────                     │
│   📁 EcosystemIP/                                               │
│      ├── character_001.png  (public link)                       │
│      ├── character_002.png  (public link)                       │
│      ├── moodboard_001.png  (public link)                       │
│      └── video_001.mp4      (public link)                       │
│                                                                  │
│   ✅ FILE TETAP ADA DI DRIVE USER                               │
│   ✅ APP MASIH BISA VIEW (via public link)                      │
│   ✅ USER BISA AKSES VIA drive.google.com                       │
│                                                                  │
│   ───────────────── USER GANTI KE DRIVE BARU ────────────────   │
│                                                                  │
│   DRIVE BARU (user_baru@gmail.com) - KOSONG                     │
│   ─────────────────────────────────────────                     │
│   📁 EcosystemIP/                                               │
│      ├── character_003.png  ← File baru masuk sini             │
│      └── ...                                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Solusi: File dibuat PUBLIC saat upload**

Ketika file di-upload ke Google Drive user, kita set permission "Anyone with link can view":

```typescript
// Saat upload, set file sebagai public
await drive.permissions.create({
  fileId: uploadedFile.id,
  requestBody: {
    role: 'reader',
    type: 'anyone'
  }
});

// Simpan public URL ke database
const publicUrl = `https://drive.google.com/uc?export=view&id=${uploadedFile.id}`;
await db.insert(generatedMedia).values({
  userId,
  driveFileId: uploadedFile.id,
  publicUrl: publicUrl,  // ← URL ini tetap bisa diakses!
  ...
});
```

**Yang Terjadi Saat Ganti Drive:**

| Aspek | Status | Keterangan |
|-------|--------|------------|
| File di Drive lama | ✅ TETAP ADA | File milik user, tidak dihapus |
| App VIEW file lama | ✅ BISA | Via public URL yang tersimpan di database |
| App UPLOAD ke Drive lama | ❌ Tidak | Token sudah ganti |
| File baru | ✅ Ke Drive baru | Generasi baru ke account baru |

**Flow Ganti Drive:**
```
User klik "Ganti Google Drive"
         │
         ▼
┌─────────────────────────────────┐
│ Disconnect Drive lama           │
│ (token dihapus, tapi public     │
│  URLs tetap tersimpan di DB)    │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ Connect Drive baru              │
│ (OAuth ke account baru)         │
└───────────┬─────────────────────┘
            │
            ▼
    ✅ Selesai!
    
- File lama: masih bisa VIEW di app (via public URL)
- File baru: upload ke Drive baru
```

**Database menyimpan:**
```sql
-- Public URL disimpan, jadi tetap bisa diakses
CREATE TABLE generated_media (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  drive_file_id VARCHAR(255),
  public_url TEXT,          -- ← URL ini tetap valid!
  drive_account_email TEXT, -- Track dari account mana
  ...
);
```

**UI menampilkan:**
- File lama: Load dari `public_url` (tetap bisa view)
- Badge: "📁 Stored in: user@gmail.com"
- Info: "File ini tersimpan di Google Drive lama Anda"

---

## 📦 Alternative Options (ARCHIVED - Tidak Diimplementasi)

<details>
<summary>Klik untuk melihat opsi lain (AWS S3, Cloudflare R2, Backblaze B2, Hybrid)</summary>

### Option 2: AWS S3

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS S3                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   All Users ──► Platform S3 Bucket                              │
│                    │                                            │
│                    ├── /user-{id}/characters/                   │
│                    ├── /user-{id}/moodboards/                   │
│                    └── /user-{id}/animations/                   │
│                                                                 │
│   Organized by user folders, single bucket ownership            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Aspect | Details |
|--------|---------|
| **Storage Cost** | $0.023/GB/month (Standard) |
| **Free Tier** | 5GB for 12 months |
| **Egress Cost** | $0.09/GB (to internet) |
| **File Size Limit** | 5TB per object |
| **API** | AWS SDK (S3 API) |
| **CDN** | CloudFront integration |
| **Implementation** | Medium complexity |

**Cost Projection (1TB):**
```
Storage:  1,000 GB × $0.023 = $23/month
Egress:   500 GB × $0.09   = $45/month  (assuming 50% retrieved)
Requests: 100K × $0.0004   = $0.40/month
────────────────────────────────────────
Total:                       ~$68/month for 1TB
```

---

### Option 3: Cloudflare R2

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE R2                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   All Users ──► R2 Bucket ──► Cloudflare CDN (free)            │
│                                                                 │
│   S3-compatible API                                             │
│   ZERO egress fees                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Aspect | Details |
|--------|---------|
| **Storage Cost** | $0.015/GB/month |
| **Free Tier** | 10GB storage, 10M reads, 1M writes |
| **Egress Cost** | $0 (FREE!) |
| **File Size Limit** | 5GB per object (multipart: 5TB) |
| **API** | S3-compatible |
| **CDN** | Built-in Cloudflare CDN |
| **Implementation** | Low-Medium complexity |

**Cost Projection (1TB):**
```
Storage:  1,000 GB × $0.015 = $15/month
Egress:   Unlimited          = $0
Requests: Included in plan   = $0
────────────────────────────────────────
Total:                       ~$15/month for 1TB
```

---

### Option 4: Backblaze B2 + Cloudflare CDN

```
┌─────────────────────────────────────────────────────────────────┐
│                   BACKBLAZE B2 + CLOUDFLARE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Users ──► Cloudflare CDN ──► B2 Bucket                       │
│             (cached)           (origin)                         │
│                                                                 │
│   Cheapest storage + free egress via Cloudflare                │
│   (Bandwidth Alliance partnership)                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Aspect | Details |
|--------|---------|
| **Storage Cost** | $0.005/GB/month (cheapest!) |
| **Free Tier** | 10GB storage |
| **Egress Cost** | Free via Cloudflare (Bandwidth Alliance) |
| **File Size Limit** | 10GB per file |
| **API** | S3-compatible |
| **CDN** | Cloudflare (separate setup) |
| **Implementation** | Medium complexity |

**Cost Projection (1TB):**
```
Storage:  1,000 GB × $0.005 = $5/month
Egress:   Via Cloudflare     = $0
Cloudflare: Free plan        = $0
────────────────────────────────────────
Total:                       ~$5/month for 1TB
```

---

### Option 5: Hybrid (Google Drive + R2)

```
┌─────────────────────────────────────────────────────────────────┐
│                     HYBRID APPROACH                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   FREE TIER USERS                                               │
│   └── Google Drive (user's own, 15GB free)                     │
│       User connects OAuth, files in their Drive                 │
│                                                                 │
│   PREMIUM USERS                                                 │
│   └── Cloudflare R2 (platform storage)                         │
│       Better performance, no OAuth friction                     │
│       Platform manages storage                                  │
│                                                                 │
│   SHARED/PUBLIC ASSETS                                          │
│   └── R2 with CDN (templates, samples, etc.)                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

</details>

---

## 💰 Cost Summary: Google Drive

### Monthly Cost at Different Scales

| Storage Amount | Google Drive | AWS S3 | Cloudflare R2 | Backblaze B2 | Hybrid |
|----------------|-------------|--------|---------------|--------------|--------|
| **100 GB** | $0* | ~$10 | $1.50 | $0.50 | $0-1.50 |
| **500 GB** | $0* | ~$45 | $7.50 | $2.50 | $0-7.50 |
| **1 TB** | $0* | ~$68 | $15 | $5 | $0-15 |
| **5 TB** | $0* | ~$340 | $75 | $25 | $0-75 |
| **10 TB** | $0* | ~$680 | $150 | $50 | $0-150 |

*Google Drive: Platform cost $0, but limited by each user's 15GB quota

### Real-World Scenario: 1000 Users

Assuming average 500MB per user = 500GB total

| Option | Monthly Cost | Notes |
|--------|-------------|-------|
| **Google Drive (per-user)** | **$0** | Each user uses own 15GB |
| **AWS S3** | ~$45 | Storage + egress |
| **Cloudflare R2** | **$7.50** | Best value for platform storage |
| **Backblaze B2** | **$2.50** | Cheapest, slightly more setup |
| **Hybrid** | **$0-7.50** | Depends on user tier split |

---

## 🎯 Decision Matrix

| Criteria | Weight | Google Drive | AWS S3 | R2 | B2 | Hybrid |
|----------|--------|-------------|--------|-----|-----|--------|
| **Cost** | 25% | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Performance** | 20% | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **UX (no friction)** | 20% | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Scalability** | 15% | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Implementation** | 10% | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Data Control** | 10% | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **TOTAL** | 100% | **3.6** | **4.0** | **4.5** | **4.2** | **4.1** |

---

## 📋 Recommendations

### 🥇 **Primary Recommendation: Cloudflare R2**

**Why R2?**
1. **Zero egress fees** - Huge savings when files are accessed frequently
2. **Built-in CDN** - Fast global delivery
3. **S3-compatible** - Easy to implement, can migrate later
4. **Simple pricing** - Predictable costs
5. **No user friction** - Users don't need to connect anything

**Implementation:**
```typescript
// Simple S3-compatible upload
const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY
  }
});

// Upload
await r2.send(new PutObjectCommand({
  Bucket: 'ecosystem-ip',
  Key: `users/${userId}/characters/${fileId}.png`,
  Body: imageBuffer,
  ContentType: 'image/png'
}));

// Get public URL
const url = `https://cdn.yourdomain.com/users/${userId}/characters/${fileId}.png`;
```

---

### 🥈 **Alternative: Hybrid (R2 + Google Drive)**

**When to use:**
- Want to offer free tier with $0 cost
- Premium users get better experience
- Flexibility is priority

**Implementation:**
```typescript
class StorageService {
  async upload(userId: string, file: Buffer): Promise<string> {
    const user = await getUser(userId);
    
    if (user.tier === 'premium') {
      // Use R2 - better UX
      return await r2Storage.upload(file);
    } else {
      // Use Google Drive - user's own storage
      if (!await driveService.isConnected(userId)) {
        throw new Error('CONNECT_DRIVE_REQUIRED');
      }
      return await driveService.upload(userId, file);
    }
  }
}
```

---

### 🥉 **Budget Option: Backblaze B2 + Cloudflare**

**When to use:**
- Maximum cost savings is priority
- OK with slightly more setup complexity
- Willing to manage Cloudflare Worker

---

## 🚀 Implementation Plan (R2 Recommended)

### Phase 1: Setup R2 Bucket
```bash
# Create R2 bucket in Cloudflare Dashboard
# Configure CORS for your domain
# Get API credentials
```

### Phase 2: Create Storage Service
```
src/lib/
├── storage/
│   ├── r2-client.ts       # R2 client setup
│   ├── storage-service.ts # Upload/download/delete
│   └── url-generator.ts   # Generate signed/public URLs
```

### Phase 3: Database Schema
```sql
CREATE TABLE stored_files (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  bucket VARCHAR(100) NOT NULL,
  key VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  public_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Phase 4: API Routes
```
/api/storage/upload     - Upload file to R2
/api/storage/[id]       - Get file info
/api/storage/[id]/url   - Get download URL
/api/storage/[id]       - DELETE file
```

### Phase 5: CDN Configuration
- Configure custom domain with R2
- Set cache headers
- Enable gzip/brotli compression

---

## ✅ Final Recommendation

| Scenario | Recommended Option | Reason |
|----------|-------------------|--------|
| **Starting out (< 100GB)** | Cloudflare R2 | Free tier covers it |
| **Scaling (100GB - 1TB)** | Cloudflare R2 | Best price + performance |
| **Large scale (> 1TB)** | Cloudflare R2 | Zero egress = huge savings |
| **$0 budget critical** | Google Drive (per-user) | Users pay storage |
| **Enterprise** | AWS S3 | Most features, compliance |

---

## 📊 Projected Costs (12 Months)

Assuming growth from 100 users to 1000 users:

| Month | Users | Data | R2 Cost | AWS S3 Cost | Savings |
|-------|-------|------|---------|-------------|---------|
| 1 | 100 | 50GB | $0.75 | $8 | $7.25 |
| 3 | 250 | 125GB | $1.88 | $20 | $18.12 |
| 6 | 500 | 250GB | $3.75 | $40 | $36.25 |
| 12 | 1000 | 500GB | $7.50 | $80 | $72.50 |
| **Total** | | | **~$50** | **~$600** | **~$550** |

---

## 🎬 Next Steps

1. [ ] **Decision**: Choose storage option
2. [ ] **Setup**: Create R2 bucket (or chosen service)
3. [ ] **Implement**: Build storage service
4. [ ] **Integrate**: Connect to AI generation pipeline
5. [ ] **Test**: Verify upload/download/delete
6. [ ] **Deploy**: Configure CDN and custom domain

---

*Document created: 2026-01-11*
*Last updated: 2026-01-11*
