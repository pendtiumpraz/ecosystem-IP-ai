"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, Book, MessageCircle, Mail, ExternalLink,
  Clapperboard, Sparkles, Image, Video, CreditCard
} from "lucide-react";

const FAQS = [
  {
    q: "Bagaimana cara memulai project baru?",
    a: "Klik tombol '+ New Project' di halaman Projects, lalu isi detail project Anda."
  },
  {
    q: "Berapa credit yang dibutuhkan untuk generate AI?",
    a: "Text generation: 1-25 credits, Image: 5-25 credits, Video: 50-100 credits."
  },
  {
    q: "Bagaimana cara mendapatkan credit tambahan?",
    a: "Buka halaman Credits dan pilih paket yang sesuai dengan kebutuhan Anda."
  },
  {
    q: "Apakah hasil generate AI disimpan?",
    a: "Ya, semua hasil generasi disimpan di History dan bisa diakses kapan saja."
  },
  {
    q: "Bagaimana cara connect Google Drive?",
    a: "Buka Settings > Google Drive dan klik Connect untuk mengizinkan akses."
  },
];

const GUIDES = [
  { title: "Getting Started", desc: "Panduan dasar menggunakan MODO", icon: Book },
  { title: "Story Generation", desc: "Cara membuat cerita dengan AI", icon: Clapperboard },
  { title: "Character Design", desc: "Membuat karakter dengan AI", icon: Sparkles },
  { title: "Moodboard", desc: "Generate visual untuk project", icon: Image },
  { title: "Animation", desc: "Preview animasi dengan AI", icon: Video },
];

export default function HelpPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-violet-600" />
          Help Center
        </h1>
        <p className="text-gray-500">Butuh bantuan? Kami siap membantu Anda.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="hover:border-violet-300 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Book className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Documentation</h3>
              <p className="text-sm text-gray-500">Panduan lengkap</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-violet-300 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Live Chat</h3>
              <p className="text-sm text-gray-500">Chat dengan tim support</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-violet-300 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Email Support</h3>
              <p className="text-sm text-gray-500">support@modo.id</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="p-4 rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Guides */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Guides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {GUIDES.map((guide) => {
              const Icon = guide.icon;
              return (
                <button
                  key={guide.title}
                  className="w-full p-4 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-4 text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{guide.title}</h4>
                    <p className="text-sm text-gray-500">{guide.desc}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Contact Section */}
      <Card className="mt-8 bg-gradient-to-br from-violet-600 to-purple-700 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Masih butuh bantuan?</h2>
          <p className="text-violet-200 mb-6">Tim support kami siap membantu Anda 24/7</p>
          <div className="flex justify-center gap-4">
            <Button className="bg-white text-violet-600 hover:bg-gray-100">
              <MessageCircle className="w-4 h-4" />
              Start Chat
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              <Mail className="w-4 h-4" />
              Email Us
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
