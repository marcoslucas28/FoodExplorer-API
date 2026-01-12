const AppError = require('../utils/AppError');
const knex = require('../database/knex');

class OrderItemsController {
    static async updateTotalPrice(order_id) {
        const items = await knex('order_items').where({ order_id });
        const total_price = items.reduce((sum, item) => sum + parseFloat(String(item.price).replace(',', '.')), 0);
        await knex('orders').where({ id: order_id }).update({ total_price });
    }

    async create(req, res) {
        const { dish_id, quantity } = req.body;
        const { id } = req.user;

        let order = await knex('orders').where({ user_id: id, payment_status: 'pending' }).first();

        if (!order) {
            const [newOrderId] = await knex('orders').insert({
                user_id: id,
                status: 'pending',
                payment_status: 'pending',
                total_price: 0
            });
            order = { id: newOrderId };
        }

        const order_id = order.id;

        const [dish] = await knex('dishes').where({ id: dish_id });

        if (!dish) {
            throw new AppError('Dish not found.', 404);
        }

        const price = parseFloat(dish.price.replace(',', '.'));

        if (isNaN(price)) {
            throw new AppError('Invalid dish price.', 400);
        }

        const total_price = price * quantity;

        await knex('order_items').insert({
            order_id,
            dish_id,
            quantity,
            price: total_price
        });

        await OrderItemsController.updateTotalPrice(order_id);

        return res.json({ message: 'Order item created successfully.' });
    }
    async delete(req, res) {
        const { order_item_id } = req.params;
        const { id } = req.user;
        const orderItem = await knex('order_items').where({ id: order_item_id }).first();

        if (!orderItem) {
            throw new AppError('Order item not found.', 404);
        }
        const order = await knex('orders').where({ id: orderItem.order_id, user_id: id }).first();

        if (!order) {
            throw new AppError('You do not have permission to delete this item.', 403);
        }
        await knex('order_items').where({ id: order_item_id }).delete();

        await OrderItemsController.updateTotalPrice(orderItem.order_id);

        return res.json({ message: 'Order item deleted successfully.' });
    }
}

module.exports = OrderItemsController;