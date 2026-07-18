import { DeleteMatchUseCase } from './delete-match.use-case';
import { IMatchRepository } from '../domain/match.repository';
import { Match } from '../domain/match.entity';
import { NotFoundError, ValidationError } from '../../../shared/domain/errors';

const FUTURE_DATE = new Date(Date.now() + 86400000);

describe('DeleteMatchUseCase', () => {
  let useCase: DeleteMatchUseCase;
  let repository: jest.Mocked<IMatchRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByDateRange: jest.fn(),
      findByPlayer: jest.fn(),
      findOpen: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new DeleteMatchUseCase(repository);
  });

  it('elimina el partido cuando lo pide el creador', async () => {
    const match = Match.create({
      creatorId: 'user-1',
      creatorEmail: 'user-1@test.com',
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Partido',
    });
    repository.findById.mockResolvedValue(match);

    await useCase.execute(match.id, 'user-1');

    expect(repository.delete).toHaveBeenCalledWith(match.id);
  });

  it('lanza NotFoundError si el partido no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('no-existe', 'user-1')).rejects.toThrow(
      NotFoundError,
    );
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('lanza ValidationError si no es el creador', async () => {
    const match = Match.create({
      creatorId: 'user-1',
      creatorEmail: 'user-1@test.com',
      clubId: 'club-1',
      dateTime: FUTURE_DATE,
      title: 'Partido',
    });
    repository.findById.mockResolvedValue(match);

    await expect(useCase.execute(match.id, 'user-2')).rejects.toThrow(
      ValidationError,
    );
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
