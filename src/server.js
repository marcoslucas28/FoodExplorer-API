require('express-async-errors')
require("dotenv/config")

const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const knex = require("./database/knex"); // <--- Faltava isso
const stripe = require('stripe')(process.env.SECRET_KEY_STRIPE);

const routes = require("./routes")
const database = require("./database/sqlite")
const AppError = require("./utils/AppError")
const uploadsConfig= require('./configs/upload')

database()

const app = express()


app.use((req, res, next) => {
  console.log(`>> REQUISIÇÃO CHEGOU: ${req.method} ${req.url}`);
  next();
});

app.post('/webhook', express.raw({ type: "application/json" }), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;
  
  console.log(">> Webhook acionado!"); // Log de depuração

  try {
    // Certifique-se que process.env.CHAVE_WEBHOOK_STRIPE é a chave whsec_...
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.CHAVE_WEBHOOK_STRIPE);
  } catch (err) {
    console.error(">> Erro na assinatura do Webhook:", err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Se passou daqui, a assinatura é válida
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log(">> Pagamento aprovado via Stripe!");
      
      const orderId = session.metadata.order_id;

      try {
        await knex('orders').where({ id: orderId }).update({
            payment_status: 'paid', // Atualiza status do pagamento
            updated_at: knex.fn.now()
        });
        console.log(`>> Pedido ${orderId} atualizado no banco com sucesso!`);
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

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))