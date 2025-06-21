
exports.up = function (knex) {
    return knex.schema.createTable('boards', (table) => {
        table.increments('id').primary();

        table.integer('number').nullable();

        table.enum('status', ['free', 'reserved']).defaultTo('free');

        table.integer('waiter_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');

        table.integer('order_id').unsigned().nullable()


        table.timestamps(true, true);
    });

};

exports.down = function (knex) {
    return knex.schema.dropTable('boards');
};
