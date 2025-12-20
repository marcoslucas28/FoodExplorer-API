const { compare } = require("bcryptjs")
const authConfig = require("../configs/auth")
const knex = require("../database/knex")
const AppError = require("../utils/AppError.js")
const { sign } = require("jsonwebtoken")

class SessionsController {
    async create(req, res){
        const { email, password } = req.body

        const user = await knex("users").where({email}).first()
        
        if(!user){
            throw new AppError("Email e/ou senha incorretos", 401)
        }

        const passwordMarched = await compare(password, user.password)

        if(!passwordMarched){
            throw new AppError("Email e/ou senha incorretos", 401)
        }

        const { secret, expiresIn } = authConfig.jwt
        const token = sign({}, secret, {
            subject: String(user.id),
            expiresIn
        })

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 7 * 24 * 60 * 1000,
        })

        delete user.password

        return res.json({
            user
        })
    }
}

module.exports = SessionsController