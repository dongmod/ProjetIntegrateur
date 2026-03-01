import express from 'express'
import { createVehicule,getVehiculeall,updateVehicule,  getMesVehicules,deleteVehicule,getHistoriqueVehicule } from '../controllers/vehicules.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()
console.log("vehicules.routes.js chargé")
// POST /api/vehicules
router.post('/', verifyToken, createVehicule)
router.get('/', verifyToken, getMesVehicules)
router.get('/getVehiculeall', verifyToken, getVehiculeall)
router.patch('/:id', verifyToken, updateVehicule)
router.delete('/:id', verifyToken, deleteVehicule)
router.get("/:id/historique",verifyToken, getHistoriqueVehicule)

export default router
