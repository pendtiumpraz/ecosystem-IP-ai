import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  UNSPLASH_IMAGES, 
  FEATURES, 
  HOW_IT_WORKS, 
  PRICING_PLANS, 
  AI_MODELS,
  CONTACT_INFO 
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { 
  Clapperboard, Play, TrendingUp, ShoppingBag, Users, Shield,
  Lightbulb, Sparkles, Pencil, FileText, Check, X, ArrowRight,
  Star, Quote, MessageCircle
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Clapperboard, Play, TrendingUp, ShoppingBag, Users, Shield,
  Lightbulb, Sparkles, Pencil, FileText
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={UNSPLASH_IMAGES.hero.main}
            alt="Film Production"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 text-violet-300 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered IP Creation Platform
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Transform Your Vision Into{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Production-Ready IP Bibles
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              From script to screen in minutes. Generate characters, create worlds, 
              build stories, and distribute to your audience. All powered by the latest AI models.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/auth?tab=register">
                <Button size="xl" className="w-full sm:w-auto">
                  <Sparkles className="w-5 h-5" />
                  Start Free 14-Day Trial
                </Button>
              </Link>
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                2 AI generations free
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 mb-8">Trusted by Creative Studios Worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50">
            {["Studio A", "Studio B", "Studio C", "Studio D", "Studio E"].map((studio) => (
              <div key={studio} className="text-xl font-bold text-gray-400">
                {studio}
              </div>
            ))}
          </div>
          <p className="mt-8 text-violet-600 font-medium">
            Used by 500+ creators in Indonesia
          </p>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Creating IP Bibles Shouldn&apos;t Take Months
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Traditional IP creation is slow, expensive, and fragmented. MODO changes everything.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Old Way */}
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-red-900">The Old Way</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "3-6 months to complete",
                    "$10,000+ in costs",
                    "Multiple freelancers needed",
                    "Scattered files everywhere",
                    "Manual everything",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-red-700">
                      <X className="w-4 h-4 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* MODO Way */}
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-900">The MODO Way</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Complete in days, not months",
                    "Start from Rp 349k/month",
                    "All-in-one platform",
                    "Organized IP Bible",
                    "AI-assisted creation",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-green-700">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Create IPs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Six powerful modules covering the entire IP lifecycle, from creation to monetization.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => {
              const Icon = iconMap[feature.icon];
              return (
                <Link key={feature.id} href={feature.href}>
                  <Card className="group h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={UNSPLASH_IMAGES.features[feature.image as keyof typeof UNSPLASH_IMAGES.features]}
                        alt={feature.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                          {Icon && <Icon className="w-5 h-5 text-white" />}
                        </div>
                        <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-gray-600">{feature.description}</p>
                      <div className="mt-4 flex items-center text-violet-600 font-medium group-hover:gap-2 transition-all">
                        Learn more <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How MODO Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From idea to IP Bible in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, index) => {
              const Icon = iconMap[step.icon];
              return (
                <div key={step.step} className="relative">
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-violet-300 to-indigo-300" />
                  )}
                  <div className="relative flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-6 relative z-10">
                      {Icon && <Icon className="w-10 h-10 text-violet-600" />}
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="py-20 bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powered by Latest AI Models
            </h2>
            <p className="text-xl text-violet-200 max-w-2xl mx-auto">
              We use the best AI for each task, automatically selecting the optimal model
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(AI_MODELS).map(([category, models]) => (
              <Card key={category} className="bg-white/10 border-white/20 backdrop-blur">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white capitalize mb-4">
                    {category === "text" ? "Text Generation" : 
                     category === "image" ? "Image Generation" :
                     category === "video" ? "Video Generation" : "Audio Generation"}
                  </h3>
                  <ul className="space-y-2">
                    {models.map((model) => (
                      <li key={model} className="flex items-center gap-2 text-violet-200">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        {model}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Creators Are Saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Budi Santoso",
                role: "Creative Director, Studio XYZ",
                quote: "MODO helped us create our IP Bible in just 3 days instead of 3 months. Incredible!",
              },
              {
                name: "Sarah Chen",
                role: "Indie Filmmaker",
                quote: "From concept to full IP Bible in 2 weeks. The AI understands creative vision perfectly.",
              },
              {
                name: "Reza Pratama",
                role: "Animation Director",
                quote: "The character generation is amazing. It captures personality and visual style exactly as I imagined.",
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="bg-white">
                <CardContent className="p-8">
                  <Quote className="w-10 h-10 text-violet-200 mb-4" />
                  <p className="text-gray-700 mb-6">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400" />
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex mt-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade when you&apos;re ready
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRICING_PLANS.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-2 border-violet-500 shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold text-gray-900">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900">
                          {formatCurrency(plan.price)}
                        </span>
                        <span className="text-gray-500">{plan.period}</span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-sm text-violet-600">
                        +{plan.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                  <Link href={plan.id === 'unlimited' ? `https://wa.me/62${CONTACT_INFO.whatsapp.number}` : '/auth?tab=register'}>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-violet-600 font-medium hover:underline">
              Compare all plans in detail →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 z-0">
          <Image
            src={UNSPLASH_IMAGES.cta.studio}
            alt="Creative Studio"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 to-indigo-900/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Creative Process?
          </h2>
          <p className="text-xl text-violet-200 mb-10">
            Join 500+ creators already using MODO to build their IPs
          </p>
          <Link href="/auth?tab=register">
            <Button size="xl" className="bg-white text-violet-900 hover:bg-gray-100">
              <Sparkles className="w-5 h-5" />
              Start Your Free 14-Day Trial
            </Button>
          </Link>
          <p className="mt-6 text-violet-300 text-sm">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-violet-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <h3 className="text-xl font-bold">Need help or want to upgrade?</h3>
              <p className="text-violet-200">Contact {CONTACT_INFO.whatsapp.name} for assistance</p>
            </div>
            <a 
              href={CONTACT_INFO.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100">
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
