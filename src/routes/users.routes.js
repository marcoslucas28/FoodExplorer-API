const { Router } = require("express")

const usersRoutes = Router()

usersRoutes.post("/", (req, res) => res.send({"Status:": "ok"}))

module.exports = usersRoutes