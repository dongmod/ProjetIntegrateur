const express = require('express');
const router = express.Router();

const { authMiddleware, checkRole } = require('../middleware/auth');
const {
  createDevice,
  getAllDevices,
  getUserDevices,
  deleteDevice
} = require('../controllers/deviceController');

// Obtener todos los devices (solo admin)
router.get('/', authMiddleware, checkRole('admin'), getAllDevices);

// Obtener los devices del usuario conectado
router.get('/my-devices', authMiddleware, getUserDevices);

// Crear un nuevo device (solo admin)
router.post('/', authMiddleware, checkRole('admin'), createDevice);

// Eliminar un device por deviceId (solo admin)
router.delete('/:deviceId', authMiddleware, checkRole('admin'), deleteDevice);

module.exports = router;