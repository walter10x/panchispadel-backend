import { Match } from '../../domain/match.entity';
import { PlayerSlot } from '../../domain/value-objects/player-slot';
import { MatchStatus } from '../../domain/value-objects/match-status';
import { MatchResponseDTO } from '../dtos/match-response.dto';

export class MatchMapper {
  static toResponse(match: Match): MatchResponseDTO {
    return {
      id: match.id,
      creatorId: match.creatorId,
      creatorEmail: match.creatorEmail,
      clubId: match.clubId,
      dateTime: match.dateTime.toISOString(),
      title: match.title,
      durationMinutes: match.durationMinutes,
      status: match.status.getValue(),
      maxPlayers: match.maxPlayers,
      level: match.level,
      players: match.players.map((p) => ({
        playerId: p.playerId,
        email: p.email,
        status: p.status,
      })),
      createdAt: match.createdAt.toISOString(),
    };
  }

  static toOrmEntity(match: Match): Record<string, unknown> {
    return {
      id: match.id,
      creatorId: match.creatorId,
      creatorEmail: match.creatorEmail,
      clubId: match.clubId,
      dateTime: match.dateTime,
      title: match.title,
      durationMinutes: match.durationMinutes,
      status: match.status.getValue(),
      maxPlayers: match.maxPlayers,
      level: match.level,
      players: JSON.stringify(match.players.map((p) => p.toPlain())),
      createdAt: match.createdAt,
    };
  }

  static toDomain(data: {
    id: string;
    creatorId: string;
    creatorEmail: string;
    clubId: string;
    dateTime: Date;
    title: string;
    durationMinutes: number;
    status: string;
    maxPlayers: number;
    level: string;
    players: string;
    createdAt: Date;
  }): Match {
    const parsedPlayers: Array<{
      playerId: string;
      email: string;
      status: string;
      joinedAt: string;
    }> = JSON.parse(data.players);

    const players = parsedPlayers.map((p) =>
      PlayerSlot.reconstitute({
        playerId: p.playerId,
        email: p.email,
        status: p.status as 'confirmado' | 'pendiente' | 'rechazado',
        joinedAt: new Date(p.joinedAt),
      }),
    );

    return Match.reconstitute({
      id: data.id,
      creatorId: data.creatorId,
      creatorEmail: data.creatorEmail,
      clubId: data.clubId,
      dateTime: data.dateTime,
      title: data.title,
      durationMinutes: data.durationMinutes,
      status: MatchStatus.from(data.status),
      maxPlayers: data.maxPlayers,
      level: data.level,
      players,
      createdAt: data.createdAt,
    });
  }
}
