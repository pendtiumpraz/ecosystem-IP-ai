const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function check() {
    const sql = neon(process.env.DATABASE_URL);

    // Check moodboards
    const moodboards = await sql`
        SELECT id, version_name, art_style, created_at
        FROM moodboards 
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 5
    `;
    console.log("=== Moodboards ===");
    console.log(JSON.stringify(moodboards, null, 2));

    if (moodboards.length > 0) {
        // Check items with images for first moodboard
        const moodboardId = moodboards[0].id;
        console.log("\n=== Moodboard Items (first moodboard) ===");

        const items = await sql`
            SELECT id, beat_key, beat_label, beat_index, key_action_index,
                   CASE WHEN image_url IS NOT NULL THEN 'HAS_IMAGE' ELSE 'NO_IMAGE' END as has_image
            FROM moodboard_items
            WHERE moodboard_id = ${moodboardId}
            ORDER BY beat_index, key_action_index
        `;
        console.log(`Total items: ${items.length}`);
        console.log(`Items with images: ${items.filter(i => i.has_image === 'HAS_IMAGE').length}`);
    }

    // Check animation versions
    const animVersions = await sql`
        SELECT id, name, moodboard_id, total_clips, completed_clips, status
        FROM animation_versions
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 5
    `;
    console.log("\n=== Animation Versions ===");
    console.log(JSON.stringify(animVersions, null, 2));

    if (animVersions.length > 0) {
        const animId = animVersions[0].id;
        const clips = await sql`
            SELECT 
                ac.id, ac.beat_key as "beatKey", ac.beat_label as "beatLabel", 
                ac.source_image_url as "sourceImageUrl", ac.status, ac.clip_order
            FROM animation_clips ac
            WHERE ac.animation_version_id = ${animId}
            ORDER BY ac.clip_order ASC
        `;
        console.log("\n=== Animation Clips ===");
        console.log(`Total clips: ${clips.length}`);
        console.log("First 10:");
        clips.slice(0, 10).forEach((c, i) => {
            console.log(`${i + 1}. [order:${c.clip_order}] ${c.beatLabel} - ${c.sourceImageUrl ? 'HAS_IMG' : 'NO_IMG'} - ${c.status}`);
        });
    }
}

check().catch(console.error);
