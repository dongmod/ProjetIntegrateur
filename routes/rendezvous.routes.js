import express from 'express'
import { createRendezVous,updateRendezVous, getMesRendezVous,
  deleteRendezVous } from '../controllers/rendezvous.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', verifyToken, createRendezVous)
router.get('/', verifyToken, getMesRendezVous)
router.put('/:id', verifyToken, updateRendezVous)
router.delete('/:id', verifyToken, deleteRendezVous)
export default router
