import { RegisterDeviceTokenUseCase } from './register-device-token.use-case';
import { IDeviceTokenRepository } from '../domain/device-token.repository';
import { DeviceToken } from '../domain/device-token.entity';
import { RegisterDeviceTokenDTO } from './dtos/register-device-token.dto';

function createMockRepo(): jest.Mocked<IDeviceTokenRepository> {
  return {
    save: jest.fn(),
    findByUser: jest.fn(),
    findByToken: jest.fn(),
    delete: jest.fn(),
  };
}

function validDto(overrides?: Partial<RegisterDeviceTokenDTO>): RegisterDeviceTokenDTO {
  return {
    token: 'fcm-token-123',
    platform: 'android',
    ...overrides,
  };
}

function makeToken(
  overrides?: Partial<{
    id: string;
    userId: string;
    token: string;
    platform: 'android' | 'ios';
  }>,
): DeviceToken {
  return DeviceToken.reconstitute({
    id: overrides?.id ?? 'default-id',
    userId: overrides?.userId ?? 'user-1',
    token: overrides?.token ?? 'fcm-token-123',
    platform: overrides?.platform ?? 'android',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('RegisterDeviceTokenUseCase', () => {
  it('crea un nuevo token cuando no existe', async () => {
    const repo = createMockRepo();
    repo.findByToken.mockResolvedValue(null);
    const useCase = new RegisterDeviceTokenUseCase(repo);

    await useCase.execute('user-1', validDto());

    expect(repo.save).toHaveBeenCalledTimes(1);
    const saved = repo.save.mock.calls[0]?.[0] as DeviceToken;
    expect(saved.userId).toBe('user-1');
    expect(saved.token).toBe('fcm-token-123');
    expect(saved.platform).toBe('android');
  });

  it('actualiza el token si ya existe para el mismo usuario', async () => {
    const existing = makeToken();
    const repo = createMockRepo();
    repo.findByToken.mockResolvedValue(existing);
    const useCase = new RegisterDeviceTokenUseCase(repo);

    await useCase.execute('user-1', validDto({ token: 'updated-token' }));

    expect(repo.findByToken).toHaveBeenCalledWith('updated-token');
    expect(repo.delete).not.toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('elimina token antiguo y crea nuevo si pertenece a otro usuario', async () => {
    const existing = makeToken({ userId: 'user-2' });
    const repo = createMockRepo();
    repo.findByToken.mockResolvedValue(existing);
    const useCase = new RegisterDeviceTokenUseCase(repo);

    await useCase.execute('user-1', validDto());

    expect(repo.delete).toHaveBeenCalledWith(existing.id);
    expect(repo.save).toHaveBeenCalledTimes(1);
    const saved = repo.save.mock.calls[0]?.[0] as DeviceToken;
    expect(saved.userId).toBe('user-1');
  });
});
