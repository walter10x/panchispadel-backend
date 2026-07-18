import { IUserRepository } from '../domain/user.repository';
import { UserMapper } from './mappers/user.mapper';
import { UserResponseDTO } from './dtos/user-response.dto';

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => UserMapper.toResponse(user));
  }
}
