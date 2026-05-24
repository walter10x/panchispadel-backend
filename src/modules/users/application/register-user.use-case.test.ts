import bcrypt from 'bcryptjs';
import { RegisterUserUseCase } from './register-user.use-case';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { ConflictError } from '../../../shared/domain/errors';

function createMockRepository(): jest.Mocked<IUserRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
  };
}

describe('RegisterUserUseCase', () => {
  let repository: jest.Mocked<IUserRepository>;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    repository = createMockRepository();
    useCase = new RegisterUserUseCase(repository);
  });

  it('registra un nuevo usuario correctamente', async () => {
    repository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
      level: 'medio',
    });

    expect(result.user.email).toBe('new@example.com');
    expect(result.user.name).toBe('New User');
    expect(result.user.level).toBe('medio');
    expect(result.user.id).toBeDefined();
    expect(result.user.createdAt).toBeInstanceOf(Date);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    expect(repository.save).toHaveBeenCalledTimes(1);
    const savedUser = repository.save.mock.calls[0]?.[0];
    expect(savedUser).toBeInstanceOf(User);
  });

  it('lanza ConflictError si el email ya existe', async () => {
    const existingUser = User.create({
      email: 'existing@example.com',
      passwordHash: '$2a$10$hash',
      name: 'Existing',
      level: 'principiante',
      photoUrl: undefined,
      phone: undefined,
    });
    repository.findByEmail.mockResolvedValue(existingUser);

    const promise = useCase.execute({
      email: 'existing@example.com',
      password: 'password123',
      name: 'Duplicate',
    });

    await expect(promise).rejects.toThrow(ConflictError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('registra sin nivel (usa valor por defecto)', async () => {
    repository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({
      email: 'default@example.com',
      password: 'password123',
      name: 'Default Level',
    });

    expect(result.user.level).toBe('principiante');
  });

  it('hashea la contraseña antes de guardar', async () => {
    repository.findByEmail.mockResolvedValue(null);

    await useCase.execute({
      email: 'hash@example.com',
      password: 'password123',
      name: 'Hash Test',
    });

    expect(repository.save).toHaveBeenCalledTimes(1);
    const savedUser = repository.save.mock.calls[0]![0];
    expect(savedUser.passwordHash).not.toBe('password123');
    const isHash = await bcrypt.compare('password123', savedUser.passwordHash);
    expect(isHash).toBe(true);
  });
});
