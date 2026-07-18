import { FirebaseAdminService } from './firebase-admin';
import { IDeviceTokenRepository } from '../modules/device-tokens/domain/device-token.repository';
import { DeviceToken } from '../modules/device-tokens/domain/device-token.entity';

const mockApps: Array<{ name: string }> = [];
const mockSendEachForMulticast = jest.fn();

jest.mock('firebase-admin', () => ({
  get apps() {
    return mockApps;
  },
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  messaging: jest.fn(() => ({
    sendEachForMulticast: mockSendEachForMulticast,
  })),
}));

function createMockRepo(): jest.Mocked<IDeviceTokenRepository> {
  return {
    save: jest.fn(),
    findByUser: jest.fn(),
    findByToken: jest.fn(),
    delete: jest.fn(),
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

describe('FirebaseAdminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApps.length = 0;
    mockApps.push({ name: '[DEFAULT]' });
  });

  it('envía notificación push a todos los tokens del usuario', async () => {
    const repo = createMockRepo();
    const tokens = [
      makeToken({ token: 'token-1' }),
      makeToken({ token: 'token-2' }),
    ];
    repo.findByUser.mockResolvedValue(tokens);
    mockSendEachForMulticast.mockResolvedValue({
      successCount: 2,
      failureCount: 0,
      responses: [{ success: true }, { success: true }],
    });

    const service = new FirebaseAdminService(repo);
    await service.sendToUser('user-1', 'Título', 'Mensaje', { type: 'test' });

    expect(mockSendEachForMulticast).toHaveBeenCalledWith(
      expect.objectContaining({
        tokens: ['token-1', 'token-2'],
        notification: { title: 'Título', body: 'Mensaje' },
        data: { type: 'test' },
      }),
    );
  });

  it('no hace nada si el usuario no tiene tokens', async () => {
    const repo = createMockRepo();
    repo.findByUser.mockResolvedValue([]);

    const service = new FirebaseAdminService(repo);
    await service.sendToUser('user-1', 'Título', 'Mensaje');

    expect(mockSendEachForMulticast).not.toHaveBeenCalled();
  });

  it('omite push si Firebase no está inicializado', async () => {
    mockApps.length = 0;
    const repo = createMockRepo();
    repo.findByUser.mockResolvedValue([makeToken()]);

    const service = new FirebaseAdminService(repo);
    await service.sendToUser('user-1', 'Título', 'Mensaje');

    expect(repo.findByUser).not.toHaveBeenCalled();
    expect(mockSendEachForMulticast).not.toHaveBeenCalled();
  });

  it('elimina tokens con errores de registro no válido', async () => {
    const repo = createMockRepo();
    const token1 = makeToken({ id: 'id-1', token: 'token-1' });
    const token2 = makeToken({ id: 'id-2', token: 'token-2' });
    repo.findByUser.mockResolvedValue([token1, token2]);
    mockSendEachForMulticast.mockResolvedValue({
      successCount: 1,
      failureCount: 1,
      responses: [
        { success: true },
        {
          success: false,
          error: { code: 'messaging/registration-token-not-registered' },
        },
      ],
    });

    const service = new FirebaseAdminService(repo);
    await service.sendToUser('user-1', 'Título', 'Mensaje');

    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith('id-2');
  });

  it('elimina tokens con invalid-registration-token', async () => {
    const repo = createMockRepo();
    const token1 = makeToken({ id: 'id-1', token: 'token-1' });
    repo.findByUser.mockResolvedValue([token1]);
    mockSendEachForMulticast.mockResolvedValue({
      successCount: 0,
      failureCount: 1,
      responses: [
        {
          success: false,
          error: { code: 'messaging/invalid-registration-token' },
        },
      ],
    });

    const service = new FirebaseAdminService(repo);
    await service.sendToUser('user-1', 'Título', 'Mensaje');

    expect(repo.delete).toHaveBeenCalledWith('id-1');
  });
});
