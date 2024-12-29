require('express-async-errors')
require("dotenv/config")

const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const routes = require("./routes")
const database = require("./database/sqlite")
const AppError = require("./utils/AppError")
const uploadsConfig= require('./configs/upload')

database()

const app = express()

app.use(express.json())

app.use(cookieParser())

app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
}))
app.options('*', cors())

app.use("/files", express.static(uploadsConfig.UPLOADS_FOLDER))

app.use(routes)

app.use((error, request, response, next) => {
    if(error instanceof AppError){
        return response.status(error.statusCode).json({
            status: 'error',
            message: error.message
        })
    }
    console.log(error)

    return response.status(500).json({
        status: 'error',
        message: 'Internal server error'
    })
})

const PORT = process.env.PORT || 3333

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))