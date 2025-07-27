import dotenv from 'dotenv';
import databaseManager from './src/utils/database.mjs';

// Load environment variables
try {
    dotenv.config({ path: './.env.local' });
    console.log('✅ Loaded .env.local');
} catch (error) {
    console.log('⚠️ No .env.local found, trying .env');
    try {
        dotenv.config();
        console.log('✅ Loaded .env');
    } catch (error2) {
        console.log('⚠️ No .env file found, using environment variables');
    }
}

async function runMigrations() {
    try {
        console.log('🔄 Starting migration process...');
        console.log('📊 Environment:', process.env.NODE_ENV || 'production');
        console.log('🔗 DATABASE_URL exists:', !!process.env.DATABASE_URL);

        if (process.env.DATABASE_URL) {
            console.log('🔗 DATABASE_URL preview:', process.env.DATABASE_URL.substring(0, 20) + '...');
        }

        // Connect to database
        const knex = await databaseManager.getKnex();
        console.log('✅ Database connected');

        // Check current tables
        try {
            const tables = await knex.raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
            console.log('📋 Current tables:', tables.rows.map(row => row.tablename));
        } catch (error) {
            console.log('⚠️ Could not check current tables:', error.message);
        }

        // Run migrations
        console.log('🔄 Running migrations...');
        await databaseManager.runMigrations();
        console.log('✅ Migrations completed');

        // Check tables after migrations
        try {
            const tablesAfter = await knex.raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
            console.log('📋 Tables after migrations:', tablesAfter.rows.map(row => row.tablename));
        } catch (error) {
            console.log('⚠️ Could not check tables after migrations:', error.message);
        }

        // Run seeds
        console.log('🌱 Running seeds...');
        await databaseManager.runSeeds();
        console.log('✅ Seeds completed');

        // Verify data
        try {
            const users = await knex('users').select('id', 'name', 'email');
            console.log('👥 Users in database:', users.length);
            if (users.length > 0) {
                console.log('📋 Sample users:', users.slice(0, 3));
            }
        } catch (error) {
            console.log('⚠️ Could not verify users:', error.message);
        }

        console.log('🎉 Migration process completed successfully!');

    } catch (error) {
        console.error('❌ Migration process failed:', error.message);
        console.error('🔍 Error details:', error.stack);
        process.exit(1);
    } finally {
        await databaseManager.disconnect();
        process.exit(0);
    }
}

// Run the migration process
runMigrations(); 