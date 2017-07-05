const logger = require('../../lib/logger');
const User = require('../../model/user');

const {
  Router,
} = require('express');

module.exports = () => {
  const api = new Router();


  api.post('/', (req, res) => {
    new User(req.body)
      .save((error, user) => {
        if (error) {
          logger.error('ERROR: POST / ', error);
          res.status(400).send();
          return;
        }
        res.json(user);
      });
  });

  api.get('/', (req, res) => {
    User.findById(req.query.id)
      .exec()
      .then((user) => {
        res.json(user);
      })
      .catch((error) => {
        logger.error('ERROR: GET / ', error);
        res.status(404).send();
      });
  });

  api.put('/', (req, res) => {
    User.findOneAndUpdate({
      _id: req.body.id,
    }, req.body, {
      new: true,
    })
    .exec()
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      logger.error('ERROR: PUT / ', error);
      res.status(404).send();
    });
  });

  api.delete('/', (req, res, next) => {
    User.findOneAndUpdate({
      _id: req.body.id,
    }, {
      enabled: false,
    })
    .exec()
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      logger.error('ERROR: DELETE / ', error);
      next(error);
    });
  });

  return api;
};
