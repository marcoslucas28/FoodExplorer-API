module.exports = {
    jwt: {
        secret: process.env.AUTH_SECRECT || "default",
        expiresIn: "2d"
    }
}