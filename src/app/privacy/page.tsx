import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { CONTACT_INFO } from "@/lib/constants";
import { Shield, Database, Eye, Lock, Trash2, Globe, Mail, Cookie, Baby, RefreshCw } from "lucide-react";

const sections = [
  { id: "intro", title: "Pendahuluan", icon: Shield },
  { id: "collect", title: "Data yang Dikumpulkan", icon: Database },
  { id: "use", title: "Penggunaan Data", icon: Eye },
  { id: "security", title: "Keamanan", icon: Lock },
  { id: "rights", title: "Hak Anda", icon: RefreshCw },
  { id: "contact", title: "Kontak", icon: Mail },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-emerald-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-16 h-16 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-emerald-200">Last updated: December 15, 2025</p>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-8 bg-white border-b sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Intro */}
            <Card id="intro">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">1. Pendahuluan</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  MODO Creator Verse (&quot;kami&quot;, &quot;kita&quot;, atau &quot;MODO&quot;) berkomitmen untuk melindungi 
                  privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, 
                  dan melindungi informasi pribadi Anda saat menggunakan layanan kami.
                </p>
                <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
                  <p className="text-emerald-800 font-medium text-center">
                    🔒 Kami TIDAK menjual data pribadi Anda kepada pihak ketiga
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card id="collect">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">2. Data yang Kami Kumpulkan</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-sm">1</span>
                      Data yang Anda Berikan
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                        <span><strong>Akun:</strong> Nama, email, password</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                        <span><strong>Profil:</strong> Foto, bio, preferensi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                        <span><strong>Proyek:</strong> Cerita, karakter, konten</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                        <span><strong>Pembayaran:</strong> Bukti transfer</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 text-sm">2</span>
                      Data Otomatis
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2" />
                        <span><strong>Penggunaan:</strong> Fitur yang diakses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2" />
                        <span><strong>Teknis:</strong> IP, browser, device</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2" />
                        <span><strong>Cookies:</strong> Session, preferensi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2" />
                        <span><strong>Analytics:</strong> Performa (anonymous)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card id="use">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">3. Bagaimana Kami Menggunakan Data</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: "🎯", title: "Layanan", desc: "Menyediakan dan meningkatkan fitur" },
                    { icon: "💳", title: "Transaksi", desc: "Memproses pembayaran & langganan" },
                    { icon: "📧", title: "Komunikasi", desc: "Notifikasi dan update penting" },
                    { icon: "🛠️", title: "Support", desc: "Memberikan dukungan pelanggan" },
                    { icon: "📊", title: "Analisis", desc: "Meningkatkan produk" },
                    { icon: "🔒", title: "Keamanan", desc: "Mencegah penipuan" },
                  ].map((item) => (
                    <div key={item.title} className="p-4 bg-gray-50 rounded-xl text-center">
                      <span className="text-2xl mb-2 block">{item.icon}</span>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card id="security">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">4. Keamanan Data</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Lock, title: "Enkripsi", desc: "Data sensitif dienkripsi (password, API keys)" },
                    { icon: Globe, title: "HTTPS", desc: "Semua komunikasi terenkripsi SSL/TLS" },
                    { icon: Database, title: "Akses Terbatas", desc: "Database dengan akses termonitor" },
                    { icon: RefreshCw, title: "Backup", desc: "Backup rutin dan disaster recovery" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Rights */}
            <Card id="rights">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">5. Hak Privasi Anda</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Akses", desc: "Meminta salinan data pribadi Anda", color: "blue" },
                    { title: "Koreksi", desc: "Memperbaiki data yang tidak akurat", color: "green" },
                    { title: "Penghapusan", desc: "Meminta penghapusan akun dan data", color: "red" },
                    { title: "Portabilitas", desc: "Mengekspor data dalam format standar", color: "orange" },
                    { title: "Penolakan", desc: "Opt-out dari komunikasi marketing", color: "violet" },
                  ].map((item) => (
                    <div key={item.title} className={`flex items-center gap-4 p-4 bg-${item.color}-50 rounded-xl border-l-4 border-${item.color}-500`}>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Cookie className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">6. Cookies</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipe</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Tujuan</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Durasi</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b">
                        <td className="py-3 px-4"><span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Essential</span></td>
                        <td className="py-3 px-4 text-gray-600">Login, session, keamanan</td>
                        <td className="py-3 px-4 text-gray-600">Session</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Functional</span></td>
                        <td className="py-3 px-4 text-gray-600">Preferensi, bahasa</td>
                        <td className="py-3 px-4 text-gray-600">1 tahun</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Analytics</span></td>
                        <td className="py-3 px-4 text-gray-600">Penggunaan (anonymous)</td>
                        <td className="py-3 px-4 text-gray-600">2 tahun</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card id="contact" className="bg-gradient-to-br from-emerald-500 to-teal-600">
              <CardContent className="p-8 text-center">
                <Mail className="w-12 h-12 text-white/80 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Pertanyaan Privasi?</h2>
                <p className="text-emerald-100 mb-6">
                  Hubungi kami untuk pertanyaan atau menjalankan hak privasi Anda
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href={`mailto:${CONTACT_INFO.email}`} className="px-6 py-3 bg-white rounded-lg text-emerald-600 font-medium hover:bg-emerald-50 transition-colors">
                    {CONTACT_INFO.email}
                  </a>
                  <a href={CONTACT_INFO.whatsapp.url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white/20 rounded-lg text-white font-medium hover:bg-white/30 transition-colors">
                    WhatsApp: {CONTACT_INFO.whatsapp.number}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}

