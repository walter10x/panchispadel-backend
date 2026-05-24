import { Club } from '../../domain/club.entity';
import { ClubResponseDTO } from '../dtos/club-response.dto';

export function clubToResponse(club: Club): ClubResponseDTO {
  return {
    id: club.id,
    name: club.name,
    address: club.address,
    phone: club.phone ?? null,
    courtsCount: club.courtsCount,
    latitude: club.latitude ?? null,
    longitude: club.longitude ?? null,
  };
}
