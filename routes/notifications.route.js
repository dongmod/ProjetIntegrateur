import express from 'express'
import { createNotifications, getNotifications } from '../controllers/notifications.controllers.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { roleFiltre } from '../middleware/filtreroleMiddleware.js'

const router = express.Router()
console.log("notifications creer")
// notificationsRoutes.js
router.post('/',verifyToken,roleFiltre('gestionnaire'), createNotifications)
router.get('/', verifyToken, roleFiltre('gestionnaire'),getNotifications)
export default router
