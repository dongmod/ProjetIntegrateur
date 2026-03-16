//Route new to get the garage scheduele 
import express from 'express'
import { getHorairesGarage, upsertHoraireGarage } from '../controllers/horaires_garage.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', verifyToken, getHorairesGarage)
router.post('/', verifyToken, upsertHoraireGarage)

export default router