import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UNSPLASH_IMAGES } from "@/lib/constants";
import {
  Sparkles, Check, ArrowRight, Play,
  Clapperboard, TrendingUp, ShoppingBag, Users, Shield,
  FileText, Palette, Globe, Video, Music, Wand2,
  BarChart3, PieChart, Wallet, HandCoins, FileCheck, Scale,
  Store, Tag, Percent, Package, BadgeCheck, ScrollText,
  MessageSquare, Heart, Image as ImageIcon, Calendar, Gift, Trophy,
  ShieldCheck, FileSearch, Lock, AlertTriangle, Gavel, ClipboardCheck
} from "lucide-react";

const featureData: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  heroImage: string;
  color: string;
  features: Array<{
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }>;
  benefits: string[];
  useCases: Array<{
    title: string;
    description: string;
  }>;
  cta: string;
}> = {
  studio: {
    title: "Studio",
    subtitle: "AI-Powered IP Bible Creation",
    description: "Create complete IP Bibles with AI assistance. Generate stories, characters, worlds, and visual assets all in one integrated platform.",
    icon: Clapperboard,
    heroImage: UNSPLASH_IMAGES.features.studio,
    color: "violet",
    features: [
      {
        icon: FileText,
        title: "Story Formula Generator",
        description: "Generate complete story structures using Hero's Journey, Save the Cat, or Dan Harmon's Story Circle frameworks."
      },
      {
        icon: Users,
        title: "Character Designer",
        description: "Create detailed character profiles with AI-generated backstories, personality traits, and visual references."
      },
      {
        icon: Globe,
        title: "World Building",
        description: "Design immersive universes with geography, culture, history, and social systems."
      },
      {
        icon: Palette,
        title: "Moodboard Generation",
        description: "Generate visual moodboards for each story beat using AI image generation."
      },
      {
        icon: Video,
        title: "Animation Preview",
        description: "Create short animation previews from your moodboard images to visualize scenes."
      },
      {
        icon: Wand2,
        title: "Script Generation",
        description: "Generate screenplay-formatted scripts from your story beats and character interactions."
      }
    ],
    benefits: [
      "Create IP Bibles in days, not months",
      "AI-assisted creative process",
      "Professional PDF exports for pitching",
      "Team collaboration features",
      "Version history & backup",
      "Multi-language support"
    ],
    useCases: [
      {
        title: "Film Development",
        description: "Create comprehensive pitch documents for feature films and series."
      },
      {
        title: "Animation Pre-production",
        description: "Design characters, worlds, and storyboards for animation projects."
      },
      {
        title: "Game Narrative",
        description: "Build rich backstories and world lore for video game development."
      }
    ],
    cta: "Start Creating"
  },
  watch: {
    title: "Watch",
    subtitle: "Content Distribution Platform",
    description: "Showcase your content with a Netflix-like experience. Stream episodes, build audience, and track engagement metrics.",
    icon: Play,
    heroImage: UNSPLASH_IMAGES.features.watch,
    color: "red",
    features: [
      {
        icon: Video,
        title: "Video Hosting",
        description: "High-quality video hosting with adaptive streaming for all devices and connection speeds."
      },
      {
        icon: FileText,
        title: "Episode Management",
        description: "Organize content into seasons and episodes with metadata, thumbnails, and descriptions."
      },
      {
        icon: BarChart3,
        title: "Analytics Dashboard",
        description: "Track views, watch time, engagement, and audience demographics in real-time."
      },
      {
        icon: Users,
        title: "Audience Building",
        description: "Build your subscriber base with follow features, notifications, and recommendations."
      },
      {
        icon: Lock,
        title: "Access Control",
        description: "Set content as free, subscriber-only, or pay-per-view with flexible monetization."
      },
      {
        icon: Globe,
        title: "Multi-platform",
        description: "Embed your content on external websites or distribute via API integration."
      }
    ],
    benefits: [
      "Professional streaming experience",
      "No third-party platform fees",
      "Own your audience data",
      "Flexible monetization options",
      "Global CDN delivery",
      "Mobile-optimized playback"
    ],
    useCases: [
      {
        title: "Web Series",
        description: "Launch your own streaming channel for original web series content."
      },
      {
        title: "Film Premiere",
        description: "Host exclusive premieres and virtual screenings for your films."
      },
      {
        title: "Educational Content",
        description: "Distribute tutorials, courses, and educational video content."
      }
    ],
    cta: "Start Streaming"
  },
  invest: {
    title: "Invest",
    subtitle: "Crowdfunding & Revenue Sharing",
    description: "Fund your projects through community investment. Transparent budget allocation and revenue sharing with your backers.",
    icon: TrendingUp,
    heroImage: UNSPLASH_IMAGES.features.invest,
    color: "green",
    features: [
      {
        icon: Wallet,
        title: "Campaign Creation",
        description: "Create compelling crowdfunding campaigns with goals, tiers, and reward structures."
      },
      {
        icon: PieChart,
        title: "Budget Transparency",
        description: "Show backers exactly how funds will be allocated across production phases."
      },
      {
        icon: HandCoins,
        title: "Revenue Sharing",
        description: "Set up automatic revenue distribution to investors based on their contribution."
      },
      {
        icon: FileCheck,
        title: "Milestone Tracking",
        description: "Update backers on project progress with milestone completions and deliverables."
      },
      {
        icon: Scale,
        title: "Legal Templates",
        description: "Access standardized investment agreements and legal documentation."
      },
      {
        icon: BarChart3,
        title: "Investor Dashboard",
        description: "Give investors real-time access to project performance and ROI metrics."
      }
    ],
    benefits: [
      "Alternative funding source",
      "Build community ownership",
      "Transparent financial reporting",
      "Automated profit distribution",
      "Legal compliance support",
      "Investor relations tools"
    ],
    useCases: [
      {
        title: "Film Production",
        description: "Raise production budget from fans and community investors."
      },
      {
        title: "Series Development",
        description: "Fund pilot episodes and secure season commitments."
      },
      {
        title: "IP Expansion",
        description: "Finance merchandise, adaptations, or franchise extensions."
      }
    ],
    cta: "Start Campaign"
  },
  license: {
    title: "License",
    subtitle: "IP Monetization & Licensing",
    description: "Monetize your IP through merchandise, licensing deals, and automated royalty management.",
    icon: ShoppingBag,
    heroImage: UNSPLASH_IMAGES.features.license,
    color: "orange",
    features: [
      {
        icon: Store,
        title: "Merchandise Store",
        description: "Launch your own branded merchandise store with print-on-demand integration."
      },
      {
        icon: Tag,
        title: "Licensing Deals",
        description: "Manage licensing agreements with manufacturers, publishers, and distributors."
      },
      {
        icon: Percent,
        title: "Royalty Tracking",
        description: "Automatically track and calculate royalties from all licensing agreements."
      },
      {
        icon: Package,
        title: "Product Catalog",
        description: "Showcase licensable assets including characters, logos, and artwork."
      },
      {
        icon: BadgeCheck,
        title: "Partner Network",
        description: "Connect with verified manufacturers and licensing partners in our network."
      },
      {
        icon: ScrollText,
        title: "Contract Management",
        description: "Store and manage all licensing contracts with expiration alerts."
      }
    ],
    benefits: [
      "Passive income from IP",
      "Global licensing reach",
      "Automated royalty collection",
      "Brand protection",
      "Partner verification",
      "Contract templates"
    ],
    useCases: [
      {
        title: "Character Licensing",
        description: "License your characters for toys, apparel, and consumer products."
      },
      {
        title: "Merchandise Launch",
        description: "Create and sell branded merchandise directly to fans."
      },
      {
        title: "Media Adaptation",
        description: "License your IP for games, comics, or international adaptations."
      }
    ],
    cta: "Start Licensing"
  },
  fandom: {
    title: "Fandom",
    subtitle: "Community Engagement Platform",
    description: "Build and engage your community with forums, fan art galleries, exclusive content, and direct creator-fan interaction.",
    icon: Users,
    heroImage: UNSPLASH_IMAGES.features.fandom,
    color: "pink",
    features: [
      {
        icon: MessageSquare,
        title: "Community Forums",
        description: "Create discussion spaces for fans to connect, theorize, and share."
      },
      {
        icon: ImageIcon,
        title: "Fan Art Gallery",
        description: "Showcase and celebrate fan-created artwork with proper attribution."
      },
      {
        icon: Heart,
        title: "Exclusive Content",
        description: "Reward loyal fans with behind-the-scenes content and early access."
      },
      {
        icon: Calendar,
        title: "Events & Meetups",
        description: "Organize virtual and in-person fan events, Q&As, and screenings."
      },
      {
        icon: Gift,
        title: "Rewards Program",
        description: "Gamify engagement with points, badges, and exclusive perks."
      },
      {
        icon: Trophy,
        title: "Contests & Challenges",
        description: "Run fan contests for art, cosplay, fan fiction, and more."
      }
    ],
    benefits: [
      "Direct fan relationships",
      "Community-driven marketing",
      "Fan content showcase",
      "Engagement analytics",
      "Moderation tools",
      "Newsletter integration"
    ],
    useCases: [
      {
        title: "Fan Community",
        description: "Build a dedicated home for your most passionate fans."
      },
      {
        title: "Content Feedback",
        description: "Gather fan input on story directions and character development."
      },
      {
        title: "Launch Support",
        description: "Mobilize your community for crowdfunding and premiere events."
      }
    ],
    cta: "Build Community"
  },
  haki: {
    title: "HAKI",
    subtitle: "IP Protection & Registration",
    description: "Protect your intellectual property with integrated HAKI registration, tracking, and infringement monitoring for Indonesian creators.",
    icon: Shield,
    heroImage: UNSPLASH_IMAGES.features.haki,
    color: "blue",
    features: [
      {
        icon: ShieldCheck,
        title: "HAKI Registration",
        description: "Streamlined application process for copyright and trademark registration in Indonesia."
      },
      {
        icon: FileSearch,
        title: "IP Documentation",
        description: "Generate comprehensive documentation proving creation date and ownership."
      },
      {
        icon: BadgeCheck,
        title: "Ownership Verification",
        description: "Blockchain-backed proof of ownership for your creative works."
      },
      {
        icon: AlertTriangle,
        title: "Infringement Monitoring",
        description: "AI-powered scanning to detect unauthorized use of your IP online."
      },
      {
        icon: Gavel,
        title: "Legal Support Network",
        description: "Connect with IP lawyers and legal experts for enforcement."
      },
      {
        icon: ClipboardCheck,
        title: "Certificate Management",
        description: "Store and manage all IP certificates with renewal reminders."
      }
    ],
    benefits: [
      "Simplified registration process",
      "Legal protection in Indonesia",
      "Proof of ownership",
      "Infringement alerts",
      "Legal expert access",
      "Certificate storage"
    ],
    useCases: [
      {
        title: "New IP Registration",
        description: "Register your original characters, stories, and creative works."
      },
      {
        title: "Brand Protection",
        description: "Trademark your studio name, logos, and brand assets."
      },
      {
        title: "Enforcement",
        description: "Take action against unauthorized use of your protected IP."
      }
    ],
    cta: "Protect Your IP"
  }
};

export function generateStaticParams() {
  return Object.keys(featureData).map((slug) => ({ slug }));
}

function getColorClasses(color: string) {
  const colorMap: Record<string, { bg100: string; bg600: string; text600: string }> = {
    violet: { bg100: "bg-orange-100", bg600: "bg-orange-600", text600: "text-orange-600" },
    red: { bg100: "bg-red-100", bg600: "bg-red-600", text600: "text-red-600" },
    green: { bg100: "bg-green-100", bg600: "bg-green-600", text600: "text-green-600" },
    orange: { bg100: "bg-orange-100", bg600: "bg-orange-600", text600: "text-orange-600" },
    pink: { bg100: "bg-pink-100", bg600: "bg-pink-600", text600: "text-pink-600" },
    blue: { bg100: "bg-blue-100", bg600: "bg-blue-600", text600: "text-blue-600" },
  };
  return colorMap[color] || { bg100: "bg-gray-100", bg600: "bg-gray-600", text600: "text-gray-600" };
}

export default async function FeatureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const feature = featureData[slug];

  if (!feature) {
    notFound();
  }

  const Icon = feature.icon;
  const colorClasses = getColorClasses(feature.color);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-32">
        <div className="absolute inset-0 z-0">
          <Image
            src={feature.heroImage}
            alt={feature.title}
            fill
            className="object-cover"
            priority
          />
          <div className={`absolute inset-0 ${
            feature.color === "violet" ? "bg-gradient-to-r from-orange-900/90 to-orange-800/80" :
            feature.color === "red" ? "bg-gradient-to-r from-red-900/90 to-red-800/80" :
            feature.color === "green" ? "bg-gradient-to-r from-green-900/90 to-green-800/80" :
            feature.color === "orange" ? "bg-gradient-to-r from-orange-900/90 to-orange-800/80" :
            feature.color === "pink" ? "bg-gradient-to-r from-pink-900/90 to-pink-800/80" :
            feature.color === "blue" ? "bg-gradient-to-r from-blue-900/90 to-blue-800/80" :
            "bg-gradient-to-r from-gray-900/90 to-gray-800/80"
          }`} />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <span className="text-white/80 text-lg">{feature.subtitle}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {feature.title}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {feature.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth?tab=register">
                <Button size="xl" variant="white">
                  <Sparkles className="w-5 h-5" />
                  {feature.cta}
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="xl" variant="outlineLight">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Key Features
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Everything you need to {feature.title.toLowerCase()} your creative projects
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {feature.features.map((item) => {
              const ItemIcon = item.icon;
              return (
                <Card key={item.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${colorClasses.bg100} flex items-center justify-center mb-4`}>
                      <ItemIcon className={`w-6 h-6 ${colorClasses.text600}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose {feature.title}?
              </h2>
              <ul className="space-y-4">
                {feature.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full ${colorClasses.bg100} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Check className={`w-4 h-4 ${colorClasses.text600}`} />
                    </div>
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={feature.heroImage}
                alt={feature.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Use Cases
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            See how creators are using {feature.title}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {feature.useCases.map((useCase) => (
              <Card key={useCase.title} className="text-center">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{useCase.title}</h3>
                  <p className="text-gray-600">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-20 ${
        feature.color === "violet" ? "bg-gradient-to-br from-orange-600 to-orange-700" :
        feature.color === "red" ? "bg-gradient-to-br from-red-600 to-red-700" :
        feature.color === "green" ? "bg-gradient-to-br from-green-600 to-green-700" :
        feature.color === "orange" ? "bg-gradient-to-br from-orange-600 to-orange-700" :
        feature.color === "pink" ? "bg-gradient-to-br from-pink-600 to-pink-700" :
        feature.color === "blue" ? "bg-gradient-to-br from-blue-600 to-blue-700" :
        "bg-gradient-to-br from-gray-600 to-gray-700"
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started with {feature.title}?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start your free 14-day trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?tab=register">
              <Button size="xl" variant="white">
                <Sparkles className="w-5 h-5" />
                Start Free Trial
              </Button>
            </Link>
            <Link href="/features">
              <Button size="xl" variant="outlineLight">
                View All Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Other Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Explore Other Modules
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(featureData)
              .filter(([key]) => key !== slug)
              .map(([key, data]) => {
                const OtherIcon = data.icon;
                return (
                  <Link key={key} href={`/features/${key}`}>
                    <Button variant="outline" className="gap-2">
                      <OtherIcon className="w-4 h-4" />
                      {data.title}
                    </Button>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
