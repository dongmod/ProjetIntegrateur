import express from 'express'
import { verifyToken } from '../middleware/authMiddleware.js'
import { createcapteurs ,getcapteurs,updatecapteurs,deletecapteurs} from '../controllers/capteurs.controller.js'
import { roleFiltre } from '../middleware/filtreroleMiddleware.js'
import { get } from 'mongoose'
const router = express.Router()
console.log("Capteurs creer")
// POST poste Travail
router.post('/', verifyToken,roleFiltre('gestionnaire'), createcapteurs)
router.get('/', verifyToken, getcapteurs)
router.put('/:id', verifyToken,roleFiltre('gestionnaire'), updatecapteurs)
router.delete('/:id', verifyToken,roleFiltre('gestionnaire'), deletecapteurs)

export default router
