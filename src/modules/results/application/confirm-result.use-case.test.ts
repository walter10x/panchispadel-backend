import { ConfirmResultUseCase } from './confirm-result.use-case';
import { IResultRepository } from '../domain/result.repository';
import { Result } from '../domain/result.entity';
import { NotFoundError } from '../../../shared/domain/errors';
import type { IWsGateway } from '../../websocket/domain/ws-gateway';

describe('ConfirmResultUseCase', () => {
  let useCase: ConfirmResultUseCase;
  let mockRepo: jest.Mocked<IResultRepository>;
  let wsGateway: jest.Mocked<IWsGateway>;

  const matchId = '550e8400-e29b-41d4-a716-446655440000';
  const registrarId = 'player-registrar';
  const playerId = 'player-confirmer';

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByMatch: jest.fn(),
      findByPlayer: jest.fn(),
      findAll: jest.fn(),
    };
    wsGateway = {
      emitToUser: jest.fn(),
      emitToMatch: jest.fn(),
      broadcast: jest.fn(),
    };
    useCase = new ConfirmResultUseCase(mockRepo, wsGateway);
  });

  it('confirms a result for the given player', async () => {
    const result = Result.create({
      matchId,
      registrarId,
      team1Score: 2,
      team2Score: 1,
    });
    mockRepo.findById.mockResolvedValue(result);
    mockRepo.save.mockResolvedValue(result);

    const response = await useCase.execute(
      { resultId: result.id },
      playerId,
    );

    expect(response.confirmedBy).toContain(playerId);
    expect(mockRepo.findById).toHaveBeenCalledWith(result.id);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundError when result does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ resultId: 'non-existent-id' }, playerId),
    ).rejects.toThrow(NotFoundError);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('saves the result after confirming', async () => {
    const result = Result.create({
      matchId,
      registrarId,
      team1Score: 2,
      team2Score: 0,
    });
    mockRepo.findById.mockResolvedValue(result);
    mockRepo.save.mockResolvedValue(result);

    await useCase.execute({ resultId: result.id }, playerId);

    const savedArg = mockRepo.save.mock.calls[0]?.[0];
    if (savedArg) {
      expect(savedArg.confirmedBy).toContain(playerId);
      expect(savedArg.confirmedBy).toContain(registrarId);
    }
  });

  it('does not duplicate an existing confirmation', async () => {
    const result = Result.create({
      matchId,
      registrarId,
      team1Score: 2,
      team2Score: 1,
    });
    mockRepo.findById.mockResolvedValue(result);
    mockRepo.save.mockResolvedValue(result);

    await useCase.execute({ resultId: result.id }, registrarId);

    const savedArg = mockRepo.save.mock.calls[0]?.[0];
    if (savedArg) {
      expect(savedArg.confirmedBy).toEqual([registrarId]);
    }
  });

  it('marks result as fully confirmed after second confirmation', async () => {
    const result = Result.create({
      matchId,
      registrarId,
      team1Score: 2,
      team2Score: 0,
    });
    mockRepo.findById.mockResolvedValue(result);
    mockRepo.save.mockResolvedValue(result);

    const response = await useCase.execute(
      { resultId: result.id },
      playerId,
    );

    expect(response.isFullyConfirmed).toBe(true);
  });
});
