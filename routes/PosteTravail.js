import express from 'express'
import { verifyToken } from '../middleware/authMiddleware.js'
import { createPosteTravail,getPostes,updatePoste,deletePoste } from '../controllers/posteTravail.controller.js'
import { roleFiltre } from '../middleware/filtreroleMiddleware.js'
const router = express.Router()
console.log("Poste Travail creer")
// POST poste Travail
router.post('/', verifyToken,roleFiltre('gestionnaire'), createPosteTravail)
router.get('/', verifyToken, getPostes)
router.put('/:id', verifyToken,roleFiltre('gestionnaire'), updatePoste)
router.delete('/:id', verifyToken,roleFiltre('gestionnaire'), deletePoste)

export default router
