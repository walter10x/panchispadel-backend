import { ConfirmPlayerUseCase } from './confirm-player.use-case';
import { IMatchRepository } from '../domain/match.repository';
import { INotificationService } from '../domain/notification-service';
import { Match } from '../domain/match.entity';
import { NotFoundError, ValidationError } from '../../../shared/domain/errors';
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

describe('ConfirmPlayerUseCase', () => {
  let useCase: ConfirmPlayerUseCase;
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
    useCase = new ConfirmPlayerUseCase(repository, notifService, wsGateway);
  });

  it('confirma jugador pendiente y notifica con displayName como nombre', async () => {
    const match = Match.create({
      creatorId: 'creator-1',
      creatorEmail: 'creator@test.com',
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Test Match',
      maxPlayers: 3,
    });
    match.join('player-2', 'player2@test.com', 'Player Two');
    repository.findById.mockResolvedValue(match);

    const result = await useCase.execute(match.id, 'creator-1', 'player-2');

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(notifService.notifyPlayerConfirmed).toHaveBeenCalledWith(
      match.id,
      'player-2',
      'Player Two',
      ['creator-1'],
    );
    expect(wsGateway.emitToUser).toHaveBeenCalledWith(
      'player-2',
      'match:player_confirmed',
      expect.objectContaining({ userId: 'player-2', userName: 'Player Two' }),
    );
    expect(result.players).toHaveLength(2);
  });

  it('lanza NotFoundError si el match no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('no-existe', 'creator-1', 'player-2'),
    ).rejects.toThrow(NotFoundError);
    expect(repository.save).not.toHaveBeenCalled();
    expect(notifService.notifyPlayerConfirmed).not.toHaveBeenCalled();
  });

  it('lanza ValidationError si no es el creador', async () => {
    const match = Match.create({
      creatorId: 'creator-1',
      creatorEmail: 'creator@test.com',
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Test Match',
    });
    match.join('player-2', 'player2@test.com', 'Player Two');
    repository.findById.mockResolvedValue(match);

    await expect(
      useCase.execute(match.id, 'other-user', 'player-2'),
    ).rejects.toThrow(ValidationError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('notifica a otros jugadores confirmados', async () => {
    const match = Match.create({
      creatorId: 'creator-1',
      creatorEmail: 'creator@test.com',
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Test Match',
      maxPlayers: 4,
    });
    match.join('player-2', 'player2@test.com', 'Player Two');
    match.confirmPlayer('player-2');
    match.join('player-3', 'player3@test.com', 'Player Three');
    repository.findById.mockResolvedValue(match);

    await useCase.execute(match.id, 'creator-1', 'player-3');

    expect(notifService.notifyPlayerConfirmed).toHaveBeenCalledWith(
      match.id,
      'player-3',
      'Player Three',
      ['creator-1', 'player-2'],
    );
  });
});