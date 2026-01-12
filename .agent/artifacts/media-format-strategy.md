# 📐 Media Format & Multi-Version Storage Strategy
## Ecosystem IP AI - Image & Video Optimization

---

## 🎯 Overview

Strategi penyimpanan media dengan multiple versions:
- **Original** - Full quality untuk AI processing & download
- **Display** - Optimized untuk web display
- **Thumbnail** - Preview kecil untuk grid/gallery

---

## 🖼️ Image Format Comparison

| Format | Size | Quality | Browser Support | Use Case |
|--------|------|---------|-----------------|----------|
| **PNG** | 🔴 Large | ⭐⭐⭐⭐⭐ Lossless | 100% | Original/Source |
| **JPG/JPEG** | 🟡 Medium | ⭐⭐⭐⭐ Good | 100% | Fallback display |
| **WebP** | 🟢 Small (-25-35%) | ⭐⭐⭐⭐ Good | 97%+ | Primary display |
| **AVIF** | 🟢🟢 Smallest (-50%) | ⭐⭐⭐⭐⭐ Great | 92% | Future-proof |
| **JFIF** | 🟡 Medium | ⭐⭐⭐ | 100% | ❌ Don't use (old) |

### ✅ Recommendation: WebP + Original PNG

---

## 🎬 Video Format Comparison

| Format | Size | Quality | Browser Support | Use Case |
|--------|------|---------|-----------------|----------|
| **MP4 (H.264)** | 🟡 Medium | ⭐⭐⭐⭐ Good | 100% | Universal/Original |
| **MP4 (H.265/HEVC)** | 🟢 Small | ⭐⭐⭐⭐⭐ Great | ~80% | High-quality archive |
| **WebM (VP9)** | 🟢 Small (-30%) | ⭐⭐⭐⭐ Good | 95% | Web display |
| **WebP (animated)** | ❌ | ❌ | - | ❌ Not for video |
| **GIF** | 🔴 Huge | ⭐ Poor | 100% | ❌ Never for AI video |

### ✅ Recommendation: MP4 (Original) + WebM (Display)

---

## 📁 Multi-Version Storage Strategy

### Image Versions

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMAGE STORAGE STRATEGY                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ORIGINAL (untuk AI input & download)                          │
│   └── character_001.png (2-5 MB)                                │
│       Format: PNG (lossless)                                     │
│       Resolution: Full (dari AI output)                          │
│       Use cases:                                                 │
│       • Image2Image input                                        │
│       • High-res download                                        │
│       • Archival                                                 │
│                                                                  │
│   DISPLAY (untuk web display)                                    │
│   └── character_001_display.webp (200-500 KB)                   │
│       Format: WebP                                               │
│       Quality: 80%                                               │
│       Max size: 1920x1920px                                      │
│       Use cases:                                                 │
│       • Gallery view                                             │
│       • Detail page                                              │
│       • Fast loading                                             │
│                                                                  │
│   THUMBNAIL (untuk preview)                                      │
│   └── character_001_thumb.webp (20-50 KB)                       │
│       Format: WebP                                               │
│       Quality: 70%                                               │
│       Size: 300x300px (cropped)                                  │
│       Use cases:                                                 │
│       • Grid thumbnails                                          │
│       • Quick previews                                           │
│       • List views                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Video Versions

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIDEO STORAGE STRATEGY                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ORIGINAL (untuk download & archival)                          │
│   └── animation_001.mp4 (20-100 MB)                             │
│       Format: MP4 (H.264)                                        │
│       Resolution: Full (dari AI output)                          │
│       Use cases:                                                 │
│       • User download                                            │
│       • Archive                                                  │
│       • Re-processing                                            │
│                                                                  │
│   DISPLAY/WEB (untuk web playback)                               │
│   └── animation_001_web.webm (5-30 MB)                          │
│       Format: WebM (VP9 codec)                                   │
│       Resolution: 720p atau 1080p                                │
│       Bitrate: ~1000kbps                                         │
│       Use cases:                                                 │
│       • Web player                                               │
│       • Streaming                                                │
│       • Inline playback                                          │
│                                                                  │
│   POSTER (video cover/placeholder)                               │
│   └── animation_001_poster.webp (50-100 KB)                     │
│       Format: WebP                                               │
│       Content: First frame of video                              │
│       Size: 640px width                                          │
│       Use cases:                                                 │
│       • Video placeholder                                        │
│       • Before video loads                                       │
│       • Social sharing preview                                   │
│                                                                  │
│   PREVIEW (optional - animated thumbnail)                        │
│   └── animation_001_preview.webm (100-500 KB)                   │
│       Format: WebM                                               │
│       Duration: 2-3 seconds loop                                 │
│       Size: 300px width                                          │
│       Use cases:                                                 │
│       • Hover preview                                            │
│       • Animated thumbnail                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📐 Complete Storage Structure

```
/users/{userId}/
│
├── characters/
│   └── {characterId}/
│       ├── original/           # Full quality PNG
│       │   └── img_001.png
│       ├── display/            # Web display WebP
│       │   └── img_001.webp
│       └── thumb/              # Thumbnails WebP
│           └── img_001.webp
│
├── moodboards/
│   └── {moodboardId}/
│       ├── original/
│       │   └── img_001.png
│       ├── display/
│       │   └── img_001.webp
│       └── thumb/
│           └── img_001.webp
│
└── animations/
    └── {sceneId}/
        ├── original/           # Full MP4
        │   └── vid_001.mp4
        ├── web/                # WebM for streaming
        │   └── vid_001.webm
        ├── poster/             # Video cover image
        │   └── vid_001.webp
        └── preview/            # Animated preview (optional)
            └── vid_001.webm
```

---

## 📊 Size Comparison Examples

### Character Image (2048x2048 from AI)

| Version | Format | Quality | Dimensions | Size | Reduction |
|---------|--------|---------|------------|------|-----------|
| Original | PNG | Lossless | 2048x2048 | 4.5 MB | - |
| Display | WebP | 80% | 1920x1920 | 350 KB | 92% smaller |
| Thumbnail | WebP | 70% | 300x300 | 25 KB | 99% smaller |

### Animation Video (5 seconds, 1080p)

| Version | Format | Quality | Resolution | Size | Reduction |
|---------|--------|---------|------------|------|-----------|
| Original | MP4 (H.264) | High | 1080p | 45 MB | - |
| Web | WebM (VP9) | Medium | 720p | 15 MB | 67% smaller |
| Poster | WebP | 80% | 640xAuto | 80 KB | 99% smaller |
| Preview | WebM | Low | 300xAuto | 200 KB | 99% smaller |

---

## ⚙️ Processing Pipeline

### Dependencies

```bash
# For image processing
npm install sharp

# For video processing (FFmpeg wrapper)
npm install fluent-ffmpeg

# FFmpeg binary required on server
# Vercel/Netlify: Won't work (no FFmpeg)
# VPS/Docker: Install FFmpeg
```

### Image Processing Service

```typescript
// src/lib/media/image-processor.ts
import sharp from 'sharp';

interface ProcessedImage {
  original: { buffer: Buffer; key: string };
  display: { buffer: Buffer; key: string };
  thumb: { buffer: Buffer; key: string };
}

export async function processImage(
  originalBuffer: Buffer,
  fileId: string,
  basePath: string
): Promise<ProcessedImage> {
  
  // 1. Original - keep as PNG
  const originalKey = `${basePath}/original/${fileId}.png`;
  
  // 2. Display version - WebP, 80% quality, max 1920px
  const displayBuffer = await sharp(originalBuffer)
    .resize(1920, 1920, { 
      fit: 'inside', 
      withoutEnlargement: true 
    })
    .webp({ quality: 80 })
    .toBuffer();
  const displayKey = `${basePath}/display/${fileId}.webp`;
  
  // 3. Thumbnail - WebP, 70% quality, 300x300 cropped
  const thumbBuffer = await sharp(originalBuffer)
    .resize(300, 300, { 
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 70 })
    .toBuffer();
  const thumbKey = `${basePath}/thumb/${fileId}.webp`;
  
  return {
    original: { buffer: originalBuffer, key: originalKey },
    display: { buffer: displayBuffer, key: displayKey },
    thumb: { buffer: thumbBuffer, key: thumbKey }
  };
}
```

### Video Processing Service

```typescript
// src/lib/media/video-processor.ts
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

interface ProcessedVideo {
  original: { path: string; key: string };
  web: { path: string; key: string };
  poster: { path: string; key: string };
}

export async function processVideo(
  originalPath: string,
  fileId: string,
  basePath: string
): Promise<ProcessedVideo> {
  
  const tempDir = '/tmp';
  
  // 1. Original - keep as MP4
  const originalKey = `${basePath}/original/${fileId}.mp4`;
  
  // 2. Web version - WebM VP9, 720p, optimized for streaming
  const webPath = path.join(tempDir, `${fileId}_web.webm`);
  await new Promise<void>((resolve, reject) => {
    ffmpeg(originalPath)
      .outputFormat('webm')
      .videoCodec('libvpx-vp9')
      .videoBitrate('1000k')
      .audioBitrate('128k')
      .size('1280x?')  // 720p width, maintain aspect
      .outputOptions([
        '-crf', '30',           // Quality (lower = better, 30 is good balance)
        '-b:v', '0',            // Let CRF control quality
        '-deadline', 'good',    // Encoding speed/quality balance
        '-cpu-used', '2'        // Speed (0-5, higher = faster)
      ])
      .output(webPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
  const webKey = `${basePath}/web/${fileId}.webm`;
  
  // 3. Poster - First frame as WebP
  const posterPath = path.join(tempDir, `${fileId}_poster.png`);
  await new Promise<void>((resolve, reject) => {
    ffmpeg(originalPath)
      .outputOptions(['-vframes', '1'])  // Extract 1 frame
      .size('640x?')                      // 640px width
      .output(posterPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
  
  // Convert poster to WebP
  const posterWebpPath = path.join(tempDir, `${fileId}_poster.webp`);
  await sharp(posterPath)
    .webp({ quality: 80 })
    .toFile(posterWebpPath);
  const posterKey = `${basePath}/poster/${fileId}.webp`;
  
  // Cleanup temp PNG
  await fs.unlink(posterPath);
  
  return {
    original: { path: originalPath, key: originalKey },
    web: { path: webPath, key: webKey },
    poster: { path: posterWebpPath, key: posterKey }
  };
}
```

### Complete Upload Flow

```typescript
// src/lib/media/media-service.ts
import { processImage } from './image-processor';
import { processVideo } from './video-processor';
import { storageClient } from './storage-client';

export class MediaService {
  
  async uploadGeneratedImage(
    imageBuffer: Buffer,
    userId: string,
    entityType: 'character' | 'moodboard',
    entityId: string
  ): Promise<MediaRecord> {
    
    const fileId = generateUUID();
    const basePath = `users/${userId}/${entityType}s/${entityId}`;
    
    // Process image into all versions
    const processed = await processImage(imageBuffer, fileId, basePath);
    
    // Upload all versions to storage
    await Promise.all([
      storageClient.upload(processed.original.key, processed.original.buffer, 'image/png'),
      storageClient.upload(processed.display.key, processed.display.buffer, 'image/webp'),
      storageClient.upload(processed.thumb.key, processed.thumb.buffer, 'image/webp'),
    ]);
    
    // Save to database
    const record = await db.insert(generatedMedia).values({
      id: fileId,
      userId,
      entityType,
      entityId,
      mediaType: 'image',
      originalKey: processed.original.key,
      displayKey: processed.display.key,
      thumbKey: processed.thumb.key,
      originalSize: imageBuffer.length,
      displaySize: processed.display.buffer.length,
      thumbSize: processed.thumb.buffer.length,
    }).returning();
    
    return record[0];
  }
  
  async uploadGeneratedVideo(
    videoPath: string,
    userId: string,
    sceneId: string
  ): Promise<MediaRecord> {
    
    const fileId = generateUUID();
    const basePath = `users/${userId}/animations/${sceneId}`;
    
    // Process video into all versions
    const processed = await processVideo(videoPath, fileId, basePath);
    
    // Upload all versions to storage
    await Promise.all([
      storageClient.uploadFile(processed.original.key, processed.original.path, 'video/mp4'),
      storageClient.uploadFile(processed.web.key, processed.web.path, 'video/webm'),
      storageClient.uploadFile(processed.poster.key, processed.poster.path, 'image/webp'),
    ]);
    
    // Cleanup temp files
    await Promise.all([
      fs.unlink(processed.web.path),
      fs.unlink(processed.poster.path),
    ]);
    
    // Get file sizes
    const originalStats = await fs.stat(processed.original.path);
    
    // Save to database
    const record = await db.insert(generatedMedia).values({
      id: fileId,
      userId,
      entityType: 'animation',
      entityId: sceneId,
      mediaType: 'video',
      originalKey: processed.original.key,
      displayKey: processed.web.key,
      thumbKey: processed.poster.key,
      originalSize: originalStats.size,
    }).returning();
    
    return record[0];
  }
}
```

---

## 🗃️ Database Schema

```sql
CREATE TABLE generated_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  entity_type VARCHAR(50) NOT NULL,  -- 'character', 'moodboard', 'animation'
  entity_id UUID NOT NULL,
  
  -- Media type
  media_type VARCHAR(20) NOT NULL,   -- 'image', 'video'
  
  -- Storage keys (paths in bucket)
  original_key VARCHAR(500) NOT NULL,
  display_key VARCHAR(500),
  thumb_key VARCHAR(500),
  
  -- File info
  original_size BIGINT,              -- bytes
  display_size BIGINT,
  thumb_size BIGINT,
  
  -- Generation info
  model_used VARCHAR(100),
  prompt_used TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  is_primary BOOLEAN DEFAULT FALSE   -- Primary image for entity
);

CREATE INDEX idx_media_entity ON generated_media(entity_type, entity_id);
CREATE INDEX idx_media_user ON generated_media(user_id);
```

---

## 🌐 Frontend Usage

### Displaying Images

```tsx
// components/MediaImage.tsx
interface MediaImageProps {
  media: MediaRecord;
  size: 'thumb' | 'display' | 'original';
  alt: string;
}

export function MediaImage({ media, size, alt }: MediaImageProps) {
  const src = useMemo(() => {
    switch (size) {
      case 'thumb':
        return getStorageUrl(media.thumbKey);
      case 'display':
        return getStorageUrl(media.displayKey);
      case 'original':
        return getStorageUrl(media.originalKey);
    }
  }, [media, size]);
  
  return (
    <Image
      src={src}
      alt={alt}
      // Use WebP with fallback
      // Next.js Image component handles this automatically
    />
  );
}

// Usage in gallery
<div className="grid grid-cols-4 gap-2">
  {images.map(img => (
    <MediaImage key={img.id} media={img} size="thumb" alt={img.name} />
  ))}
</div>

// Usage in detail view
<MediaImage media={image} size="display" alt={image.name} />

// Download button uses original
<a href={getStorageUrl(image.originalKey)} download>
  Download Original
</a>
```

### Displaying Videos

```tsx
// components/MediaVideo.tsx
interface MediaVideoProps {
  media: MediaRecord;
  autoPlay?: boolean;
}

export function MediaVideo({ media, autoPlay = false }: MediaVideoProps) {
  return (
    <video
      poster={getStorageUrl(media.thumbKey)}  // Poster image
      controls
      autoPlay={autoPlay}
      playsInline
      preload="metadata"
    >
      {/* WebM first (smaller, modern browsers) */}
      <source 
        src={getStorageUrl(media.displayKey)} 
        type="video/webm" 
      />
      {/* MP4 fallback */}
      <source 
        src={getStorageUrl(media.originalKey)} 
        type="video/mp4" 
      />
      Your browser does not support video playback.
    </video>
  );
}
```

---

## 💾 Storage Cost Impact

### Per-Media Storage

| Media Type | Original | + Display | + Thumb | Total | Overhead |
|------------|----------|-----------|---------|-------|----------|
| Image | 4.5 MB | +350 KB | +25 KB | 4.88 MB | +8% |
| Video | 45 MB | +15 MB | +80 KB | 60.08 MB | +33% |

### At Scale (1000 users, avg usage)

| Scenario | Without Variants | With Variants | Increase | Monthly Cost (R2) |
|----------|------------------|---------------|----------|-------------------|
| Images (20K) | 90 GB | 97.5 GB | +8% | $1.46 |
| Videos (5K) | 225 GB | 300 GB | +33% | $4.50 |
| **Total** | **315 GB** | **397.5 GB** | **+26%** | **$5.96** |

### Bandwidth Savings

| Without Optimization | With Optimization | Savings |
|---------------------|-------------------|---------|
| Load original images (4.5MB each) | Load thumbnails (25KB each) | **99% bandwidth saved** |
| Load original videos (45MB each) | Load WebM (15MB each) | **67% bandwidth saved** |

**Conclusion:** +26% storage cost BUT 70-99% bandwidth savings = **NET POSITIVE**

---

## ✅ Summary

### Image Strategy

| Version | Format | Quality | Max Size | Use Case |
|---------|--------|---------|----------|----------|
| **Original** | PNG | Lossless | Full | AI input, download |
| **Display** | WebP | 80% | 1920px | Web gallery, detail |
| **Thumbnail** | WebP | 70% | 300px | Grid, preview |

### Video Strategy

| Version | Format | Quality | Resolution | Use Case |
|---------|--------|---------|------------|----------|
| **Original** | MP4 (H.264) | High | Full | Download, archive |
| **Web** | WebM (VP9) | Medium | 720p | Web playback |
| **Poster** | WebP | 80% | 640px | Video cover |

### Processing Tools

| Media | Library | Runs On |
|-------|---------|---------|
| Images | `sharp` | Node.js (any hosting) |
| Videos | `fluent-ffmpeg` | VPS with FFmpeg |

---

## 🚀 Implementation Order

1. [ ] Setup storage client (R2/S3)
2. [ ] Create image processor with sharp
3. [ ] Create video processor with FFmpeg
4. [ ] Create media service for upload flow
5. [ ] Update database schema
6. [ ] Create frontend components
7. [ ] Integrate with AI generation pipeline

---

*Document created: 2026-01-11*
*Last updated: 2026-01-11*
