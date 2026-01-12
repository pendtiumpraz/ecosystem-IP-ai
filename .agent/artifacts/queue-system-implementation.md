# 🚀 Queue System & Architecture
## Ecosystem IP AI - Background Job Processing

---

## ✅ Current Architecture (SUDAH BENAR!)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT STACK                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌───────────────┐                                             │
│   │    VERCEL     │  ← Hosting (Serverless)                     │
│   │   Next.js 14  │                                             │
│   └───────┬───────┘                                             │
│           │                                                      │
│     ┌─────┴─────┐                                               │
│     │           │                                                │
│     ▼           ▼                                                │
│ ┌───────┐   ┌───────┐                                           │
│ │ NEON  │   │UPSTASH│                                           │
│ │  DB   │   │ REDIS │                                           │
│ └───────┘   └───────┘                                           │
│     │           │                                                │
│     │           ├── Cache                                        │
│     │           ├── Session                                      │
│     │           └── Job Queue ✅                                │
│     │                                                            │
│     └── Data Storage                                             │
│         ├── Users                                                │
│         ├── Projects                                             │
│         ├── AI Models                                            │
│         └── Generated Media                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Stack sudah lengkap untuk queue system!** ✅

---

## 📦 Queue Implementation dengan Upstash Redis

### Database Schema: Job Tracking

```sql
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID REFERENCES tenants(id),
  
  -- Job Type
  job_type VARCHAR(50) NOT NULL,  -- 'character-image', 'moodboard', 'animation'
  entity_id UUID NOT NULL,         -- characterId, moodboardId, etc.
  
  -- Status
  status VARCHAR(20) DEFAULT 'queued',  -- 'queued', 'processing', 'completed', 'failed'
  progress INTEGER DEFAULT 0,            -- 0-100%
  
  -- Result
  result_media_id UUID REFERENCES generated_media(id),
  error_message TEXT,
  
  -- Timing
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Metadata
  model_used VARCHAR(100),
  credits_used INTEGER DEFAULT 0
);

CREATE INDEX idx_jobs_user ON generation_jobs(user_id);
CREATE INDEX idx_jobs_status ON generation_jobs(status);
```

### Queue Service

```typescript
// src/lib/queue/queue-service.ts
import { Redis } from "@upstash/redis";
import { db } from "@/db";
import { generationJobs } from "@/db/schema";

const redis = Redis.fromEnv();

const QUEUE_KEY = "generation-queue";

export interface QueueJob {
  id: string;
  type: "character-image" | "moodboard" | "animation";
  userId: string;
  entityId: string;
  params?: Record<string, any>;
  createdAt: number;
}

// Add job to queue
export async function addToQueue(job: Omit<QueueJob, "id" | "createdAt">): Promise<string> {
  const jobId = crypto.randomUUID();
  
  const fullJob: QueueJob = {
    id: jobId,
    ...job,
    createdAt: Date.now()
  };
  
  // Add to Redis queue (FIFO)
  await redis.lpush(QUEUE_KEY, JSON.stringify(fullJob));
  
  // Track in database
  await db.insert(generationJobs).values({
    id: jobId,
    userId: job.userId,
    jobType: job.type,
    entityId: job.entityId,
    status: "queued"
  });
  
  return jobId;
}

// Get next job from queue
export async function getNextJob(): Promise<QueueJob | null> {
  const jobStr = await redis.rpop(QUEUE_KEY);
  if (!jobStr) return null;
  return JSON.parse(jobStr as string);
}

// Update job status
export async function updateJobStatus(
  jobId: string, 
  status: "processing" | "completed" | "failed",
  data?: { resultMediaId?: string; error?: string }
) {
  await db.update(generationJobs)
    .set({
      status,
      ...(status === "processing" && { startedAt: new Date() }),
      ...(status === "completed" && { completedAt: new Date() }),
      ...(data?.resultMediaId && { resultMediaId: data.resultMediaId }),
      ...(data?.error && { errorMessage: data.error })
    })
    .where(eq(generationJobs.id, jobId));
}

// Get queue length
export async function getQueueLength(): Promise<number> {
  return await redis.llen(QUEUE_KEY);
}
```

### API Routes

```typescript
// 1. Add job to queue
// app/api/generate/character/route.ts
import { addToQueue } from "@/lib/queue/queue-service";
import { waitUntil } from "@vercel/functions";

export async function POST(req: Request) {
  const { characterId, imageReferenceId } = await req.json();
  const session = await getSession();
  
  // Check Google Drive connected
  const driveConnected = await checkDriveConnection(session.user.id);
  if (!driveConnected) {
    return Response.json({ 
      error: "CONNECT_DRIVE_REQUIRED" 
    }, { status: 400 });
  }
  
  // Add to queue
  const jobId = await addToQueue({
    type: "character-image",
    userId: session.user.id,
    entityId: characterId,
    params: { imageReferenceId }
  });
  
  // Process in background using waitUntil
  waitUntil(processJob(jobId));
  
  return Response.json({ 
    jobId,
    status: "processing",
    message: "Image generation started!" 
  });
}

// 2. Process job (called by waitUntil or cron)
async function processJob(jobId: string) {
  const job = await db.query.generationJobs.findFirst({
    where: eq(generationJobs.id, jobId)
  });
  
  if (!job) return;
  
  try {
    await updateJobStatus(jobId, "processing");
    
    // Generate based on type
    let result;
    switch (job.jobType) {
      case "character-image":
        result = await generateCharacterImage(job.entityId, job.params);
        break;
      case "moodboard":
        result = await generateMoodboard(job.entityId, job.params);
        break;
      case "animation":
        result = await generateAnimation(job.entityId, job.params);
        break;
    }
    
    await updateJobStatus(jobId, "completed", { 
      resultMediaId: result.mediaId 
    });
    
  } catch (error) {
    await updateJobStatus(jobId, "failed", { 
      error: error.message 
    });
  }
}

// 3. Check job status
// app/api/generate/status/[jobId]/route.ts
export async function GET(req: Request, { params }) {
  const job = await db.query.generationJobs.findFirst({
    where: eq(generationJobs.id, params.jobId),
    with: {
      resultMedia: true  // Include generated media if completed
    }
  });
  
  if (!job) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }
  
  return Response.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    result: job.resultMedia,
    error: job.errorMessage,
    createdAt: job.createdAt,
    completedAt: job.completedAt
  });
}
```

### ⚠️ Cron Job (TIDAK DIPERLUKAN untuk Vercel Free)

**Dengan `waitUntil`, kita TIDAK butuh cron job!**

Cron job hanya berguna jika:
- Punya Vercel Pro (unlimited cron)
- Butuh retry failed jobs secara otomatis
- Mau process very long-running jobs

**Untuk Vercel Free:**
- ❌ Cron hanya 1x/day (tidak berguna)
- ✅ Pakai `waitUntil` untuk background processing
- ✅ Pakai polling untuk long-running jobs (video)

### Video Generation (Long-Running Jobs)

Untuk video yang butuh > 10 detik, pakai **polling strategy**:

```typescript
// 1. Start video generation
// app/api/generate/animation/route.ts
export async function POST(req: Request) {
  const { moodboardId, sourceImageId } = await req.json();
  
  // Kirim request ke ModelsLab (returns job ID immediately)
  const mlResponse = await modelslab.img2video({
    init_image: base64Image,
    // ... params
  });
  
  // Simpan job ke database
  const jobId = crypto.randomUUID();
  await db.insert(generationJobs).values({
    id: jobId,
    userId: session.user.id,
    jobType: "animation",
    entityId: moodboardId,
    externalJobId: mlResponse.id,  // ModelsLab job ID
    status: "processing"
  });
  
  // Return immediately - user will poll for status
  return Response.json({ 
    jobId,
    status: "processing",
    message: "Video generation started, this may take 30-60 seconds..."
  });
}

// 2. User polls this endpoint
// app/api/generate/status/[jobId]/route.ts
export async function GET(req: Request, { params }) {
  const job = await db.query.generationJobs.findFirst({
    where: eq(id, params.jobId)
  });
  
  if (!job) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  
  // If still processing, check ModelsLab status
  if (job.status === "processing" && job.externalJobId) {
    const mlStatus = await modelslab.checkStatus(job.externalJobId);
    
    if (mlStatus.status === "completed") {
      // Download video from ModelsLab and save to Drive
      const videoBuffer = await downloadFromUrl(mlStatus.output_url);
      const driveFile = await driveService.uploadVideo(videoBuffer);
      
      // Update job as completed
      await db.update(generationJobs)
        .set({ 
          status: "completed",
          resultMediaId: driveFile.id 
        })
        .where(eq(id, job.id));
      
      job.status = "completed";
      job.resultMedia = driveFile;
    } else if (mlStatus.status === "failed") {
      await db.update(generationJobs)
        .set({ status: "failed", errorMessage: mlStatus.error })
        .where(eq(id, job.id));
      
      job.status = "failed";
    }
  }
  
  return Response.json(job);
}
```

**Frontend polling hook sudah handle ini** - akan poll setiap 2 detik sampai selesai.

---

## 🎨 Frontend: Job Status Polling

```typescript
// hooks/useJobStatus.ts
import { useQuery } from "@tanstack/react-query";

export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["job-status", jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const res = await fetch(`/api/generate/status/${jobId}`);
      return res.json();
    },
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Stop polling when completed or failed
      if (data?.status === "completed" || data?.status === "failed") {
        return false;
      }
      return 2000; // Poll every 2 seconds
    }
  });
}

// Usage in component
function GenerateButton({ characterId }) {
  const [jobId, setJobId] = useState<string | null>(null);
  const { data: jobStatus } = useJobStatus(jobId);
  
  const handleGenerate = async () => {
    const res = await fetch("/api/generate/character", {
      method: "POST",
      body: JSON.stringify({ characterId })
    });
    const data = await res.json();
    setJobId(data.jobId);
  };
  
  return (
    <div>
      <Button onClick={handleGenerate} disabled={jobStatus?.status === "processing"}>
        {jobStatus?.status === "processing" ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            Generating...
          </>
        ) : (
          "Generate Image"
        )}
      </Button>
      
      {jobStatus?.status === "completed" && (
        <img src={jobStatus.result.publicUrl} alt="Generated" />
      )}
      
      {jobStatus?.status === "failed" && (
        <Alert variant="destructive">
          {jobStatus.error}
        </Alert>
      )}
    </div>
  );
}
```

---

## 📊 Capacity & Limits

### Upstash Redis Quota & Cost

```
┌─────────────────────────────────────────────────────────────────┐
│                  UPSTASH REDIS QUOTA                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   FREE TIER:                                                    │
│   └── Commands: 10,000/day                                      │
│   └── Data: 256 MB                                              │
│   └── Connections: Unlimited                                    │
│                                                                  │
│   Untuk queue system:                                           │
│   └── 1 job = ~4-6 commands (lpush, rpop, get, set, etc)       │
│   └── 10,000 / 5 = ~2,000 jobs/day                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Tier | Commands/Day | Cost | Jobs/Day (approx) |
|------|-------------|------|-------------------|
| **Free** | 10,000 | $0 | ~2,000 jobs |
| **Pay as you go** | Unlimited | $0.2/100K commands | Unlimited |
| **Pro** | 1M/day included | $10/mo | ~200K jobs |

**Cost Estimation:**
| Users | Jobs/Day | Commands | Tier Needed | Cost/Month |
|-------|----------|----------|-------------|------------|
| **1-100** | 500 | 2,500 | Free | $0 |
| **100-400** | 2,000 | 10,000 | Free (max) | $0 |
| **400-1000** | 5,000 | 25,000 | Pay-as-you-go | ~$5 |
| **1000+** | 10,000+ | 50,000+ | Pay-as-you-go | ~$10 |

### Vercel Limits

| Tier | Function Timeout | Cron Jobs | Bandwidth |
|------|-----------------|-----------|-----------|
| **Free** | 10 seconds | 1/day | 100GB/mo |
| **Pro ($20/mo)** | 60 seconds | Unlimited | 1TB/mo |

### Neon (Database)

| Aspect | Free Limit |
|--------|------------|
| Storage | 0.5GB |
| Compute | 191 hours/month |
| Connections | 100 pooled |

---

## 🎯 Smart Queue Logic

**Tidak selalu pakai antrian!** Queue hanya dipakai kalau sibuk.

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMART PROCESSING LOGIC                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Request masuk                                                  │
│        │                                                         │
│        ▼                                                         │
│   ┌─────────────────────────────────┐                           │
│   │ Cek: Ada berapa job sedang      │                           │
│   │      berjalan sekarang?         │                           │
│   └─────────────┬───────────────────┘                           │
│                 │                                                │
│        ┌────────┴────────┐                                      │
│        │                 │                                       │
│        ▼                 ▼                                       │
│   ┌─────────┐      ┌─────────────┐                              │
│   │ < 5 job │      │ >= 5 job    │                              │
│   │ (sepi)  │      │ (sibuk)     │                              │
│   └────┬────┘      └──────┬──────┘                              │
│        │                  │                                      │
│        ▼                  ▼                                      │
│   LANGSUNG           MASUK QUEUE                                │
│   PROSES!            (antri)                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Smart Queue Implementation

```typescript
// src/lib/queue/smart-queue.ts
const MAX_CONCURRENT_JOBS = 5;  // Batas job bersamaan (sesuaikan)

export async function processOrQueue(jobData: JobData): Promise<{
  mode: "direct" | "queued";
  jobId: string;
}> {
  const activeJobs = await redis.get("active-jobs-count") || 0;
  const jobId = crypto.randomUUID();
  
  if (Number(activeJobs) < MAX_CONCURRENT_JOBS) {
    // ========== LANGSUNG PROSES (tidak sibuk) ==========
    await redis.incr("active-jobs-count");
    
    await db.insert(generationJobs).values({
      id: jobId,
      ...jobData,
      status: "processing"  // Langsung processing
    });
    
    return { mode: "direct", jobId };
    
  } else {
    // ========== MASUK ANTRIAN (sibuk) ==========
    await redis.lpush("generation-queue", JSON.stringify({
      id: jobId,
      ...jobData
    }));
    
    await db.insert(generationJobs).values({
      id: jobId,
      ...jobData,
      status: "queued"
    });
    
    return { mode: "queued", jobId };
  }
}

// Panggil setelah job selesai
export async function jobCompleted() {
  await redis.decr("active-jobs-count");
}
```

### API dengan Smart Queue

```typescript
// app/api/generate/character/route.ts
export async function POST(req: Request) {
  const { characterId } = await req.json();
  
  // Cek kapasitas: langsung atau antri?
  const { mode, jobId } = await processOrQueue({
    type: "character-image",
    userId: session.user.id,
    entityId: characterId
  });
  
  if (mode === "direct") {
    // LANGSUNG PROSES (tidak sibuk)
    waitUntil(async () => {
      try {
        await generateCharacterImage(characterId);
        await updateJobStatus(jobId, "completed");
      } finally {
        await jobCompleted();  // Kurangi counter
      }
    });
    
    return Response.json({
      jobId,
      status: "processing",
      message: "Generating now..."
    });
    
  } else {
    // MASUK ANTRIAN
    return Response.json({
      jobId,
      status: "queued",
      message: "Added to queue...",
      position: await getQueuePosition(jobId)
    });
  }
}
```

### Scenario Examples

**Sepi (1-1-1 tidak bersamaan):**
```
User A request → Langsung proses ✅
   (selesai)
User B request → Langsung proses ✅
   (selesai)
User C request → Langsung proses ✅

Tidak ada antrian sama sekali!
```

**Agak Ramai:**
```
User A request → Langsung proses (job #1)
User B request → Langsung proses (job #2)
User C request → Langsung proses (job #3)
User D request → Langsung proses (job #4)
User E request → Langsung proses (job #5)
User F request → MASUK ANTRIAN (limit tercapai)
   (User A selesai)
User F diproses → Langsung proses (slot kosong)
```

### Config: Batas Concurrent Jobs

```typescript
const CONFIG = {
  // Vercel Free (10s timeout) - conservative
  MAX_CONCURRENT_JOBS: 3,
  
  // Vercel Pro (60s timeout) - more capacity
  // MAX_CONCURRENT_JOBS: 10,
  
  // VPS (no limit) - maximum capacity
  // MAX_CONCURRENT_JOBS: 20,
};

---

## ✅ Architecture Validation

```
┌─────────────────────────────────────────────────────────────────┐
│                 COMPLETE ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   USER                                                           │
│     │                                                            │
│     ▼                                                            │
│   ┌─────────────────────────────────────┐                       │
│   │          VERCEL (Next.js)           │                       │
│   │  ┌─────────┐  ┌─────────┐           │                       │
│   │  │   API   │  │  Pages  │           │                       │
│   │  │ Routes  │  │   SSR   │           │                       │
│   │  └────┬────┘  └─────────┘           │                       │
│   │       │                              │                       │
│   │       │ waitUntil()                 │                       │
│   │       ▼                              │                       │
│   │  ┌──────────────┐                   │                       │
│   │  │  Background  │                   │                       │
│   │  │  Processing  │                   │                       │
│   │  └──────┬───────┘                   │                       │
│   └─────────┼───────────────────────────┘                       │
│             │                                                    │
│     ┌───────┴───────┬───────────────┐                           │
│     │               │               │                            │
│     ▼               ▼               ▼                            │
│ ┌───────┐     ┌───────────┐   ┌───────────┐                     │
│ │ NEON  │     │  UPSTASH  │   │  GOOGLE   │                     │
│ │  DB   │     │   REDIS   │   │   DRIVE   │                     │
│ └───────┘     └───────────┘   └───────────┘                     │
│     │               │               │                            │
│     │               │               └── User File Storage        │
│     │               │                                            │
│     │               └── Queue + Cache                            │
│     │                                                            │
│     └── Data + Job Tracking                                      │
│                                                                  │
│                         ┌───────────────┐                       │
│                         │   MODELSLAB   │                       │
│                         │   (AI API)    │                       │
│                         └───────────────┘                       │
│                               │                                  │
│                               └── Image/Video Generation         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Implementation Checklist

### Queue System
- [ ] Create `generation_jobs` table migration
- [ ] Implement `queue-service.ts`
- [ ] Add job status API route
- [ ] Add cron job for backup processing
- [ ] Frontend polling hook

### Integration Points
- [ ] Character generation → Queue
- [ ] Moodboard generation → Queue
- [ ] Animation generation → Queue
- [ ] Status display in UI

---

*Document created: 2026-01-11*
*Architecture: ✅ VALIDATED*
