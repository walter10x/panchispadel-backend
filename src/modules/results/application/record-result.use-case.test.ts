import { RecordResultUseCase } from './record-result.use-case';
import { IResultRepository } from '../domain/result.repository';
import { Result } from '../domain/result.entity';
import { ConflictError } from '../../../shared/domain/errors';
import type { IWsGateway } from '../../websocket/domain/ws-gateway';

describe('RecordResultUseCase', () => {
  let useCase: RecordResultUseCase;
  let mockRepo: jest.Mocked<IResultRepository>;
  let wsGateway: jest.Mocked<IWsGateway>;

  const validDto = {
    matchId: '550e8400-e29b-41d4-a716-446655440000',
    team1Score: 2,
    team2Score: 0,
  };
  const registrarId = 'player-registrar';

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
    useCase = new RecordResultUseCase(mockRepo, wsGateway);
  });

  it('creates and saves a result successfully', async () => {
    mockRepo.findByMatch.mockResolvedValue(null);
    const savedResult = Result.create({
      ...validDto,
      registrarId,
    });
    mockRepo.save.mockResolvedValue(savedResult);

    const response = await useCase.execute(validDto, registrarId);

    expect(response.matchId).toBe(validDto.matchId);
    expect(response.team1Score).toBe(2);
    expect(response.team2Score).toBe(0);
    expect(response.confirmedBy).toContain(registrarId);
    expect(response.isFullyConfirmed).toBe(false);
    expect(response.id).toBeDefined();
    expect(mockRepo.findByMatch).toHaveBeenCalledWith(validDto.matchId);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictError when a result already exists for the match', async () => {
    const existing = Result.create({ ...validDto, registrarId: 'other' });
    mockRepo.findByMatch.mockResolvedValue(existing);

    await expect(useCase.execute(validDto, registrarId)).rejects.toThrow(
      ConflictError,
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('returns the saved result from repository', async () => {
    mockRepo.findByMatch.mockResolvedValue(null);
    const savedResult = Result.create({
      ...validDto,
      registrarId,
    });
    mockRepo.save.mockResolvedValue(savedResult);

    const response = await useCase.execute(validDto, registrarId);

    const savedArg = mockRepo.save.mock.calls[0]?.[0];
    expect(savedArg).toBeInstanceOf(Result);
    expect(response.id).toBe(savedResult.id);
  });

  it('passes correct data to the Result entity', async () => {
    mockRepo.findByMatch.mockResolvedValue(null);
    const savedResult = Result.create({
      ...validDto,
      registrarId,
    });
    mockRepo.save.mockResolvedValue(savedResult);

    await useCase.execute(validDto, registrarId);

    const savedArg = mockRepo.save.mock.calls[0]?.[0];
    if (savedArg) {
      expect(savedArg.matchId).toBe(validDto.matchId);
      expect(savedArg.team1Score).toBe(2);
      expect(savedArg.team2Score).toBe(0);
      expect(savedArg.confirmedBy).toEqual([registrarId]);
    }
  });
});
