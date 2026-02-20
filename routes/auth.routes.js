import express from 'express'
import { register, getUserbyId,resetMot_de_passe,login,deleteUser,updateUser,getUser } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.delete('/deleteUser/:id', deleteUser)
router.put('/updateUser/:id', updateUser)
router.put('/resetMot_de_passe/:id', resetMot_de_passe)
router.get('/getUser', getUser) 
router.get('/getUserbyId/:id', getUserbyId)
export default router
