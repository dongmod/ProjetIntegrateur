import express from 'express'
import { createCommentaires_taches, getCommentairesTache } from '../controllers/createCommentaires_taches.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()
console.log("commentaires_taches creer")
// commentaires_tachesRoutes.js
router.get('/:tache_id', verifyToken,getCommentairesTache) //New 
router.post('/', verifyToken, createCommentaires_taches) //We add the verifytoken 

export default router
