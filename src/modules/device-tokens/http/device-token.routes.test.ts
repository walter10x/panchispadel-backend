import express from 'express';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import { errorHandler } from '../../../shared/infrastructure/http/error-handler';
import { DeviceTokenController } from './device-token.controller';
import { createDeviceTokenRoutes } from './device-token.routes';
import { RegisterDeviceTokenUseCase } from '../application/register-device-token.use-case';
import { IDeviceTokenRepository } from '../domain/device-token.repository';

function createMockRepo(): jest.Mocked<IDeviceTokenRepository> {
  return {
    save: jest.fn(),
    findByUser: jest.fn(),
    findByToken: jest.fn(),
    delete: jest.fn(),
  };
}

function generateToken(userId: string): string {
  return jwt.sign({ userId, email: `${userId}@test.com`, name: 'Test User' }, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
}

describe('DeviceTokenRoutes', () => {
  let app: express.Express;
  let repo: jest.Mocked<IDeviceTokenRepository>;

  beforeEach(() => {
    repo = createMockRepo();
    const useCase = new RegisterDeviceTokenUseCase(repo);
    const controller = new DeviceTokenController(useCase);

    app = express();
    app.use(express.json());
    app.use('/api/devices', createDeviceTokenRoutes(controller));
    app.use(errorHandler);
  });

  describe('POST /api/devices/register-token', () => {
    it('devuelve 200 con token válido y autenticación', async () => {
      repo.findByToken.mockResolvedValue(null);

      const token = generateToken('user-1');
      const res = await supertest(app)
        .post('/api/devices/register-token')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: 'fcm-token-123', platform: 'android' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Device token registered successfully' });
    });

    it('devuelve 401 sin token de autenticación', async () => {
      const res = await supertest(app)
        .post('/api/devices/register-token')
        .send({ token: 'fcm-token-123', platform: 'android' });

      expect(res.status).toBe(401);
    });

    it('devuelve 400 con body inválido', async () => {
      const token = generateToken('user-1');
      const res = await supertest(app)
        .post('/api/devices/register-token')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: '', platform: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('devuelve 400 cuando falta el campo platform', async () => {
      const jwtToken = generateToken('user-1');
      const res = await supertest(app)
        .post('/api/devices/register-token')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ token: 'fcm-token-123' });

      expect(res.status).toBe(400);
    });
  });
});
