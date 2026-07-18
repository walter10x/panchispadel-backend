import { UpdateMatchUseCase } from './update-match.use-case';
import { IMatchRepository } from '../domain/match.repository';
import { Match } from '../domain/match.entity';
import { NotFoundError, ValidationError } from '../../../shared/domain/errors';

const FUTURE_DATE = new Date(Date.now() + 86400000);

describe('UpdateMatchUseCase', () => {
  let useCase: UpdateMatchUseCase;
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
    useCase = new UpdateMatchUseCase(repository);
  });

  it('actualiza el partido cuando lo pide el creador', async () => {
    const match = Match.create({
      creatorId: 'user-1',
      creatorEmail: 'user-1@test.com',
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Titulo viejo',
    });
    repository.findById.mockResolvedValue(match);

    const result = await useCase.execute(
      {
        matchId: match.id,
        title: 'Titulo nuevo',
        clubId: 'club-2',
      },
      'user-1',
    );

    expect(result.title).toBe('Titulo nuevo');
    expect(result.clubId).toBe('club-2');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('lanza NotFoundError si el partido no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ matchId: 'no-existe', title: 'X' }, 'user-1'),
    ).rejects.toThrow(NotFoundError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('lanza ValidationError si no es el creador', async () => {
    const match = Match.create({
      creatorId: 'user-1',
      creatorEmail: 'user-1@test.com',
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Titulo',
    });
    repository.findById.mockResolvedValue(match);

    await expect(
      useCase.execute({ matchId: match.id, title: 'Hack' }, 'user-2'),
    ).rejects.toThrow(ValidationError);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
