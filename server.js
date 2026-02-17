import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Serveur lancé sur le port ${process.env.PORT}`)
})
