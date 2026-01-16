import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function runMigration() {
    console.log('Running Animation Versions Migration...');

    try {
        // Create enums if not exist
        await sql`
            DO $$ BEGIN
                CREATE TYPE animation_version_status AS ENUM ('draft', 'generating', 'completed', 'failed');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `;
        console.log('✓ animation_version_status enum ready');

        await sql`
            DO $$ BEGIN
                CREATE TYPE animation_clip_status AS ENUM ('pending', 'prompt_ready', 'queued', 'processing', 'completed', 'failed');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `;
        console.log('✓ animation_clip_status enum ready');

        await sql`
            DO $$ BEGIN
                CREATE TYPE transition_type AS ENUM ('none', 'fade', 'dissolve', 'wipe', 'zoom', 'slide', 'blur');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `;
        console.log('✓ transition_type enum ready');

        await sql`
            DO $$ BEGIN
                CREATE TYPE camera_motion AS ENUM ('static', 'orbit', 'zoom_in', 'zoom_out', 'pan_left', 'pan_right', 'pan_up', 'pan_down', 'ken_burns', 'parallax');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `;
        console.log('✓ camera_motion enum ready');

        // Create animation_versions table
        await sql`
            CREATE TABLE IF NOT EXISTS animation_versions (
                id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
                moodboard_id VARCHAR(36) NOT NULL,
                version_number INTEGER NOT NULL DEFAULT 1,
                name VARCHAR(255),
                
                default_duration INTEGER DEFAULT 6,
                default_fps INTEGER DEFAULT 25,
                default_resolution VARCHAR(20) DEFAULT '1920x1080',
                generate_audio BOOLEAN DEFAULT false,
                
                transition_type transition_type DEFAULT 'fade',
                transition_duration DECIMAL(3,1) DEFAULT 0.5,
                
                effect_preset JSONB,
                
                status animation_version_status DEFAULT 'draft',
                total_clips INTEGER DEFAULT 0,
                completed_clips INTEGER DEFAULT 0,
                
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW(),
                deleted_at TIMESTAMP
            );
        `;
        console.log('✓ animation_versions table created');

        // Create animation_clips table
        await sql`
            CREATE TABLE IF NOT EXISTS animation_clips (
                id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
                animation_version_id VARCHAR(36) NOT NULL REFERENCES animation_versions(id) ON DELETE CASCADE,
                moodboard_item_id VARCHAR(36),
                
                beat_key VARCHAR(100),
                beat_label VARCHAR(255),
                clip_order INTEGER NOT NULL DEFAULT 0,
                
                source_image_url TEXT NOT NULL,
                key_action_description TEXT,
                
                video_prompt TEXT,
                negative_prompt TEXT,
                
                duration INTEGER DEFAULT 6,
                fps INTEGER DEFAULT 25,
                resolution VARCHAR(20) DEFAULT '1920x1080',
                
                camera_motion camera_motion DEFAULT 'static',
                camera_angle VARCHAR(100),
                
                video_url TEXT,
                thumbnail_url TEXT,
                preview_gif_url TEXT,
                
                job_id VARCHAR(255),
                eta_seconds INTEGER,
                
                status animation_clip_status DEFAULT 'pending',
                error_message TEXT,
                generation_cost INTEGER,
                
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;
        console.log('✓ animation_clips table created');

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_animation_versions_moodboard ON animation_versions(moodboard_id);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_animation_versions_deleted ON animation_versions(deleted_at) WHERE deleted_at IS NULL;`;
        await sql`CREATE INDEX IF NOT EXISTS idx_animation_clips_version ON animation_clips(animation_version_id);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_animation_clips_item ON animation_clips(moodboard_item_id);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_animation_clips_beat ON animation_clips(beat_key);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_animation_clips_status ON animation_clips(status);`;
        console.log('✓ Indexes created');

        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
