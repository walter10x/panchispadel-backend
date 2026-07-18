import { IMatchRepository } from '../domain/match.repository';
import { NotFoundError, ValidationError } from '../../../shared/domain/errors';

export class DeleteMatchUseCase {
  constructor(private readonly matchRepository: IMatchRepository) {}

  async execute(matchId: string, requesterId: string): Promise<void> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new NotFoundError('Partido no encontrado');
    }

    if (match.creatorId !== requesterId) {
      throw new ValidationError('Solo el creador puede eliminar el partido');
    }

    await this.matchRepository.delete(matchId);
  }
}
