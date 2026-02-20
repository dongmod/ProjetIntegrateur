import express from 'express'
import { createGarage } from '../controllers/garage.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { roleFiltre } from '../middleware/filtreroleMiddleware.js'
import { getGarages, updateGarage, deleteGarage } from '../controllers/garage.controller.js'
const router = express.Router()
console.log("garage creer")
// garageRoutes.js
router.post('/', createGarage)
router.post('/', verifyToken, roleFiltre('gestionnaire'), createGarage)
router.get('/', verifyToken, getGarages)
router.put('/:id', verifyToken, roleFiltre('gestionnaire'), updateGarage)
router.delete('/:id', verifyToken, roleFiltre('gestionnaire'), deleteGarage)
export default router
