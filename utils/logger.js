const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/journal.log'),
      level: 'info'
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error'
    })
  ]
});

// Ajouter console en développement
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;