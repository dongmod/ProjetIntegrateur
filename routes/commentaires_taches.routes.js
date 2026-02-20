import express from 'express'
import { createCommentaires_taches } from '../controllers/createCommentaires_taches.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()
console.log("commentaires_taches creer")
// commentaires_tachesRoutes.js
router.post('/', createCommentaires_taches)

export default router
