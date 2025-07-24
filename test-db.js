// test-db.js - Test MariaDB connection
const knex = require('knex');
const knexConfig = require('./knexfile.cjs');

async function testConnection() {
    try {
        console.log('🔌 Testing MariaDB connection...');

        const config = knexConfig.development;
        console.log('📊 Config:', {
            client: config.client,
            host: config.connection.host,
            port: config.connection.port,
            user: config.connection.user,
            database: config.connection.database
        });

        const db = knex(config);

        // Test connection
        const result = await db.raw('SELECT 1 as test');
        console.log('✅ Connection successful:', result[0][0]);

        // Check if database exists
        const databases = await db.raw('SHOW DATABASES');
        console.log('📋 Available databases:', databases[0].map(db => db.Database));

        await db.destroy();
        console.log('✅ Test completed successfully');

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('🔍 Error details:', error.stack);
    }
}

testConnection(); 