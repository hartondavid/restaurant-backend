import knex from 'knex';
import knexConfig from './../../knexfile.cjs';

const db = knex(knexConfig);

async function resetDatabase() {
    try {
        // Drop all tables
        await db.schema.dropTableIfExists('knex_migrations');
        await db.schema.dropTableIfExists('knex_migrations_lock');
        await db.schema.dropTableIfExists('users');
        await db.schema.dropTableIfExists('rights');
        await db.schema.dropTableIfExists('user_rights');
        await db.schema.dropTableIfExists('tables');
        await db.schema.dropTableIfExists('products');
        await db.schema.dropTableIfExists('orders');
        await db.schema.dropTableIfExists('order_items');

        console.log('Database reset successful');
    } catch (error) {
        console.error('Error resetting database:', error);
    } finally {
        await db.destroy();
    }
}

resetDatabase(); 