const AppError = require("../utils/AppError");
const knex = require("../database/knex");
const { getIO } = require("../socket")

class OrderController {
  async index(req, res) {
    const { id } = req.user;

    const user = await knex("users").where({ id }).first();
    const isAdmin = user.isAdmin;

    let query = knex("orders")
      .leftJoin("order_items", "orders.id", "order_items.order_id")
      .leftJoin("dishes", "order_items.dish_id", "dishes.id")
      .select(
        "orders.id as order_id",
        "orders.user_id",
        "orders.status",
        "orders.total_price",
        "orders.payment_status", 
        "orders.created_at",
        "orders.updated_at",
        "order_items.id as item_id",
        "order_items.dish_id",
        "order_items.quantity",
        "order_items.price as item_price",
        "dishes.name as dish_name",
        "dishes.image as dish_image"
      );

    query = query.whereNot("orders.payment_status", "pending");

    if (!isAdmin) {
      query = query.where("orders.user_id", id);
    }

    const ordersWithItems = await query
      .orderBy("orders.created_at", "desc")
      .orderBy("order_items.created_at", "asc");

    const ordersMap = new Map();

    ordersWithItems.forEach(row => {
      const orderId = row.order_id;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: row.order_id,
          user_id: row.user_id,
          status: row.status, 
          payment_status: row.payment_status,
          total_price: row.total_price,
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: []
        });
      }

      if (row.item_id) {
        ordersMap.get(orderId).items.push({
          id: row.item_id,
          dish_id: row.dish_id,
          dish_name: row.dish_name,
          dish_image: row.dish_image,
          quantity: row.quantity,
          price: row.item_price
        });
      }
    });

    const orders = Array.from(ordersMap.values());

    return res.json(orders);
  }

  async update(req, res) {
    const { order_id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "preparing", "delivered"];

    if (!validStatuses.includes(status)) {
      throw new AppError("Invalid status. Must be one of: pending, preparing, delivered.", 400);
    }
    
    const order = await knex("orders").where({ id: order_id }).first();

    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    await knex("orders").where({ id: order_id }).update({ status });

    const io = getIO()

    io.to("admin").emit("order_status_updated", {
      order_id,
      status
    })

    io.to(`user_${order.user_id}`).emit("order_status_updated", {
      order_id,
      status
    })

    return res.json({ message: "Order updated successfully." });
  }

  async show(req, res) {
    const { id } = req.user;
    const order = await knex("orders").where({ user_id: id, payment_status: "pending" }).first();

    if (!order) {
      throw new AppError("Order not found.", 404);
    }
    const orderItems = await knex("order_items")
      .where({ order_id: order.id })
      .join("dishes", "order_items.dish_id", "dishes.id")
      .select(
        "order_items.id",
        "order_items.dish_id",
        "dishes.name as dish_name",
        "dishes.image as dish_image",
        "order_items.quantity",
        "order_items.price"
      );
    order.items = orderItems;

    return res.json(order);
  }
}

module.exports = OrderController;