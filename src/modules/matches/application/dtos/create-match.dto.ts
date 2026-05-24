export interface CreateMatchDTO {
  clubId: string;
  dateTime: Date;
  title: string;
  durationMinutes?: number;
  maxPlayers?: number;
  level?: string;
}
