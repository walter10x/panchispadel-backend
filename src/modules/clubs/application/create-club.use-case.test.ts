import { CreateClubUseCase } from './create-club.use-case';
import { IClubRepository } from '../domain/club.repository';
import { Club } from '../domain/club.entity';
import { ConflictError } from '../../../shared/domain/errors';

describe('CreateClubUseCase', () => {
  let useCase: CreateClubUseCase;
  let repository: jest.Mocked<IClubRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn().mockResolvedValue(null),
      delete: jest.fn(),
    };
    useCase = new CreateClubUseCase(repository);
  });

  it('crea y guarda un club nuevo', async () => {
    const result = await useCase.execute({
      name: 'Nuevo Club',
      address: 'Calle 1',
      courtsCount: 4,
    });

    expect(result.name).toBe('Nuevo Club');
    expect(result.courtsCount).toBe(4);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('lanza ConflictError si el nombre ya existe', async () => {
    repository.findByName.mockResolvedValue(
      Club.create({ name: 'Nuevo Club', address: 'X', courtsCount: 2 }),
    );

    await expect(
      useCase.execute({
        name: 'Nuevo Club',
        address: 'Calle 1',
        courtsCount: 4,
      }),
    ).rejects.toThrow(ConflictError);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
