import express from 'express'
import { createservices,getservices } from '../controllers/services.controllers.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()
// servicesRoutes.js
router.post('/', createservices)
router.get('/', verifyToken, getservices)
export default router
