const { verify } = require("jsonwebtoken")
const AppError = require("../utils/AppError")
const auth = require("../configs/auth")

function ensureAuthenticated(req, res, next){
    const authHeader = req.headers

    if(!authHeader.cookie){
        throw new AppError("JWT token not found", 401)
    }

    const [, token] = authHeader.cookie.split("token=")

    try {
        const { sub: user_id } = verify(token, auth.jwt.secret)

        req.user = {
            id: Number(user_id)
        }

        return next()
    } catch {
        throw new AppError("JWT token not found", 401)
    }
}

module.exports = ensureAuthenticated