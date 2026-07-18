import { IUserRepository } from '../domain/user.repository';
import { NotFoundError } from '../../../shared/domain/errors';
import { UserMapper } from './mappers/user.mapper';
import { UserResponseDTO } from './dtos/user-response.dto';

export interface UpdateUserRoleDTO {
  userId: string;
  role: string;
}

export class UpdateUserRoleUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: UpdateUserRoleDTO): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    user.changeRole(dto.role);
    await this.userRepository.save(user);

    return UserMapper.toResponse(user);
  }
}
