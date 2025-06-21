
exports.up = function (knex) {
    return knex.schema.createTable('products', (table) => {
        table.increments('id').primary();

        table.string('name').notNullable();

        table.string('image').notNullable();

        table.string('description').notNullable();

        table.integer('price').notNullable();

        table.integer('quantity').notNullable();

        table.integer('manager_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');

        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('products');
};
