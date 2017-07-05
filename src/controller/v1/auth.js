const passport = require('passport');
const { Router } = require('express');

module.exports = () => {
  const api = new Router();

  api.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        next(err);
        return;
      }

      if (!user) {
        res.status(401).send({
          error: info.message,
        });
        return;
      }

      req.logIn(user, (loginError) => {
        if (loginError) {
          next(loginError);
          return;
        }
        res.json(user);
      });
    })(req, res, next);
  });

  return api;
};
