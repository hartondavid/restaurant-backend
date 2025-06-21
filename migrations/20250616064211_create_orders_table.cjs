
exports.up = function (knex) {
    return knex.schema.createTable('orders', (table) => {
        table.increments('id').primary();

        table.enum('status', ['new', 'pending', 'prepared', 'done']).defaultTo('new');

        table.integer('board_id').unsigned().notNullable()
            .references('id').inTable('boards').onDelete('CASCADE');

        table.integer('waiter_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');


        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('orders');
};
