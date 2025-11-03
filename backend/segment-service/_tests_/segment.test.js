const request = require('supertest');
const app = require('../index');

describe('Segment Service', () => {
  it('should respond at root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Segment Service Running/i);
  });

  it('should evaluate valid rules correctly', async () => {
    const rules = "price > 50\nstock_status = 'instock'";
    const res = await request(app)
      .post('/segments/evaluate')
      .send({ rules });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return 400 for invalid rule syntax', async () => {
    const res = await request(app)
      .post('/segments/evaluate')
      .send({ rules: "invalid syntax" });
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 for missing rules', async () => {
    const res = await request(app).post('/segments/evaluate').send({});
    expect(res.statusCode).toBe(400);
  });
});

afterAll((done) => {
  if (global.db && global.db.close) global.db.close();
  done();
});
