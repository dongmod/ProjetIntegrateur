import express from 'express'
import { createTaches,updateTache,deleteTache, terminertaches,getMesTaches, getAllTaches } from '../controllers/taches.controllers.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()
console.log("taches creer")
// tachesRoutes.js
router.get('/all',verifyToken,getAllTaches) //Nouveau 
router.post('/', createTaches)
router.get('/', verifyToken, getMesTaches)
router.put('/:id', verifyToken, updateTache)
router.delete('/:id', verifyToken, deleteTache)

router.post('/terminer', verifyToken, terminertaches)
export default router
