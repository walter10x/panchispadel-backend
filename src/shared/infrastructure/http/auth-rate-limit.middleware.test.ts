import express from 'express';
import request from 'supertest';
import { createAuthRateLimiter } from './auth-rate-limit.middleware';

describe('createAuthRateLimiter', () => {
  it('permite requests dentro del límite', async () => {
    const limiter = createAuthRateLimiter({ windowMs: 60_000, max: 3 });
    const app = express();
    app.post('/login', limiter, (_req, res) => {
      res.status(200).json({ ok: true });
    });

    const first = await request(app).post('/login');
    const second = await request(app).post('/login');

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });

  it('devuelve 429 con code RATE_LIMIT al exceder el máximo', async () => {
    const limiter = createAuthRateLimiter({ windowMs: 60_000, max: 2 });
    const app = express();
    app.post('/login', limiter, (_req, res) => {
      res.status(200).json({ ok: true });
    });

    await request(app).post('/login');
    await request(app).post('/login');
    const blocked = await request(app).post('/login');

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      error: 'Demasiados intentos. Inténtalo de nuevo más tarde.',
      code: 'RATE_LIMIT',
    });
  });
});
