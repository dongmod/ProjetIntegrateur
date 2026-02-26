import express from "express"
import { downloadFacture } from "../controllers/genererfacture.controller.js"
import { verifyToken } from "../middleware/authMiddleware.js"
import {sendFactureByEmail } from "../controllers/envoiefacture.controller.js"
const router = express.Router()

router.get("/:id/download",verifyToken,downloadFacture)
router.post("/:id/send-email",  verifyToken,  sendFactureByEmail)
export default router
