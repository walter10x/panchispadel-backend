import { IClubRepository } from '../domain/club.repository';
import { NotFoundError } from '../../../shared/domain/errors';
import { UpdateClubDTO } from './dtos/update-club.dto';
import { ClubResponseDTO } from './dtos/club-response.dto';
import { clubToResponse } from './mappers/club.mapper';

export class UpdateClubUseCase {
  constructor(private readonly clubRepository: IClubRepository) {}

  async execute(dto: UpdateClubDTO): Promise<ClubResponseDTO> {
    const club = await this.clubRepository.findById(dto.clubId);
    if (!club) {
      throw new NotFoundError('Club no encontrado');
    }

    const updated = club.update({
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.courtsCount !== undefined ? { courtsCount: dto.courtsCount } : {}),
      ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
      ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
    });

    await this.clubRepository.save(updated);
    return clubToResponse(updated);
  }
}
