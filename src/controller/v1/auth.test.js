const { expect } = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');

const User = require('../../model/user');
const config = require('../../config');
const app = require('../../app');


mongoose.Promise = global.Promise;

describe('', () => {
  before(() => mongoose.connect(config.get('MONGODB:SERVER')));
  after(() => mongoose.disconnect());
  beforeEach((done) => {
    request(app)
      .post('/users')
      .send({
        username: 'testuser',
        password: 'testpassword',
        email: 'testuser@testmail.de',
      })
      .end((error, res) => {
        this.id = res.body._id;
        done();
      });
  });
  afterEach((done) => {
    User.findByIdAndRemove(this.id)
      .then(() => {
        done();
      });
  });

  it('POST /login should login and return user object', (done) => {
    request(app)
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'testpassword',
      })
      .expect((res) => {
        const username = res.body.username;
        const email = res.body.email;
        expect(username).to.be.equal('testuser');
        expect(email).to.be.equal('testuser@testmail.de');
      })
      .expect(200, done);
  });
});
