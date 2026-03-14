import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js"; // o authMiddlewar.js si aún no renombraste
import { roleFiltre } from "../middleware/filtreroleMiddleware.js";
import { createservices, getservices,updateService,deleteService } from "../controllers/services.controllers.js"; //Mis a jour 

const router = express.Router()
console.log("services creer")
router.post('/', createservices)
router.get('/',verifyToken,getservices) 
router.put('/:id', verifyToken, roleFiltre("gestionnaire"), updateService) 
router.delete('/:id', verifyToken, roleFiltre("gestionnaire"), deleteService) 
export default router
