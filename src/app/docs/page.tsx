import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Book, Search, Sparkles, PlayCircle, FileText, Settings, CreditCard,
  Users, Palette, Video, Globe, Shield, MessageSquare, ArrowRight,
  Zap, BookOpen, Code, HelpCircle, ExternalLink
} from "lucide-react";

const quickStart = [
  {
    icon: PlayCircle,
    title: "Getting Started",
    description: "Create your first project in 5 minutes",
    href: "/docs/getting-started",
    time: "5 min",
  },
  {
    icon: FileText,
    title: "Story Formula",
    description: "Learn how to generate compelling stories",
    href: "/docs/story-formula",
    time: "10 min",
  },
  {
    icon: Users,
    title: "Character Design",
    description: "Create memorable characters with AI",
    href: "/docs/characters",
    time: "8 min",
  },
  {
    icon: Palette,
    title: "Moodboards",
    description: "Generate visual moodboards for your story",
    href: "/docs/moodboards",
    time: "6 min",
  },
];

const categories = [
  {
    icon: Book,
    title: "Guides",
    description: "Step-by-step tutorials for all features",
    articles: 24,
    color: "violet",
    topics: ["Project Setup", "Story Writing", "Character Creation", "World Building", "Export & Share"],
  },
  {
    icon: Sparkles,
    title: "AI Features",
    description: "Master AI-powered generation tools",
    articles: 18,
    color: "blue",
    topics: ["Synopsis Generation", "Structure Beats", "Character Profiles", "Image Generation", "Video Preview"],
  },
  {
    icon: CreditCard,
    title: "Billing & Plans",
    description: "Manage subscriptions and credits",
    articles: 12,
    color: "green",
    topics: ["Pricing Plans", "Credit System", "Upgrade Process", "Payment Methods", "Invoices"],
  },
  {
    icon: Settings,
    title: "Account Settings",
    description: "Configure your account and preferences",
    articles: 15,
    color: "orange",
    topics: ["Profile Settings", "Security", "Notifications", "API Keys", "Team Management"],
  },
  {
    icon: Code,
    title: "API Reference",
    description: "Integrate MODO into your workflow",
    articles: 20,
    color: "red",
    topics: ["Authentication", "Projects API", "AI Generation API", "Webhooks", "Rate Limits"],
  },
  {
    icon: HelpCircle,
    title: "Troubleshooting",
    description: "Common issues and solutions",
    articles: 16,
    color: "gray",
    topics: ["Common Errors", "Generation Issues", "Payment Problems", "Account Recovery", "Contact Support"],
  },
];

const popularArticles = [
  { title: "How to generate a complete story structure", views: "12.5K", category: "AI Features" },
  { title: "Understanding the credit system", views: "8.2K", category: "Billing" },
  { title: "Best practices for character design prompts", views: "7.8K", category: "AI Features" },
  { title: "Exporting your IP Bible as PDF", views: "6.4K", category: "Guides" },
  { title: "Setting up team collaboration", views: "5.1K", category: "Settings" },
  { title: "Using your own API keys (BYOK)", views: "4.9K", category: "API" },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-violet-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Book className="w-16 h-16 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Documentation
          </h1>
          <p className="text-xl text-violet-200 mb-8">
            Everything you need to master MODO Creator Verse
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search documentation..."
              className="pl-12 h-14 text-lg rounded-xl border-0 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Start</h2>
              <p className="text-gray-600">Get up and running in minutes</p>
            </div>
            <Link href="/docs/getting-started">
              <Button variant="outline">
                View All Tutorials
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStart.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                          <Icon className="w-6 h-6 text-violet-600" />
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {item.time}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Card key={cat.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-${cat.color}-100 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${cat.color}-600`} />
                      </div>
                      <span className="text-sm text-gray-500">{cat.articles} articles</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{cat.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{cat.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                        >
                          {topic}
                        </span>
                      ))}
                      {cat.topics.length > 3 && (
                        <span className="text-xs px-2 py-1 text-gray-500">
                          +{cat.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Articles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {popularArticles.map((article, index) => (
              <Link key={article.title} href="/docs/article">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate hover:text-violet-600 transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{article.category}</span>
                        <span>•</span>
                        <span>{article.views} views</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Video className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Video Tutorials</h2>
            <p className="text-gray-400">Learn by watching step-by-step video guides</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Complete Beginner's Guide", duration: "15:32", thumbnail: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=225&fit=crop" },
              { title: "Mastering Story Structure", duration: "12:45", thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=225&fit=crop" },
              { title: "Advanced AI Prompting", duration: "18:20", thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop" },
            ].map((video) => (
              <Card key={video.title} className="bg-gray-800 border-gray-700 overflow-hidden group cursor-pointer">
                <div className="relative aspect-video">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
                    {video.duration}
                  </span>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-white">{video.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              View All Videos
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-violet-500 to-indigo-600">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-white/80 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Still Have Questions?</h2>
              <p className="text-violet-200 mb-6">
                Our support team is here to help you succeed
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100">
                    Contact Support
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Join Community
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
