import { LeaveMatchUseCase } from './leave-match.use-case';
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

describe('LeaveMatchUseCase', () => {
  let useCase: LeaveMatchUseCase;
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
    useCase = new LeaveMatchUseCase(repository, notifService, wsGateway);
  });

  it('remueve jugador del match, guarda y notifica', async () => {
    const match = Match.create({
      creatorId: 'user-1',
      creatorEmail: 'user-1@test.com',
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Test Match',
      maxPlayers: 3,
    });
    match.join('user-2', 'User 2');
    repository.findById.mockResolvedValue(match);

    const result = await useCase.execute(
      { matchId: match.id },
      'user-2',
      'User 2',
    );

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(result.players).toHaveLength(1);
    expect(result.players[0]?.playerId).toBe('user-1');
    expect(notifService.notifyPlayerLeft).toHaveBeenCalledWith(
      match.id,
      'user-1',
      'User 2',
    );
  });

  it('lanza NotFoundError si el match no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(
        { matchId: 'no-existe' },
        'user-2',
        'User 2',
      ),
    ).rejects.toThrow(NotFoundError);
    expect(repository.save).not.toHaveBeenCalled();
    expect(notifService.notifyPlayerLeft).not.toHaveBeenCalled();
  });
});
