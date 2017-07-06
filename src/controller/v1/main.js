const Redis = require('ioredis');
const base58 = require('base58');
const { Router } = require('express');

const config = require('../../config');
const track = require('../../lib/track');
const logger = require('../../lib/logger');
const asyncWrap = require('../../lib/async-wrap');

const User = require('../../model/user');

const publisher = new Redis();
const redisClient = new Redis();

module.exports = () => {
  const api = new Router();

  api.post('/', asyncWrap(async (req, res) => {
    const url = req.body.url || '';
    const isAuthenticated = req.isAuthenticated();

    const id = await track.getNextId();
    const encodedId = base58.encode(id);

    if (isAuthenticated) {
      User.findByIdAndUpdate(req.user.id, {
        $addToSet: {
          links: encodedId,
        },
      })
      .exec()
      .catch((error) => {
        logger.error('ERROR: POST / findByIdAndUpdate', error);
      });
    }

    try {
      await redisClient.hset(encodedId, 'url', url);
      res.json({
        url: `${config.get('DOMAIN_NAME')}/${encodedId}`,
        id: encodedId,
      });
    } catch (error) {
      logger.error('ERROR: redisClient.hset ', error);
      res.status(400).send();
    }
  }));

  api.get('/:id', asyncWrap(async(req, res) => {
    const id = req.params.id || '';
    const url = await redisClient.hget(id, 'url');

    if (!url) {
      logger.error('ERROR: GET /:id:  NO URL');
      res.status(404).send();
      return;
    }

    await redisClient.hincrby(id, 'views', 1);
    await publisher.publish('updates', id);

    res.redirect(url);
  }));

  api.get('/stream/:id', asyncWrap(async(req, res) => {
    req.socket.setTimeout(500);
    const isAuthenticated = req.isAuthenticated();

    let messageCount = 0;
    const id = req.params.id || false;

    if (!id) {
      logger.error('ERROR: GET /stream/:id: NO ID');
      res.status(400).send();
      return;
    }

    if (!isAuthenticated) {
      logger.error('ERROR: GET /stream/:id: isAuthenticated');
      res.status(401).send();
      return;
    }

    if (!req.user.links.includes(id)) {
      logger.error(`ERROR: GET /stream/:id: user is no allowed to access id: ${id}`);
      res.status(403).send();
      return;
    }

    const subscriber = new Redis();

    subscriber.on('message', async() => {
      messageCount += 1;
      const count = await redisClient.hget(id, 'views');
      res.write(`id: ${messageCount}\n`);
      res.write(`data: ${count}\n\n`);
    });

    subscriber.on('error', (error) => {
      logger.error('ERROR: sub.on(error) ', error);
    });

    subscriber.subscribe('updates');

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
  }));

  return api;
};
