# UI/UX Revamp Plan: "Ethereal Creative Suite"

## 🎨 Visual Identity

Misi: Mengubah UI yang "Administrative" menjadi "Inspirational".

### 1. Color Palette System (Dynamic Themes)
Setiap modul memiliki identitas gradasi unik untuk memberikan konteks visual instan:
- **Core:** Slate-900 (Text), Slate-500 (Secondary), White/Glass (Surfaces).
- **Character:** `from-emerald-500 via-teal-500 to-cyan-500` (Organic/Life).
- **Story:** `from-violet-500 via-purple-500 to-fuchsia-500` (Magic/Mystery).
- **Universe:** `from-blue-500 via-indigo-500 to-violet-500` (Deep/Vast).
- **Strategic:** `from-orange-500 via-amber-500 to-yellow-500` (Energy/Action).

### 2. Component Design (The "Glass" Look)
Tidak ada lagi border abu-abu kaku. Kita gunakan layer cahaya.

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 10px 15px -3px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.85);
  transform: translateY(-2px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 3. Typography & Spacing
- **Headings:** Tracking tight (`-0.02em`), font-weight bold/black.
- **Labels:** Uppercase, tracking wide, text-xs, muted colors (elegant minimalism).
- **Input Fields:** Minimalis, tanpa border keras, background `bg-slate-50` yang berubah jadi putih saat focus.

---

## 🛠 Implementation Plan

### Phase 1: Foundation (Current Step)
1. **Update `globals.css`:** Tambahkan utility classes untuk glassmorphism, mesh gradients, dan animasi.
2. **Create Reusable Components:**
   - `GlassHeader`: Header tab yang cantik dengan background mesh.
   - `BentoCard`: Card container untuk layout grid.
   - `FloatingControls`: Action bar yang melayang.

### Phase 2: Tab Revamp (Immediate Actions)
Kita akan ubah tampilan tab yang paling "kaku" terlebih dahulu:

#### **Strategic Plan (Revamp Target 1)**
- **Before:** List input biasa dalam card putih.
- **After:** 
  - Layout Grid 3 kolom.
  - "Vision Statement" dalam card besar dengan typography hero.
  - "Target Audience" dengan visual tags/chips yang colorful.
  - Progress bar yang stylish untuk timeline.

#### **Story Formula (Revamp Target 2)**
- **Before:** Form panjang ke bawah.
- **After:** 
  - "Story Arc Visualization": Grafik visual sederhana untuk struktur cerita.
  - "Premise Builder": Input besar di tengah seperti Notion headline.
  - "Beat Sheet": Kartu-kartu kecil yang bisa di-scroll horizontal.

### Phase 3: Animation Polish
- Menambahkan `AnimatePresence` (framer-motion) untuk transisi tab yang mulus (dissolve/slide).
- Micro-interaction saat mengetik (glowing borders).

---

## 📸 Visualization

Bayangkan dashboard Milanote bertemu dengan UI modern MacOS Big Sur. Bersih, transparan, tapi penuh warna yang terkontrol.
