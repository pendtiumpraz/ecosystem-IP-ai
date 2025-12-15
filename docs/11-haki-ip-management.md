# HAKI & IP Rights Management System

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MODO IP LIFECYCLE MANAGEMENT                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CREATION          PROTECTION         MONETIZATION       ENFORCEMENT       │
│   ┌─────────┐      ┌─────────┐        ┌─────────┐        ┌─────────┐       │
│   │ Studio  │ ──►  │  HAKI   │  ──►   │ License │  ──►   │ Monitor │       │
│   │ (Create)│      │(Protect)│        │ (Earn)  │        │(Enforce)│       │
│   └─────────┘      └─────────┘        └─────────┘        └─────────┘       │
│                         │                                      │            │
│                         ▼                                      ▼            │
│                  ┌─────────────┐                      ┌─────────────┐       │
│                  │ Dirjen HAKI │                      │   Legal     │       │
│                  │ Integration │                      │  Partners   │       │
│                  └─────────────┘                      └─────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Jenis Hak Kekayaan Intelektual

### 1. Hak Cipta (Copyright) - UU No. 28/2014
Untuk karya kreatif yang dibuat di platform:

| Jenis Karya | Perlindungan | Durasi |
|-------------|--------------|--------|
| Script/Skenario | Otomatis | Seumur hidup + 70 tahun |
| Karakter (visual) | Otomatis | Seumur hidup + 70 tahun |
| Musik/Soundtrack | Otomatis | Seumur hidup + 70 tahun |
| Film/Video | Otomatis | 50 tahun sejak publikasi |
| Desain Grafis | Otomatis | Seumur hidup + 70 tahun |

**Catatan:** Hak cipta otomatis ada saat karya dibuat, tapi PENDAFTARAN memberikan bukti kuat di pengadilan.

### 2. Merek (Trademark) - UU No. 20/2016
Untuk nama dan logo IP:

| Jenis | Contoh | Durasi | Biaya Daftar |
|-------|--------|--------|--------------|
| Merek Kata | "NEON GENESIS" | 10 tahun (perpanjang) | Rp 1.800.000 |
| Merek Logo | Logo karakter | 10 tahun (perpanjang) | Rp 1.800.000 |
| Merek 3D | Bentuk produk | 10 tahun (perpanjang) | Rp 1.800.000 |

### 3. Desain Industri - UU No. 31/2000
Untuk merchandise dan produk fisik:

| Jenis | Durasi | Biaya |
|-------|--------|-------|
| Desain Produk | 10 tahun | Rp 600.000 |
| Kemasan | 10 tahun | Rp 600.000 |

### 4. Paten (jika ada teknologi unik)
| Jenis | Durasi | Biaya |
|-------|--------|-------|
| Paten Sederhana | 10 tahun | Rp 1.250.000 |
| Paten Biasa | 20 tahun | Rp 1.750.000 |

---

## Integrasi Dirjen HAKI

### Rencana Kerjasama

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DGIP INTEGRATION ROADMAP                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1: Manual Assisted (2024-2025)                                      │
│  ├── Template dokumen pendaftaran                                          │
│  ├── Panduan step-by-step                                                  │
│  ├── Partner dengan konsultan HKI                                          │
│  └── Tracking manual                                                       │
│                                                                             │
│  PHASE 2: Semi-Automated (2025-2026)                                       │
│  ├── Auto-fill formulir DGIP                                               │
│  ├── Document preparation AI                                               │
│  ├── Status tracking via scraping                                          │
│  └── Reminder sistem                                                       │
│                                                                             │
│  PHASE 3: Full Integration (2026+)                                         │
│  ├── API langsung ke DGIP                                                  │
│  ├── Submit langsung dari platform                                         │
│  ├── Real-time status update                                               │
│  ├── Pembayaran terintegrasi                                               │
│  └── Sertifikat digital                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### DGIP Online Services (Existing)
- **e-Filing**: https://e-filing.dgip.go.id
- **PDKI (Pangkalan Data KI)**: https://pdki-indonesia.dgip.go.id
- **TMview**: Pencarian merek internasional

---

## Database Schema - IP Management

```sql
-- =====================================================
-- IP RIGHTS MANAGEMENT
-- =====================================================

-- IP Registration master
CREATE TABLE ip_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- copyright, trademark, industrial_design, patent
  subtype VARCHAR(100), -- script, character, logo, music, etc
  
  -- Description
  description TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',
  -- draft, documents_ready, submitted, under_review, 
  -- revision_needed, approved, registered, rejected, expired
  
  -- DGIP Info
  dgip_application_number VARCHAR(100),
  dgip_registration_number VARCHAR(100),
  dgip_filing_date DATE,
  dgip_registration_date DATE,
  dgip_expiry_date DATE,
  
  -- Classification
  nice_class VARCHAR(10)[], -- For trademarks: class 9, 16, 25, 41, etc
  locarno_class VARCHAR(10)[], -- For industrial design
  
  -- Files
  certificate_url TEXT,
  
  -- Costs
  official_fee DECIMAL(15,2),
  service_fee DECIMAL(15,2),
  total_paid DECIMAL(15,2),
  
  -- Timestamps
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- IP Documents
CREATE TABLE ip_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES ip_registrations(id) ON DELETE CASCADE,
  
  -- Document Info
  type VARCHAR(100) NOT NULL,
  -- statement_of_creation, power_of_attorney, id_card, npwp,
  -- logo_image, specimen, description, assignment, etc
  
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  -- pending, approved, rejected, revision_needed
  
  rejection_reason TEXT,
  
  -- Version
  version INTEGER DEFAULT 1,
  is_latest BOOLEAN DEFAULT TRUE,
  
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- IP Ownership
CREATE TABLE ip_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES ip_registrations(id) ON DELETE CASCADE,
  
  -- Owner Type
  owner_type VARCHAR(50) NOT NULL, -- individual, company, organization
  
  -- Individual
  full_name VARCHAR(255),
  id_number VARCHAR(50), -- KTP/Passport
  nationality VARCHAR(100),
  address TEXT,
  
  -- Company
  company_name VARCHAR(255),
  company_registration VARCHAR(100), -- NIB/SIUP
  npwp VARCHAR(50),
  company_address TEXT,
  
  -- Contact
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Ownership
  ownership_percentage DECIMAL(5,2) DEFAULT 100,
  
  -- Role
  role VARCHAR(50), -- creator, applicant, assignee
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- IP Creators (for copyright - bisa beda dengan owner)
CREATE TABLE ip_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES ip_registrations(id) ON DELETE CASCADE,
  
  full_name VARCHAR(255) NOT NULL,
  pseudonym VARCHAR(255), -- Nama pena/alias
  id_number VARCHAR(50),
  nationality VARCHAR(100),
  address TEXT,
  
  contribution VARCHAR(255), -- What they created
  contribution_percentage DECIMAL(5,2),
  
  -- If deceased
  is_deceased BOOLEAN DEFAULT FALSE,
  death_date DATE,
  heir_name VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- IP Timeline/History
CREATE TABLE ip_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES ip_registrations(id) ON DELETE CASCADE,
  
  event_type VARCHAR(100) NOT NULL,
  -- created, submitted, document_uploaded, status_changed,
  -- payment_made, revision_requested, approved, registered,
  -- renewed, transferred, expired, infringement_reported
  
  event_date TIMESTAMP DEFAULT NOW(),
  description TEXT,
  
  -- Related data
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  document_id UUID REFERENCES ip_documents(id),
  
  -- Actor
  performed_by UUID REFERENCES users(id),
  performed_by_name VARCHAR(255), -- For external actors
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- IP Renewals
CREATE TABLE ip_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES ip_registrations(id) ON DELETE CASCADE,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Payment
  fee_amount DECIMAL(15,2),
  payment_status VARCHAR(50), -- pending, paid, overdue
  payment_date DATE,
  payment_reference VARCHAR(255),
  
  -- Reminder
  reminder_sent_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- IP Assignments/Transfers
CREATE TABLE ip_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES ip_registrations(id) ON DELETE CASCADE,
  
  -- Transfer Type
  type VARCHAR(50) NOT NULL, -- full_transfer, partial_transfer, license
  
  -- Parties
  transferor_id UUID REFERENCES ip_owners(id),
  transferee_name VARCHAR(255) NOT NULL,
  transferee_company VARCHAR(255),
  transferee_address TEXT,
  transferee_id_number VARCHAR(100),
  
  -- Terms
  transfer_date DATE,
  effective_date DATE,
  consideration DECIMAL(15,2), -- Payment amount
  territory VARCHAR(255), -- Geographic scope
  
  -- Documents
  agreement_url TEXT,
  dgip_recorded BOOLEAN DEFAULT FALSE,
  dgip_record_number VARCHAR(100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- IP Monitoring (for infringement detection)
CREATE TABLE ip_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES ip_registrations(id) ON DELETE CASCADE,
  
  -- Monitoring Settings
  is_active BOOLEAN DEFAULT TRUE,
  monitor_type VARCHAR(50)[], -- web, marketplace, social_media, trademark_db
  
  -- Keywords
  keywords TEXT[],
  
  -- Schedule
  frequency VARCHAR(50), -- daily, weekly, monthly
  last_scan_at TIMESTAMP,
  next_scan_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- IP Infringement Reports
CREATE TABLE ip_infringements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES ip_registrations(id) ON DELETE CASCADE,
  
  -- Source
  detected_by VARCHAR(50), -- auto_scan, manual_report, legal_team
  
  -- Infringement Details
  platform VARCHAR(255), -- Tokopedia, Shopee, YouTube, etc
  url TEXT,
  screenshot_url TEXT,
  
  infringer_name VARCHAR(255),
  infringer_contact TEXT,
  
  description TEXT,
  similarity_score DECIMAL(5,2), -- AI-detected similarity
  
  -- Status
  status VARCHAR(50) DEFAULT 'reported',
  -- reported, investigating, takedown_sent, takedown_success,
  -- legal_action, resolved, dismissed
  
  -- Actions Taken
  takedown_sent_at TIMESTAMP,
  takedown_reference VARCHAR(255),
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  
  -- Legal
  legal_case_number VARCHAR(100),
  legal_partner_id UUID,
  
  reported_by UUID REFERENCES users(id),
  reported_at TIMESTAMP DEFAULT NOW()
);

-- Legal Partners (law firms for IP)
CREATE TABLE legal_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Firm Info
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- law_firm, ip_consultant, notary
  
  -- Contact
  address TEXT,
  city VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Services
  services VARCHAR(50)[], -- copyright, trademark, patent, litigation
  
  -- Pricing
  consultation_fee DECIMAL(15,2),
  filing_fee_copyright DECIMAL(15,2),
  filing_fee_trademark DECIMAL(15,2),
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Rating
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## User Interface - IP Management

### IP Dashboard
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📜 HAK KEKAYAAN INTELEKTUAL                              [Project: X]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Status Overview                                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ 🟢 2        │ │ 🟡 1        │ │ 🔵 1        │ │ ⚪ 3        │          │
│  │ Terdaftar   │ │ Dalam Proses│ │ Perlu Aksi  │ │ Draft       │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                                             │
│  ⚠️ 1 Merek akan expired dalam 30 hari - [Perpanjang Sekarang]             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ HAK CIPTA                                                           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ ✅ Skenario "Neon Genesis" │ EC00202312345 │ Terdaftar 12 Jan 2024 │   │
│  │ ✅ Karakter "Aria"         │ EC00202312346 │ Terdaftar 12 Jan 2024 │   │
│  │ 🟡 Soundtrack              │ Submitted     │ Dalam Review          │   │
│  │ ⚪ Storyboard              │ Draft         │ [Daftarkan]           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ MEREK                                                               │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ ✅ "NEON GENESIS" (Kata)   │ IDM000912345  │ s.d. 15 Mar 2034      │   │
│  │ ⚠️ Logo Neon Genesis       │ IDM000912346  │ Exp: 15 Jan 2025      │   │
│  │    [Perpanjang]                                                     │   │
│  │ ⚪ "Aria" (Karakter)       │ Draft         │ [Daftarkan]           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [+ Daftarkan Hak Cipta Baru]  [+ Daftarkan Merek Baru]                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Copyright Registration Flow
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📝 PENDAFTARAN HAK CIPTA                                    Step 2 of 5   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ● Info Dasar  ● Pencipta  ○ Dokumen  ○ Pembayaran  ○ Submit               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ INFORMASI PENCIPTA                                                  │   │
│  │                                                                     │   │
│  │ Pencipta 1 (Utama)                                                  │   │
│  │ ┌─────────────────────────────────────────────────────────────┐    │   │
│  │ │ Nama Lengkap:    [Ahmad Rizky                            ]  │    │   │
│  │ │ No. KTP:         [3175xxxxxxxxxxxx                       ]  │    │   │
│  │ │ Kewarganegaraan: [Indonesia                          ▼]     │    │   │
│  │ │ Alamat:          [Jl. Sudirman No. 123, Jakarta      ]      │    │   │
│  │ │                                                             │    │   │
│  │ │ Kontribusi:      [Penulis Skenario                      ]   │    │   │
│  │ │ Persentase:      [60] %                                     │    │   │
│  │ └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                     │   │
│  │ [+ Tambah Pencipta Lain]                                           │   │
│  │                                                                     │   │
│  │ ☑️ Pencipta sama dengan Pemegang Hak Cipta                         │   │
│  │ ☐ Pemegang Hak Cipta berbeda (assignment/work for hire)            │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  💡 Tips: Pastikan nama sesuai KTP untuk menghindari penolakan            │
│                                                                             │
│  [← Kembali]                                        [Lanjut: Dokumen →]    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Document Checklist
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📄 DOKUMEN PENDAFTARAN HAK CIPTA                            Step 3 of 5   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dokumen yang Diperlukan:                                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ✅ Surat Pernyataan Penciptaan                                      │   │
│  │    [surat_pernyataan_ahmad.pdf] - Auto-generated                    │   │
│  │    [Preview] [Re-generate]                                          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ ✅ Fotokopi KTP Pencipta                                            │   │
│  │    [ktp_ahmad.jpg] - Uploaded 12 Jan 2024                           │   │
│  │    [Preview] [Replace]                                              │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ ⚠️ Contoh Ciptaan (Script)                                         │   │
│  │    [neon_genesis_script_v3.pdf] - 245 halaman                       │   │
│  │    ⚠️ File terlalu besar (>10MB). Compress atau split.              │   │
│  │    [Compress Otomatis] [Upload Ulang]                               │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ ⬜ Bukti Pengalihan Hak (jika ada)                                  │   │
│  │    Tidak diperlukan - Pencipta = Pemegang Hak                       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ ⬜ Surat Kuasa (jika menggunakan kuasa)                             │   │
│  │    [Upload Surat Kuasa]                                             │   │
│  │    Atau: [Gunakan Konsultan HKI Partner] - Rp 500.000               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  📋 Checklist Auto-Generated Documents:                                    │
│  [✓] Surat Pernyataan dari data yang diinput                              │
│  [✓] Deskripsi Ciptaan dari IP Bible                                      │
│  [✓] Abstrak dari Synopsis                                                │
│                                                                             │
│  [← Kembali]                                      [Lanjut: Pembayaran →]   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### IP Monitoring Dashboard
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔍 IP MONITORING & PROTECTION                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Active Monitoring: 5 IPs                        Last Scan: 2 hours ago    │
│                                                                             │
│  ⚠️ ALERTS (3 new)                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🔴 HIGH: Merek "Neon Genesis" ditemukan di Tokopedia               │   │
│  │    Produk: "Kaos Neon Genesis Bootleg"                              │   │
│  │    Seller: toko_xyz                                                 │   │
│  │    Similarity: 95%                                                  │   │
│  │    [Lihat Detail] [Kirim Takedown] [Abaikan]                       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🟡 MEDIUM: Karakter mirip "Aria" di YouTube                        │   │
│  │    Video: "Fan Animation Aria"                                      │   │
│  │    Channel: fan_animator_123                                        │   │
│  │    Similarity: 72%                                                  │   │
│  │    [Lihat Detail] [Fair Use?] [Kirim DMCA]                         │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🟢 LOW: Nama mirip di database merek                               │   │
│  │    Merek: "NEON GENESIS STUDIO" (Kelas 41)                          │   │
│  │    Applicant: PT XYZ                                                │   │
│  │    Status: Dalam proses pendaftaran                                 │   │
│  │    [Lihat Detail] [Ajukan Oposisi] [Monitor]                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Monitoring Coverage:                                                      │
│  ☑️ Marketplace (Tokopedia, Shopee, Lazada, Bukalapak)                    │
│  ☑️ Social Media (Instagram, TikTok, YouTube)                             │
│  ☑️ Trademark Database (PDKI, WIPO, TMview)                               │
│  ☑️ Domain Names (whois lookup)                                           │
│  ☐ Google Images (upgrade to Pro) [Upgrade]                               │
│                                                                             │
│  [Configure Monitoring]  [View All Alerts]  [Export Report]                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Biaya & Pricing untuk Fitur HAKI

### Platform Service Fees

| Service | MODO Fee | Official Fee | Total |
|---------|----------|--------------|-------|
| **Hak Cipta** |
| Pendaftaran Hak Cipta | Rp 250.000 | Rp 400.000 | Rp 650.000 |
| Konsultasi HKI | Rp 500.000 | - | Rp 500.000 |
| **Merek** |
| Pendaftaran Merek (1 kelas) | Rp 500.000 | Rp 1.800.000 | Rp 2.300.000 |
| Pendaftaran Merek (per kelas tambahan) | Rp 250.000 | Rp 1.800.000 | Rp 2.050.000 |
| Perpanjangan Merek | Rp 350.000 | Rp 2.000.000 | Rp 2.350.000 |
| Pencarian Merek | Rp 150.000 | - | Rp 150.000 |
| **Monitoring** |
| Basic Monitoring (manual) | Gratis | - | Gratis |
| Auto Monitoring (AI) | Rp 200.000/bln | - | Rp 200.000/bln |
| **Legal Action** |
| Template Takedown | Gratis | - | Gratis |
| Assisted Takedown | Rp 500.000 | - | Rp 500.000 |
| Legal Consultation | Rp 1.000.000 | - | Rp 1.000.000 |

### Bundle Packages

| Package | Includes | Price | Savings |
|---------|----------|-------|---------|
| **Starter IP** | 1 Copyright + 1 Trademark | Rp 2.700.000 | 10% |
| **Full Protection** | 1 Copyright + 3 Trademarks + Monitoring 6 bln | Rp 8.500.000 | 15% |
| **Enterprise** | Unlimited + Priority + Legal Retainer | Custom | - |

---

## Auto-Generated Documents

### Templates yang Di-generate Otomatis

1. **Surat Pernyataan Penciptaan**
   - Nama pencipta dari profil
   - Judul ciptaan dari project
   - Tanggal penciptaan dari created_at
   - Deskripsi dari IP Bible

2. **Deskripsi Ciptaan**
   - Synopsis sebagai deskripsi
   - Genre, tone, theme
   - Karakter utama
   - Setting/universe

3. **Abstrak Ciptaan**
   - AI-generated dari full synopsis
   - Max 300 kata

4. **Formulir Pendaftaran**
   - Auto-fill dari data project
   - Format sesuai DGIP

```typescript
// lib/haki/document-generator.ts

export async function generateCopyrightDocuments(
  projectId: string,
  creatorData: CreatorData[]
): Promise<GeneratedDocuments> {
  const project = await getProject(projectId);
  const story = await getStory(projectId);
  
  // 1. Generate Surat Pernyataan
  const statementDoc = await generateStatement({
    creators: creatorData,
    title: project.title,
    type: 'skenario',
    creationDate: project.createdAt,
    description: story.synopsis,
  });
  
  // 2. Generate Deskripsi Ciptaan
  const descriptionDoc = await generateDescription({
    title: project.title,
    synopsis: story.globalSynopsis,
    genre: story.genre,
    characters: await getCharacters(projectId),
    universe: await getUniverse(projectId),
  });
  
  // 3. Generate Abstrak
  const abstract = await generateAbstract(story.globalSynopsis);
  
  // 4. Compile PDF
  const compiledPdf = await compileToPdf([
    statementDoc,
    descriptionDoc,
    { type: 'abstract', content: abstract },
  ]);
  
  return {
    statement: statementDoc,
    description: descriptionDoc,
    abstract,
    compiledPdf,
  };
}
```

---

## Integration Points

### 1. Project Creation → IP Suggestion
```typescript
// Setelah project dibuat, suggest IP registration
async function onProjectPublished(projectId: string) {
  const hasIp = await checkExistingIpRegistration(projectId);
  
  if (!hasIp) {
    await createNotification({
      userId: project.userId,
      type: 'ip_suggestion',
      title: 'Lindungi Karya Anda',
      message: `Project "${project.title}" belum terdaftar HAKI. Daftarkan sekarang untuk perlindungan hukum.`,
      action: `/studio/${projectId}/ip`,
    });
  }
}
```

### 2. License Deal → IP Verification
```typescript
// Sebelum license deal, verify IP ownership
async function beforeLicenseDeal(projectId: string, dealData: LicenseDeal) {
  const ipRegistrations = await getProjectIpRegistrations(projectId);
  
  if (ipRegistrations.length === 0) {
    throw new Error('Project must have registered IP before licensing');
  }
  
  // Check if IP is still valid
  const expiredIps = ipRegistrations.filter(ip => 
    ip.dgip_expiry_date && new Date(ip.dgip_expiry_date) < new Date()
  );
  
  if (expiredIps.length > 0) {
    throw new Error('Some IP registrations have expired. Please renew before licensing.');
  }
  
  return true;
}
```

### 3. Crowdfunding → IP Disclosure
```typescript
// Crowdfunding campaigns must disclose IP status
async function getCampaignIpStatus(campaignId: string) {
  const campaign = await getCampaign(campaignId);
  const ipRegistrations = await getProjectIpRegistrations(campaign.projectId);
  
  return {
    hasRegisteredCopyright: ipRegistrations.some(ip => 
      ip.type === 'copyright' && ip.status === 'registered'
    ),
    hasRegisteredTrademark: ipRegistrations.some(ip => 
      ip.type === 'trademark' && ip.status === 'registered'
    ),
    ipDetails: ipRegistrations.map(ip => ({
      type: ip.type,
      title: ip.title,
      status: ip.status,
      registrationNumber: ip.dgip_registration_number,
    })),
  };
}
```

---

## Future: DGIP API Integration

### Planned API Endpoints (when available)

```typescript
// lib/dgip/api.ts (future implementation)

interface DGIPClient {
  // Search
  searchTrademark(query: string): Promise<TrademarkSearchResult[]>;
  searchCopyright(query: string): Promise<CopyrightSearchResult[]>;
  
  // Filing
  submitCopyrightApplication(data: CopyrightApplication): Promise<FilingResult>;
  submitTrademarkApplication(data: TrademarkApplication): Promise<FilingResult>;
  
  // Status
  getApplicationStatus(applicationNumber: string): Promise<ApplicationStatus>;
  
  // Payment
  getPaymentCode(applicationNumber: string): Promise<PaymentCode>;
  verifyPayment(paymentCode: string): Promise<PaymentVerification>;
  
  // Certificate
  downloadCertificate(registrationNumber: string): Promise<Buffer>;
}
```

### Webhook Events (future)
```typescript
// Receive status updates from DGIP
app.post('/api/webhooks/dgip', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'application.status_changed':
      await updateApplicationStatus(data.applicationNumber, data.newStatus);
      await notifyUser(data.applicationNumber, data.newStatus);
      break;
      
    case 'application.approved':
      await handleApproval(data);
      break;
      
    case 'certificate.issued':
      await downloadAndStoreCertificate(data.registrationNumber);
      break;
  }
  
  res.json({ received: true });
});
```

---

## Legal Partner Network

### Partner Integration
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏛️ KONSULTAN HKI PARTNER                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⭐⭐⭐⭐⭐ (4.9) - 234 reviews                                       │   │
│  │                                                                     │   │
│  │ IP LAW INDONESIA                                                    │   │
│  │ Konsultan HKI Terdaftar                                            │   │
│  │                                                                     │   │
│  │ Layanan: Hak Cipta, Merek, Paten, Desain Industri                  │   │
│  │ Lokasi: Jakarta Selatan                                            │   │
│  │                                                                     │   │
│  │ Biaya Konsultasi: Rp 500.000 (30 menit)                           │   │
│  │ Filing Fee: Mulai Rp 250.000                                       │   │
│  │                                                                     │   │
│  │ [Lihat Profil]  [Jadwalkan Konsultasi]  [Chat]                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⭐⭐⭐⭐ (4.7) - 156 reviews                                         │   │
│  │                                                                     │   │
│  │ HUKUM KREATIF                                                       │   │
│  │ Spesialis Industri Kreatif & Entertainment                         │   │
│  │                                                                     │   │
│  │ Layanan: Hak Cipta, Merek, Kontrak Entertainment                   │   │
│  │ Lokasi: Bandung                                                    │   │
│  │                                                                     │   │
│  │ Biaya Konsultasi: Rp 350.000 (30 menit)                           │   │
│  │ Filing Fee: Mulai Rp 200.000                                       │   │
│  │                                                                     │   │
│  │ [Lihat Profil]  [Jadwalkan Konsultasi]  [Chat]                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Lihat Semua Partner]  [Filter by Location]  [Filter by Service]          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

MODO menjadi **one-stop platform** untuk:
1. **CREATE** - Buat IP di Studio
2. **PROTECT** - Daftarkan HAKI
3. **MONETIZE** - License & crowdfunding
4. **ENFORCE** - Monitor & takedown

Ini memberikan **competitive advantage** yang sangat kuat karena tidak ada platform lain yang mengintegrasikan creation + IP protection dalam satu tempat.
