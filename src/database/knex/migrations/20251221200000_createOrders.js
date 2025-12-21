exports.up = knex => knex.schema.createTable('orders', table => {
    table.increments('id')
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.text('status').notNullable().defaultTo('pending') // pending | preparing | delivered
    table.decimal('total_price', 10, 2).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  });

exports.down = knex => knex.schema.dropTable('orders');
