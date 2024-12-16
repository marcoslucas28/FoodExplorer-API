const { Router } = require("express");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated.js");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization.js")
const DishesController = require("../controllers/DishesController.js");

const multer = require("multer")
const uploadConfig = require("../configs/upload.js");

const upload = multer(uploadConfig.MULTER)
const dishesRoutes = Router()
const dishesController = new DishesController()

dishesRoutes.use(ensureAuthenticated)

dishesRoutes.post("/", verifyUserAuthorization, upload.single('image'), dishesController.create)
dishesRoutes.put("/:id", verifyUserAuthorization, upload.single('image'), dishesController.update)
dishesRoutes.get("/", dishesController.index)
dishesRoutes.get("/:id", dishesController.show)
dishesRoutes.delete("/:id", verifyUserAuthorization, dishesController.delete)

module.exports = dishesRoutes