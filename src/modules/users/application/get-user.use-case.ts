import { IUserRepository } from '../domain/user.repository';
import { UserResponseDTO } from './dtos/user-response.dto';
import { UserMapper } from './mappers/user.mapper';
import { NotFoundError } from '../../../shared/domain/errors';

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new NotFoundError('User not found');
    }

    return UserMapper.toResponse(user);
  }
}
