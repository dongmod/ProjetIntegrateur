import express from 'express'
import { createRendezVous,updateRendezVous, getMesRendezVous, RendezVousAll,
  deleteRendezVous} from '../controllers/rendezvous.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import upload from '../middleware/multer_images.js'
const router = express.Router()

router.post('/', verifyToken, upload.array("images", 5), createRendezVous)
router.get('/', verifyToken, getMesRendezVous)
router.get('/all', verifyToken, RendezVousAll)
router.put('/:id', verifyToken, upload.array("images", 5), updateRendezVous)
router.delete('/:id', verifyToken, deleteRendezVous)
//router.post('/terminer', verifyToken, terminerRendezVous)

export default router
