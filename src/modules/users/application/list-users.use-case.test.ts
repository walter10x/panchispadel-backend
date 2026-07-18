import { ListUsersUseCase } from './list-users.use-case';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';

describe('ListUsersUseCase', () => {
  it('lista todos los usuarios', async () => {
    const users = [
      User.create({
        email: 'a@test.com',
        passwordHash: 'hash',
        name: 'A',
        level: 'medio',
        photoUrl: undefined,
        phone: undefined,
      }),
    ];
    const repository: jest.Mocked<IUserRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn().mockResolvedValue(users),
      delete: jest.fn(),
    };

    const useCase = new ListUsersUseCase(repository);
    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0]!.email).toBe('a@test.com');
    expect(result[0]!.role).toBe('player');
  });
});
