const Redis = require('ioredis');

const redisClient = new Redis();

const getNextId = async () => {
  const key = 'counter';
  await redisClient.incr(key);
  const value = await redisClient.get(key);
  return value;
};

module.exports.getNextId = getNextId;

