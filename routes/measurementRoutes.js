const express = require('express');
const router = express.Router();

const { authMiddleware, checkRole } = require('../middleware/auth');
const {
  getMeasurements,
  getMeasurementStats,
  deleteMeasurements
} = require('../controllers/measurementController');

// Obtenir les mesures
// - Admin: voit toutes les mesures de tous les utilisateurs
// - Standard: voit uniquement ses propres mesures
router.get('/', authMiddleware, getMeasurements);

// Obtenir les statistiques d'un device
router.get('/stats/:deviceId', authMiddleware, getMeasurementStats);

// Supprimer des mesures anciennes (solo admin)
router.delete('/', authMiddleware, checkRole('admin'), deleteMeasurements);

module.exports = router;