import { IClubRepository } from '../domain/club.repository';
import { ClubResponseDTO } from './dtos/club-response.dto';
import { clubToResponse } from './mappers/club.mapper';
import { NotFoundError } from '../../../shared/domain/errors';

export class GetClubUseCase {
  constructor(private readonly repository: IClubRepository) {}

  async execute(clubId: string): Promise<ClubResponseDTO> {
    const club = await this.repository.findById(clubId);

    if (!club) {
      throw new NotFoundError('Club no encontrado');
    }

    return clubToResponse(club);
  }
}
