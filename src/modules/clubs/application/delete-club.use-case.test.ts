import { DeleteClubUseCase } from './delete-club.use-case';
import { IClubRepository } from '../domain/club.repository';
import { Club } from '../domain/club.entity';
import { NotFoundError } from '../../../shared/domain/errors';

describe('DeleteClubUseCase', () => {
  let useCase: DeleteClubUseCase;
  let repository: jest.Mocked<IClubRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new DeleteClubUseCase(repository);
  });

  it('elimina un club existente', async () => {
    const club = Club.create({
      name: 'Club',
      address: 'Dir',
      courtsCount: 2,
    });
    repository.findById.mockResolvedValue(club);

    await useCase.execute(club.id);

    expect(repository.delete).toHaveBeenCalledWith(club.id);
  });

  it('lanza NotFoundError si no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('no-existe')).rejects.toThrow(NotFoundError);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
