const { Router } = require('express');

module.exports = () => {
  const api = new Router();

  api.get('/', (req, res) => {
    res.send('Hello World!');
  });

  return api;
};
