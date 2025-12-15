import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRICING_PLANS, CONTACT_INFO } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Check, X, Sparkles, MessageCircle, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Bagaimana cara upgrade plan?",
    a: "Hubungi Galih Praz via WhatsApp untuk upgrade plan. Pembayaran dilakukan manual via transfer bank.",
  },
  {
    q: "Apakah ada refund jika tidak puas?",
    a: "Ya, kami menawarkan refund 100% dalam 7 hari pertama jika tidak puas dengan layanan.",
  },
  {
    q: "Apa yang terjadi setelah trial berakhir?",
    a: "Akun akan otomatis downgrade ke Free dengan fitur terbatas. Data project tetap tersimpan.",
  },
  {
    q: "Bisakah menggunakan API key sendiri (BYOK)?",
    a: "Ya, fitur BYOK tersedia di plan Unlimited. Anda bisa menggunakan API key OpenAI, Anthropic, dll sendiri.",
  },
  {
    q: "Apakah ada diskon untuk pembayaran tahunan?",
    a: "Ya, pembayaran tahunan mendapat diskon 20%. Hubungi tim sales untuk info lebih lanjut.",
  },
  {
    q: "Bagaimana sistem credit bekerja?",
    a: "Setiap AI generation menggunakan credit. Text generation ~1 credit, image ~5 credits, video ~50 credits.",
  },
];

const comparisonFeatures = [
  { name: "AI Credits per Month", trial: "2x only", premium: "400", pro: "1,500", unlimited: "6,000" },
  { name: "Projects", trial: "1", premium: "5", pro: "20", unlimited: "50" },
  { name: "Storage", trial: "50MB", premium: "2GB", pro: "10GB", unlimited: "50GB" },
  { name: "Video Generation", trial: false, premium: false, pro: "20/month", unlimited: "50/month" },
  { name: "Team Members", trial: "1", premium: "1", pro: "5", unlimited: "10" },
  { name: "PDF Export", trial: false, premium: true, pro: true, unlimited: true },
  { name: "Watermark-free", trial: false, premium: true, pro: true, unlimited: true },
  { name: "Watch Module", trial: false, premium: false, pro: true, unlimited: true },
  { name: "Invest Module", trial: false, premium: false, pro: true, unlimited: true },
  { name: "BYOK (Own API Keys)", trial: false, premium: false, pro: false, unlimited: true },
  { name: "API Access", trial: false, premium: false, pro: false, unlimited: true },
  { name: "Priority Support", trial: false, premium: false, pro: true, unlimited: true },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-violet-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent{" "}
            <span className="text-violet-600">Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? "border-2 border-violet-500 shadow-xl scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
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
                  <p className="text-gray-500 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-start gap-2 text-sm">
                        <X className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={
                      plan.id === "unlimited"
                        ? CONTACT_INFO.whatsapp.url
                        : "/auth?tab=register"
                    }
                    target={plan.id === "unlimited" ? "_blank" : undefined}
                  >
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Compare Plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium text-gray-500">Feature</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">Trial</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">Premium</th>
                  <th className="text-center py-4 px-4 font-medium text-violet-600">Pro</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">Unlimited</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature) => (
                  <tr key={feature.name} className="border-b">
                    <td className="py-4 px-4 text-gray-700">{feature.name}</td>
                    <td className="text-center py-4 px-4">
                      {typeof feature.trial === "boolean" ? (
                        feature.trial ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-600">{feature.trial}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {typeof feature.premium === "boolean" ? (
                        feature.premium ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-600">{feature.premium}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4 bg-violet-50">
                      {typeof feature.pro === "boolean" ? (
                        feature.pro ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-violet-600 font-medium">{feature.pro}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {typeof feature.unlimited === "boolean" ? (
                        feature.unlimited ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-600">{feature.unlimited}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-violet-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <h3 className="text-xl font-bold">Ada pertanyaan tentang pricing?</h3>
              <p className="text-violet-200">Hubungi {CONTACT_INFO.whatsapp.name} untuk konsultasi gratis</p>
            </div>
            <a href={CONTACT_INFO.whatsapp.url} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="white">
                <MessageCircle className="w-5 h-5" />
                Chat WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
