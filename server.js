import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'
import rendezvousRoutes from './routes/rendezvous.routes.js'
import vehiculesRoutes from './routes/vehicules.routes.js'
import garageRoutes from './routes/garage.route.js'
import posteTravailRoutes from './routes/PosteTravail.js'
import tachesRoutes from './routes/taches.routes.js'
import statsRoutes from './routes/stats.routes.js'
import servicesRoutes from './routes/services.routes.js'
import crenauxRoutes from './routes/crenaux.routes.js'
import notificationsRoutes from './routes/notifications.route.js'
import commentaires_tachesRoutes from './routes/commentaires_taches.routes.js'
dotenv.config()
console.log("JWT_SECRET utilisé par le serveur :", process.env.JWT_SECRET)

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

app.use('/api/rendezvous', rendezvousRoutes)
app.use('/api/garages', garageRoutes)
app.use('/api/vehicules', vehiculesRoutes)
app.use('/api/posteTravail', posteTravailRoutes)
app.use('/api/taches', tachesRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/commentaires_taches',commentaires_tachesRoutes)
app.use('/api/notifications',notificationsRoutes)
app.use('/api/stats',statsRoutes)
app.use('/api/crenaux',crenauxRoutes)
app.listen(process.env.PORT, () => {
console.log(`Serveur lancé sur le port ${process.env.PORT}`)
console.log("SECRET:", process.env.JWT_SECRET)

})
