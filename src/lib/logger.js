const fs = require('fs');
const path = require('path');
const bunyan = require('bunyan');

const config = require('../config');

const logDir = path.join(__dirname, '../../logs/');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const streams = [
  {
    level: config.get('NODE_ENV') === 'development' ? 'info' : 'error',
    stream: process.stdout,
  }, {
    level: 'error',
    path: path.join(logDir, 'app.log'),
  },
];

module.exports = bunyan.createLogger({
  name: 'rurly-backend',
  streams,
});
