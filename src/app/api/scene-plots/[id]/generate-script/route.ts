import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { callAI } from '@/lib/ai-providers';
import { checkCredits, deductCredits } from '@/lib/ai-generation';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get user's subscription tier
async function getUserTier(userId: string): Promise<"trial" | "creator" | "studio" | "enterprise"> {
  if (!userId) return "trial";
  const result = await sql`
    SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
  return (result[0]?.subscription_tier as "trial" | "creator" | "studio" | "enterprise") || "trial";
}

const SCRIPT_GENERATION_SYSTEM = `Kamu adalah penulis skenario profesional Indonesia. Tugas kamu adalah menulis naskah skenario untuk sebuah scene berdasarkan plot scene, daftar shot, dan informasi karakter.

TULIS DALAM FORMAT SKENARIO STANDAR:
- SCENE HEADING (INT./EXT. LOKASI - WAKTU)
- Action lines (present tense, deskripsi visual)
- NAMA KARAKTER (tengah, huruf kapital)
- Dialog (di bawah nama karakter)
- Parentheticals untuk catatan delivery (gunakan secukupnya)
- Transitions (CUT TO:, DISSOLVE TO:, dll.)

Naskah kamu harus:
1. Sesuai dengan emotional beat scene
2. Setia dengan kepribadian karakter
3. Memajukan cerita secara natural
4. Panjang sesuai durasi scene
5. Menyertakan deskripsi visual yang sesuai dengan shot list
6. Menggunakan dialog alami yang sesuai karakter

PENTING:
- Tulis dalam Bahasa Indonesia
- Gunakan dialog yang natural dan conversational
- Perhatikan dinamika antar karakter
- Buat action lines yang visual dan cinematik`;

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sceneId } = await params;
    const body = await request.json();
    const { userId, forceNewVersion } = body;

    // Get scene data with project context
    const scenes = await sql`
      SELECT sp.*, 
        p.title as project_title, 
        p.id as project_id,
        p.genre as project_genre,
        p.tone as project_tone,
        p.theme as project_theme,
        p.description as project_description
      FROM scene_plots sp
      JOIN projects p ON sp.project_id = p.id
      WHERE sp.id = ${sceneId}::uuid
    `;

    if (scenes.length === 0) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    const scene = scenes[0];

    // Get user tier
    const tier = await getUserTier(userId);
    const creditCost = 4; // Script generation is more expensive

    // Check credits if userId provided
    if (userId) {
      const hasCredits = await checkCredits(userId, creditCost);
      if (!hasCredits) {
        return NextResponse.json(
          { error: 'Insufficient credits', required: creditCost },
          { status: 402 }
        );
      }
    }

    // Get shots for this scene
    const shots = await sql`
      SELECT * FROM scene_shots
      WHERE scene_id = ${sceneId}::uuid AND deleted_at IS NULL
      ORDER BY shot_number
    `;

    // Get project characters
    const characters = await sql`
      SELECT id, name, description, personality, role, appearance
      FROM characters
      WHERE project_id = ${scene.project_id}::uuid
    `;

    // Build character personality context
    const characterContext = characters.length > 0
      ? characters.map(c =>
        `${c.name}${c.role ? ` (${c.role})` : ''}:
  Personality: ${c.personality || 'Not specified'}
  Appearance: ${c.appearance || 'Not specified'}`
      ).join('\n\n')
      : 'No character details available';

    // Build shot list context
    const shotContext = shots.length > 0
      ? shots.map(s =>
        `Shot ${s.shot_number}: ${s.camera_type} - ${s.action || s.framing || 'No action specified'}`
      ).join('\n')
      : 'No shot list available';

    const userPrompt = `KONTEKS IP PROJECT (WAJIB DIIKUTI):
- Judul Proyek: ${scene.project_title || 'Proyek Tanpa Judul'}
- Genre: ${scene.project_genre || 'Tidak ditentukan'} 
- Tone: ${scene.project_tone || 'Tidak ditentukan'}
- Theme: ${scene.project_theme || 'Tidak ditentukan'}

SCENE ${scene.scene_number}: ${scene.scene_title || scene.title || 'Scene Tanpa Judul'}

LOKASI: ${scene.scene_location || scene.location || 'LOKASI TIDAK DITENTUKAN'}
WAKTU: ${scene.scene_time?.toUpperCase() || scene.time_of_day?.toUpperCase() || 'SIANG'}

SINOPSIS SCENE (PLOT):
${scene.scene_description || scene.synopsis || 'Tidak ada sinopsis'}

EMOTIONAL BEAT: ${scene.emotional_beat || 'Tidak ditentukan'}

KARAKTER DALAM SCENE:
${scene.characters_present?.join(', ') || scene.characters_involved?.map((c: { name: string }) => c.name).join(', ') || 'Tidak ada karakter yang ditentukan'}

DETAIL KARAKTER:
${characterContext}

DAFTAR SHOT (referensi visual):
${shotContext}

DURASI SCENE: ~${scene.estimated_duration || 60} detik (target sekitar ${Math.round((scene.estimated_duration || 60) / 60 * 125)} kata)

INSTRUKSI:
1. Tulis script yang SESUAI dengan GENRE dan TONE dari IP Project
2. Scene heading (INT./EXT. LOKASI - WAKTU)
3. Deskripsi aksi yang cinematik dan visual
4. Dialog natural sesuai personality karakter
5. Parentheticals bila perlu
6. Buat singkat tapi impactful - sesuaikan dengan emotional beat`;

    // Call AI via unified provider system
    const aiResult = await callAI("text", userPrompt, {
      systemPrompt: SCRIPT_GENERATION_SYSTEM,
      maxTokens: 3000,
      temperature: 0.8,
      tier,
    });

    if (!aiResult.success || !aiResult.result) {
      return NextResponse.json(
        { error: aiResult.error || 'Failed to generate script' },
        { status: 500 }
      );
    }

    const scriptContent = aiResult.result.trim();

    // Create context snapshot for versioning
    const shotListString = shots.map(s => `${s.shot_number}:${s.action || ''}`).join('|');

    const contextSnapshot = {
      scene_plot_hash: crypto.createHash('md5').update(scene.synopsis || '').digest('hex'),
      shot_list_hash: crypto.createHash('md5').update(shotListString).digest('hex'),
      beat_id: scene.story_beat_id,
      scene_synopsis: scene.synopsis?.substring(0, 200)
    };

    // Get next version number
    const maxVersion = await sql`
      SELECT COALESCE(MAX(version_number), 0) as max_version
      FROM scene_script_versions WHERE scene_id = ${sceneId}::uuid
    `;
    const nextVersion = (maxVersion[0]?.max_version || 0) + 1;

    // Deactivate previous active version
    await sql`
      UPDATE scene_script_versions
      SET is_active = FALSE, updated_at = NOW()
      WHERE scene_id = ${sceneId}::uuid AND is_active = TRUE
    `;

    // Create new version
    const insertResult = await sql`
      INSERT INTO scene_script_versions (
        scene_id, version_number, script_content, context_snapshot,
        provider, model, credit_cost, prompt, is_active, is_manual_edit
      ) VALUES (
        ${sceneId}::uuid, 
        ${nextVersion}, 
        ${scriptContent},
        ${JSON.stringify(contextSnapshot)}::jsonb,
        ${aiResult.provider || 'unknown'}, 
        'deepseek-chat', 
        ${creditCost},
        ${userPrompt.substring(0, 500)},
        TRUE,
        FALSE
      )
      RETURNING *
    `;

    // Update scene status
    await sql`
      UPDATE scene_plots
      SET status = CASE 
        WHEN status IN ('plotted', 'shot_listed', 'storyboarded') THEN 'scripted'
        ELSE status
      END,
      updated_at = NOW()
      WHERE id = ${sceneId}::uuid
    `;

    // Deduct credits if userId provided
    if (userId) {
      await deductCredits(
        userId,
        creditCost,
        "text_generation",
        `script_${sceneId}_${Date.now()}`,
        `Script generation for scene`
      );
    }

    return NextResponse.json({
      success: true,
      version: insertResult[0],
      versionNumber: nextVersion,
      creditsUsed: creditCost,
      provider: aiResult.provider
    });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}
