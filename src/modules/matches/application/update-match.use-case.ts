import { IMatchRepository } from '../domain/match.repository';
import { Match } from '../domain/match.entity';
import { NotFoundError, ValidationError } from '../../../shared/domain/errors';
import { MatchMapper } from './mappers/match.mapper';
import { UpdateMatchDTO } from './dtos/update-match.dto';
import { MatchResponseDTO } from './dtos/match-response.dto';

export class UpdateMatchUseCase {
  constructor(private readonly matchRepository: IMatchRepository) {}

  async execute(
    dto: UpdateMatchDTO,
    requesterId: string,
  ): Promise<MatchResponseDTO> {
    const match = await this.matchRepository.findById(dto.matchId);

    if (!match) {
      throw new NotFoundError('Partido no encontrado');
    }

    if (match.creatorId !== requesterId) {
      throw new ValidationError('Solo el creador puede editar el partido');
    }

    const updated = Match.reconstitute({
      id: match.id,
      creatorId: match.creatorId,
      creatorEmail: match.creatorEmail,
      clubId: dto.clubId ?? match.clubId,
      dateTime: dto.dateTime ?? match.dateTime,
      title: dto.title ?? match.title,
      durationMinutes: dto.durationMinutes ?? match.durationMinutes,
      status: match.status,
      maxPlayers: dto.maxPlayers ?? match.maxPlayers,
      level: dto.level ?? match.level,
      players: [...match.players],
      createdAt: match.createdAt,
    });

    await this.matchRepository.save(updated);

    return MatchMapper.toResponse(updated);
  }
}
