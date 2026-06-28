import { CancelMatchUseCase } from './cancel-match.use-case';
import { IMatchRepository } from '../domain/match.repository';
import { INotificationService } from '../domain/notification-service';
import { Match } from '../domain/match.entity';
import { NotFoundError } from '../../../shared/domain/errors';
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

describe('CancelMatchUseCase', () => {
  let useCase: CancelMatchUseCase;
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
    useCase = new CancelMatchUseCase(repository, notifService, wsGateway);
  });

  it('cancela el match por el creador, guarda y notifica a los players', async () => {
    const match = Match.create({
      creatorId: 'user-1',
      creatorEmail: 'user-1@test.com',
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Test Match',
    });
    match.join('user-2', 'user2@test.com', 'User 2');
    match.join('user-3', 'user3@test.com', 'User 3');
    repository.findById.mockResolvedValue(match);

    const result = await useCase.execute(
      { matchId: match.id },
      'user-1',
      'User 1',
    );

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('cancelado');
    expect(notifService.notifyMatchCancelled).toHaveBeenCalledWith(
      match.id,
      ['user-2', 'user-3'],
      'User 1',
    );
  });

  it('lanza NotFoundError si el match no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(
        { matchId: 'no-existe' },
        'user-1',
        'User 1',
      ),
    ).rejects.toThrow(NotFoundError);
    expect(repository.save).not.toHaveBeenCalled();
    expect(notifService.notifyMatchCancelled).not.toHaveBeenCalled();
  });

  it('no notifica si no hay otros jugadores', async () => {
    const match = Match.create({
      creatorId: 'user-1',
      creatorEmail: 'user-1@test.com',
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Test Match',
    });
    repository.findById.mockResolvedValue(match);

    await useCase.execute(
      { matchId: match.id },
      'user-1',
      'User 1',
    );

    expect(notifService.notifyMatchCancelled).not.toHaveBeenCalled();
  });
});
