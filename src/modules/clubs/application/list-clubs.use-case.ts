import { IClubRepository } from '../domain/club.repository';
import { ClubResponseDTO } from './dtos/club-response.dto';
import { clubToResponse } from './mappers/club.mapper';

export class ListClubsUseCase {
  constructor(private readonly repository: IClubRepository) {}

  async execute(): Promise<ClubResponseDTO[]> {
    const clubs = await this.repository.findAll();
    return clubs.map(clubToResponse);
  }
}
