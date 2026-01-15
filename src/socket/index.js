const AppError = require("../utils/AppError")

let io;

function initSocket(server) {
  io = require("socket.io")(server, {
    cors: {
      origin: [process.env.BASE_URL],
      credentials: true
    }
  })

  io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id)

    socket.on("join_admin", () => {
      socket.join("admin")
    })

    socket.on("join_user", (userId) => {
      socket.join(`user_${userId}`)
    })

    socket.on("disconnect", () => {
      console.log("Usuário desconectado:", socket.id)
    })
  })

  return io
}

function getIO() {
  if (!io) {
    throw new AppError("Socket.io não inicializado")
  }
  return io
}

module.exports = { initSocket, getIO }
