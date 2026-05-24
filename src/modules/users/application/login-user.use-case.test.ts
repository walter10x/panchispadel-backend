import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginUserUseCase } from './login-user.use-case';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { UnauthorizedError } from '../../../shared/domain/errors';
import { env } from '../../../config/env';

function createMockRepository(): jest.Mocked<IUserRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
  };
}

async function createUserWithPassword(
  email: string,
  password: string,
  name = 'Test User',
): Promise<User> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return User.create({
    email,
    passwordHash: hash,
    name,
    level: 'principiante',
    photoUrl: undefined,
    phone: undefined,
  });
}

describe('LoginUserUseCase', () => {
  let repository: jest.Mocked<IUserRepository>;
  let useCase: LoginUserUseCase;

  beforeEach(() => {
    repository = createMockRepository();
    useCase = new LoginUserUseCase(repository);
  });

  it('loguea un usuario con credenciales válidas', async () => {
    const user = await createUserWithPassword(
      'test@example.com',
      'password123',
    );
    repository.findByEmail.mockResolvedValue(user);

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('lanza UnauthorizedError si el email no existe', async () => {
    repository.findByEmail.mockResolvedValue(null);

    const promise = useCase.execute({
      email: 'unknown@example.com',
      password: 'password123',
    });

    await expect(promise).rejects.toThrow(UnauthorizedError);
  });

  it('lanza UnauthorizedError si la contraseña es incorrecta', async () => {
    const user = await createUserWithPassword(
      'test@example.com',
      'correctpassword',
    );
    repository.findByEmail.mockResolvedValue(user);

    const promise = useCase.execute({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    await expect(promise).rejects.toThrow(UnauthorizedError);
  });

  it('genera accessToken y refreshToken válidos', async () => {
    const user = await createUserWithPassword(
      'token@example.com',
      'password123',
    );
    repository.findByEmail.mockResolvedValue(user);

    const result = await useCase.execute({
      email: 'token@example.com',
      password: 'password123',
    });

    const accessPayload = jwt.verify(
      result.accessToken,
      env.JWT_ACCESS_SECRET,
    ) as { userId: string; email: string };
    expect(accessPayload.userId).toBe(user.id);
    expect(accessPayload.email).toBe('token@example.com');

    const refreshPayload = jwt.verify(
      result.refreshToken,
      env.JWT_REFRESH_SECRET,
    ) as { userId: string; email: string };
    expect(refreshPayload.userId).toBe(user.id);
  });

  it('devuelve mensaje genérico para email no encontrado', async () => {
    repository.findByEmail.mockResolvedValue(null);

    const promise = useCase.execute({
      email: 'nobody@example.com',
      password: 'anypassword',
    });

    await expect(promise).rejects.toThrow('Invalid email or password');
  });

  it('devuelve mensaje genérico para contraseña incorrecta', async () => {
    const user = await createUserWithPassword(
      'test@example.com',
      'correctpass',
    );
    repository.findByEmail.mockResolvedValue(user);

    const promise = useCase.execute({
      email: 'test@example.com',
      password: 'wrongpass',
    });

    await expect(promise).rejects.toThrow('Invalid email or password');
  });
});
