import express from 'express'
import { createRendezVous,updateRendezVous, getMesRendezVous,
  deleteRendezVous,getAllRendezVous, assignerRendezVous,
  getCreaneauxDisponibles} from '../controllers/rendezvous.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()
router.get('/all', verifyToken, getAllRendezVous) // Nouveau - Route pour obtenir tous les rendez-vous d'un garage (dashboard) 
router.patch('/:id/assigner', verifyToken,assignerRendezVous) //Nouveau - Route pour assigner rendez vous a employes 
router.get('crenaux-disponibles',verifyToken,getCreaneauxDisponibles) //Nouveau - Assigner rendez-vous auto a employes 
router.post('/', verifyToken, createRendezVous)
router.get('/', verifyToken, getMesRendezVous)
router.put('/:id', verifyToken, updateRendezVous)
router.delete('/:id', verifyToken, deleteRendezVous)
//router.post('/terminer', verifyToken, terminerRendezVous)

export default router
