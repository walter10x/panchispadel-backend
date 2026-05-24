export interface MatchResponseDTO {
  id: string;
  creatorId: string;
  creatorEmail: string;
  clubId: string;
  dateTime: string;
  title: string;
  durationMinutes: number;
  status: string;
  maxPlayers: number;
  level: string;
  players: Array<{ playerId: string; email: string; status: string }>;
  createdAt: string;
}
