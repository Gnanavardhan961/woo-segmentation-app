const request = require('supertest');
const { app, db } = require('../index');

describe('Product Service', () => {
  it('should respond at root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Product Service Running/i);
  });

  it('should return an array of products', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

afterAll((done) => {
  db.close(() => {
    console.log('Closed DB connection after tests');
    done();
  });
});
