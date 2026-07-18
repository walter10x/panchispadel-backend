import { IClubRepository } from '../domain/club.repository';
import { Club } from '../domain/club.entity';
import { ConflictError } from '../../../shared/domain/errors';
import { CreateClubDTO } from './dtos/create-club.dto';
import { ClubResponseDTO } from './dtos/club-response.dto';
import { clubToResponse } from './mappers/club.mapper';

export class CreateClubUseCase {
  constructor(private readonly clubRepository: IClubRepository) {}

  async execute(dto: CreateClubDTO): Promise<ClubResponseDTO> {
    const existing = await this.clubRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictError('Ya existe un club con ese nombre');
    }

    const club = Club.create({
      name: dto.name,
      address: dto.address,
      courtsCount: dto.courtsCount,
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
      ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
    });

    await this.clubRepository.save(club);
    return clubToResponse(club);
  }
}
