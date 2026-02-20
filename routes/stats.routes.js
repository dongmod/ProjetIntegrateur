import express from 'express'
import { getRdvToday,getRdvByDate } from '../controllers/stats.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { roleFiltre } from '../middleware/filtreroleMiddleware.js'

const router = express.Router()

// Seulement gestionnaire
router.get('/rdv-today', verifyToken, roleFiltre('gestionnaire'), getRdvToday)
router.get('/rdv-by-date', verifyToken, roleFiltre('gestionnaire'), getRdvByDate)
export default router
