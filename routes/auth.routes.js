import express from 'express'
import { 
    register, 
    getUserbyId,
    resetMot_de_passe,
    login,
    deleteUser,
    updateUser,
    getUser,
    updateProfil,
    userconnected,
    me,
} from '../controllers/auth.controller.js'

import { verifyToken } from '../middleware/authMiddleware.js'


router.get('/me', verifyToken, me)
router.post('/register', register)




import upload from '../middleware/multer_images.js'
const router = express.Router()

router.post('/register', upload.single('photos'), register)   //profil
router.patch('/profil/:id', upload.single('photos'), updateProfil) //profil 
router.post('/login', login)
router.patch('/profil/:id', updateProfil)
router.delete('/deleteUser/:id', deleteUser)
router.put('/updateUser/:id', updateUser)
router.put('/resetMot_de_passe/:id', resetMot_de_passe)
router.get('/userconnected', verifyToken, userconnected)
router.get('/getUser', getUser)
router.get('/getUserbyId/:id', getUserbyId)
router.get('/test', (req, res) => res.json({ ok: true }))

export default router
console.log("Auth routes loaded") 