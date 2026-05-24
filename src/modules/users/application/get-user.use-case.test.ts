import { GetUserUseCase } from './get-user.use-case';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { NotFoundError } from '../../../shared/domain/errors';

function createMockRepository(): jest.Mocked<IUserRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
  };
}

describe('GetUserUseCase', () => {
  let repository: jest.Mocked<IUserRepository>;
  let useCase: GetUserUseCase;

  beforeEach(() => {
    repository = createMockRepository();
    useCase = new GetUserUseCase(repository);
  });

  it('devuelve el usuario cuando existe', async () => {
    const user = User.create({
      email: 'test@example.com',
      passwordHash: '$2a$10$hash',
      name: 'Test User',
      level: 'avanzado',
      photoUrl: undefined,
      phone: undefined,
    });
    repository.findById.mockResolvedValue(user);

    const result = await useCase.execute(user.id);

    expect(result.id).toBe(user.id);
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('Test User');
    expect(result.level).toBe('avanzado');
  });

  it('lanza NotFoundError cuando el usuario no existe', async () => {
    repository.findById.mockResolvedValue(null);

    const promise = useCase.execute('non-existent-id');

    await expect(promise).rejects.toThrow(NotFoundError);
  });
});
