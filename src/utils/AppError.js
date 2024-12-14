class AppError {
    message
    statusCode

    construtuctor(message, statusCode = 400){
        this.message = message
        this.statusCode = statusCode
    }
}

module.exports = AppError