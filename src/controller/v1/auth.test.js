const { expect } = require('chai');
const request = require('supertest');

const app = require('../../app');

describe('/', () => {
  it('should return "Hello World!"', (done) => {
    request(app)
      .get('/')
      .expect('Content-Type', /text/)
      .expect((res) => {
        expect(res.text).to.be.equal('Hello World!');
      })
      .expect(200, done);
  });
});
