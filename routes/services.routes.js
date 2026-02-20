import express from 'express'
import { createservices } from '../controllers/services.controllers.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()
console.log("services creer")
// servicesRoutes.js
router.post('/', createservices)
export default router
