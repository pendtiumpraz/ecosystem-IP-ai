import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateText } from 'ai';
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from '@/lib/ai/providers';

const sql = neon(process.env.DATABASE_URL!);

// POST - Generate Universe Formula with AI
export async function POST(request: NextRequest) {
    try {
        const { userId, projectId, projectContext } = await request.json();

        if (!userId || !projectId) {
            return NextResponse.json(
                { error: 'userId and projectId are required' },
                { status: 400 }
            );
        }

        // Verify user owns project
        const project = await sql`
      SELECT id, title, genre, sub_genre, description FROM projects 
      WHERE id = ${projectId} AND user_id = ${userId} AND deleted_at IS NULL
    `;

        if (project.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
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
        const creditCost = (CREDIT_COSTS[selectedModel] || 1) * 2; // Double for full generation

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

Generate Universe Formula dengan semua field dalam format JSON:
{
  "universeName": "Nama universe yang memorable dan sesuai genre...",
  "period": "Era/periode waktu (contoh: 2045, Medieval, Ancient, dst)...",
  
  "workingOfficeSchool": "Deskripsi tempat kerja/sekolah utama di universe ini...",
  "townDistrictCity": "Deskripsi kota/distrik utama...",
  "neighborhoodEnvironment": "Deskripsi lingkungan sekitar...",
  
  "rulesOfWork": "Aturan kerja yang berlaku di universe ini...",
  "laborLaw": "Hukum ketenagakerjaan...",
  "country": "Negara/wilayah utama...",
  "governmentSystem": "Sistem pemerintahan...",
  
  "environmentLandscape": "Deskripsi pemandangan/lingkungan alam...",
  "societyAndSystem": "Struktur masyarakat dan sistemnya...",
  "privateInterior": "Suasana privat/interior rumah...",
  
  "sociopoliticEconomy": "Kondisi sosiopolitik dan ekonomi...",
  "socioculturalSystem": "Sistem sosial-budaya...",
  
  "houseCastle": "Deskripsi rumah/kastil utama karakter...",
  "roomCave": "Deskripsi kamar/ruang pribadi...",
  "familyInnerCircle": "Struktur keluarga/inner circle...",
  "kingdomTribeCommunal": "Kerajaan/suku/komunitas..."
}

IMPORTANT:
- Setiap field harus detail dan saling berkaitan
- Sesuaikan dengan genre ${projectGenre}
- Gunakan bahasa Indonesia
- Buat world-building yang immersive dan konsisten
- Return ONLY valid JSON, no markdown`;

        const model = getTextModel(selectedModel);
        const result = await generateText({
            model,
            prompt,
            maxTokens: 3000,
            temperature: 0.7,
        });

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
