const AppError = require("../utils/AppError")
const knex = require("../database/knex")
const stripe = require("stripe")(process.env.SECRET_KEY_STRIPE)

class PaymentController {
    async create(req, res){
       const user_id = req.user.id

       const order = await knex('orders')
      .where({ user_id, payment_status: 'pending' })
      .first();

      if(!order){
        throw new AppError("Carrinho vazio ou não encontrado.", 400)
      }

      const orderItems = await knex('order_items')
      .select('order_items.*', 'dishes.name', 'dishes.description')
      .innerJoin('dishes', 'order_items.dish_id', 'dishes.id')
      .where({ order_id: order.id });

      const lineItems = orderItems.map(item => {
        const unitPrice = item.price / item.quantity

        return {
            price_data: {
            currency: 'brl',
            product_data: {
                name: item.name,
                description: item.description || '',
            },
            unit_amount: Math.round(unitPrice * 100), 
            },
            quantity: item.quantity,
        };
    });

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:3000/historico-de-pedidos`, 
      cancel_url: `http://localhost:3000/carrinho`,
      metadata: {
        order_id: order.id
      }
    });

    await knex('orders').where({ id: order.id }).update({
      stripe_checkout_id: session.id
    });

    return res.json({ url: session.url });
    }
}

module.exports = PaymentController;