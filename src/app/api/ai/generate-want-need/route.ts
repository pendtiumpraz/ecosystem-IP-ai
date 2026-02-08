import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { callAI } from "@/lib/ai-providers";
import { checkCredits, deductCredits } from "@/lib/ai-generation";

const sql = neon(process.env.DATABASE_URL!);

// Get user's subscription tier
async function getUserTier(userId: string): Promise<"trial" | "creator" | "studio" | "enterprise"> {
  if (!userId) return "trial";
  const result = await sql`
        SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
    `;
  return (result[0]?.subscription_tier as "trial" | "creator" | "studio" | "enterprise") || "trial";
}

const WANT_NEED_V2_SYSTEM = `Kamu adalah story consultant profesional yang ahli dalam character motivation dan character arc.
Tugasmu adalah membuat Want/Need Matrix V2 yang menggambarkan JOURNEY karakter melalui cerita.

PENTING: SEMUA OUTPUT HARUS DALAM BAHASA INDONESIA!

KONSEP WANT vs NEED:
- WANT = Keinginan EKSTERNAL yang DISADARI karakter (goal yang terlihat)
- NEED = Kebutuhan INTERNAL yang TIDAK DISADARI karakter (pertumbuhan batin)

STRUKTUR WANT/NEED MATRIX V2:

WANT STAGES (Journey Keinginan Eksternal):
1. MENGINGINKAN - Apa yang karakter inginkan di awal cerita? (concrete, visible, external)
2. MEMASTIKAN - Bagaimana karakter berkomitmen mengejar keinginan ini?
3. MENGEJAR - Aksi-aksi apa yang karakter lakukan untuk mencapainya?
4. TERCAPAI - Apakah keinginan ini tercapai di akhir? (true/false)

NEED STAGES (Journey Kebutuhan Internal):
1. MEMBUTUHKAN - Apa yang karakter BUTUHKAN tapi tidak sadari? (internal growth)
2. MENEMUKAN - Bagaimana karakter menemukan kebenaran tentang dirinya?
3. MENERIMA - Bagaimana karakter menerima/embrace perubahan ini?
4. TERPENUHI - Apakah kebutuhan internal terpenuhi? (true/false)

ENDING TYPES (berdasarkan kombinasi):
- Want ✓ + Need ✓ = Happy Ending (dapat yang diinginkan DAN bertumbuh)
- Want ✗ + Need ✓ = Bittersweet (tidak dapat goal, tapi bertumbuh)
- Want ✓ + Need ✗ = Hollow Victory (dapat goal, tapi kosong)
- Want ✗ + Need ✗ = Tragic (gagal di keduanya)

OUTPUT FORMAT - Return ONLY valid JSON:
{
  "wantStages": {
    "menginginkan": "<apa yang karakter inginkan di awal - BAHASA INDONESIA>",
    "memastikan": "<bagaimana karakter berkomitmen - BAHASA INDONESIA>",
    "mengejar": "<aksi yang dilakukan - BAHASA INDONESIA>",
    "tercapai": <true/false berdasarkan ending type>
  },
  "needStages": {
    "membutuhkan": "<kebutuhan internal yang tidak disadari - BAHASA INDONESIA>",
    "menemukan": "<bagaimana menemukan kebenaran - BAHASA INDONESIA>",
    "menerima": "<bagaimana menerima perubahan - BAHASA INDONESIA>",
    "terpenuhi": <true/false berdasarkan ending type>
  },
  "endingType": "<happy|bittersweet|hollow|tragic>",
  "endingDescription": "<penjelasan ending dalam BAHASA INDONESIA>"
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      userId,
      // Story context
      synopsis,
      premise,
      genre,
      theme,
      tone,
      description,
      // Story structure for context
      storyStructure,
      structureBeats,
      // Ending preference (optional)
      preferredEnding
    } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // Get user tier
    const tier = await getUserTier(userId);
    const creditCost = 3;

    // Check credits
    if (userId) {
      const hasCredits = await checkCredits(userId, creditCost);
      if (!hasCredits) {
        return NextResponse.json(
          { error: 'Insufficient credits', required: creditCost },
          { status: 402 }
        );
      }
    }

    // Build user prompt with all context
    const userPrompt = `Generate Want/Need Matrix V2 untuk cerita ini:

=== IP PROJECT CONTEXT ===
${premise ? `PREMISE: ${premise}` : ''}
${synopsis ? `SYNOPSIS: ${synopsis}` : ''}
${description ? `DESCRIPTION: ${description}` : ''}
GENRE: ${genre || 'Tidak ditentukan'}
THEME: ${theme || 'Tidak ditentukan'}
TONE: ${tone || 'Tidak ditentukan'}

${storyStructure ? `STORY STRUCTURE: ${storyStructure}` : ''}
${structureBeats ? `STORY BEATS: ${JSON.stringify(structureBeats)}` : ''}

${preferredEnding ? `PREFERRED ENDING TYPE: ${preferredEnding}` : 'Tentukan ending type yang paling sesuai dengan cerita.'}

INSTRUKSI:
1. Analisis cerita dan tentukan WANT (keinginan eksternal) karakter utama
2. Tentukan NEED (kebutuhan internal) yang tidak disadari karakter
3. Buat journey untuk masing-masing (menginginkan→memastikan→mengejar→tercapai dan membutuhkan→menemukan→menerima→terpenuhi)
4. Sesuaikan tercapai/terpenuhi dengan ending type yang paling cocok
5. SEMUA output dalam BAHASA INDONESIA

Return ONLY valid JSON tanpa markdown.`;

    // Call AI
    const aiResult = await callAI("text", userPrompt, {
      systemPrompt: WANT_NEED_V2_SYSTEM,
      maxTokens: 2000,
      temperature: 0.7,
      tier,
    });

    if (!aiResult.success || !aiResult.result) {
      return NextResponse.json(
        { error: aiResult.error || "Failed to generate Want/Need matrix" },
        { status: 500 }
      );
    }

    // Parse JSON from response
    let result: Record<string, unknown> = {};
    try {
      const cleanedText = aiResult.result
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse Want/Need response:", e);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Deduct credits
    if (userId) {
      await deductCredits(userId, creditCost, 'want-need-generation', projectId, 'Generate Want/Need Matrix V2');
    }

    return NextResponse.json({
      wantStages: result.wantStages || {},
      needStages: result.needStages || {},
      endingType: result.endingType || null,
      endingDescription: result.endingDescription || null,
      creditCost,
    });
  } catch (error) {
    console.error("Want/Need generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate Want/Need matrix" },
      { status: 500 }
    );
  }
}
