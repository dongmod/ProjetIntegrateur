import express from 'express'
import { createavis,getavis,modifieravis,supprimeravis,moyenneGarage } from '../controllers/avis.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js';

import upload from '../middleware/multer_images.js'
const router = express.Router()

router.post('/create', upload.array('photos', 5), createavis)
router.get('/getavis/:id', getavis)
router.patch('/modifieravis/:id',upload.array('photos', 5), modifieravis)
router.delete('/supprimeravis/:id', supprimeravis)

router.get('/moyenne/:id', moyenneGarage)
export default router
