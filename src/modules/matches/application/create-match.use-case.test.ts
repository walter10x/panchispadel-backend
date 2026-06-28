import { CreateMatchUseCase } from './create-match.use-case';
import { IMatchRepository } from '../domain/match.repository';
import { INotificationService } from '../domain/notification-service';
import { Match } from '../domain/match.entity';
import type { IWsGateway } from '../../websocket/domain/ws-gateway';

const FUTURE_DATE = new Date(Date.now() + 86400000);

function createMockNotifService(): jest.Mocked<INotificationService> {
  return {
    notifyPlayerJoined: jest.fn().mockResolvedValue(undefined),
    notifyPlayerLeft: jest.fn().mockResolvedValue(undefined),
    notifyMatchCancelled: jest.fn().mockResolvedValue(undefined),
    notifyMatchCreated: jest.fn().mockResolvedValue(undefined),
    notifyMatchFull: jest.fn().mockResolvedValue(undefined),
    notifyPlayerConfirmed: jest.fn().mockResolvedValue(undefined),
    notifyPlayerRejected: jest.fn().mockResolvedValue(undefined),
  };
}

function createMockWsGateway(): jest.Mocked<IWsGateway> {
  return {
    emitToUser: jest.fn(),
    emitToMatch: jest.fn(),
    broadcast: jest.fn(),
  };
}

describe('CreateMatchUseCase', () => {
  let useCase: CreateMatchUseCase;
  let repository: jest.Mocked<IMatchRepository>;
  let notifService: jest.Mocked<INotificationService>;
  let wsGateway: jest.Mocked<IWsGateway>;

  beforeEach(() => {
    repository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByDateRange: jest.fn(),
      findByPlayer: jest.fn(),
      findOpen: jest.fn(),
      delete: jest.fn(),
    };
    notifService = createMockNotifService();
    wsGateway = createMockWsGateway();
    useCase = new CreateMatchUseCase(repository, notifService, wsGateway);
  });

  it('crea un match, lo guarda y notifica', async () => {
    const dto = {
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Partido de prueba',
      durationMinutes: 60,
      maxPlayers: 3,
    };

    const result = await useCase.execute(dto, 'user-1', 'user-1@test.com', 'User One');

    expect(repository.save).toHaveBeenCalledTimes(1);
    const savedMatch = repository.save.mock.calls[0]?.[0] as Match;
    expect(savedMatch.creatorId).toBe('user-1');
    expect(savedMatch.creatorEmail).toBe('user-1@test.com');
    expect(savedMatch.clubId).toBe('club-1');
    expect(savedMatch.title).toBe('Partido de prueba');
    expect(savedMatch.durationMinutes).toBe(60);
    expect(savedMatch.maxPlayers).toBe(3);
    expect(savedMatch.players).toHaveLength(1);
    expect(savedMatch.players[0]?.playerId).toBe('user-1');
    expect(savedMatch.players[0]?.email).toBe('user-1@test.com');
    expect(savedMatch.players[0]?.displayName).toBe('User One');

    expect(savedMatch.level).toBe('medio');

    expect(result).toEqual({
      id: savedMatch.id,
      creatorId: 'user-1',
      creatorEmail: 'user-1@test.com',
      creatorName: 'User One',
      clubId: 'club-1',
      dateTime: FUTURE_DATE.toISOString(),
      title: 'Partido de prueba',
      durationMinutes: 60,
      status: 'abierto',
      maxPlayers: 3,
      level: 'medio',
      players: [{ playerId: 'user-1', email: 'user-1@test.com', displayName: 'User One', status: 'confirmado' }],
      createdAt: savedMatch.createdAt.toISOString(),
    });

    expect(notifService.notifyMatchCreated).toHaveBeenCalledWith(
      savedMatch.id,
      'user-1',
    );
  });

  it('usa valores por defecto cuando no se proveen', async () => {
    const dto = {
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Partido con defaults',
    };

    const result = await useCase.execute(dto, 'user-1', 'user-1@test.com', 'User One');

    expect(result.durationMinutes).toBe(90);
    expect(result.maxPlayers).toBe(4);
    expect(result.level).toBe('medio');
  });

  it('usa el level personalizado cuando se provee', async () => {
    const dto = {
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Partido pro',
      level: 'pro',
    };

    const result = await useCase.execute(dto, 'user-1', 'user-1@test.com', 'User One');

    expect(result.level).toBe('pro');
  });

  it('propaga errores de validación del dominio', async () => {
    const pastDate = new Date(Date.now() - 86400000);
    const dto = {
      clubId: 'club-1',
      dateTime: pastDate,
      title: 'Partido pasado',
    };

    await expect(useCase.execute(dto, 'user-1', 'user-1@test.com')).rejects.toThrow(
      'dateTime debe ser una fecha futura',
    );
    expect(repository.save).not.toHaveBeenCalled();
    expect(notifService.notifyMatchCreated).not.toHaveBeenCalled();
  });
});
