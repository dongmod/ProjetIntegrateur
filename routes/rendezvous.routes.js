import express from 'express'

import { createRendezVous,updateRendezVous, getMesRendezVous,
  deleteRendezVous,getAllRendezVous, assignerRendezVous,RendezVousAll,
  getCreaneauxDisponibles} from '../controllers/rendezvous.controller.js'

// import { createRendezVous,updateRendezVous, getMesRendezVous, RendezVousAll,
//   deleteRendezVous} from '../controllers/rendezvous.controller.js'

import { verifyToken } from '../middleware/authMiddleware.js'
import upload from '../middleware/multer_images.js'
const router = express.Router()


router.get('/all', verifyToken, getAllRendezVous) // Nouveau - Route pour obtenir tous les rendez-vous d'un garage (dashboard) 
router.patch('/:id/assigner', verifyToken,assignerRendezVous) //Nouveau - Route pour assigner rendez vous a employes 
router.get('crenaux-disponibles',verifyToken,getCreaneauxDisponibles) //Nouveau - Assigner rendez-vous auto a employes 
router.post('/', verifyToken, createRendezVous)
router.post('/', verifyToken, upload.array("images", 5), createRendezVous)
router.get('/', verifyToken, getMesRendezVous)
router.get('/all', verifyToken, RendezVousAll)
router.put('/:id', verifyToken, upload.array("images", 5), updateRendezVous)
router.delete('/:id', verifyToken, deleteRendezVous)
//router.post('/terminer', verifyToken, terminerRendezVous)

export default router
