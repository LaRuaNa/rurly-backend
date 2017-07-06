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

  it('GET / should return a user object', (done) => {
    request(app)
      .get('/users')
      .query({
        id: this.id,
      })
      .expect((res) => {
        const username = res.body.username;
        const email = res.body.email;
        expect(username).to.equal('testuser');
        expect(email).to.equal('testuser@testmail.de');
      })
      .expect(200, done);
  });

  it('PUT / should update an user and return', (done) => {
    request(app)
      .put('/users')
      .send({
        id: this.id,
        username: 'testuserUPDATED',
        email: 'testuserUPDATED@testmail.de',
      })
      .expect((res) => {
        const username = res.body.username;
        const email = res.body.email;
        expect(username).to.equal('testuserUPDATED');
        expect(email).to.equal('testuserUPDATED@testmail.de');
      })
      .expect(200, done);
  });

  it('DELETE / should mark an user as enabled = false and return', (done) => {
    request(app)
      .delete('/users')
      .send({
        id: this.id,
      })
      .expect((res) => {
        const isEnabled = res.body.enabled;
        expect(isEnabled).to.be.false;
      })
    .expect(200, done);
  });
});
