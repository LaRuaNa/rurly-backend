const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const RedisStore = require('connect-redis')(session);

const config = require('./config');
const logger = require('./lib/logger');

const requestloggerMiddleware = require('./middleware/requestLogger');

const urlController = require('./controller/url');

const app = express();


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


/* MIDDLEWARES */

app.use(requestloggerMiddleware());

/* MIDDLEWARES END */


/* ROUTES */

app.use('/', urlController());

/* ROUTES END */


if (!module.parent) {
  logger.info(`started with ${config.get('NODE_ENV')} env.`);

  app.listen(config.get('HTTP_PORT'), function serverListen() {
    logger.info(`Express server listening on port http://localhost:${this.address().port}`);
  });
}

module.exports = app;
