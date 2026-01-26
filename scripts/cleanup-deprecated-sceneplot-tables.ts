/**
 * DEPRECATED TABLES CLEANUP SCRIPT
 * 
 * This script is for archiving/dropping the unused scene_plots and scene_shots tables
 * after the Scene Plot feature has been successfully migrated to use the 
 * animation_clips.scene_plot JSONB column instead.
 * 
 * WARNING: Run this only after verifying all data has been migrated successfully!
 * 
 * The new approach stores scene plot data directly in the animation_clips table:
 * - animation_clips.scene_plot (JSONB) - contains shots array
 * - animation_clips.scene_plot_preference (TEXT) - user preference for generation
 * 
 * These deprecated tables can be safely removed:
 * - scene_plots (was linked to story_versions)
 * - scene_shots (was linked to scene_plots)
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function cleanupDeprecatedTables() {
    console.log('===========================================');
    console.log('DEPRECATED SCENE PLOT TABLES CLEANUP');
    console.log('===========================================\n');

    try {
        // Check if tables exist
        const tableCheck = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('scene_plots', 'scene_shots')
        `;

        console.log('Found tables:', tableCheck.map(t => t.table_name));

        if (tableCheck.length === 0) {
            console.log('✅ No deprecated tables found. Nothing to clean up.');
            return;
        }

        // Check row counts before cleanup
        for (const table of tableCheck) {
            const countResult = await sql`
                SELECT COUNT(*) as count FROM ${sql(table.table_name)}
            `;
            console.log(`  - ${table.table_name}: ${countResult[0]?.count || 0} rows`);
        }

        // Prompt user for confirmation
        console.log('\n⚠️  WARNING: This will permanently delete these tables!');
        console.log('    Make sure all data has been migrated to animation_clips.scene_plot');
        console.log('\n    To proceed, uncomment the DROP statements below and run again.\n');

        // UNCOMMENT THESE LINES TO ACTUALLY DROP THE TABLES
        // ============================================================
        // 
        // // Drop scene_shots first (has FK to scene_plots)
        // if (tableCheck.some(t => t.table_name === 'scene_shots')) {
        //     await sql`DROP TABLE IF EXISTS scene_shots CASCADE`;
        //     console.log('✅ Dropped scene_shots table');
        // }
        // 
        // // Drop scene_plots
        // if (tableCheck.some(t => t.table_name === 'scene_plots')) {
        //     await sql`DROP TABLE IF EXISTS scene_plots CASCADE`;
        //     console.log('✅ Dropped scene_plots table');
        // }
        // 
        // console.log('\n✅ Cleanup complete!');
        // ============================================================

        console.log('Dry run complete. No tables were dropped.');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    }
}

cleanupDeprecatedTables()
    .then(() => {
        console.log('\n✅ Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
