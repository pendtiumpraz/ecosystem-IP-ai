import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTACT_INFO } from "@/lib/constants";
import { Check, Clock, Shield, Zap } from "lucide-react";

export default function SLAPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <article className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Service Level Agreement</h1>
          <p className="text-gray-500 mb-8">Last updated: December 15, 2025</p>

          {/* SLA Overview Cards */}
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">99%</h3>
                <p className="text-gray-600">Uptime Guarantee</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">&lt;24h</h3>
                <p className="text-gray-600">Support Response</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">&lt;5s</h3>
                <p className="text-gray-600">API Response Time</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Daily</h3>
                <p className="text-gray-600">Data Backup</p>
              </CardContent>
            </Card>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2>1. Definisi</h2>
            <ul>
              <li><strong>Uptime:</strong> Persentase waktu Layanan tersedia dan dapat diakses</li>
              <li><strong>Downtime:</strong> Periode ketika Layanan tidak dapat diakses</li>
              <li><strong>Scheduled Maintenance:</strong> Pemeliharaan terjadwal yang diumumkan sebelumnya</li>
              <li><strong>Incident:</strong> Gangguan yang mempengaruhi ketersediaan Layanan</li>
            </ul>

            <h2>2. Uptime Guarantee</h2>
            <h3>2.1 Target Uptime</h3>
            <p>
              MODO berkomitmen untuk menyediakan uptime minimum <strong>99%</strong> per bulan kalender, tidak termasuk Scheduled Maintenance.
            </p>

            <h3>2.2 Pengukuran</h3>
            <p>
              Uptime dihitung sebagai:
            </p>
            <pre className="bg-gray-100 p-4 rounded-lg">
              Uptime % = ((Total Menit - Downtime Menit) / Total Menit) × 100
            </pre>

            <h3>2.3 Pengecualian</h3>
            <p>Downtime tidak termasuk:</p>
            <ul>
              <li>Scheduled Maintenance (diumumkan 24 jam sebelumnya)</li>
              <li>Gangguan pihak ketiga (AI providers, cloud providers)</li>
              <li>Force majeure (bencana alam, perang, dll)</li>
              <li>Serangan DDoS atau security incidents</li>
              <li>Masalah koneksi internet pengguna</li>
            </ul>

            <h2>3. Kompensasi</h2>
            <p>
              Jika uptime bulanan di bawah target, pengguna berbayar berhak atas kompensasi berupa credit tambahan:
            </p>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Uptime</th>
                  <th className="text-left">Kompensasi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>99% - 99.9%</td>
                  <td>Tidak ada</td>
                </tr>
                <tr>
                  <td>95% - 98.9%</td>
                  <td>10% credit tambahan</td>
                </tr>
                <tr>
                  <td>90% - 94.9%</td>
                  <td>25% credit tambahan</td>
                </tr>
                <tr>
                  <td>&lt;90%</td>
                  <td>50% credit tambahan</td>
                </tr>
              </tbody>
            </table>

            <h2>4. Support Response Time</h2>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Prioritas</th>
                  <th className="text-left">Deskripsi</th>
                  <th className="text-left">Response Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="text-red-600 font-medium">Critical</span></td>
                  <td>Layanan down, tidak bisa diakses</td>
                  <td>&lt;2 jam</td>
                </tr>
                <tr>
                  <td><span className="text-orange-600 font-medium">High</span></td>
                  <td>Fitur utama tidak berfungsi</td>
                  <td>&lt;8 jam</td>
                </tr>
                <tr>
                  <td><span className="text-yellow-600 font-medium">Medium</span></td>
                  <td>Fitur minor bermasalah</td>
                  <td>&lt;24 jam</td>
                </tr>
                <tr>
                  <td><span className="text-green-600 font-medium">Low</span></td>
                  <td>Pertanyaan umum, feedback</td>
                  <td>&lt;48 jam</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-gray-500">
              * Response time dihitung pada jam kerja (Senin-Jumat, 09:00-18:00 WIB)
            </p>

            <h2>5. API Performance</h2>
            <h3>5.1 Response Time</h3>
            <ul>
              <li><strong>Standard API:</strong> &lt;500ms (p95)</li>
              <li><strong>Text Generation:</strong> &lt;5 detik untuk respon pertama</li>
              <li><strong>Image Generation:</strong> &lt;30 detik</li>
              <li><strong>Video Generation:</strong> &lt;5 menit</li>
            </ul>

            <h3>5.2 Rate Limits</h3>
            <ul>
              <li><strong>Trial:</strong> 10 requests/menit</li>
              <li><strong>Premium:</strong> 30 requests/menit</li>
              <li><strong>Pro:</strong> 60 requests/menit</li>
              <li><strong>Unlimited:</strong> 120 requests/menit</li>
            </ul>

            <h2>6. Data Protection</h2>
            <h3>6.1 Backup</h3>
            <ul>
              <li>Database backup: Harian</li>
              <li>File storage backup: Harian</li>
              <li>Retention: 30 hari</li>
              <li>Recovery Point Objective (RPO): &lt;24 jam</li>
              <li>Recovery Time Objective (RTO): &lt;4 jam</li>
            </ul>

            <h3>6.2 Data Center</h3>
            <ul>
              <li>Primary: AWS Singapore (ap-southeast-1)</li>
              <li>Database: Neon PostgreSQL (US East)</li>
              <li>CDN: Vercel Edge Network (Global)</li>
            </ul>

            <h2>7. Maintenance Windows</h2>
            <ul>
              <li><strong>Scheduled:</strong> Sabtu/Minggu, 02:00-06:00 WIB</li>
              <li><strong>Emergency:</strong> Sesuai kebutuhan dengan notifikasi</li>
              <li><strong>Notice:</strong> Minimal 24 jam sebelumnya via email</li>
            </ul>

            <h2>8. Incident Management</h2>
            <h3>8.1 Komunikasi</h3>
            <ul>
              <li>Status page: status.modo.creator</li>
              <li>Email notification untuk incident major</li>
              <li>WhatsApp group untuk pelanggan Enterprise</li>
            </ul>

            <h3>8.2 Post-Incident</h3>
            <ul>
              <li>Root Cause Analysis dalam 48 jam</li>
              <li>Preventive measures documentation</li>
              <li>Kompensasi jika applicable</li>
            </ul>

            <h2>9. Klaim Kompensasi</h2>
            <p>Untuk mengajukan klaim kompensasi:</p>
            <ol>
              <li>Hubungi support dalam 7 hari setelah incident</li>
              <li>Sertakan tanggal, waktu, dan deskripsi gangguan</li>
              <li>Klaim akan diproses dalam 14 hari kerja</li>
            </ol>

            <h2>10. Kontak</h2>
            <ul>
              <li><strong>Technical Support:</strong> {CONTACT_INFO.email}</li>
              <li><strong>Emergency:</strong> {CONTACT_INFO.whatsapp.number} (WhatsApp)</li>
              <li><strong>Status Page:</strong> status.modo.creator</li>
            </ul>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}

