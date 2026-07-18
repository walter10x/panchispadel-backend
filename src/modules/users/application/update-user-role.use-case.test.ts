import { UpdateUserRoleUseCase } from './update-user-role.use-case';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { NotFoundError } from '../../../shared/domain/errors';

describe('UpdateUserRoleUseCase', () => {
  let useCase: UpdateUserRoleUseCase;
  let repository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdateUserRoleUseCase(repository);
  });

  it('cambia el rol de un usuario', async () => {
    const user = User.create({
      email: 'u@test.com',
      passwordHash: 'hash',
      name: 'User',
      level: 'medio',
      photoUrl: undefined,
      phone: undefined,
    });
    repository.findById.mockResolvedValue(user);

    const result = await useCase.execute({ userId: user.id, role: 'admin' });

    expect(result.role).toBe('admin');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('lanza NotFoundError si no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'no-existe', role: 'admin' }),
    ).rejects.toThrow(NotFoundError);
  });
});
