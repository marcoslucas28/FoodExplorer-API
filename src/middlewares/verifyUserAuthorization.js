const AppError = require("../utils/AppError")
const knex = require("../database/knex")

async function verifyUserAuthorization(req, res, next){
    const { id } = req.user

    const { isAdmin } = await knex("users").where({id}).first()

    if(!isAdmin){
        throw new AppError("Unauthorized")
    }

    return next()
}

module.exports = verifyUserAuthorization