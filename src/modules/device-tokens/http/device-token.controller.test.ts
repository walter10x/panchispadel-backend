import { DeviceTokenController } from './device-token.controller';
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

function makeReq(userId: string, body?: Record<string, unknown>) {
  return {
    user: { userId, email: 'test@test.com' },
    body: body ?? { token: 'fcm-token', platform: 'android' },
  } as any;
}

function makeRes() {
  const res: any = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

function makeNext() {
  return jest.fn();
}

describe('DeviceTokenController', () => {
  describe('registerToken', () => {
    it('devuelve 200 cuando el registro es exitoso', async () => {
      const repo = createMockRepo();
      repo.findByToken.mockResolvedValue(null);
      const useCase = new RegisterDeviceTokenUseCase(repo);
      const controller = new DeviceTokenController(useCase);

      const req = makeReq('user-1');
      const res = makeRes();
      const next = makeNext();

      await controller.registerToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Device token registered successfully',
      });
    });

    it('llama next con error si el caso de uso falla', async () => {
      const repo = createMockRepo();
      repo.findByToken.mockRejectedValue(new Error('DB error'));
      const useCase = new RegisterDeviceTokenUseCase(repo);
      const controller = new DeviceTokenController(useCase);

      const req = makeReq('user-1');
      const res = makeRes();
      const next = makeNext();

      await controller.registerToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
