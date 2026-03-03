import express from "express"
import { createFacture,getMesfactures,getfacturesall } from "../controllers/creationfacture.controller.js"
import { verifyToken } from "../middleware/authMiddleware.js"
import { roleFiltre } from "../middleware/filtreroleMiddleware.js"

const router = express.Router()

router.post("/",  verifyToken,roleFiltre("gestionnaire"),createFacture)
router.get('/', verifyToken, getMesfactures)
router.get('/getfacturesall', verifyToken, getfacturesall)
export default router
