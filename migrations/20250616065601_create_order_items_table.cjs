
exports.up = function (knex) {
    return knex.schema.createTable('order_items', (table) => {
        table.increments('id').primary();

        table.integer('order_id').unsigned().notNullable()
            .references('id').inTable('orders').onDelete('CASCADE');

        table.integer('product_id').unsigned().notNullable()
            .references('id').inTable('products').onDelete('CASCADE');


        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('order_items');
};
