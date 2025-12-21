const {  Router } = require('express');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const OrderItemsController = require('../controllers/OrderItemsController');

const orderItemsRoutes = Router();
const orderItemsController = new OrderItemsController();
orderItemsRoutes.use(ensureAuthenticated);

orderItemsRoutes.post('/', orderItemsController.create);
orderItemsRoutes.delete('/:order_item_id', orderItemsController.delete);

module.exports = orderItemsRoutes;