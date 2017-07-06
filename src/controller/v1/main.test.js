const { expect } = require('chai');
const request = require('supertest');

const app = require('../../app');


describe('POST /', () => {
  it('should redirect to "http://bla.one"', (done) => {
    request(app)
      .post('/')
      .send({
        url: 'http://bla.one',
      })
      .expect((res) => {
        const url = res.body.url;
        const id = res.body.id;
        expect(url).to.be.a('string');
        expect(id).to.be.a('string');
      })
      .expect(200, done);
  });
});


describe('GET /:id', () => {
  before((done) => {
    request(app)
      .post('/')
      .send({
        url: 'http://bla.one',
      })
      .end((error, res) => {
        this.id = res.body.id;
        done();
      });
  });
  it('should redirect to "http://bla.one"', (done) => {
    request(app)
      .get(`/${this.id}`)
      .expect((res) => {
        expect(res.headers.location).to.be.equal('http://bla.one');
      })
      .expect(302, done);
  });
});
