const morgan = require('morgan');
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const errorhandler = require('errorhandler');
const cookieParser = require('cookie-parser');
const RedisStore = require('connect-redis')(session);
const Strategy = require('passport-local').Strategy;

const config = require('./config');
const User = require('./model/user');
const logger = require('./lib/logger');

const mainControllerV1 = require('./controller/v1/main');
const authControllerV1 = require('./controller/v1/auth');
const usersControllerV1 = require('./controller/v1/users');

mongoose.Promise = global.Promise;

const app = express();

passport.use(new Strategy(async(username, password, cb) => {
  User.findOne({
    username,
  })
    .exec()
    .then(async(user) => {
      if (!user) {
        cb(null, false);
        return;
      }

      let isMatch = false;
      try {
        isMatch = await user.comparePassword(password);
      } catch (err) {
        cb(err);
        return;
      }

      if (!isMatch) {
        cb(null, false);
        return;
      }
      if (isMatch) {
        cb(null, user);
      }
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
  secret: config.get('SESSION_SECRET'),
}));
app.use(morgan('combined', {
  stream: {
    write: msg => logger.info(msg),
  },
}));

app.use(passport.initialize());
app.use(passport.session());

/* ROUTES */
app.use('/users', usersControllerV1());
app.use('/auth', authControllerV1());
app.use('/', mainControllerV1());
/* ROUTES END */

app.use(errorhandler());

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
