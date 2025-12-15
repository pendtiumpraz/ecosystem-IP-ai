import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CONTACT_INFO } from "@/lib/constants";

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <article className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: December 15, 2025</p>

          <div className="prose prose-lg max-w-none">
            <h2>1. Penerimaan Ketentuan</h2>
            <p>
              Dengan mengakses dan menggunakan layanan MODO Creator Verse (&quot;Layanan&quot;), Anda setuju untuk terikat dengan Ketentuan Layanan ini. Jika Anda tidak setuju dengan ketentuan ini, mohon untuk tidak menggunakan Layanan kami.
            </p>

            <h2>2. Deskripsi Layanan</h2>
            <p>
              MODO Creator Verse adalah platform pembuatan IP Bible berbasis AI yang menyediakan:
            </p>
            <ul>
              <li>Pembuatan cerita dan karakter menggunakan AI</li>
              <li>Generasi gambar dan video preview</li>
              <li>Manajemen proyek kreatif</li>
              <li>Ekspor dokumen IP Bible</li>
              <li>Fitur kolaborasi tim</li>
            </ul>

            <h2>3. Akun Pengguna</h2>
            <p>
              Untuk menggunakan Layanan, Anda harus:
            </p>
            <ul>
              <li>Berusia minimal 18 tahun atau memiliki izin dari wali</li>
              <li>Memberikan informasi yang akurat saat pendaftaran</li>
              <li>Menjaga kerahasiaan kredensial akun</li>
              <li>Bertanggung jawab atas semua aktivitas di akun Anda</li>
            </ul>

            <h2>4. Hak Kekayaan Intelektual</h2>
            <h3>4.1 Konten Anda</h3>
            <p>
              Anda mempertahankan semua hak atas konten yang Anda buat menggunakan Layanan kami. MODO tidak mengklaim kepemilikan atas karya kreatif Anda termasuk cerita, karakter, dan visual yang dihasilkan.
            </p>
            <h3>4.2 Konten yang Dihasilkan AI</h3>
            <p>
              Konten yang dihasilkan oleh AI berdasarkan input Anda adalah milik Anda sepenuhnya untuk penggunaan komersial maupun non-komersial, sesuai dengan batasan plan berlangganan Anda.
            </p>
            <h3>4.3 Properti MODO</h3>
            <p>
              Platform MODO, termasuk kode, desain, logo, dan konten editorial adalah properti MODO yang dilindungi hak cipta.
            </p>

            <h2>5. Penggunaan yang Diizinkan</h2>
            <p>Anda setuju untuk TIDAK menggunakan Layanan untuk:</p>
            <ul>
              <li>Membuat konten ilegal, berbahaya, atau melanggar hukum</li>
              <li>Melanggar hak kekayaan intelektual pihak ketiga</li>
              <li>Menyebarkan malware atau konten berbahaya</li>
              <li>Mengakses sistem tanpa izin</li>
              <li>Membuat konten SARA, pornografi, atau kekerasan</li>
              <li>Menjual kembali akses ke Layanan tanpa izin</li>
            </ul>

            <h2>6. Pembayaran dan Langganan</h2>
            <ul>
              <li>Pembayaran dilakukan secara manual via transfer bank</li>
              <li>Upgrade plan dengan menghubungi {CONTACT_INFO.whatsapp.name} di {CONTACT_INFO.whatsapp.number}</li>
              <li>Langganan berlaku untuk periode yang dibeli (bulanan/tahunan)</li>
              <li>Refund tersedia dalam 7 hari pertama pembelian</li>
              <li>Credit yang tidak terpakai tidak dapat di-refund atau dipindahkan</li>
            </ul>

            <h2>7. Batasan Layanan</h2>
            <ul>
              <li>Layanan disediakan &quot;as is&quot; tanpa jaminan tertentu</li>
              <li>Kami berhak membatasi atau menghentikan akses jika melanggar ketentuan</li>
              <li>Uptime dijamin 99% (lihat SLA untuk detail)</li>
              <li>Hasil AI bervariasi dan tidak dijamin akurasi 100%</li>
            </ul>

            <h2>8. Pembatasan Tanggung Jawab</h2>
            <p>
              MODO tidak bertanggung jawab atas:
            </p>
            <ul>
              <li>Kerugian tidak langsung atau konsekuensial</li>
              <li>Kehilangan data akibat kelalaian pengguna</li>
              <li>Penggunaan konten yang melanggar hukum oleh pengguna</li>
              <li>Gangguan layanan di luar kendali kami</li>
            </ul>

            <h2>9. Penghentian</h2>
            <p>
              Kami berhak menghentikan atau menangguhkan akun Anda jika:
            </p>
            <ul>
              <li>Melanggar Ketentuan Layanan ini</li>
              <li>Tidak melakukan pembayaran sesuai jadwal</li>
              <li>Aktivitas yang mencurigakan atau berbahaya terdeteksi</li>
            </ul>

            <h2>10. Perubahan Ketentuan</h2>
            <p>
              Kami dapat memperbarui Ketentuan Layanan ini sewaktu-waktu. Perubahan material akan diberitahukan via email atau notifikasi di platform. Penggunaan berkelanjutan setelah perubahan berarti penerimaan ketentuan baru.
            </p>

            <h2>11. Hukum yang Berlaku</h2>
            <p>
              Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Sengketa akan diselesaikan melalui arbitrase di Jakarta.
            </p>

            <h2>12. Kontak</h2>
            <p>
              Untuk pertanyaan tentang Ketentuan Layanan ini, hubungi:
            </p>
            <ul>
              <li>Email: {CONTACT_INFO.email}</li>
              <li>WhatsApp: {CONTACT_INFO.whatsapp.number}</li>
            </ul>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
