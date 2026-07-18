import { GetMatchUseCase } from './get-match.use-case';
import { IMatchRepository } from '../domain/match.repository';
import { Match } from '../domain/match.entity';
import { NotFoundError } from '../../../shared/domain/errors';

const FUTURE_DATE = new Date(Date.now() + 86400000);

describe('GetMatchUseCase', () => {
  let useCase: GetMatchUseCase;
  let repository: jest.Mocked<IMatchRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByDateRange: jest.fn(),
      findByPlayer: jest.fn(),
      findOpen: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetMatchUseCase(repository);
  });

  it('devuelve el partido cuando existe', async () => {
    const match = Match.create({
      creatorId: 'user-1',
      creatorEmail: 'user-1@test.com',
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Partido test',
    });
    repository.findById.mockResolvedValue(match);

    const result = await useCase.execute(match.id);

    expect(result.id).toBe(match.id);
    expect(result.title).toBe('Partido test');
    expect(repository.findById).toHaveBeenCalledWith(match.id);
  });

  it('lanza NotFoundError si el partido no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('no-existe')).rejects.toThrow(NotFoundError);
  });
});
