import { IClubRepository } from '../domain/club.repository';
import { NotFoundError } from '../../../shared/domain/errors';

export class DeleteClubUseCase {
  constructor(private readonly clubRepository: IClubRepository) {}

  async execute(clubId: string): Promise<void> {
    const club = await this.clubRepository.findById(clubId);
    if (!club) {
      throw new NotFoundError('Club no encontrado');
    }
    await this.clubRepository.delete(clubId);
  }
}
