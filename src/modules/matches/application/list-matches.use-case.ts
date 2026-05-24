import { IMatchRepository } from '../domain/match.repository';
import { Match } from '../domain/match.entity';
import { MatchMapper } from './mappers/match.mapper';
import { ListMatchesDTO } from './dtos/list-matches.dto';
import { MatchResponseDTO } from './dtos/match-response.dto';
import { PaginatedResponseDTO } from './dtos/paginated-response.dto';

export class ListMatchesUseCase {
  constructor(private readonly matchRepository: IMatchRepository) {}

  async execute(
    dto: ListMatchesDTO,
  ): Promise<PaginatedResponseDTO<MatchResponseDTO>> {
    const matches = await this.resolveMatches(dto);

    const start = (dto.page - 1) * dto.limit;
    const paged = matches.slice(start, start + dto.limit);

    return {
      data: paged.map(MatchMapper.toResponse),
      total: matches.length,
      page: dto.page,
      limit: dto.limit,
    };
  }

  private async resolveMatches(
    dto: ListMatchesDTO,
  ): Promise<Match[]> {
    const filters = dto.filters;

    if (filters?.dateFrom && filters?.dateTo) {
      return this.matchRepository.findByDateRange(
        filters.dateFrom,
        filters.dateTo,
      );
    }

    if (filters?.status === 'abierto') {
      return this.matchRepository.findOpen();
    }

    return this.matchRepository.findOpen();
  }
}
