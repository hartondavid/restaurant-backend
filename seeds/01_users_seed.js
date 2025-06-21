/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('users').del()
  await knex('users').insert([
    {
      id: 1, name: 'Elena', email: 'elena@gmail.com', password: '171c94533cacff0e4c5b85636a9e4fd6',
      phone: '07254345', confirm_password: '171c94533cacff0e4c5b85636a9e4fd6'
    },
    {
      id: 2, name: 'Maria', email: 'maria@gmail.com', password: '49518a5bba04f0d047a86e56218d966a',
      phone: '0745123457', confirm_password: '49518a5bba04f0d047a86e56218d966a'
    },
    {
      id: 3, name: 'Manager', email: 'manager@gmail.com', password: '23416379944e641a8ad6bdbc95ef1859',
      phone: '0745183457', confirm_password: '23416379944e641a8ad6bdbc95ef1859'
    },
  ]);
};
