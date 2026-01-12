const { Router }  = require("express")

const usersRoutes = require("./users.routes")
const sessionsRoutes = require("./sessions.routes")
const dishesRoutes = require('./dishes.routes')
const favoritesRoutes = require('./favorites.routes')
const orderRoutes = require('./order.routes')
const orderItemsRoutes = require('./order.items.routes')
const paymentRoutes = require("./payment.routes")

const routes = Router()

routes.use("/users", usersRoutes)
routes.use("/sessions", sessionsRoutes)
routes.use("/dishes", dishesRoutes)
routes.use("/favorites", favoritesRoutes)
routes.use("/orders", orderRoutes)
routes.use("/order-items", orderItemsRoutes)
routes.use("/payment", paymentRoutes)

module.exports = routes