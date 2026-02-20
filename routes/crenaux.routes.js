import express from 'express'
import { verifyToken } from '../middleware/authMiddleware.js'
import { getCrenaux } from '../controllers/crenaux.controller.js'
const router = express.Router()
console.log("crenaux creer")
// garageRoutes.js
router.get('/', verifyToken, getCrenaux)
export default router
