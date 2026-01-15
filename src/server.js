require('express-async-errors')
require("dotenv/config")

const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const http = require("http")
const { initSocket } = require("./socket")
const { getIO } = require("./socket")

const knex = require("./database/knex")
const stripe = require('stripe')(process.env.SECRET_KEY_STRIPE);

const routes = require("./routes")
const database = require("./database/sqlite")
const AppError = require("./utils/AppError")
const uploadsConfig= require('./configs/upload')

database()

const app = express()


app.post('/webhook', express.raw({ type: "application/json" }), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.CHAVE_WEBHOOK_STRIPE);
  } catch (err) {
    console.error(">> Erro na assinatura do Webhook:", err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      const orderId = session.metadata.order_id;
      const user_id = session.metadata.userID

      try {
        await knex('orders').where({ id: orderId }).update({
            payment_status: 'paid', 
            updated_at: knex.fn.now()
        });

        const io = getIO()

        io.to("admin").emit("new_order", {
          order_id: orderId,
          user_id: user_id,
          message: "Novo pedido criado"
        })
      } catch (dbError) {
        console.error(">> Erro ao atualizar banco:", dbError);
      }
      break;
      
    default:
      console.log(`>> Evento ignorado: ${event.type}`);
  }

  response.send();
});


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

const server = http.createServer(app)

initSocket(server)

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))