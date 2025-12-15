// Unsplash Images
export const UNSPLASH_IMAGES = {
  hero: {
    main: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=1080&fit=crop",
    alt1: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop",
    alt2: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&h=1080&fit=crop",
  },
  features: {
    studio: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
    watch: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop",
    invest: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop",
    license: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
    fandom: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
    haki: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop",
  },
  about: {
    team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop",
    office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
    meeting: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop",
  },
  auth: {
    creative: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&h=800&fit=crop",
    workspace: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop",
  },
  cta: {
    studio: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1920&h=600&fit=crop",
  },
};

// Pricing Plans
export const PRICING_PLANS = [
  {
    id: "trial",
    name: "Free Trial",
    price: 0,
    period: "14 days",
    description: "Coba gratis selama 14 hari",
    features: [
      "2x AI generation",
      "1 project",
      "50MB storage",
      "Watermark on exports",
      "Community support",
    ],
    limitations: [
      "No video generation",
      "No team collaboration",
      "Limited exports",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 349000,
    period: "/month",
    description: "Untuk creator individu",
    features: [
      "400 AI credits/month",
      "5 projects",
      "2GB storage",
      "PDF export",
      "Email support",
      "No watermark",
    ],
    limitations: [
      "No video generation",
      "No team collaboration",
    ],
    cta: "Get Premium",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 899000,
    period: "/month",
    description: "Untuk tim kecil & studio",
    features: [
      "1,500 AI credits/month",
      "20 projects",
      "10GB storage",
      "20 video generations/month",
      "Team collaboration (5 members)",
      "Watch & Invest modules",
      "Priority support",
    ],
    limitations: [],
    cta: "Get Pro",
    popular: false,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: 1999000,
    period: "/month",
    description: "Untuk studio profesional",
    features: [
      "6,000 AI credits/month",
      "50 projects",
      "50GB storage",
      "50 video generations/month",
      "Team collaboration (10 members)",
      "All modules unlocked",
      "BYOK (Bring Your Own Key)",
      "API access",
      "24/7 support",
    ],
    limitations: [],
    cta: "Contact Us",
    popular: false,
  },
];

// Features
export const FEATURES = [
  {
    id: "studio",
    title: "Studio",
    icon: "Clapperboard",
    description: "AI-powered IP Bible creation with story generation, character design, world building, and media production.",
    image: "studio",
    href: "/auth",
  },
  {
    id: "watch",
    title: "Watch",
    icon: "Play",
    description: "Streaming platform untuk konten kreatif Indonesia. Tonton film, serial, dan dokumenter.",
    image: "watch",
    href: "/watch",
  },
  {
    id: "invest",
    title: "Invest",
    icon: "TrendingUp",
    description: "Investasi di proyek kreatif Indonesia. Dapatkan revenue share dan benefit eksklusif.",
    image: "invest",
    href: "/invest",
  },
  {
    id: "license",
    title: "License",
    icon: "ShoppingBag",
    description: "Merchandise resmi dan lisensi B2B untuk IP Indonesia. Beli atau jual produk.",
    image: "license",
    href: "/license",
  },
  {
    id: "fandom",
    title: "Fandom",
    icon: "Users",
    description: "Bergabung dengan komunitas fans IP Indonesia. Discord, Telegram, dan WhatsApp.",
    image: "fandom",
    href: "/fandom",
  },
  {
    id: "haki",
    title: "HAKI",
    icon: "Shield",
    description: "Lindungi IP Anda dengan registrasi HAKI terintegrasi dan tracking.",
    image: "haki",
    href: "/auth",
  },
];

// How It Works Steps
export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Input Your Idea",
    description: "Start with a simple concept, premise, or story idea.",
    icon: "Lightbulb",
  },
  {
    step: 2,
    title: "AI Generates",
    description: "Our AI creates story structure, characters, and visuals.",
    icon: "Sparkles",
  },
  {
    step: 3,
    title: "Customize & Refine",
    description: "Review and edit with more AI assistance.",
    icon: "Pencil",
  },
  {
    step: 4,
    title: "Export IP Bible",
    description: "Export as PDF, share with teams, pitch to studios.",
    icon: "FileText",
  },
];

// AI Models Display
export const AI_MODELS = {
  text: ["GPT-5.2", "Gemini 3 Pro", "Claude Opus 4.5", "DeepSeek V3.2"],
  image: ["FLUX.2 Pro", "Midjourney V7", "Nano Banana Pro", "SD 3.5"],
  video: ["Runway Gen-4.5", "Luma Ray3", "Kling 2.6", "Sora 2"],
  audio: ["ElevenLabs", "Suno AI", "Udio"],
};

// Contact Info
export const CONTACT_INFO = {
  whatsapp: {
    number: "081319504441",
    name: "Galih Praz",
    url: "https://wa.me/6281319504441",
  },
  email: "hello@modo.creator",
  address: "Jakarta, Indonesia",
};

// Social Links
export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/modocreator",
  instagram: "https://instagram.com/modocreator",
  linkedin: "https://linkedin.com/company/modocreator",
  youtube: "https://youtube.com/@modocreator",
};

// Navigation Links
export const NAV_LINKS = [
  { href: "/watch", label: "Watch" },
  { href: "/invest", label: "Invest" },
  { href: "/license", label: "License" },
  { href: "/fandom", label: "Fandom" },
  { href: "/pricing", label: "Pricing" },
];
