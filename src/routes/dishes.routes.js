const { Router } = require("express");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated.js");
const DishesController = require("../controllers/DishesController.js");

const multer = require("multer")
const uploadConfig = require("../configs/upload.js");

const upload = multer(uploadConfig.MULTER)
const dishesRoutes = Router()
const dishesController = new DishesController()

dishesRoutes.post("/", ensureAuthenticated, upload.single('image'), dishesController.create)

module.exports = dishesRoutes