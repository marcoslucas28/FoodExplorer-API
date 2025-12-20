const { Router } = require("express")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")
const FavoriteDishes = require("../controllers/FavoriteDishes")

const favoritesRoutes = Router()
const favoriteDishes = new FavoriteDishes()

favoritesRoutes.use(ensureAuthenticated)

favoritesRoutes.post("/:dish_id", favoriteDishes.create)
favoritesRoutes.delete("/:dish_id", favoriteDishes.delete)
favoritesRoutes.get("/", favoriteDishes.index)

module.exports = favoritesRoutes