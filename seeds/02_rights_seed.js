/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('rights').del()
  await knex('rights').insert([
    { id: 1, name: 'waiter', right_code: 1 },
    { id: 2, name: 'chef', right_code: 2 },
    { id: 3, name: 'manager', right_code: 3 }
  ]);
};
