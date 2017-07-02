const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const RedisStore = require('connect-redis')(session);

const config = require('./config');
const logger = require('./lib/logger');

const helloController = require('./controller/hello');

const app = express();

mongoose.Promise = global.Promise;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  store: new RedisStore(),
  secret: config.get('COOKIE_SECRET'),
}));


/* ROUTES */

app.use('/', helloController());

/* ROUTES END */


if (!module.parent) {
  logger.info(`started with ${config.get('NODE_ENV')} env.`);

  mongoose.connection
    .on('error', err => logger.error(err))
    .once('open', () => {
      logger.info(`connected: ${config.get('MONGODB:SERVER')}`);

      app.listen(config.get('HTTP_PORT'), function serverListen() {
        logger.info(`Express server listening on port http://localhost:${this.address().port}`);
      });
    });

  mongoose.connect(config.get('MONGODB:SERVER'));
}

module.exports = app;
