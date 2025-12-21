const {  Router } = require('express');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization.js")
const OrderController = require('../controllers/OrderController');

const orderControllerRoutes = Router();
const orderController = new OrderController();

orderControllerRoutes.use(ensureAuthenticated);

orderControllerRoutes.get('/', orderController.index);
orderControllerRoutes.get('/pending', orderController.show);
orderControllerRoutes.put('/:order_id', verifyUserAuthorization, orderController.update);

module.exports = orderControllerRoutes;