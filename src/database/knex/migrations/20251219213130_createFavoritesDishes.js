exports.up = knex => knex.schema.createTable('favoriteDishes', table => {
    table.increments('id')
    table.integer('dish_id').references('id').inTable('dishes').onDelete('CASCADE')
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.timestamp('created_at').defaultTo(knex.fn.now())
})

exports.down = knex => knex.schema.dropTable('favoriteDishes')
