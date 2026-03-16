import express from 'express'
import { getProfil, upsertProfil } from '../controllers/profils.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()
console.log("profils creer")

router.get('/:user_id', verifyToken, getProfil)   // any user can see the profil 
router.post('/', verifyToken, upsertProfil)        // only authoriced employee can modify his profile. 

export default router