import express from 'express'
import { createavis,getavis,modifieravis,supprimeravis,moyenneGarage } from '../controllers/avis.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js';
const router = express.Router()

router.post('/create', createavis)
router.get('/getavis/:id', getavis)
router.patch('/modifieravis/:id', modifieravis)
router.delete('/supprimeravis/:id', supprimeravis)

router.get('/moyenne/:id', moyenneGarage)
export default router
