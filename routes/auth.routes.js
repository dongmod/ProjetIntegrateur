import express from 'express'
import { register, 
            getUserbyId,
            resetMot_de_passe,
            login,
            deleteUser,
            updateUser,
            getUser,
            userconnected,
            me,     //Nouevau endpoint pour obtenir les infos de l'utilisateur loggué
        } from '../controllers/auth.controller.js'

import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()
router.get('/me', verifyToken, me);
router.post('/register', register)
    router.post('/login', login)
router.get('/userconnected', verifyToken, userconnected) //profil de l'utilisateur loggué
router.put('/updateUser/:id', updateUser)
router.put('/resetMot_de_passe/:id', resetMot_de_passe)
router.get('/getUser', getUser) 
router.get('/getUserbyId/:id', getUserbyId)
router.get("/test", (req, res) => res.json({ ok: true }));

export default router
console.log("Auth routes loaded")