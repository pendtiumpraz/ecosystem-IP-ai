import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UNSPLASH_IMAGES, FEATURES } from "@/lib/constants";
import {
  Clapperboard, Play, TrendingUp, ShoppingBag, Users, Shield,
  ArrowRight, Sparkles, Check
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Clapperboard, Play, TrendingUp, ShoppingBag, Users, Shield,
};

const detailedFeatures = [
  {
    id: "studio",
    title: "Studio",
    subtitle: "AI-Powered IP Bible Creation",
    description: "Create complete IP Bibles with AI assistance. Generate stories, characters, worlds, and visual assets all in one place.",
    image: UNSPLASH_IMAGES.features.studio,
    icon: "Clapperboard",
    features: [
      "Story Formula Generator (Hero's Journey, Save the Cat, etc.)",
      "AI Synopsis & Script Generation",
      "Character Designer with personality profiles",
      "World Building & Universe Creation",
      "Moodboard Generation per story beat",
      "Animation Preview Generation",
      "PDF Export for pitching",
    ],
  },
  {
    id: "watch",
    title: "Watch",
    subtitle: "Content Distribution Platform",
    description: "Showcase your content with a Netflix-like experience. Stream episodes, build audience, and track engagement.",
    image: UNSPLASH_IMAGES.features.watch,
    icon: "Play",
    features: [
      "Video hosting & streaming",
      "Episode management",
      "Audience analytics",
      "Subscription-based access",
      "Multi-platform distribution",
      "Engagement tracking",
    ],
  },
  {
    id: "invest",
    title: "Invest",
    subtitle: "Crowdfunding & Revenue Sharing",
    description: "Fund your projects through community investment. Transparent revenue sharing and investor rewards system.",
    image: UNSPLASH_IMAGES.features.invest,
    icon: "TrendingUp",
    features: [
      "Project crowdfunding campaigns",
      "Transparent budget allocation",
      "Revenue sharing contracts",
      "Investor dashboard",
      "Milestone tracking",
      "Legal documentation",
    ],
  },
  {
    id: "license",
    title: "License",
    subtitle: "IP Monetization & Licensing",
    description: "Monetize your IP through merchandise, licensing deals, and royalty management.",
    image: UNSPLASH_IMAGES.features.license,
    icon: "ShoppingBag",
    features: [
      "Merchandise store integration",
      "Licensing deal management",
      "Royalty tracking",
      "Contract templates",
      "Partner network",
      "Revenue analytics",
    ],
  },
  {
    id: "fandom",
    title: "Fandom",
    subtitle: "Community Engagement",
    description: "Build and engage your community with forums, fan art galleries, and exclusive content.",
    image: UNSPLASH_IMAGES.features.fandom,
    icon: "Users",
    features: [
      "Community forums",
      "Fan art galleries",
      "Exclusive content access",
      "Creator-fan interaction",
      "Events & meetups",
      "Rewards program",
    ],
  },
  {
    id: "haki",
    title: "HAKI",
    subtitle: "IP Protection & Registration",
    description: "Protect your intellectual property with integrated HAKI registration and tracking for Indonesian creators.",
    image: UNSPLASH_IMAGES.features.haki,
    icon: "Shield",
    features: [
      "HAKI registration assistance",
      "IP documentation",
      "Ownership verification",
      "Infringement monitoring",
      "Legal support network",
      "Certificate management",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to Create,{" "}
            <span className="text-orange-600">Protect & Monetize</span> Your IP
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Six powerful modules covering the entire IP lifecycle, from creation to distribution and monetization.
          </p>
          <Link href="/auth?tab=register">
            <Button size="xl">
              <Sparkles className="w-5 h-5" />
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-32">
            {detailedFeatures.map((feature, index) => {
              const Icon = iconMap[feature.icon];
              const isEven = index % 2 === 0;
              return (
                <div
                  key={feature.id}
                  className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} gap-12 items-center`}
                >
                  {/* Image */}
                  <div className="flex-1 w-full">
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-6 left-6 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                          {Icon && <Icon className="w-6 h-6 text-white" />}
                        </div>
                        <span className="text-2xl font-bold text-white">{feature.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-orange-600 font-medium mb-2">{feature.subtitle}</p>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h2>
                    <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                    <ul className="space-y-3 mb-8">
                      {feature.features.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={`/features/${feature.id}`}>
                      <Button variant="outline">
                        Learn More <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-600 to-amber-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Creative Process?
          </h2>
          <p className="text-xl text-orange-200 mb-8">
            Start with a free 14-day trial. No credit card required.
          </p>
          <Link href="/auth?tab=register">
            <Button size="xl" variant="white">
              <Sparkles className="w-5 h-5" />
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

