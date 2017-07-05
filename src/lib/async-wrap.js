const logger = require('./logger');

module.exports = fn =>
  (req, res, next) => fn(req, res, next)
  .catch((err) => {
    logger.error(err);
    next(err);
  });
