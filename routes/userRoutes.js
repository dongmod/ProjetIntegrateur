const express = require('express');
const router = express.Router();

const { authMiddleware, checkRole } = require('../middleware/auth');
const {
  createUser,
  getProfile,
  getAllUsers,
  UpdateUser,
  deleteUser,
  assignDevice,
  promoteToAdmin
} = require('../controllers/userController');

// Ruta para obtener el perfil del usuario conectado
router.get('/profile', authMiddleware, getProfile);

// Ruta para obtener todos los usuarios (solo admin)
router.get('/', authMiddleware, checkRole('admin'), getAllUsers);

// Crear un nuevo usuario (solo admin)
router.post('/', authMiddleware, checkRole('admin'), createUser);

// Modificar un usuario (solo admin)
router.patch('/:id', authMiddleware, checkRole('admin'), UpdateUser);

// Promover un usuario a admin (solo admin)
router.patch('/:id/promote', authMiddleware, checkRole('admin'), promoteToAdmin);

// Eliminar un usuario (solo admin)
router.delete('/:id', authMiddleware, checkRole('admin'), deleteUser);

// Asignar un device a un usuario (solo admin)
router.post('/assign-device', authMiddleware, checkRole('admin'), assignDevice);

module.exports = router;