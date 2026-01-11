exports.up = function (knex) {
  return knex.schema.alterTable('orders', function (table) {
    table.text('stripe_checkout_id');
    table.text('payment_status').defaultTo('pending');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('orders', function (table) {
    table.dropColumn('stripe_checkout_id');
    table.dropColumn('payment_status');
  });
};
