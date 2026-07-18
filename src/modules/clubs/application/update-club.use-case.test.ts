import { UpdateClubUseCase } from './update-club.use-case';
import { IClubRepository } from '../domain/club.repository';
import { Club } from '../domain/club.entity';
import { NotFoundError } from '../../../shared/domain/errors';

describe('UpdateClubUseCase', () => {
  let useCase: UpdateClubUseCase;
  let repository: jest.Mocked<IClubRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdateClubUseCase(repository);
  });

  it('actualiza un club existente', async () => {
    const club = Club.create({
      name: 'Club Viejo',
      address: 'Dir 1',
      courtsCount: 2,
    });
    repository.findById.mockResolvedValue(club);

    const result = await useCase.execute({
      clubId: club.id,
      name: 'Club Nuevo',
      courtsCount: 5,
    });

    expect(result.name).toBe('Club Nuevo');
    expect(result.courtsCount).toBe(5);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('lanza NotFoundError si no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ clubId: 'no-existe', name: 'X' }),
    ).rejects.toThrow(NotFoundError);
  });
});
