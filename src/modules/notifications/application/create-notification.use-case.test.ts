import { CreateNotificationUseCase } from './create-notification.use-case';
import { INotificationRepository } from '../domain/notification.repository';
import { Notification } from '../domain/notification.entity';
import { CreateNotificationDTO } from './dtos/create-notification.dto';
import { IPushNotificationService } from '../../device-tokens/domain/push-notification-service';
import type { IWsGateway } from '../../websocket/domain/ws-gateway';
import { WS_EVENT_NOTIFICATION_NEW } from '../../websocket/domain/ws-events';

function createMockRepo(): jest.Mocked<INotificationRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    findUnreadByUser: jest.fn(),
    markAsRead: jest.fn(),
    delete: jest.fn(),
    countUnread: jest.fn(),
  };
}

function createMockPushService(): jest.Mocked<IPushNotificationService> {
  return {
    sendToUser: jest.fn(),
  };
}

function validDto(overrides?: Partial<CreateNotificationDTO>): CreateNotificationDTO {
  return {
    userId: 'user-1',
    type: 'match_created',
    title: 'Nuevo partido',
    message: 'Se ha creado un nuevo partido',
    ...overrides,
  };
}

describe('CreateNotificationUseCase', () => {
  it('crea y guarda una notificación, devuelve response DTO', async () => {
    const repo = createMockRepo();
    const useCase = new CreateNotificationUseCase(repo);

    const dto = validDto();
    const result = await useCase.execute(dto);

    expect(repo.save).toHaveBeenCalledTimes(1);
    const saved = repo.save.mock.calls[0]?.[0] as Notification;
    expect(saved.userId).toBe('user-1');
    expect(saved.title).toBe('Nuevo partido');
    expect(saved.type.getValue()).toBe('match_created');
    expect(saved.read).toBe(false);

    expect(result.id).toBeDefined();
    expect(result.userId).toBe('user-1');
    expect(result.type).toBe('match_created');
    expect(result.title).toBe('Nuevo partido');
    expect(result.message).toBe('Se ha creado un nuevo partido');
    expect(result.read).toBe(false);
    expect(result.createdAt).toBeDefined();
  });

  it('guarda notificación con matchId opcional', async () => {
    const repo = createMockRepo();
    const useCase = new CreateNotificationUseCase(repo);

    const dto = validDto({ matchId: 'match-123' });
    const result = await useCase.execute(dto);

    expect(result.matchId).toBe('match-123');
  });

  it('lanza error si type no es válido', async () => {
    const repo = createMockRepo();
    const useCase = new CreateNotificationUseCase(repo);

    await expect(
      useCase.execute(validDto({ type: 'invalid' as never })),
    ).rejects.toThrow();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('envía push notification si el servicio está disponible', async () => {
    const repo = createMockRepo();
    const pushService = createMockPushService();
    const useCase = new CreateNotificationUseCase(repo, pushService);

    const dto = validDto({ matchId: 'match-123' });
    await useCase.execute(dto);

    expect(pushService.sendToUser).toHaveBeenCalledTimes(1);
    expect(pushService.sendToUser).toHaveBeenCalledWith(
      'user-1',
      'Nuevo partido',
      'Se ha creado un nuevo partido',
      { type: 'match_created', matchId: 'match-123' },
    );
  });

  it('no envía push si no hay servicio configurado', async () => {
    const repo = createMockRepo();
    const useCase = new CreateNotificationUseCase(repo);

    await useCase.execute(validDto());

    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('emite evento WS notification:new si wsGateway está disponible', async () => {
    const repo = createMockRepo();
    const wsGateway: jest.Mocked<IWsGateway> = {
      emitToUser: jest.fn(),
      emitToMatch: jest.fn(),
      broadcast: jest.fn(),
    };
    const useCase = new CreateNotificationUseCase(repo, undefined, wsGateway);

    const dto = validDto({ matchId: 'match-123', playerId: 'player-1' });
    await useCase.execute(dto);

    expect(wsGateway.emitToUser).toHaveBeenCalledTimes(1);
    expect(wsGateway.emitToUser).toHaveBeenCalledWith(
      'user-1',
      WS_EVENT_NOTIFICATION_NEW,
      expect.objectContaining({
        notificationId: expect.any(String),
        type: 'match_created',
        matchId: 'match-123',
        playerId: 'player-1',
      }),
    );
  });

  it('no emite WS si wsGateway no está configurado', async () => {
    const repo = createMockRepo();
    const useCase = new CreateNotificationUseCase(repo);

    await useCase.execute(validDto());

    // No error thrown — WS is optional
    expect(repo.save).toHaveBeenCalledTimes(1);
  });
});
