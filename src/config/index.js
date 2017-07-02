const nconf = require('nconf');

nconf
  .argv()
  .env()
  .defaults({
    NODE_ENV: 'development',
  })
  .file(`${__dirname}/env/${nconf.get('NODE_ENV')}.json`)
  .file('default', `${__dirname}/env/default.json`);

module.exports = nconf;
