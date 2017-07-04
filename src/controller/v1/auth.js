const passport = require('passport');

const {
  Router,
} = require('express');

module.exports = () => {
  const api = new Router();


  api.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  (req, res) => {
    res.json(req.user);
  });


  return api;
};
