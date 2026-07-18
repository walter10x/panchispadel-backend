import { GetClubUseCase } from './get-club.use-case';
import { IClubRepository } from '../domain/club.repository';
import { Club } from '../domain/club.entity';

describe('GetClubUseCase', () => {
  let useCase: GetClubUseCase;
  let repository: jest.Mocked<IClubRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetClubUseCase(repository);
  });

  it('devuelve un club por su id', async () => {
    const club = Club.reconstitute({
      id: 'id-1',
      name: 'Logroño Pádel Indoor',
      address: 'Calle Test, 1, Logroño',
      courtsCount: 4,
      createdAt: new Date('2024-01-01'),
    });

    repository.findById.mockResolvedValue(club);

    const result = await useCase.execute('id-1');

    expect(result.id).toBe('id-1');
    expect(result.name).toBe('Logroño Pádel Indoor');
  });

  it('lanza NotFoundError si el club no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('id-inexistente')).rejects.toThrow(
      'Club no encontrado',
    );
  });
});
