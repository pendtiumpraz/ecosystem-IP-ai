import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CONTACT_INFO } from "@/lib/constants";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <article className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: December 15, 2025</p>

          <div className="prose prose-lg max-w-none">
            <h2>1. Pendahuluan</h2>
            <p>
              MODO Creator Verse (&quot;kami&quot;, &quot;kita&quot;, atau &quot;MODO&quot;) berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
            </p>

            <h2>2. Informasi yang Kami Kumpulkan</h2>
            <h3>2.1 Informasi yang Anda Berikan</h3>
            <ul>
              <li><strong>Data Akun:</strong> Nama, email, password (terenkripsi)</li>
              <li><strong>Data Profil:</strong> Foto profil, bio, preferensi</li>
              <li><strong>Data Proyek:</strong> Cerita, karakter, dan konten kreatif yang Anda buat</li>
              <li><strong>Data Pembayaran:</strong> Bukti transfer, metode pembayaran</li>
            </ul>

            <h3>2.2 Informasi yang Dikumpulkan Otomatis</h3>
            <ul>
              <li><strong>Data Penggunaan:</strong> Fitur yang digunakan, frekuensi akses</li>
              <li><strong>Data Teknis:</strong> IP address, browser, device info</li>
              <li><strong>Cookies:</strong> Session, preferensi, analytics</li>
            </ul>

            <h2>3. Bagaimana Kami Menggunakan Informasi</h2>
            <p>Kami menggunakan informasi Anda untuk:</p>
            <ul>
              <li>Menyediakan dan meningkatkan Layanan</li>
              <li>Memproses transaksi dan langganan</li>
              <li>Mengirim notifikasi dan update penting</li>
              <li>Memberikan dukungan pelanggan</li>
              <li>Menganalisis penggunaan untuk peningkatan produk</li>
              <li>Mencegah penipuan dan penyalahgunaan</li>
              <li>Mematuhi kewajiban hukum</li>
            </ul>

            <h2>4. Berbagi Informasi</h2>
            <p>Kami TIDAK menjual data pribadi Anda. Kami hanya membagikan informasi dengan:</p>
            <ul>
              <li><strong>Penyedia Layanan:</strong> Cloud hosting (Vercel, Neon), payment processors</li>
              <li><strong>AI Providers:</strong> OpenAI, Google, Anthropic (untuk proses generasi)</li>
              <li><strong>Otoritas Hukum:</strong> Jika diwajibkan oleh hukum</li>
            </ul>
            <p>
              <strong>Catatan:</strong> Data prompt yang dikirim ke AI providers tidak menyertakan informasi identitas pribadi.
            </p>

            <h2>5. Keamanan Data</h2>
            <p>Kami menerapkan langkah keamanan:</p>
            <ul>
              <li>Enkripsi data sensitif (password, API keys)</li>
              <li>HTTPS untuk semua komunikasi</li>
              <li>Akses database terbatas dan termonitor</li>
              <li>Backup rutin dan disaster recovery</li>
              <li>Security audit berkala</li>
            </ul>

            <h2>6. Hak Privasi Anda</h2>
            <p>Anda memiliki hak untuk:</p>
            <ul>
              <li><strong>Akses:</strong> Meminta salinan data pribadi Anda</li>
              <li><strong>Koreksi:</strong> Memperbaiki data yang tidak akurat</li>
              <li><strong>Penghapusan:</strong> Meminta penghapusan akun dan data</li>
              <li><strong>Portabilitas:</strong> Mengekspor data dalam format standar</li>
              <li><strong>Penolakan:</strong> Opt-out dari komunikasi marketing</li>
            </ul>

            <h2>7. Retensi Data</h2>
            <ul>
              <li><strong>Data Akun:</strong> Selama akun aktif + 30 hari setelah penghapusan</li>
              <li><strong>Data Proyek:</strong> Selama akun aktif</li>
              <li><strong>Log Aktivitas:</strong> 90 hari</li>
              <li><strong>Data Pembayaran:</strong> 5 tahun (kewajiban pajak)</li>
            </ul>

            <h2>8. Cookies dan Tracking</h2>
            <p>Kami menggunakan cookies untuk:</p>
            <ul>
              <li><strong>Essential:</strong> Login, session, keamanan</li>
              <li><strong>Functional:</strong> Preferensi, bahasa</li>
              <li><strong>Analytics:</strong> Penggunaan dan performa (anonymized)</li>
            </ul>
            <p>Anda dapat mengelola cookies melalui pengaturan browser.</p>

            <h2>9. Konten yang Dihasilkan AI</h2>
            <p>
              Prompt dan konten yang Anda kirim untuk generasi AI:
            </p>
            <ul>
              <li>Tidak digunakan untuk training model pihak ketiga</li>
              <li>Tidak dibagikan dengan pengguna lain</li>
              <li>Disimpan terenkripsi di server kami</li>
              <li>Dapat dihapus bersama dengan penghapusan proyek</li>
            </ul>

            <h2>10. Anak-anak</h2>
            <p>
              Layanan kami tidak ditujukan untuk anak di bawah 18 tahun. Kami tidak secara sengaja mengumpulkan data dari anak-anak. Jika Anda adalah orang tua dan menemukan anak Anda menggunakan Layanan, hubungi kami.
            </p>

            <h2>11. Transfer Internasional</h2>
            <p>
              Data Anda mungkin diproses di server yang berlokasi di luar Indonesia (cloud providers). Kami memastikan penyedia memiliki standar keamanan yang memadai.
            </p>

            <h2>12. Perubahan Kebijakan</h2>
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini. Perubahan signifikan akan diberitahukan via email atau notifikasi di platform.
            </p>

            <h2>13. Kontak</h2>
            <p>
              Untuk pertanyaan tentang privasi atau menjalankan hak Anda:
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
