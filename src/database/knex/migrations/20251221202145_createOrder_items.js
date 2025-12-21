exports.up = knex => knex.schema.createTable('order_items', table => {
    table.increments('id')
    table.integer('order_id').references('id').inTable('orders').onDelete('CASCADE')
    table.integer('dish_id').references('id').inTable('dishes').onDelete('CASCADE')
    table.integer('quantity').notNullable()
    table.decimal('price', 10, 2).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  });

exports.down = knex => knex.schema.dropTable('order_items');
