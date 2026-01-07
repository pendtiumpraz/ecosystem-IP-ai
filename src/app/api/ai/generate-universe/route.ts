import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateText } from 'ai';
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from '@/lib/ai/providers';

const sql = neon(process.env.DATABASE_URL!);

// All 18 required fields for universe
const REQUIRED_FIELDS = [
    'universeName', 'period', 'roomCave', 'houseCastle', 'privateInterior',
    'familyInnerCircle', 'neighborhoodEnvironment', 'townDistrictCity',
    'workingOfficeSchool', 'country', 'governmentSystem', 'laborLaw',
    'rulesOfWork', 'societyAndSystem', 'socioculturalSystem',
    'environmentLandscape', 'sociopoliticEconomy', 'kingdomTribeCommunal'
];

// POST - Generate Universe Formula with AI
export async function POST(request: NextRequest) {
    try {
        const { userId, projectId, storyVersionId, projectContext } = await request.json();

        if (!userId || !projectId) {
            return NextResponse.json(
                { error: 'userId and projectId are required' },
                { status: 400 }
            );
        }

        // Get project info
        const project = await sql`
          SELECT id, title, genre, sub_genre, description FROM projects 
          WHERE id = ${projectId} AND user_id = ${userId} AND deleted_at IS NULL
        `;

        if (project.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Get characters for ethnicity/background context
        // Note: Character data is stored as nested JSON in physiological, sociocultural, etc.
        const characters = await sql`
          SELECT name, role, physiological, sociocultural
          FROM characters 
          WHERE project_id = ${projectId} AND deleted_at IS NULL
          LIMIT 10
        `;

        // Get story version for premise/theme context
        let storyContext = '';
        if (storyVersionId) {
            const storyVersion = await sql`
              SELECT premise, synopsis, genre, theme, tone 
              FROM story_versions 
              WHERE id = ${storyVersionId} AND deleted_at IS NULL
            `;
            if (storyVersion.length > 0) {
                const sv = storyVersion[0];
                storyContext = `
STORY CONTEXT:
- Premise: ${sv.premise || 'N/A'}
- Synopsis: ${sv.synopsis?.substring(0, 300) || 'N/A'}
- Story Genre: ${sv.genre || 'N/A'}
- Theme: ${sv.theme || 'N/A'}
- Tone: ${sv.tone || 'N/A'}`;
            }
        }

        // Build character context - extract from nested JSON
        let characterContext = '';
        if (characters.length > 0) {
            characterContext = `
CHARACTER CONTEXT:
${characters.map((c: any) => {
                const physio = c.physiological || {};
                const socio = c.sociocultural || {};
                return `- ${c.name} (${c.role || 'Unknown'}): Ethnicity: ${physio.ethnicity || 'N/A'}, Culture: ${socio.cultureTradition || 'N/A'}, Language: ${socio.language || 'N/A'}`;
            }).join('\n')}`;
        }

        // Check user credits
        const userResult = await sql`
          SELECT subscription_tier, credit_balance FROM users WHERE id = ${userId} AND deleted_at IS NULL
        `;

        if (userResult.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const creditBalance = userResult[0].credit_balance || 0;
        const selectedModel = DEFAULT_MODELS.synopsis as TextModelId;
        const creditCost = (CREDIT_COSTS[selectedModel] || 1) * 3; // Triple for full universe generation

        if (creditBalance < creditCost) {
            return NextResponse.json(
                { error: 'Insufficient credits', required: creditCost, balance: creditBalance },
                { status: 402 }
            );
        }

        const projectTitle = project[0].title;
        const projectGenre = project[0].genre || 'N/A';
        const projectSubGenre = project[0].sub_genre || 'N/A';
        const projectDescription = project[0].description || '';

        const prompt = `Anda adalah world-builder profesional untuk IP (Intellectual Property) project. Generate Universe Formula lengkap untuk project berikut.

PROJECT INFO:
- Title: ${projectTitle}
- Genre: ${projectGenre}
- Sub-Genre: ${projectSubGenre}
- Description: ${projectDescription}
${projectContext ? `- Additional Context: ${projectContext}` : ''}
${storyContext}
${characterContext}

PENTING: Generate Universe Formula dengan SEMUA 18 field berikut dalam format JSON.
Setiap field harus diisi dengan detail yang konsisten dengan genre, cerita, dan latar belakang karakter.

{
  "universeName": "Nama universe yang memorable dan sesuai genre (1-3 kata)",
  "period": "Era/periode waktu (contoh: 2045, Medieval Era, Kerajaan Majapahit 1350, dst)",
  
  "roomCave": "Deskripsi ruangan/kamar pribadi karakter utama, suasana, dekorasi (2-3 kalimat)",
  "houseCastle": "Deskripsi rumah/istana/tempat tinggal utama, arsitektur, kondisi (2-3 kalimat)",
  "privateInterior": "Suasana interior privat, pencahayaan, aroma, nuansa emosional (2-3 kalimat)",
  
  "familyInnerCircle": "Struktur keluarga atau lingkaran dalam protagonis, hubungan penting (2-3 kalimat)",
  
  "neighborhoodEnvironment": "Lingkungan sekitar tempat tinggal, tetangga, aktivitas harian (2-3 kalimat)",
  
  "townDistrictCity": "Kota/distrik/desa tempat cerita berlangsung, karakteristik, landmark (2-3 kalimat)",
  "workingOfficeSchool": "Tempat kerja/sekolah/aktivitas utama karakter, suasana, aturan (2-3 kalimat)",
  
  "country": "Negara/kerajaan/wilayah besar, geografis, hubungan dengan wilayah lain (2-3 kalimat)",
  "governmentSystem": "Sistem pemerintahan, struktur kekuasaan, pemimpin (2-3 kalimat)",
  
  "laborLaw": "Hukum ketenagakerjaan/aturan kerja formal, hak pekerja, jam kerja (2-3 kalimat)",
  "rulesOfWork": "Norma kerja tidak tertulis, kebiasaan, etika profesi (2-3 kalimat)",
  
  "societyAndSystem": "Struktur sosial, kelas/kasta, mobilitas sosial (2-3 kalimat)",
  "socioculturalSystem": "Budaya, tradisi, festival, kepercayaan yang mempengaruhi karakter (2-3 kalimat)",
  
  "environmentLandscape": "Pemandangan alam, cuaca, flora fauna, kondisi geografis (2-3 kalimat)",
  "sociopoliticEconomy": "Kondisi politik-ekonomi, mata uang, perdagangan, konflik ekonomi (2-3 kalimat)",
  "kingdomTribeCommunal": "Kerajaan/suku/komunitas besar yang berpengaruh, aliansi, rivalitas (2-3 kalimat)"
}

RULES:
- WAJIB ISI SEMUA 18 FIELDS - tidak boleh ada yang kosong
- Setiap field 2-3 kalimat dalam Bahasa Indonesia
- Sesuaikan dengan etnis dan latar belakang karakter
- Consistent dengan genre ${projectGenre} dan cerita
- Buat world-building yang immersive dan saling terhubung
- Return ONLY valid JSON, no markdown code blocks`;

        const model = getTextModel(selectedModel);
        const result = await generateText({
            model,
            prompt,
            maxTokens: 12000,
            temperature: 0.7,
        });

        // Validate all fields exist
        try {
            let jsonText = result.text;
            // Remove markdown code blocks if present
            if (jsonText.includes('```')) {
                jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            }
            const parsed = JSON.parse(jsonText);
            const missingFields = REQUIRED_FIELDS.filter(f => !parsed[f]?.trim());
            if (missingFields.length > 0) {
                console.warn('Missing universe fields:', missingFields);
            }
        } catch (e) {
            console.warn('Could not validate universe JSON:', e);
        }

        // Deduct credits
        await sql`
          UPDATE users SET credit_balance = credit_balance - ${creditCost}, updated_at = NOW()
          WHERE id = ${userId}
        `;

        // Log transaction
        await sql`
          INSERT INTO credit_transactions (user_id, amount, balance_after, description, type)
          VALUES (${userId}, -${creditCost}, ${creditBalance - creditCost}, 'AI generation for universe formula', 'usage')
        `;

        // Log AI generation
        await sql`
          INSERT INTO ai_generation_logs (user_id, project_id, generation_type, prompt, result_text, credits_used, status)
          VALUES (${userId}, ${projectId}, 'universe_formula', ${prompt.substring(0, 500)}, ${result.text.substring(0, 5000)}, ${creditCost}, 'completed')
        `;

        return NextResponse.json({
            success: true,
            content: result.text,
            creditsUsed: creditCost,
            remainingCredits: creditBalance - creditCost
        });
    } catch (error: any) {
        console.error('Universe formula generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate universe formula: ' + (error.message || String(error)) },
            { status: 500 }
        );
    }
}

