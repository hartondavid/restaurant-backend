
exports.up = function (knex) {
    return knex.schema.createTable('board_items', (table) => {
        table.increments('id').primary();

        table.integer('board_id').unsigned().notNullable()
            .references('id').inTable('boards').onDelete('CASCADE');

        table.integer('product_id').unsigned().notNullable()
            .references('id').inTable('products').onDelete('CASCADE');

        table.integer('waiter_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');


        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('board_items');
};
