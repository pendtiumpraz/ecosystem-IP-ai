import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { CONTACT_INFO } from "@/lib/constants";
import { FileText, Shield, CreditCard, AlertTriangle, Scale, Mail } from "lucide-react";

const sections = [
  { id: "acceptance", title: "Penerimaan Ketentuan", icon: FileText },
  { id: "services", title: "Deskripsi Layanan", icon: Shield },
  { id: "account", title: "Akun Pengguna", icon: CreditCard },
  { id: "ip", title: "Hak Kekayaan Intelektual", icon: Scale },
  { id: "usage", title: "Penggunaan yang Diizinkan", icon: AlertTriangle },
  { id: "contact", title: "Kontak", icon: Mail },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-violet-600 to-violet-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FileText className="w-16 h-16 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-violet-200">Last updated: December 15, 2025</p>
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
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-colors"
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
            {/* Section 1 */}
            <Card id="acceptance">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">1. Penerimaan Ketentuan</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Dengan mengakses dan menggunakan layanan MODO Creator Verse (&quot;Layanan&quot;), 
                  Anda setuju untuk terikat dengan Ketentuan Layanan ini. Jika Anda tidak setuju 
                  dengan ketentuan ini, mohon untuk tidak menggunakan Layanan kami.
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card id="services">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">2. Deskripsi Layanan</h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  MODO Creator Verse adalah platform pembuatan IP Bible berbasis AI yang menyediakan:
                </p>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Pembuatan cerita dan karakter menggunakan AI",
                    "Generasi gambar dan video preview",
                    "Manajemen proyek kreatif",
                    "Ekspor dokumen IP Bible",
                    "Fitur kolaborasi tim",
                    "Distribusi dan monetisasi konten"
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card id="account">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">3. Akun Pengguna</h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Untuk menggunakan Layanan, Anda harus:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: "Usia", desc: "Minimal 18 tahun atau memiliki izin dari wali" },
                    { title: "Informasi", desc: "Memberikan informasi yang akurat saat pendaftaran" },
                    { title: "Keamanan", desc: "Menjaga kerahasiaan kredensial akun" },
                    { title: "Tanggung Jawab", desc: "Bertanggung jawab atas semua aktivitas di akun Anda" }
                  ].map((item) => (
                    <div key={item.title} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card id="ip">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">4. Hak Kekayaan Intelektual</h2>
                </div>
                <div className="space-y-6">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Konten Anda</h3>
                    <p className="text-gray-600">
                      Anda mempertahankan semua hak atas konten yang Anda buat menggunakan Layanan kami. 
                      MODO tidak mengklaim kepemilikan atas karya kreatif Anda termasuk cerita, karakter, 
                      dan visual yang dihasilkan.
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Konten AI</h3>
                    <p className="text-gray-600">
                      Konten yang dihasilkan oleh AI berdasarkan input Anda adalah milik Anda sepenuhnya 
                      untuk penggunaan komersial maupun non-komersial, sesuai dengan batasan plan berlangganan Anda.
                    </p>
                  </div>
                  <div className="border-l-4 border-violet-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Properti MODO</h3>
                    <p className="text-gray-600">
                      Platform MODO, termasuk kode, desain, logo, dan konten editorial adalah 
                      properti MODO yang dilindungi hak cipta.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card id="usage">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">5. Penggunaan yang Dilarang</h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Anda setuju untuk TIDAK menggunakan Layanan untuk:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Membuat konten ilegal atau berbahaya",
                    "Melanggar hak kekayaan intelektual pihak ketiga",
                    "Menyebarkan malware atau konten berbahaya",
                    "Mengakses sistem tanpa izin",
                    "Membuat konten SARA, pornografi, atau kekerasan",
                    "Menjual kembali akses tanpa izin"
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 6 - Payment */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">6. Pembayaran & Langganan</h2>
                </div>
                <div className="bg-emerald-50 rounded-xl p-6">
                  <ul className="space-y-3">
                    {[
                      "Pembayaran dilakukan secara manual via transfer bank",
                      `Upgrade plan dengan menghubungi ${CONTACT_INFO.whatsapp.name} di ${CONTACT_INFO.whatsapp.number}`,
                      "Langganan berlaku untuk periode yang dibeli (bulanan/tahunan)",
                      "Refund tersedia dalam 7 hari pertama pembelian",
                      "Credit yang tidak terpakai tidak dapat di-refund"
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-gray-700">
                        <span className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 text-emerald-700 text-sm font-medium">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card id="contact" className="bg-gradient-to-br from-violet-500 to-indigo-600">
              <CardContent className="p-8 text-center">
                <Mail className="w-12 h-12 text-white/80 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Ada Pertanyaan?</h2>
                <p className="text-violet-200 mb-6">
                  Hubungi kami untuk pertanyaan tentang Ketentuan Layanan
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href={`mailto:${CONTACT_INFO.email}`} className="px-6 py-3 bg-white rounded-lg text-violet-600 font-medium hover:bg-violet-50 transition-colors">
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
