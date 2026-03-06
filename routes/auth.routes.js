import express from 'express'
import { register,updateProfil, getUserbyId,resetMot_de_passe,login,deleteUser,updateUser,getUser,me,userconnected } from '../controllers/auth.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js';
const router = express.Router()

router.post('/register', register)
router.patch('/profil/:id', updateProfil)
router.post('/login', login)
router.delete('/deleteUser/:id', deleteUser)
router.put('/updateUser/:id', updateUser)
router.put('/resetMot_de_passe/:id', resetMot_de_passe)
router.get('/me',verifyToken, me)
router.get('/userconnected', verifyToken, userconnected) //profil de l'utilisateur loggué
router.get('/getUser', getUser) 
router.get('/getUserbyId/:id', getUserbyId)
export default router
