import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UNSPLASH_IMAGES, CONTACT_INFO } from "@/lib/constants";
import { Sparkles, Target, Heart, Zap, Users, Award, Globe } from "lucide-react";

const stats = [
  { label: "Creators", value: "500+", icon: Users },
  { label: "Projects Created", value: "2,000+", icon: Award },
  { label: "AI Generations", value: "50,000+", icon: Zap },
  { label: "Countries", value: "10+", icon: Globe },
];

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "Empowering Indonesian creators to compete globally with AI-powered tools.",
  },
  {
    icon: Heart,
    title: "Creator-First",
    description: "Every feature we build starts with creator needs and feedback.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Constantly integrating the latest AI models to give creators an edge.",
  },
];

const team = [
  {
    name: "Galih Praz",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  },
  {
    name: "Rofiq Achmad",
    role: "CTO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    name: "Maya Putri",
    role: "Head of Product",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
  {
    name: "Budi Santoso",
    role: "Head of AI",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-32">
        <div className="absolute inset-0 z-0">
          <Image
            src={UNSPLASH_IMAGES.about.team}
            alt="Team"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 to-indigo-900/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Democratizing IP Creation{" "}
            <span className="text-orange-300">for Everyone</span>
          </h1>
          <p className="text-xl text-orange-200 max-w-3xl mx-auto">
            We believe every creator deserves access to professional-grade tools. 
            MODO makes IP Bible creation accessible, affordable, and powered by the latest AI.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 -mt-16 relative z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="text-center">
                  <CardContent className="p-6">
                    <Icon className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-gray-500">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  MODO was born from a simple observation: creating professional IP Bibles 
                  was too expensive and time-consuming for independent creators in Indonesia.
                </p>
                <p>
                  Traditional IP development requires hiring multiple specialists - 
                  writers, artists, researchers - and takes months to complete. 
                  We knew AI could change this.
                </p>
                <p>
                  In 2024, we launched MODO with a mission to democratize IP creation. 
                  By leveraging the latest AI models, we&apos;ve helped hundreds of Indonesian 
                  creators bring their stories to life in days, not months.
                </p>
                <p>
                  Today, MODO is the leading AI-powered IP creation platform in Indonesia, 
                  trusted by independent creators and professional studios alike.
                </p>
              </div>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src={UNSPLASH_IMAGES.about.office}
                alt="Office"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title}>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Meet the Team</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            A passionate team of creators, engineers, and AI enthusiasts building the future of IP creation.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <Card key={member.name} className="text-center">
                <CardContent className="p-6">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-orange-600 text-sm">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-600 to-amber-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-orange-200 mb-8">
            Start creating your IP Bible today and become part of our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?tab=register">
              <Button size="xl" variant="white">
                <Sparkles className="w-5 h-5" />
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="xl" variant="outlineLight">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

