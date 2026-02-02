# 💰 ESTIMASI INVESTASI MODO - CAPEX & OPEX
## Platform AI IP Creation - Updated Februari 2026

> **Kurs yang digunakan: $1 = Rp 16.000**

---

## 📊 RINGKASAN EKSEKUTIF

| Kategori | **CAPEX (Sekali)** | **OPEX (Bulanan)** |
|----------|-------------------|-------------------|
| **Minimum (100 users)** | Rp 12-18 juta | Rp 5-10 juta/bulan |
| **Standard (1,000 users)** | Rp 20-30 juta | Rp 25-45 juta/bulan |
| **Scale (10,000 users)** | Rp 75 juta | Rp 200-400 juta/bulan |

---

## 🔧 AI PROVIDERS & MODELS YANG DIGUNAKAN

### 1. **ModelsLab.com** - Image & Video Generation

#### 📸 Image Generation - Seedream 4.5

| Model | Harga per Image | Use Case |
|-------|-----------------|----------|
| **Seedream 4.5** (Text-to-Image) | **Rp 640** | Generate karakter, scene |
| **Seedream 4.5-i2i** (Image-to-Image) | **Rp 640** | Edit, variation, consistent char |

#### 🎬 Video Generation - Seedance 4.0

| Model | Harga per Detik | Harga per 6 detik | Use Case |
|-------|-----------------|-------------------|----------|
| **Seedance 4.0 Text-to-Video** | **Rp 880/detik** | **Rp 5.280** | Generate video dari prompt |
| **Seedance 4.0 Image-to-Video** | **Rp 880/detik** | **Rp 5.280** | Animate image jadi video |
| Seedance 1.0 Pro Fast | Rp 500/detik | Rp 3.000 | Draft/preview cepat |

#### 💳 ModelsLab Subscription Plans

| Plan | Harga/bulan | Benefit |
|------|-------------|---------|
| **Prototype** | Pay-as-you-go | Fleksibel, topup wallet |
| **Standard** | **Rp 752.000** | 10 concurrent, priority support |
| **Unlimited Premium** | **Rp 3.184.000** | Unlimited generations |

---

### 2. **DeepSeek API** - LLM Text Generation

| Model | Input (Cache Miss) | Input (Cache Hit) | Output |
|-------|-------------------|-------------------|--------|
| **DeepSeek-V3** | **Rp 8.960/1jt tokens** | **Rp 1.120/1jt tokens** | **Rp 26.880/1jt tokens** |

> Rata-rata per 1K tokens (story gen): **~Rp 32/request**

---

## 💰 KALKULASI BIAYA PER IP

### Satu IP Creation (Full Package)

| Component | Model | Quantity | Cost/Unit | Total |
|-----------|-------|----------|-----------|-------|
| **Story Generation** | DeepSeek V3 | ~5K tokens | Rp 32/1K | **Rp 160** |
| **Character Images** | Seedream 4.5 | 10 images | Rp 640 | **Rp 6.400** |
| **Scene Images** | Seedream 4.5-i2i | 60 images | Rp 640 | **Rp 38.400** |
| **Teaser Videos** | Seedance 4.0 | 10-20 × 6s | Rp 5.280 | **Rp 52.800 - 105.600** |
| **TOTAL per IP** | | | | **Rp 97.760 - 150.560** |

### 💵 Dibulatkan: **Rp 100.000 - 150.000 per IP**

---

## 🏗️ CAPEX (Capital Expenditure) - Investasi Awal

> **CAPEX = Aset** yang dibeli sekali dan digunakan jangka panjang

### 1. CLOUD INFRASTRUCTURE

| Item | MVP (Vercel) | Scale (AWS) | Keterangan |
|------|--------------|-------------|------------|
| **Hosting/Compute** | Rp 3.840.000/thn | Rp 24.000.000/thn | Vercel Pro → AWS EC2/ECS |
| **Database** | Rp 4.800.000/thn | Rp 12.000.000/thn | Neon → AWS RDS |
| **Storage (S3/R2)** | Rp 2.400.000/thn | Rp 12.000.000/thn | Images, videos, assets |
| **CDN** | Included | Rp 6.000.000/thn | CloudFront untuk global delivery |
| **Domain & SSL** | Rp 1.000.000 | Rp 1.000.000 | modo.io atau similar |
| **Subtotal Cloud MVP** | **Rp 12.040.000** | | |
| **Subtotal Cloud Scale** | | **Rp 55.000.000/thn** | Untuk 1000+ users |

### 2. HARDWARE (Aset Tetap)

| Item | Spesifikasi | Harga | Keterangan |
|------|-------------|-------|------------|
| **Laptop Developer** | MacBook Pro M3 / ROG Strix | Rp 35.000.000 | Main development machine |
| **PC Workstation** | Ryzen 9 + RTX 4080 + 64GB | Rp 45.000.000 | Heavy processing, local AI |
| **Monitor** | 27" 4K × 2 | Rp 10.000.000 | Dual monitor setup |
| **Peripheral** | Keyboard, mouse, webcam, dll | Rp 3.000.000 | |
| **Backup Storage** | NAS 8TB | Rp 8.000.000 | Local backup |
| **Subtotal Hardware** | | **Rp 101.000.000** | Investasi 1x, pakai 3-5 tahun |

### 3. TRAINING DATA (Aset Intelektual)

| Item | Quantity | Harga | Keterangan |
|------|----------|-------|------------|
| **Dataset Film/Series** | 2.000+ judul | Rp 50.000.000 | Lisensi atau scraping legal |
| **Naskah/Screenplay** | 5.000+ naskah | Rp 30.000.000 | Koleksi screenplay database |
| **Dataset Karakter** | 10.000+ profil | Rp 20.000.000 | Archetype, personality, backstory |
| **Dataset Visual** | 100.000+ gambar | Rp 25.000.000 | Reference art, storyboard |
| **Anotasi & Labeling** | - | Rp 25.000.000 | Cleaning dan labeling data |
| **Subtotal Training Data** | | **Rp 150.000.000** | Aset untuk fine-tuning model |

### 4. AI API INITIAL TOPUP

| Provider | Topup Awal | Estimasi Usage |
|----------|------------|----------------|
| **ModelsLab Standard** | Rp 752.000 | 1 bulan subscription |
| **DeepSeek** | Rp 800.000 | ~25.000 story generations |
| **ModelsLab Wallet** | Rp 1.600.000 | ~2.500 images atau ~300 videos |
| **Subtotal AI Topup** | **Rp 3.152.000** | |

### 5. BIAYA DEVELOPMENT (Sebelum Launch)

| Item | Durasi | Biaya | Keterangan |
|------|--------|-------|------------|
| **Gaji Developer** | 6 bulan | Rp 150.000.000 | 1 orang × Rp 25jt × 6 bulan |
| **AI Coding Tools** | 6 bulan | Rp 9.600.000 | Antigravity Pro × 5 × 6 bulan |
| **Subtotal Dev** | | **Rp 159.600.000** | |

### 6. TOTAL CAPEX

| Kategori | Amount |
|----------|--------|
| Cloud Infrastructure (MVP) | Rp 12.040.000 |
| Hardware | Rp 101.000.000 |
| Training Data | Rp 150.000.000 |
| AI API Topup | Rp 3.152.000 |
| Development (6 bulan) | Rp 159.600.000 |
| **SUBTOTAL** | **Rp 425.792.000** |
| Buffer 10% | Rp 42.579.200 |
| **TOTAL CAPEX** | **Rp 468.371.200** |

### 💡 Ringkasan CAPEX

| Skenario | Estimasi |
|----------|----------|
| **Minimum (tanpa hardware & training)** | **Rp 175.000.000** |
| **Standard (dengan hardware)** | **Rp 276.000.000** |
| **Full (dengan training data)** | **Rp 470.000.000** |

---

## 👥 STRUKTUR TIM & BIAYA SDM (AI-Powered Lean Team)

> **Catatan:** Dengan AI coding tools (Cursor, Copilot, Claude), tim bisa sangat lean!

### Fase 1: MVP/Early Stage (0-100 users)

| Role | Jumlah | Gaji/bulan | Total/bulan | Keterangan |
|------|--------|------------|-------------|------------|
| **Founder/Tech Lead** | 1 | Rp 25.000.000 | Rp 25.000.000 | All-in-one: dev, bisnis, presentasi |
| **TOTAL** | **1 orang** | | **Rp 25.000.000/bulan** | Pakai AI tools untuk 10x productivity |

### Fase 2: Growth Stage (100-1.000 users)

| Role | Jumlah | Gaji/bulan | Total/bulan | Keterangan |
|------|--------|------------|-------------|------------|
| **CEO/Product** | 1 | Rp 25.000.000 | Rp 25.000.000 | Strategy, presentasi, partnership |
| **Full-stack Developer** | 1 | Rp 20.000.000 | Rp 20.000.000 | Development + AI tools |
| **Marketing/CS** | 1 | Rp 10.000.000 | Rp 10.000.000 | Growth, support, content |
| **TOTAL** | **3 orang** | | **Rp 55.000.000/bulan** | |

### Fase 3: Scale Stage (1.000-10.000 users)

| Role | Jumlah | Gaji/bulan | Total/bulan | Keterangan |
|------|--------|------------|-------------|------------|
| **CEO** | 1 | Rp 30.000.000 | Rp 30.000.000 | Strategy, fundraising |
| **CTO/Lead Dev** | 1 | Rp 25.000.000 | Rp 25.000.000 | Architecture, AI integration |
| **Full-stack Developer** | 1 | Rp 20.000.000 | Rp 20.000.000 | Feature development |
| **Marketing/Growth** | 1 | Rp 15.000.000 | Rp 15.000.000 | Ads, partnership, BD |
| **CS/Operations** | 1 | Rp 10.000.000 | Rp 10.000.000 | Support, admin |
| **TOTAL** | **5 orang** | | **Rp 100.000.000/bulan** | |

---

### 📊 Ringkasan Biaya Tim (AI-Powered)

| Fase | Tim | Gaji Total/bulan | Gaji Total/tahun |
|------|-----|------------------|------------------|
| **MVP** | 1 orang | Rp 25.000.000 | Rp 300.000.000 |
| **Growth** | 3 orang | Rp 55.000.000 | Rp 660.000.000 |
| **Scale** | 5 orang | Rp 100.000.000 | Rp 1.200.000.000 |

> **Perbandingan:** Tim tradisional tanpa AI butuh 3x lebih banyak orang!

### 🤖 Biaya AI Coding Tools

| Tool | Harga/subscription | Jumlah | Total/bulan | Keterangan |
|------|-------------------|--------|-------------|------------|
| **Antigravity Pro** | Rp 320.000 ($20) | 5 | **Rp 1.600.000** | Claude Opus 4.5, parallel coding |

> **Catatan:** 1 developer pakai 5 subscription Antigravity Pro untuk kerja paralel = **Rp 1.600.000/bulan**

#### 💡 Total Biaya AI Coding per Fase

| Fase | Tim | Subscriptions | Total/bulan |
|------|-----|---------------|-------------|
| **MVP** | 1 orang | 5 | **Rp 1.600.000** |
| **Growth** | 3 orang | 15 | **Rp 4.800.000** |
| **Scale** | 5 orang | 25 | **Rp 8.000.000** |

> **Worth it!** AI coding 10x lebih produktif dibanding developer manual!

---

## �📈 OPEX (Operational Expenditure) - Biaya Bulanan

### 1. HOSTING & INFRASTRUCTURE

| Service | Cost/bulan |
|---------|------------|
| Vercel Pro | Rp 320.000 |
| Neon Database | Rp 400.000 - 1.100.000 |
| Cloudflare R2 | Rp 80.000 - 320.000 |
| **Subtotal Hosting** | **Rp 800.000 - 1.740.000/bulan** |

### 2. AI API COSTS

#### Skenario A: 100 Users Aktif/bulan
Asumsi: 1 IP per user (30 images + 2 videos)

| AI Type | Model | Usage | Cost |
|---------|-------|-------|------|
| LLM | DeepSeek V3 | 500K tokens | **Rp 8.000** |
| Image | Seedream 4.5 | 3.000 images | **Rp 1.920.000** |
| Video | Seedance 4.0 | 200 × 6s | **Rp 1.056.000** |
| **Total AI** | | | **Rp 2.984.000** |

#### Skenario B: 500 Users Aktif/bulan

| AI Type | Model | Usage | Cost |
|---------|-------|-------|------|
| LLM | DeepSeek V3 | 2.5M tokens | **Rp 40.000** |
| Image | Seedream 4.5 | 15.000 images | **Rp 9.600.000** |
| Video | Seedance 4.0 | 1.000 × 6s | **Rp 5.280.000** |
| **Total AI** | | | **Rp 14.920.000** |

#### Skenario C: 1.000 Users Aktif/bulan

| AI Type | Model | Usage | Cost |
|---------|-------|-------|------|
| LLM | DeepSeek V3 | 5M tokens | **Rp 80.000** |
| Image | Seedream 4.5 | 30.000 images | **Rp 19.200.000** |
| Video | Seedance 4.0 | 2.000 × 6s | **Rp 10.560.000** |
| **Total AI** | | | **Rp 29.840.000** |

### 3. SUBSCRIPTION + OPERATIONAL

| Item | Cost/bulan |
|------|------------|
| ModelsLab Standard | Rp 752.000 |
| ModelsLab Unlimited (scaled) | Rp 3.184.000 |
| Admin/CS (part-time) | Rp 3.000.000 - 5.000.000 |
| Marketing | Rp 5.000.000 - 10.000.000 |
| Payment Gateway (~2.5%) | Variable |
| **Subtotal Ops** | **Rp 9.000.000 - 18.000.000** |

---

### 📌 TOTAL OPEX BULANAN

| Skenario | Users | AI Cost | Infra+Ops | **TOTAL** |
|----------|-------|---------|-----------|-----------|
| **Early** | 100 | Rp 3.000.000 | Rp 10.000.000 | **Rp 13.000.000/bln** |
| **Growing** | 500 | Rp 15.000.000 | Rp 12.000.000 | **Rp 27.000.000/bln** |
| **Scale** | 1.000 | Rp 30.000.000 | Rp 15.000.000 | **Rp 45.000.000/bln** |
| **Mature** | 5.000 | Rp 150.000.000 | Rp 25.000.000 | **Rp 175.000.000/bln** |

---

## 💡 STRATEGI HEMAT VIDEO

Video adalah **cost driver terbesar** (Rp 5.280/6 detik vs Rp 640/image)!

| Strategi | Impact |
|----------|--------|
| Limit video per user (2-5/bulan) | -60-80% video cost |
| Video hanya untuk paid tier | -90% video cost |
| Gunakan Seedance 1.0 Pro Fast (Rp 500/detik) | -44% per video |
| Shorter videos (3s instead of 6s) | -50% per video |

---

## 💰 PRICING & MARGIN

### Credit System Recommendation

| Action | API Cost | Jual | Margin |
|--------|----------|------|--------|
| Story Gen (5K tokens) | Rp 160 | 1 credit = Rp 500 | **68%** |
| Image Gen (1x) | Rp 640 | 3 credits = Rp 1.500 | **57%** |
| Video Gen (6s) | Rp 5.280 | 15 credits = Rp 7.500 | **30%** |
| **Full IP Package** | Rp 30.000 | 50 credits = Rp 25.000 | **-17%** ⚠️ |

> ⚠️ Full IP package dengan video **RUGI** jika dijual murah! Perlu pricing lebih tinggi atau limit video.

### Recommended Subscription Pricing

| Plan | Price/bulan | Included | Target Margin |
|------|-------------|----------|---------------|
| **Free Trial** | Rp 0 | 3 images, 0 video | Loss leader |
| **Starter** | Rp 49.000 | 30 images, 1 video | 40% |
| **Creator** | Rp 149.000 | 100 images, 5 videos | 50% |
| **Pro** | Rp 349.000 | 300 images, 15 videos | 55% |
| **Enterprise** | Rp 999.000 | Unlimited images, 50 videos | 60% |

### Break-even Analysis

| Plan | Harga | API Cost per User | Users untuk Break-even OPEX Rp 13jt |
|------|-------|-------------------|-------------------------------------|
| Starter | Rp 49.000 | Rp 6.000 | ~300 users |
| Creator | Rp 149.000 | Rp 33.000 | ~112 users |
| Pro | Rp 349.000 | Rp 85.000 | ~50 users |

---

## 🎯 SUMMARY

### Model & Pricing (dalam Rupiah)

| Category | Model | Harga |
|----------|-------|-------|
| **LLM** | DeepSeek V3 | Rp 1.120-8.960 input, Rp 26.880 output /1jt tokens |
| **Image** | Seedream 4.5 | **Rp 640/image** |
| **Image Edit** | Seedream 4.5-i2i | **Rp 640/image** |
| **Video** | Seedance 4.0 | **Rp 880/detik** = Rp 5.280/6 detik |

### Investment Summary

| Metric | Amount |
|--------|--------|
| **CAPEX Minimum** | Rp 12.000.000 - 15.000.000 |
| **OPEX 100 users (tanpa gaji)** | Rp 5.000.000/bulan |
| **OPEX 500 users (tanpa gaji)** | Rp 15.000.000/bulan |
| **OPEX 1.000 users (tanpa gaji)** | Rp 30.000.000/bulan |
| **Cost per Full IP** | Rp 100.000 - 150.000 |
| **Break-even** | ~50 Pro subscribers |
| **Key Risk** | Video generation cost |

### 💰 Initial Investment Recommendation (MVP)

| Item | Amount | Keterangan |
|------|--------|------------|
| **Infrastructure (1 tahun)** | Rp 9.000.000 | Vercel + Neon + Domain |
| **AI API Topup Awal** | Rp 3.200.000 | ModelsLab + DeepSeek |
| **AI Coding (3 bulan)** | Rp 4.800.000 | Antigravity Pro × 5 × 3 bulan |
| **Gaji Founder (3 bulan)** | Rp 75.000.000 | 1 orang × Rp 25jt × 3 bulan |
| **Marketing Awal** | Rp 10.000.000 | Launch campaign |
| **Buffer Operasional** | Rp 10.000.000 | Cadangan |
| **TOTAL INITIAL** | **Rp 112.000.000** | Modal awal untuk 3 bulan pertama |

### 📊 Ringkasan OPEX Bulanan (Termasuk Gaji)

| Fase | Users | AI Cost | AI Coding | Gaji Tim | Infra | **TOTAL** |
|------|-------|---------|-----------|----------|-------|-----------|
| **MVP** | 0-100 | Rp 3jt | Rp 1.6jt | Rp 25jt | Rp 1jt | **Rp 30.6jt/bln** |
| **Growth** | 100-1K | Rp 15jt | Rp 4.8jt | Rp 55jt | Rp 2jt | **Rp 76.8jt/bln** |
| **Scale** | 1K-10K | Rp 30jt | Rp 8jt | Rp 100jt | Rp 3jt | **Rp 141jt/bln** |

---

*Last Updated: Februari 2026*
*Kurs: $1 = Rp 16.000*
*Models: Seedream 4.5, Seedream 4.5-i2i, Seedance 4.0 (ModelsLab) + DeepSeek V3*
*AI Coding: Antigravity Pro (Claude Opus 4.5)*

