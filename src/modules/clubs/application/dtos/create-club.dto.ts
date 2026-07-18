export interface CreateClubDTO {
  name: string;
  address: string;
  phone?: string;
  courtsCount: number;
  latitude?: number;
  longitude?: number;
}
