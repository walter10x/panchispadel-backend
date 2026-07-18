export interface UpdateMatchDTO {
  matchId: string;
  clubId?: string;
  dateTime?: Date;
  title?: string;
  durationMinutes?: number;
  maxPlayers?: number;
  level?: string;
}
