export interface ClubResponseDTO {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  courtsCount: number;
  latitude: number | null;
  longitude: number | null;
}
