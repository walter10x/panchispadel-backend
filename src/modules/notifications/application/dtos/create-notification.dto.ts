export interface CreateNotificationDTO {
  userId: string;
  type: string;
  title: string;
  message: string;
  matchId?: string;
  playerId?: string;
}
