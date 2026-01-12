const { Router } = require("express")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated.js");
const PaymentController = require("../controllers/PaymentController.js")

const paymentRoutes = Router()
const paymentController = new PaymentController()

paymentRoutes.use(ensureAuthenticated)

paymentRoutes.post("/", paymentController.create)

module.exports = paymentRoutes

