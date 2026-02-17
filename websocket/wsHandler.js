const WebSocket = require('ws');
const Device = require('../models/Device');
const Measurement = require('../models/Measurement');
const logger = require('../utils/logger');

// Map pour stocker les connexions actives
const activeConnections = new Map();

const initWebSocket = (server) => {
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws'
  });

  wss.on('connection', async (ws, req) => {
    console.log('🔌 Nouvelle connexion WebSocket');
    let deviceId = null;
    let userId = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Authentification initiale avec deviceId
        if (data.type === 'auth' && data.deviceId) {
          deviceId = data.deviceId;

          // Vérifier si le device existe et est associé à un utilisateur
          const device = await Device.findOne({ deviceId });

          if (!device) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Device non reconnu' 
            }));
            ws.close();
            return;
          }

          if (!device.userId) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Device non associé à un utilisateur' 
            }));
            ws.close();
            return;
          }

          userId = device.userId;

          // Mettre à jour le statut du device
          device.isConnected = true;
          device.lastConnection = new Date();
          await device.save();

          // Stocker la connexion
          activeConnections.set(deviceId, ws);

          ws.send(JSON.stringify({ 
            type: 'auth_success', 
            message: 'Authentification réussie',
            deviceId 
          }));

          logger.info(`Device ${deviceId} connecté`, { deviceId, userId });
          
          console.log(`Device ${deviceId} authentifié`);
        }

        // Réception d'une mesure
        else if (data.type === 'measurement' && deviceId && userId) {
          const { value, unit, timestamp } = data;

          if (value === undefined) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Valeur manquante' 
            }));
            return;
          }

          // Sauvegarder la mesure
          const measurement = new Measurement({
            deviceId,
            userId,
            value: parseFloat(value),
            unit: unit || 'celsius',
            timestamp: timestamp ? new Date(timestamp) : new Date()
          });

          await measurement.save();

          ws.send(JSON.stringify({ 
            type: 'measurement_received', 
            message: 'Mesure enregistrée',
            measurementId: measurement._id
          }));

          logger.info('Mesure enregistrée', { 
            deviceId, 
            userId, 
            value 
          });

          console.log(` Mesure reçue de ${deviceId}: ${value}`);
        }

        // Message non reconnu
        else {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Type de message non reconnu ou device non authentifié' 
          }));
        }

      } catch (error) {
        console.error('Erreur WebSocket:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Erreur de traitement' 
        }));
      }
    });

    ws.on('close', async () => {
      if (deviceId) {
        // Mettre à jour le statut du device
        await Device.findOneAndUpdate(
          { deviceId },
          { isConnected: false }
        );

        activeConnections.delete(deviceId);
        logger.info(`Device ${deviceId} déconnecté`, { deviceId });
        console.log(`Device ${deviceId} déconnecté`);
      }
    });

    ws.on('error', (error) => {
      console.error('Erreur WebSocket:', error);
      logger.error('Erreur WebSocket', { error: error.message });
    });
  });

  console.log(' Serveur WebSocket démarré');
  return wss;
};

// Fonction pour envoyer une commande à un device
const sendCommand = async (deviceId, command) => {
  const ws = activeConnections.get(deviceId);

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('Device non connecté');
  }

  ws.send(JSON.stringify({
    type: 'command',
    command
  }));

  logger.info('Commande envoyée', { deviceId, command });
  
  return true;
};

module.exports = { initWebSocket, sendCommand, activeConnections };