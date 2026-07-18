import { ListClubsUseCase } from './list-clubs.use-case';
import { IClubRepository } from '../domain/club.repository';
import { Club } from '../domain/club.entity';

describe('ListClubsUseCase', () => {
  let useCase: ListClubsUseCase;
  let repository: jest.Mocked<IClubRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ListClubsUseCase(repository);
  });

  it('devuelve lista vacía cuando no hay clubs', async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });

  it('devuelve todos los clubs como DTOs', async () => {
    const club = Club.reconstitute({
      id: 'id-1',
      name: 'Logroño Pádel Indoor',
      address: 'Calle Test, 1, Logroño',
      phone: '941 123 456',
      courtsCount: 4,
      createdAt: new Date('2024-01-01'),
    });

    repository.findAll.mockResolvedValue([club]);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'id-1',
      name: 'Logroño Pádel Indoor',
      address: 'Calle Test, 1, Logroño',
      phone: '941 123 456',
      courtsCount: 4,
      latitude: null,
      longitude: null,
    });
  });

  it('mapea campos opcionales ausentes a null en el DTO', async () => {
    const club = Club.reconstitute({
      id: 'id-1',
      name: 'Club sin extras',
      address: 'Calle Test',
      courtsCount: 2,
      createdAt: new Date('2024-01-01'),
    });

    repository.findAll.mockResolvedValue([club]);

    const result = await useCase.execute();

    expect(result[0]?.phone).toBeNull();
    expect(result[0]?.latitude).toBeNull();
    expect(result[0]?.longitude).toBeNull();
  });
});
