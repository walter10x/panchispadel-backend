import { ListMatchesUseCase } from './list-matches.use-case';
import { IMatchRepository } from '../domain/match.repository';
import { Match } from '../domain/match.entity';

const FUTURE_DATE = new Date(Date.now() + 86400000);

function createMatch(overrides: Partial<{
  creatorId: string;
  creatorEmail: string;
  clubId: string;
  maxPlayers: number;
}> = {}): Match {
  return Match.create({
    creatorId: overrides.creatorId ?? 'user-1',
    creatorEmail: overrides.creatorEmail ?? 'creator@test.com',
    clubId: overrides.clubId ?? 'club-1',
    dateTime: FUTURE_DATE,
    title: 'Test Match',
    maxPlayers: overrides.maxPlayers ?? 4,
  });
}

describe('ListMatchesUseCase', () => {
  let useCase: ListMatchesUseCase;
  let repository: jest.Mocked<IMatchRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByDateRange: jest.fn(),
      findByPlayer: jest.fn(),
      findOpen: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ListMatchesUseCase(repository);
  });

  it('devuelve lista paginada de matches', async () => {
    const match1 = createMatch({ creatorId: 'user-1' });
    const match2 = createMatch({ creatorId: 'user-2' });
    repository.findOpen.mockResolvedValue([match1, match2]);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('filtra por clubId', async () => {
    repository.findByDateRange.mockResolvedValue([]);
    repository.findOpen.mockResolvedValue([]);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      filters: { clubId: 'club-1' },
    });

    expect(result.data).toEqual([]);
  });

  it('filtra por rango de fechas', async () => {
    const match = createMatch();
    const from = new Date(Date.now() - 86400000);
    const to = new Date(Date.now() + 2 * 86400000);
    repository.findByDateRange.mockResolvedValue([match]);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      filters: { dateFrom: from, dateTo: to },
    });

    expect(result.data).toHaveLength(1);
    expect(repository.findByDateRange).toHaveBeenCalledWith(from, to);
  });

  it('filtra por status abierto', async () => {
    const match = createMatch();
    repository.findOpen.mockResolvedValue([match]);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      filters: { status: 'abierto' },
    });

    expect(result.data).toHaveLength(1);
    expect(repository.findOpen).toHaveBeenCalled();
  });

  it('aplica paginación correctamente', async () => {
    const matches = Array.from({ length: 5 }, (_, i) =>
      createMatch({ creatorId: `user-${i + 1}` }),
    );
    repository.findOpen.mockResolvedValue(matches);

    const result = await useCase.execute({ page: 1, limit: 2 });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
  });

  it('devuelve página vacía si no hay matches', async () => {
    repository.findOpen.mockResolvedValue([]);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });
});
