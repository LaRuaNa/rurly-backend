const Redis = require('ioredis');
const {
  Router,
} = require('express');

const track = require('../lib/track');
const base58 = require('../lib/base58');
const logger = require('../lib/logger');

const publisher = new Redis();
const redisClient = new Redis();

module.exports = () => {
  const api = new Router();

  api.post('/', async(req, res) => {
    const url = req.body.url || '';

    const id = await track.getNextId();
    const encodedId = await base58.encode(id);

    try {
      await redisClient.hset(encodedId, 'url', url);
      res.json({
        id: encodedId,
      });
    } catch (error) {
      logger.error('ERROR: redisClient.hset ', error);
      res.status(400).send();
    }
  });

  api.get('/:id', async(req, res) => {
    const id = req.params.id || '';
    const url = await redisClient.hget(id, 'url');
    console.log(`url: ${url}`);
    if (!url) {
      logger.error('ERROR: GET /:id:  NO URL');
      res.status(404).send();
      return;
    }

    await redisClient.hincrby(id, 'views', 1);
    await publisher.publish('updates', id);

    res.send(url);
  });

  api.get('/stream/:id', async(req, res) => {
    req.socket.setTimeout(0x7FFFFFFF);

    let messageCount = 0;
    const id = req.params.id || false;

    if (!id) {
      logger.error('ERROR: GET /stream/:id: NO ID');
      res.status(400).send();
      return;
    }

    const subscriber = new Redis();

    subscriber.subscribe('updates');

    subscriber.on('message', async(channel, message) => {
      messageCount += 1;
      const count = await redisClient.hget(id, 'views');
      // console.log(`message: ${message}, channel: ${channel}`);
      res.write(`id: ${messageCount}\n`);
      res.write(`data: ${count}\n\n`);
    });

    subscriber.on('error', (error) => {
      logger.error('ERROR: sub.on(error) ', error);
    });

    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n');

    req.on('close', () => {
      subscriber.unsubscribe();
      subscriber.quit();
    });
  });

  return api;
};
