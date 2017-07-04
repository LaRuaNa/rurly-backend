const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const RedisStore = require('connect-redis')(session);
const Strategy = require('passport-local').Strategy;

const User = require('./model/user');
const config = require('./config');
const logger = require('./lib/logger');

const requestloggerMiddleware = require('./middleware/requestLogger');

const urlsControllerV1 = require('./controller/v1/urls');
const usersControllerV1 = require('./controller/v1/users');
const authControllerV1 = require('./controller/v1/auth');

const app = express();

passport.use(new Strategy(
  (username, password, cb) => {
    console.log(`username: ${username} password: ${password}`);
    User.findOne({
        username,
      })
      .exec()
      .then((user) => {
        if (!user) {
          cb(null, false);
          return;
        }
        user.comparePassword(password, (error, isMatch) => {
          if (error) {
            cb(error);
            logger.error('ERROR: comparePassword() ', error);

            return;
          }
          if (!isMatch) {
            cb(null, false);
            return;
          }
          if (isMatch) {
            cb(null, user);
          }
        });
      })
      .catch((error) => {
        cb(error);
        logger.error('ERROR: User.findOne ', error);
      });
  }));

passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (error, user) => {
    if (error) {
      cb(error);
      return;
    }
    cb(null, user);
  });
});

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


app.use(passport.initialize());
app.use(passport.session());

/* MIDDLEWARES */

app.use(requestloggerMiddleware());

/* MIDDLEWARES END */


/* ROUTES */

app.use('/users', usersControllerV1());
app.use('/auth', authControllerV1());
app.use('/', urlsControllerV1());

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
